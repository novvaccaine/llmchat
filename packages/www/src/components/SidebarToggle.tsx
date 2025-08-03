import { cn } from '@/utils';
import { useUIStore } from '@/utils/uiStore';
import { PanelRight as SidebarIcon } from 'lucide-react';

export function SidebarToggle() {
  const toggleSidebar = useUIStore().toggleSidebar
  const sidebarOpen = useUIStore().sidebarOpen

  return (
    <button className={cn("fixed top-[13px] left-2 p-2 hover:bg-bg rounded-md", {
      "hover:bg-bg-2": !sidebarOpen
    })} onClick={toggleSidebar}>
      <SidebarIcon size={17} />
    </button>
  )
}
