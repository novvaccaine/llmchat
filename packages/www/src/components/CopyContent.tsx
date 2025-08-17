import { useState } from "react";
import { toast } from "sonner";
import { Copy as CopyIcon, Check as CheckIcon } from "lucide-react";

type Props = {
  content: string;
};

export function CopyContent(props: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(props.content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.error("failed to copy", err);
      toast.error("Failed to copy");
    }
  }

  return copied ? (
    <CheckIcon size={16} />
  ) : (
    <button onClick={copy}>
      <CopyIcon size={16} />
    </button>
  );
}
