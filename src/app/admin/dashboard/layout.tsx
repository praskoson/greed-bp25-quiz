import { GreedAcademyLogo } from "@/components/ga-logo";
import { RefreshButton } from "../_components/refresh-button";
import { SignOutButton } from "../_components/sign-out-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-2">
      <header className="bg-brand py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <GreedAcademyLogo className="text-foreground-1" />
            <div className="h-5 w-px bg-white" />
            <span className="pl-3 font-futura text-xl mr-auto uppercase">
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
