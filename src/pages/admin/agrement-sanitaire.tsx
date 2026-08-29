import { AdminLayout } from "@/components/admin/AdminLayout";
import { AgrementSanitaireForm } from "@/components/admin/AgrementSanitaireForm";
import { SEO } from "@/components/SEO";

export default function AgrementSanitairePage() {
  return (
    <AdminLayout>
      <SEO title="Agrément Sanitaire - MISSU BALA Admin" noIndex={true} />
      <AgrementSanitaireForm />
    </AdminLayout>
  );
}