import { notFound } from "next/navigation";

import { MasterDataScreen } from "@/features/master-data";
import { getSectionData } from "@/features/master-data/actions";
import {
  MASTER_DATA_SECTIONS,
  type MasterDataSection,
} from "@/features/master-data/conts";

interface MasterDataSectionPageProps {
  params: Promise<{ section: string }>;
}

const VALID_SECTIONS = new Set<MasterDataSection>(
  MASTER_DATA_SECTIONS.map((section) => section.slug),
);

export default async function MasterDataSectionPage({
  params,
}: MasterDataSectionPageProps) {
  const { section } = await params;
  const sectionSlug = section as MasterDataSection;

  if (!VALID_SECTIONS.has(sectionSlug)) {
    notFound();
  }

  const data = await getSectionData(sectionSlug);

  return (
    <MasterDataScreen key={sectionSlug} section={sectionSlug} data={data} />
  );
}
