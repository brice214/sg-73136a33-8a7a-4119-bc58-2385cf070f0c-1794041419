import { AdminLayout } from "@/components/admin/AdminLayout";
import CatalogueForm from "@/components/admin/CatalogueForm";
import { SEO } from "@/components/SEO";

export default function CataloguePage() {
  return (
    <AdminLayout>
      <SEO title="Catalogue - DGCCRF Admin" noIndex={true} />
      <CatalogueForm />
    </AdminLayout>
  );
}