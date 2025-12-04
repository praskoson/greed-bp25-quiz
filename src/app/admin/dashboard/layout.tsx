import { GreedAcademyLogo } from "@/components/ga-logo";
import { RefreshButton } from "../_components/refresh-button";
import { SignOutButton } from "../_components/sign-out-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-2 min-h-screen">
      <header className="bg-brand px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-1">
            <GreedAcademyLogo className="text-foreground-1" />
            <div className="h-5 w-px bg-white" />
            <span className="font-futura mr-auto pl-3 text-xl uppercase">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <RefreshButton />
            <SignOutButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
