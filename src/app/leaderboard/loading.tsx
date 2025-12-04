import { Spinner } from "@/components/spinner";

export default function Loading() {
  return (
    <div className="mt-10 flex-1 p-4">
      <Spinner className="text-foreground size-10" />
    </div>
  );
}
