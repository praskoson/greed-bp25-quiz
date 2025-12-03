import { Spinner } from "./spinner";

export function PendingWrapper({
  children,
  isPending,
}: {
  children: React.ReactNode;
  isPending: boolean;
}) {
  return (
    <div
      style={{
        opacity: isPending ? 0.9 : 1,
      }}
      className="px-[0.625em] text-center transition-opacity ease-out"
    >
      <div className="relative">
        <div
          style={{
            transform: isPending ? "translateX(-0.75em)" : "translateX(0)",
            filter: isPending ? "blur(0px)" : "blur(2px)",
            opacity: isPending ? 1 : 0,
          }}
          className="absolute top-1/2 size-[1.1em] -translate-y-1/2 transition-transform ease-out"
        >
          <Spinner className="size-full stroke-current text-current" />
        </div>
        <div
          className="transition-transform ease-out"
          style={{
            transform: isPending ? "translateX(0.75em)" : "translateX(0)",
            color: isPending ? "rgb(252 195 195)" : "currentcolor",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
