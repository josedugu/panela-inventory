import { redirect } from "next/navigation";
import { DEFAULT_MASTER_DATA_SECTION } from "@/features/master-data/conts";

export default function MasterDataPage() {
  redirect(`/dashboard/master-data/${DEFAULT_MASTER_DATA_SECTION}`);
}
