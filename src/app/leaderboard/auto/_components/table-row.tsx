import { cn } from "@/lib/utils";

export function LeaderboardRowDesktop({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full p-4 bg-surface-1",
        "items-center justify-between grid grid-cols-subgrid col-span-full bg-[#F9F6F6] rounded-full",
      )}
    >
      {children}
    </div>
  );
}
