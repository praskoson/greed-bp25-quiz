import { ReactNode } from "react";

export function RouteContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 ${className ?? ""}`}>{children}</div>
  );
}
