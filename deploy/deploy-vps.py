# -*- coding: utf-8 -*-
"""Deploy MercaGo (web + admin) to the shared Elastika VPS.

Same VPS and same credential-resolution convention already used by
APP CONTRATACIONES/scripts/deploy-vps.py (imported here, not duplicated) and
the same Apache-vhost-per-Next.js-app pattern already live for
casa-de-la-palabra, contrataciones, ingenieria, odontomedic, etc.

Usage: python deploy-vps.py
"""
from __future__ import annotations

import importlib.util
import os
import posixpath
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

_spec = importlib.util.spec_from_file_location(
    "contrataciones_deploy",
    r"C:\Users\Renzo\Desktop\APP CONTRATACIONES\scripts\deploy-vps.py",
)
_cd = importlib.util.module_from_spec(_spec)
sys.modules["contrataciones_deploy"] = _cd
_spec.loader.exec_module(_cd)

import paramiko

HOST = _cd.HOST
USER = _cd.USER
ROOT = Path(__file__).resolve().parent.parent  # APP-ECOMERCE/

ALL_APPS = [
    {
        "name": "mercago-web",
        "local": ROOT / "mercago-web",
        "remote": "/opt/mercago-web",
        "port": 8798,
        "domain": "mercago.miacademiapreu.com",
        "service": "mercago-web",
    },
    {
        "name": "mercago-admin",
        "local": ROOT / "mercago-admin",
        "remote": "/opt/mercago-admin",
        "port": 8799,
        "domain": "control-mercago.miacademiapreu.com",
        "service": "mercago-admin",
    },
]

# Allow deploying one app at a time (python deploy-vps.py mercago-web) so
# each run comfortably fits inside a single SSH session / tool timeout.
_filter = set(sys.argv[1:])
APPS = [a for a in ALL_APPS if not _filter or a["name"] in _filter]

SKIP_DIRS = {".git", "node_modules", ".next", ".turbo", "coverage", "dist", "tmp"}
# .env.production is written explicitly below (never walked/copied as-is),
# and .env.local (dev, localhost URLs) never leaves this machine.
SKIP_FILES = {".env", ".env.local", ".env.production"}


def connect() -> paramiko.SSHClient:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(
        HOST,
        username=USER,
        password=_cd.password(),
        timeout=30,
        allow_agent=False,
        look_for_keys=False,
        banner_timeout=30,
    )
    return ssh


def run(ssh: paramiko.SSHClient, cmd: str, timeout: int = 300) -> str:
    _i, out, err = ssh.exec_command(cmd, timeout=timeout)
    data = out.read() + err.read()
    text = data.decode("utf-8", "replace")
    if len(text) > 6000:
        return text[:1500] + "\n...\n" + text[-4000:]
    return text


def put_dir(sftp: paramiko.SFTPClient, local: Path, remote: str) -> int:
    count = 0
    for root, dirs, files in os.walk(local):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".git")]
        rel = os.path.relpath(root, local)
        rdir = remote if rel == "." else posixpath.join(remote, rel.replace("\\", "/"))
        try:
            sftp.stat(rdir)
        except OSError:
            sftp.mkdir(rdir)
        for name in files:
            if name in SKIP_FILES or name.endswith(".log"):
                continue
            lp = Path(root) / name
            rp = posixpath.join(rdir, name)
            sftp.put(str(lp), rp)
            count += 1
    return count


def read_env_production(app_dir: Path) -> str:
    p = app_dir / ".env.production"
    return p.read_text(encoding="utf-8") if p.exists() else ""


def service_unit(app: dict) -> str:
    return f"""[Unit]
Description=MercaGo - {app['name']}
After=network.target

[Service]
Type=simple
WorkingDirectory={app['remote']}
EnvironmentFile={app['remote']}/.env.production
Environment=NODE_ENV=production
Environment=PORT={app['port']}
Environment=HOSTNAME=127.0.0.1
ExecStart=/usr/bin/npx next start -H 127.0.0.1 -p {app['port']}
Restart=always
RestartSec=4
User=root

[Install]
WantedBy=multi-user.target
"""


