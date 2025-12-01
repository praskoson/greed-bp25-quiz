import { ConnectButton } from "@/components/connect-button";
import { GreedAcademyDottedBackground } from "@/components/ga-dotted-bg";
import { GreedAcademyLogo } from "@/components/ga-logo";
// import HowItWorks from "@/components/how-it-works";
import dynamic from "next/dynamic";

export function HomeContent() {
  return (
    <div className="h-full grid place-content-center">
      <GreedAcademyLogo className="text-white fixed top-8 left-1/2 -translate-x-1/2" />
      <main className="h-full flex flex-col justify-center gap-20 pb-24">
        <div>
          <h1 className="text-surface-2 text-[64px]/[110%] font-black tracking-[-1.9px] uppercase">
            BP25 QUIZ
          </h1>
          <p className="text-surface-2 text-2xl font-futura tracking-tight">
            Stake, learn and win
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <ConnectButton />
        </div>
      </main>
      <GreedAcademyDottedBackground />
      <DynamicHowItWorks />
    </div>
  );
}

const DynamicHowItWorks = dynamic(() => import("@/components/how-it-works"), {
  ssr: false,
});
