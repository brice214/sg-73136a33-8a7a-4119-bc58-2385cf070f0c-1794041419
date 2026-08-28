import dynamic from "next/dynamic";
import { AdminLayout } from "@/components/admin/AdminLayout";

const MercurialeForm = dynamic(() => import("@/components/admin/MercurialeForm"), { ssr: false });

export default function Mercuriale() {
  return (
    <AdminLayout>
      <MercurialeForm />
    </AdminLayout>
  );
}