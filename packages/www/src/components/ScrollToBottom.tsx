import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";

export type Props = {
  className?: string;
  isAtBottom: boolean;
  scrollToBottom: () => void;
};

export function ScrollToBottom(props: Props) {
  const { isAtBottom, scrollToBottom } = props;

  return (
    <motion.button
      className={cn(
        "flex items-center gap-3 bg-bg-2 text-sm border border-border px-4 py-1 rounded-full",
        isAtBottom && "pointer-events-none",
        props.className,
      )}
      initial={{ y: 16, scale: 0.95, opacity: 0 }}
      animate={{
        y: isAtBottom ? 16 : 0,
        scale: isAtBottom ? 0.95 : 1,
        opacity: isAtBottom ? 0 : 1,
      }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      onClick={() => scrollToBottom()}
    >
      <span>Scroll to bottom</span>
      <ChevronDown size={16} />
    </motion.button>
  );
}
