import { useState } from "react";
import DottedSvg from "../../public/logo-dotted.svg";
import { motion } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function GreedAcademyDottedBackground({
  className,
}: {
  className?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 0.5 : 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className={cn(
        "pointer-events-none flex items-center justify-center overflow-hidden",
        className,
      )}
    >
      <Image
        onLoad={() => setIsLoaded(true)}
        src={DottedSvg}
        alt=""
        className="h-auto w-full max-w-[650px] min-w-[400px] shrink-0 object-contain"
      />
    </motion.div>
  );
}
