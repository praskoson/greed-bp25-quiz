import { Spinner } from "@/components/spinner";

export default function Loading() {
  return (
    <div className="min-h-screen p-4">
      <Spinner className="text-foreground size-6" />
    </div>
  );
}
