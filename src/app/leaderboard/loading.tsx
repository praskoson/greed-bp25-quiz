import { Spinner } from "@/components/spinner";

export default function Loading() {
  return (
    <div className="p-4 flex-1">
      <Spinner className="text-foreground size-10" />
    </div>
  );
}
