"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { exportCompletedQuizResultsCsv } from "../_lib/actions";
import { Download } from "lucide-react";

export function ExportCsvButton() {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      const csv = await exportCompletedQuizResultsCsv();

      // Create and download the file
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quiz-results-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isPending}
      className="text-foreground"
    >
      <Download className="size-4" />
      {isPending ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
