import { GreedAcademyLogo } from "@/components/ga-logo";
import { RefreshButton } from "./_components/refresh-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-2">
      <header className="bg-brand py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
