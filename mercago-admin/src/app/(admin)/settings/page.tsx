import { getMonetizationEnabled } from "@/lib/settings";
import { PageHeader } from "@/components/admin/PageHeader";
import { MonetizationToggle } from "@/components/admin/MonetizationToggle";

export default async function SettingsPage() {
  const enabled = await getMonetizationEnabled();

  return (
    <div>
      <PageHeader title="Configuración" description="Ajustes generales del marketplace." />
      <div className="max-w-xl p-6">
        <MonetizationToggle enabled={enabled} />
      </div>
    </div>
  );
}
