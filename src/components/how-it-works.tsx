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
          "size-[60px] grid place-content-center rounded-full",
          "rounded-full shadow-lg bg-brand-dark text-foreground-muted hover:bg-brand",
          className,
        )}
      >
        <QuestionCircle className="size-7" />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-neutral flex flex-col rounded-t-2xl mt-24 h-fit fixed bottom-0 left-0 right-0 outline-none">
          <div className="p-4">
            <Drawer.Handle
              aria-hidden
              className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-gray-300 mb-4"
            />
            <div className="max-w-md mx-auto px-3 py-4">
              <Drawer.Title className="text-[#F9F6F6] text-center font-semibold text-2xl">
                How does it work
              </Drawer.Title>
              <Drawer.Description className="sr-only">
                How does the quiz work
              </Drawer.Description>
              <ul className="mt-4 text-[#F7F7F7] text-sm/5 font-base space-y-1">
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
                "px-2 py-4 rounded-full",
                "bg-brand text-[#F7F7F7]",
                "font-semibold text-sm/5",
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
