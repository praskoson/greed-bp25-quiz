import { cn } from "@/lib/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { Popover as PopoverPrimitive } from "@base-ui-components/react/popover";
import { WalletIcon } from "./svg/wallet-icon";
import { XIcon } from "lucide-react";

export function ConnectedWalletButton({
  className,
  onConnect,
  onDisconnect,
}: {
  className?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}) {
  const { disconnect, connect, connected, publicKey } = useWallet();

  if (!connected) {
    return (
      <button
        onClick={async () => {
          await connect();
          if (onConnect) {
            onConnect();
          }
        }}
        className={cn(
          "flex items-center justify-center rounded-full gap-[7px]",
          "rounded-full font-medium text-sm/[130%] text-brand bg-surface-3",
          className,
        )}
      >
        Connect
      </button>
    );
  }

  const shortAddress = `${publicKey?.toBase58().slice(0, 4)}…${publicKey?.toBase58().slice(-4)}`;

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex items-center justify-center gap-[7px] py-[18px]",
          "rounded-full font-medium text-sm/6 text-brand",
          "bg-surface-3 aria-disabled:pointer-events-none",
          className,
        )}
      >
        Connected as {shortAddress} <WalletIcon className="size-6" />
      </PopoverTrigger>
      <PopoverPopup>
        <PopoverPrimitive.Close
          onClick={async () => {
            await disconnect();
            if (onDisconnect) {
              onDisconnect();
            }
          }}
          className={cn(
            "h-[60px] w-full font-medium text-sm/[130%] flex gap-1 items-center justify-center rounded-full",
            "rounded-full bg-[#FCC3C3] text-[#F00F0F]",
          )}
        >
          <XIcon className="size-4" />
          Disconnect Wallet
        </PopoverPrimitive.Close>
        <PopoverPrimitive.Close
          className={cn(
            "h-[54px] w-full font-medium text-sm/[130%] flex items-center justify-center",
            "text-neutral bg-transparent",
          )}
        >
          Cancel
        </PopoverPrimitive.Close>
      </PopoverPopup>
    </Popover>
  );
}

const scale = [
  `[transition-property:scale,opacity] [will-change:scale,opacity]`,
  `data-starting-style:scale-80 data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:scale-80`,
];

const snappyOut = `duration-[0.35s] ease-[cubic-bezier(0.19,1,0.22,1)]`;

type PopoverProps = PopoverPrimitive.Root.Props;

function Popover({ ...props }: PopoverProps) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

type PopoverTriggerProps = PopoverPrimitive.Trigger.Props;

function PopoverTrigger({ ...props }: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

interface PopoverPopupProps
  extends PopoverPrimitive.Popup.Props,
    Pick<
      PopoverPositionerProps,
      "side" | "sideOffset" | "align" | "alignOffset"
    > {}

function PopoverPopup({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...rest
}: PopoverPopupProps) {
  return (
    <PopoverPositioner
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
    >
      <PopoverPrimitive.Popup
        data-slot="popover-popup"
        render={
          <div
            key="popover-popup"
            className={cn(
              "pointer-events-auto origin-(--transform-origin) w-(--anchor-width) bg-white p-1 shadow-sm rounded-[30px]",
              scale,
              snappyOut,
              className,
            )}
          >
            {children}
          </div>
        }
        {...rest}
      />
    </PopoverPositioner>
  );
}

type PopoverTitleProps = PopoverPrimitive.Title.Props;

function PopoverTitle({ className, ...rest }: PopoverTitleProps) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("text-base text-popover-foreground font-medium", className)}
      {...rest}
    />
  );
}

type PopoverPortalProps = PopoverPrimitive.Portal.Props;

function PopoverPortal(props: PopoverPortalProps) {
  return <PopoverPrimitive.Portal data-slot="popover-portal" {...props} />;
}

type PopoverPositionerProps = PopoverPrimitive.Positioner.Props;

function PopoverPositioner({
  sideOffset = 5,
  side = "bottom",
  className,
  ...rest
}: PopoverPositionerProps) {
  return (
    <PopoverPortal>
      <PopoverPrimitive.Positioner
        sideOffset={sideOffset}
        side={side}
        data-slot="popover-positioner"
        className={cn("z-100", className)}
        {...rest}
      />
    </PopoverPortal>
  );
}
