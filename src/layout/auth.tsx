import { Menu } from "@/components/menu";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row gap-0 md:gap-2 w-full min-h-screen">
      <SidebarProvider>
        <Menu />
        <div className="flex-1 p-3 md:p-5 w-full overflow-x-hidden">
          <Outlet />
        </div>
      </SidebarProvider>
    </div>
  );
};
