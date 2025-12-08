import { GreedAcademyLogo } from "@/components/ga-logo";
import { BackLink } from "./_components/back-link";

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="bg-surface-2 relative flex min-h-screen flex-col items-center p-4 xl:pb-10">
      <div className="xl:max-tv:max-w-[1440px] tv:max-w-[2000px] flex min-h-0 w-full grow flex-col items-center">
        <GreedAcademyLogo className="text-brand-dark mt-3 xl:mt-9 xl:scale-150" />
        <h1 className="text-foreground xl:text-neutral mt-2 text-[34px]/none font-black tracking-[-1.1px] xl:mt-5 xl:text-[96px]/none xl:tracking-[-3px]">
          LEADERBOARD
        </h1>
        <p className="text-foreground -mx-1 mt-3.5 text-center text-sm xl:mt-6 xl:text-2xl">
          Score = Stake × Quiz multiplier (from 1.0× to 2.0×)
        </p>
        {children}
        <BackLink />
      </div>
    </div>
  );
}
