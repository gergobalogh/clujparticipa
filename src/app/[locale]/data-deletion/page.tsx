import { Suspense } from "react";
import { DataDeletionContent } from "./content";

export default function DataDeletionPage() {
  return (
    <Suspense>
      <DataDeletionContent />
    </Suspense>
  );
}
