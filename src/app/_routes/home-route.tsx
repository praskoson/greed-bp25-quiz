import { ConnectButton } from "@/components/connect-button";
import { GreedAcademyDottedBackground } from "@/components/ga-dotted-bg";
import { GreedAcademyLogo } from "@/components/ga-logo";
import dynamic from "next/dynamic";

export function HomeRoute() {
  return (
    <div className="h-full bg-brand flex flex-col">
      <div className="h-[90px] flex items-end justify-center pb-1">
        <GreedAcademyLogo className="text-white" />
      </div>
      <div className="relative bg-surface-2 mx-4 mb-4 mt-3 grow min-h-0 rounded-2xl overflow-hidden">
        <div className="mt-[12%] flex flex-col gap-8">
          <h1 className="text-foreground text-center text-[46px]/[110%] font-black tracking-[-1.9px] uppercase px-4">
            CONNECT WALLET TO CONTINUE
          </h1>
          <div className="px-7 w-full">
            <ConnectButton />
          </div>
        </div>
        <GreedAcademyDottedBackground className="pt-6" />

        <DynamicHowItWorks className="absolute bottom-5 left-5" />
      </div>
    </div>
  );
}

const DynamicHowItWorks = dynamic(() => import("@/components/how-it-works"), {
  ssr: false,
});
