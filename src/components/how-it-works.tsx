"use client";

import { Drawer } from "vaul";

export default function HowItWorks() {
  return (
    <Drawer.Root>
      <Drawer.Trigger className="fixed bottom-9 size-10 left-6 rounded-full bg-foreground-2 shadow-lg grid place-content-center text-brand-dark text-xl font-black">
        ?
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-foreground-2 border-t-4 border-x-4 border-[#EDD8D8] flex flex-col rounded-t-2xl mt-24 h-fit fixed bottom-0 left-0 right-0 outline-none">
          <div className="p-4">
            <Drawer.Handle
              aria-hidden
              className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-gray-300 mb-8"
            />
            <div className="max-w-md mx-auto pb-12">
              <Drawer.Title className="text-foreground font-futura text-lg mb-4">
                How does it work
              </Drawer.Title>
              <Drawer.Description className="sr-only">
                Instructions on how the quiz works
              </Drawer.Description>
              <ul className="text-foreground font-base space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-brand-dark">•</span>
                  <span>Stake SOL for at least 60 days to participate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-dark">•</span>
                  <span>Answer 5 quiz questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-dark">•</span>
                  <span>Your score = Stake Amount × Correct Answers</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="p-4 bg-[#EDD8D8] text-foreground mt-auto">
            <a
              className="text-xs font-semibold flex items-center gap-px"
              href="https://x.com/GreedAcademy"
              target="_blank"
            >
              Greed Academy
              <svg
                fill="none"
                height="16"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="16"
                aria-hidden="true"
                className="w-3 h-3 ml-1"
              >
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
                <path d="M15 3h6v6"></path>
                <path d="M10 14L21 3"></path>
              </svg>
            </a>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
