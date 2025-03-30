import Sidebar from "@/components/sidebar/Sidebar";
import { ReactNode } from "react";

interface SidebarLayoutProps {
  children: ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  return (
      <main className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-8 relative">
          {children}
          </div>
      </main>
  );
};

export default SidebarLayout;