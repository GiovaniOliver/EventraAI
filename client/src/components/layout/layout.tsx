import Header from "./header";
import BottomNavigation from "./bottom-navigation";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  currentPath: string;
}

export default function Layout({ children, currentPath }: LayoutProps) {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-16 pb-24 overflow-x-hidden">
        {children}
      </main>
      <BottomNavigation currentPath={currentPath} />
    </div>
  );
}
