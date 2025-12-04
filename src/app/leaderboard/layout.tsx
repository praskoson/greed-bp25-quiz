import { GreedAcademyLogo } from "@/components/ga-logo";
import { BackLink } from "./_components/back-link";

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="bg-surface-2 relative flex min-h-screen flex-col items-center p-4 xl:pb-10">
      <div className="xl:max-tv:max-w-[1440px] tv:max-w-[2000px] flex min-h-0 w-full grow flex-col items-center">
        <GreedAcademyLogo className="text-brand-dark mt-5 xl:mt-10 xl:scale-150" />
        <h1 className="text-foreground xl:text-neutral mt-2 text-[36px]/none font-black tracking-[-1.1px] xl:mt-6 xl:text-[96px]/none xl:tracking-[-3px]">
          LEADERBOARD
        </h1>
        <p className="text-foreground mt-4 text-xl xl:mt-6 xl:text-3xl">
          Score = Stake × Correct Answers
        </p>
        {children}
        <BackLink />
      </div>
    </div>
  );
}
