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
      className="pointer-events-none absolute -z-10 top-32 inset-x-0 flex items-center justify-center overflow-hidden"
    >
      <Image
        onLoad={() => setIsLoaded(true)}
        src={DottedSvg}
        alt=""
        className="w-[640px] h-auto shrink-0 object-contain"
      />
    </motion.div>
  );
}
