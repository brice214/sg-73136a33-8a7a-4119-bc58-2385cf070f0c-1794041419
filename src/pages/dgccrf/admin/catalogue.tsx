import dynamic from "next/dynamic";
import { AdminLayout } from "@/components/admin/AdminLayout";

const CatalogueForm = dynamic(() => import("@/components/admin/CatalogueForm"), { ssr: false });

export default function Catalogue() {
  return (
    <AdminLayout>
      <CatalogueForm />
    </AdminLayout>
  );
}