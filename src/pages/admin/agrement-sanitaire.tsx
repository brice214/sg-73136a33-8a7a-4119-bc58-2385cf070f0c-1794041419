import dynamic from "next/dynamic";
import { AdminLayout } from "@/components/admin/AdminLayout";

const AgrementSanitaireForm = dynamic(
  () => import("@/components/admin/AgrementSanitaireForm"),
  { ssr: false }
);

export default function AgrementSanitaire() {
  return (
    <AdminLayout>
      <AgrementSanitaireForm />
    </AdminLayout>
  );
}