import { useState } from "react";
import DottedSvg from "../../public/logo-dotted.svg";
import { motion } from "motion/react";
import Image from "next/image";

export function GreedAcademyDottedBackground() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 0.5 : 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="pointer-events-none fixed -z-1 top-32 _-translate-y-1/2 w-[640px] left-1/2 -translate-x-1/2 flex items-center justify-center"
    >
      <Image
        onLoad={() => setIsLoaded(true)}
        src={DottedSvg}
        alt=""
        className="size-full object-contain"
      />
    </motion.div>
  );
}
