import { motion } from "motion/react";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="size-2 rounded-full bg-muted/50"
        animate={{ y: ["0%", "-30%", "0%"] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="size-2 rounded-full bg-muted/50"
        animate={{ y: ["0%", "-50%", "0%"] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />
      <motion.div
        className="size-2 rounded-full bg-muted/50"
        animate={{ y: ["0%", "-60%", "0%"] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        }}
      />
    </div>
  );
}
