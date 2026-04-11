/**
 * Layout — thin shell that injects floating widgets (AIChatBot) above
 * role-specific layouts. Each role (Recycler / Picker / Buyer) has its
 * own layout component with its own sidebar.
 */
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";

interface LayoutProps {
  children?: ReactNode; // floating widgets e.g. AIChatBot
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Outlet />
      {children}
    </>
  );
}
