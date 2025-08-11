import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/uiStore";
import { PanelRight as SidebarIcon } from "lucide-react";

type Props = {
  className?: string;
};

export function SidebarToggle(props: Props) {
  const toggleSidebar = useUIStore().toggleSidebar;

  return (
    <button
      className={cn("p-2 rounded-md", props.className)}
      onClick={toggleSidebar}
    >
      <SidebarIcon size={17} />
    </button>
  );
}
