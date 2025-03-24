import Header from "./header";
import BottomNavigation from "./bottom-navigation";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  currentPath: string;
}

export default function Layout({ children, currentPath }: LayoutProps) {
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <Header />
      <div className="main-content pt-16 pb-20">
        {children}
      </div>
      <BottomNavigation currentPath={currentPath} />
    </div>
  );
}
