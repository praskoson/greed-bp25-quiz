import { GreedAcademyLogo } from "@/components/ga-logo";
import { BackLink } from "./_components/back-link";

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-surface-2 p-4 xl:pb-10 flex flex-col items-center">
      <div className="grow min-h-0 flex flex-col items-center xl:max-tv:max-w-[1440px] tv:max-w-[2000px] w-full">
        <GreedAcademyLogo className="text-brand-dark mt-5 xl:mt-10 xl:scale-150" />
        <h1 className="mt-2 text-[36px]/none font-black text-foreground tracking-[-1.1px] xl:mt-6 xl:text-[96px]/none xl:tracking-[-3px] xl:text-neutral">
          LEADERBOARD
        </h1>
        <p className="mt-4 text-xl text-foreground xl:text-3xl xl:mt-6">
          Score = Stake × Correct Answers
        </p>
        {children}
        <BackLink />
      </div>
    </div>
  );
}
