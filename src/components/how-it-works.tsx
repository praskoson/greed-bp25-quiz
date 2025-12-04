"use client";

import clsx from "clsx";
import { Drawer } from "vaul";
import { QuestionCircle } from "./svg/question-circle";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export default function HowItWorks({ className }: { className?: string }) {
  return (
    <Drawer.Root>
      <Drawer.Trigger
        className={clsx(
          "grid size-[60px] place-content-center rounded-full",
          "bg-brand-dark text-foreground-muted hover:bg-brand rounded-full shadow-lg",
          className,
        )}
      >
        <QuestionCircle className="size-7" />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-neutral fixed right-0 bottom-0 left-0 mt-24 flex h-fit flex-col rounded-t-2xl outline-none">
          <div className="p-4">
            <Drawer.Handle
              aria-hidden
              className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-gray-300"
            />
            <div className="mx-auto max-w-md px-3 py-4">
              <Drawer.Title className="text-center text-2xl font-semibold text-[#F9F6F6]">
                How does it work
              </Drawer.Title>
              <Drawer.Description className="sr-only">
                How does the quiz work
              </Drawer.Description>
              <ul className="font-base mt-4 space-y-1 text-sm/5 text-[#F7F7F7]">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Stake SOL for at least 60 days to participate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Answer 5 quiz questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Your score = Stake Amount × Correct Answers</span>
                </li>
              </ul>
            </div>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              href="https://x.com/GreedAcademy"
              target="_blank"
              className={cn(
                "mt-4 mb-8 flex items-center justify-center gap-1.5",
                "rounded-full px-2 py-4",
                "bg-brand text-[#F7F7F7]",
                "text-sm/5 font-semibold",
              )}
            >
              Greed Academy <ArrowUpRight className="size-5" />
            </motion.a>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
