import { AdminLayout } from "@/components/admin/AdminLayout";
import { MercurialeForm } from "@/components/admin/MercurialeForm";
import { SEO } from "@/components/SEO";

export default function MercurialePage() {
  return (
    <AdminLayout>
      <SEO title="Mercuriale - DGCCRF Admin" noIndex={true} />
      <MercurialeForm />
    </AdminLayout>
  );
}