import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { PWAInstallPrompt } from "../pwa/PWAInstallPrompt";
import { OfflineNotifier } from "../pwa/OfflineNotifier";
import { ProfileDrawer } from "../profile/ProfileDrawer";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("autoapply_sidebar_collapsed");
      if (saved !== null) return saved === "true";
      // Auto-collapse on medium laptop screens under 1200px if no user preference
      if (typeof window !== "undefined" && window.innerWidth < 1200) return true;
    } catch {
      // fallback
    }
    return false;
  });

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem("autoapply_sidebar_collapsed", String(next));
      } catch {
        // silent
      }
      return next;
    });
  };

  return (
    <div className="flex h-screen bg-[#F5F9FF] dark:bg-[#090D16] text-[#102A63] dark:text-slate-100 overflow-hidden font-sans">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar 
        mobileOpen={mobileOpen} 
        onCloseMobile={() => setMobileOpen(false)} 
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopHeader 
          onToggleMobile={() => setMobileOpen(!mobileOpen)} 
          sidebarCollapsed={collapsed}
          onToggleSidebar={toggleCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6 scroll-smooth">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* AI Candidate Profile Drawer Overlay */}
      <ProfileDrawer />

      {/* PWA Features & Offline Status Notifier */}
      <PWAInstallPrompt />
      <OfflineNotifier />
    </div>
  );
}
