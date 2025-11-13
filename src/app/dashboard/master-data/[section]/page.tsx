"use client";

import { notFound, useParams } from "next/navigation";

import { MasterDataScreen } from "@/features/master-data";
import {
  MASTER_DATA_SECTIONS,
  type MasterDataSection,
} from "@/features/master-data/conts";

const VALID_SECTIONS = new Set<MasterDataSection>(
  MASTER_DATA_SECTIONS.map((section) => section.slug),
);

export default function MasterDataSectionPage() {
  const params = useParams();
  const section = params?.section as string | undefined;
  const sectionSlug = section as MasterDataSection | undefined;

  if (!sectionSlug || !VALID_SECTIONS.has(sectionSlug)) {
    notFound();
  }

  return <MasterDataScreen section={sectionSlug} />;
}
