import { ConnectButton } from "@/components/connect-button";
import { GreedAcademyDottedBackground } from "@/components/ga-dotted-bg";
import { GreedAcademyLogo } from "@/components/ga-logo";
import dynamic from "next/dynamic";

export function HomeRoute() {
  return (
    <div className="bg-brand flex h-full flex-col">
      <div className="flex h-16 items-end justify-center pb-1">
        <GreedAcademyLogo className="text-white" />
      </div>
      <div className="bg-surface-2 relative mx-4 mt-3 mb-4 min-h-0 grow overflow-hidden rounded-2xl">
        <div className="mt-[12%] flex flex-col gap-8">
          <h1 className="text-foreground px-4 text-center text-[46px]/[110%] font-black tracking-[-1.9px] uppercase">
            CONNECT WALLET TO CONTINUE
          </h1>
          <div className="w-full px-7">
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
