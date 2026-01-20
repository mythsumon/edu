import { cn } from "@/shared/lib/cn";

interface SpinnerProps {
  className?: string;
  size?: number;
  firstBlockColor?: string;
  secondBlockColor?: string;
}

export const Spinner = ({
  className,
  size = 30,
  firstBlockColor = "#005bba",
  secondBlockColor = "#fed500",
}: SpinnerProps) => {
  return (
    <>
      <style>{`
        @keyframes spinner-up {
          0%, 100% {
            transform: none;
          }
          25% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(-100%) translateY(-100%);
          }
          75% {
            transform: translateY(-100%);
          }
        }
        
        @keyframes spinner-down {
          0%, 100% {
            transform: none;
          }
          25% {
            transform: translateX(100%);
          }
          50% {
            transform: translateX(100%) translateY(100%);
          }
          75% {
            transform: translateY(100%);
          }
        }
        
        .spinner-block::before {
          content: "";
          box-sizing: border-box;
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          top: 50%;
          left: 50%;
          background: ${firstBlockColor};
          animation: spinner-up 2.4s cubic-bezier(0, 0, 0.24, 1.21) infinite;
        }
        
        .spinner-block::after {
          content: "";
          box-sizing: border-box;
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          top: calc(50% - ${size}px);
          left: calc(50% - ${size}px);
          background: ${secondBlockColor};
          animation: spinner-down 2.4s cubic-bezier(0, 0, 0.24, 1.21) infinite;
        }
      `}</style>
      <div
        className={cn(
          "spinner-block relative w-[100px] h-[100px]",
          className
        )}
      />
    </>
  );
};
