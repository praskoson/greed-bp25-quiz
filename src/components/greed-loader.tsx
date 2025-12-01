import { cn } from "@/lib/utils";
import { motion, MotionNodeAnimationOptions } from "motion/react";

const mainPath =
  "M478.046 333.378C478.756 333.627 479.53 333.627 480.24 333.378L540.093 312.418C543.056 311.38 543.055 307.19 540.092 306.153L479.143 284.833L453.142 275.728C450.179 274.691 450.18 270.5 453.143 269.463L512.997 248.527C513.706 248.279 514.479 248.279 515.188 248.526L549.042 260.355L679.864 306.151C682.827 307.188 682.827 311.379 679.864 312.416L480.239 382.28C479.529 382.528 478.756 382.528 478.047 382.28L368.209 343.868C366.051 343.113 363.795 344.715 363.795 347.001L363.795 424.844C363.795 426.261 364.694 427.521 366.033 427.982L478.059 466.533C478.761 466.774 479.524 466.773 480.225 466.53L614.537 420.014C616.693 419.268 618.942 420.869 618.942 423.15V478.167C618.942 479.577 618.05 480.833 616.719 481.299L480.239 529.066C479.529 529.315 478.756 529.315 478.046 529.066L306.616 469.06C305.285 468.594 304.394 467.338 304.394 465.928V323.877C304.394 322.467 303.503 321.211 302.172 320.745L138.622 263.488C135.659 262.45 135.659 258.26 138.622 257.223L478.047 138.43C478.756 138.182 479.529 138.182 480.239 138.43L819.665 257.224C822.627 258.261 822.628 262.45 819.665 263.488L759.809 284.449C759.099 284.698 758.326 284.698 757.616 284.45L480.239 187.359C479.529 187.111 478.756 187.111 478.046 187.359L278.421 257.223C275.458 258.26 275.458 262.45 278.421 263.488L478.046 333.378Z";

const secondPath =
  "M754.309 335.355C756.471 334.583 758.744 336.186 758.744 338.48V527.115C758.744 528.52 757.859 529.773 756.534 530.243L703.651 548.981C701.492 549.747 699.225 548.145 699.224 545.854L699.168 357.383C699.167 355.98 700.049 354.729 701.37 354.257L754.309 335.355Z";

// Animation variants for different effects
const animations: Record<
  string,
  {
    initial: MotionNodeAnimationOptions["initial"];
    animate: MotionNodeAnimationOptions["animate"];
  }
> = {
  // 1. Classic draw animation
  draw: {
    initial: {
      pathLength: 0,
      opacity: 0,
    },
    animate: {
      pathLength: [0, 1, 1, 0],
      opacity: [0, 1, 1, 0],
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: undefined,
        times: [0, 0.4, 0.6, 1],
      },
    },
  },
  sequential: {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: [0, 1, 1, 0],
      opacity: [0, 1, 1, 0],
      transition: {
        duration: 5,
        ease: "easeInOut",
        repeat: Infinity,
        times: [0, 0.4, 0.6, 1],
        delay: 0.1,
      },
    },
  },
};

export function AnimatedGreedLoader({ className }: { className?: string }) {
  return (
    <div className={cn("relative backdrop-blur", className)}>
      <motion.svg
        viewBox="0 0 962 693"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-64 h-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <defs>
          <clipPath id="clip0_386_357">
            <rect
              width="698.938"
              height="415.854"
              fill="currentColor"
              transform="translate(129.69 138.153)"
            />
          </clipPath>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            {/*<stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#c084fc" />*/}
            <stop offset="0%" stopColor="#7e1d1d" />
            <stop offset="50%" stopColor="#7e1d1d" />
            <stop offset="100%" stopColor="#7e1d1d" />
          </linearGradient>
        </defs>

        <g clipPath="url(#clip0_386_357)">
          {/* Background path (faded) */}
          <path
            d={mainPath}
            stroke="rgb(126 29 29 / 0.2)"
            strokeWidth="6"
            fill="none"
          />
          <path
            d={secondPath}
            stroke="rgb(126 29 29 / 0.2)"
            strokeWidth="6"
            fill="none"
          />

          {/* Animated main path */}
          <motion.path
            d={mainPath}
            stroke="url(#logoGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            {...animations["sequential"]}
          />

          {/* Animated second path with delay */}
          <motion.path
            d={secondPath}
            stroke="url(#logoGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={animations["sequential"].initial}
            animate={animations["sequential"].animate}
            transition={{ repeat: Infinity }}
            // transition={{
            //   ...animations["draw"].animate?.transition,

            //   // delay: animationType === "draw" ? 0.5 : 0,
            // }}
          />
        </g>
      </motion.svg>
    </div>
  );
}