def apache_vhost(app: dict) -> str:
    # No blanket HTTP->HTTPS redirect on purpose — these domains sit behind
    # Cloudflare, which may reach the origin over plain HTTP (Flexible SSL);
    # redirecting everything on :80 would loop forever. The app itself
    # redirects based on X-Forwarded-Proto (see src/proxy.ts).
    return f"""<VirtualHost *:80>
  ServerName {app['domain']}
  Alias /.well-known/acme-challenge/ /var/www/letsencrypt/.well-known/acme-challenge/
  <Directory /var/www/letsencrypt/.well-known/acme-challenge/>
    Require all granted
  </Directory>
  ProxyPreserveHost On
  ProxyTimeout 180
  ProxyPass /.well-known/acme-challenge/ !
  ProxyPass / http://127.0.0.1:{app['port']}/
  ProxyPassReverse / http://127.0.0.1:{app['port']}/
</VirtualHost>
"""


def main() -> None:
    ssh = connect()
    sftp = ssh.open_sftp()

    print(run(ssh, "mkdir -p /var/www/letsencrypt/.well-known/acme-challenge"))

    for app in APPS:
        print(f"\n===== {app['name']} =====")
        print(run(ssh, f"mkdir -p {app['remote']}"))
        uploaded = put_dir(sftp, app["local"], app["remote"])
        print(f"UPLOADED_FILES={uploaded}")

        env_content = read_env_production(app["local"])
        with sftp.file(f"{app['remote']}/.env.production", "w") as fh:
            fh.write(env_content)

        with sftp.file(f"/etc/systemd/system/{app['service']}.service", "w") as fh:
            fh.write(service_unit(app))

        with sftp.file(f"/etc/apache2/sites-available/{app['domain']}.conf", "w") as fh:
            fh.write(apache_vhost(app))

        print("BUILD_START")
        print(
            run(
                ssh,
                f"cd {app['remote']} && npm install && npm run build",
                timeout=600,
            )
        )

    sftp.close()

    print("\n===== Apache: enable sites + reload =====")
    site_names = " ".join(f"{a['domain']}.conf" for a in APPS)
    print(
        run(
            ssh,
            f"a2enmod proxy proxy_http headers ssl rewrite >/dev/null 2>&1; "
            f"a2ensite {site_names}; "
            "apache2ctl configtest && systemctl reload apache2",
            timeout=60,
        )
    )

    print("\n===== systemd: enable + start services =====")
    service_names = " ".join(a["service"] for a in APPS)

    def local_probe(app: dict) -> str:
        name = app["name"]
        port = app["port"]
        return f"curl -sS -m 15 -o /dev/null -w '{name} local:%{{http_code}}\\n' http://127.0.0.1:{port}/"

    probes = "; ".join(local_probe(a) for a in APPS)
    print(
        run(
            ssh,
            f"systemctl daemon-reload; "
            f"systemctl enable --now {service_names}; "
            f"systemctl restart {service_names}; "
            "sleep 3; " + probes,
            timeout=60,
        )
    )

    print("\n===== certbot (HTTPS) =====")
    for app in APPS:
        print(
            run(
                ssh,
                f"if [ ! -d /etc/letsencrypt/live/{app['domain']} ]; then "
                f"certbot --apache -d {app['domain']} --non-interactive --agree-tos "
                "--email miacademiapreu.pe@gmail.com --redirect || true; "
                "fi",
                timeout=120,
            )
        )
    print(run(ssh, "systemctl reload apache2"))

    print("\n===== Verificacion final (por dominio, via HTTPS) =====")

    def https_probe(app: dict) -> str:
        domain = app["domain"]
        return f"curl -sS -m 20 -o /dev/null -w '{domain} => %{{http_code}}\\n' https://{domain}/"

    for app in APPS:
        print(run(ssh, https_probe(app), timeout=30))

    ssh.close()
    print("\nDEPLOY_OK")


if __name__ == "__main__":
    main()
