import { GreedAcademyLogo } from "@/components/ga-logo";
import { RefreshButton } from "../_components/refresh-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-2 min-h-screen">
      <header className="bg-brand px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <GreedAcademyLogo className="text-foreground-1" />
          <div className="flex items-center gap-4">
            <RefreshButton />
            <span className="text-foreground-1 text-sm font-medium">
              Admin Dashboard
            </span>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
