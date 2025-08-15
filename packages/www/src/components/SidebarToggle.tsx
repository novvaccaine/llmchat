import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/uiStore";
import { PanelRight as SidebarIcon } from "lucide-react";
import { useMediaQuery } from "@uidotdev/usehooks";

type Props = {
  className?: string;
};

export const MEDIUM_DEVICE_QUERY = "only screen and (max-width : 768px)";

export function SidebarToggle(props: Props) {
  const isMediumSizedDevice = useMediaQuery(MEDIUM_DEVICE_QUERY);
  const toggleSidebar = useUIStore().toggleSidebar;
  const toggleDrawerSidebar = useUIStore().toggleDrawerSidebar;

  return (
    <button
      className={cn("p-2 rounded-md", props.className)}
      onClick={() => {
        if (isMediumSizedDevice) {
          toggleDrawerSidebar();
        } else {
          toggleSidebar();
        }
      }}
    >
      <SidebarIcon size={17} />
    </button>
  );
}
