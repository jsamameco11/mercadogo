import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Fuerza al navegador a no volver a intentar http:// para este sitio.
        // Google Identity Services envía el origin de la página a Google, y
        // solo el origin https está registrado en Google Cloud Console — sin
        // esto, un enlace viejo en http:// rompe el login con origin_mismatch.
        source: "/:path*",
        headers: [{ key: "Strict-Transport-Security", value: "max-age=31536000" }],
      },
    ];
  },
};

export default nextConfig;
