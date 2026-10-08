import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import { 
  LayoutGrid, 
  Briefcase, 
  FileText, 
  Target, 
  Mail, 
  CheckCircle2,
  Bot,
  BarChart3,
  User,
  Settings,
  Sparkles,
  Smartphone,
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile, collapsed = false, onToggleCollapse }: SidebarProps) {
  const location = useLocation();

  const navigationSections = [
    {
      title: "OVERVIEW",
      links: [
        { name: "Dashboard", href: "/", icon: LayoutGrid }
      ]
    },
    {
      title: "WORKSPACE",
      links: [
        { name: "Jobs", href: "/jobs", icon: Briefcase },
        { name: "Resume", href: "/resume", icon: FileText },
        { name: "JD Matcher", href: "/matcher", icon: Target },
        { name: "Cover Letters", href: "/cover-letters", icon: Mail },
        { name: "Applications", href: "/applications", icon: CheckCircle2 }
      ]
    },
    {
      title: "AI COMMAND",
      links: [
        { name: "AI Agents", href: "/agents", icon: Bot }
      ]
    },
    {
      title: "INSIGHTS",
      links: [
        { name: "Analytics", href: "/analytics", icon: BarChart3 }
      ]
    },
    {
      title: "ACCOUNT",
      links: [
        { name: "Profile", href: "/profile", icon: User },
        { name: "Settings", href: "/settings", icon: Settings }
      ]
    }
  ];

  return (
    <aside className={cn(
      "flex-shrink-0 flex flex-col bg-white dark:bg-[#0D1526] border-r border-[#E2E8F0] dark:border-slate-800/80 transition-all duration-300 z-40 shadow-xs",
      collapsed ? "w-[72px]" : "w-[245px]",
      "fixed md:static inset-y-0 left-0",
      mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      {/* Brand Header */}
      <div className={cn(
        "h-16 flex items-center border-b border-[#E2E8F0] dark:border-slate-800/80 bg-white dark:bg-[#0D1526] transition-all",
        collapsed ? "justify-center px-2" : "justify-between px-4"
      )}>
        <Link 
          to="/" 
          className="flex items-center gap-2.5 group overflow-hidden" 
          onClick={onCloseMobile}
          title={collapsed ? "AutoApply AI - Dashboard" : undefined}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1769F5] via-[#5241E2] to-[#792BEE] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all duration-200 shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <span className="text-[14px] font-black text-[#5241E2] dark:text-indigo-400 tracking-tight block leading-tight truncate">
                AutoApply AI
              </span>
              <span className="block text-[9px] tracking-widest text-[#6B7280] dark:text-slate-400 uppercase font-extrabold mt-0.5 truncate">
                CAREER COMMAND
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className={cn(
        "flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin",
        collapsed ? "px-2" : "px-3"
      )}>
        {navigationSections.map((section) => (
          <div key={section.title}>
            {!collapsed ? (
              <h3 className="px-2 text-[10px] font-black text-[#526783] dark:text-slate-500 uppercase tracking-wider mb-1.5">
                {section.title}
              </h3>
            ) : (
              <div className="h-px bg-slate-200/80 dark:bg-slate-800 my-2 mx-1" />
            )}
            <nav className="space-y-1">
              {section.links.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onCloseMobile}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "flex items-center rounded-xl text-xs transition-all duration-200 group relative",
                      collapsed ? "justify-center py-2.5 px-0" : "gap-3 px-3 py-2",
                      isActive 
                        ? "bg-[#EFF6FF] dark:bg-blue-950/60 text-[#1769F5] dark:text-blue-300 font-extrabold shadow-2xs" 
                        : "text-[#102A63] dark:text-slate-300 font-semibold hover:text-[#1769F5] dark:hover:text-blue-400 hover:bg-[#F5F9FF] dark:hover:bg-slate-800/60"
                    )}
                  >
                    <item.icon className={cn(
                      "w-4 h-4 transition-all duration-200 group-hover:scale-110 shrink-0 stroke-[2.2]",
                      isActive ? "text-[#1769F5] dark:text-blue-400" : "text-[#526783] dark:text-slate-400 group-hover:text-[#1769F5]"
                    )} />
                    {!collapsed && (
                      <span className="tracking-tight text-xs truncate">{item.name}</span>
                    )}
                    {isActive && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1769F5] dark:bg-blue-400 shadow-2xs"></span>
                    )}
                    {isActive && collapsed && (
                      <span className="absolute left-1 w-1 h-5 rounded-full bg-[#1769F5] dark:bg-blue-400"></span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* If INSIGHTS, render the Android & Mobile App Card */}
            {section.title === "INSIGHTS" && (
              !collapsed ? (
                <div className="mt-3 p-3 rounded-2xl bg-[#F0F7FF] dark:bg-slate-800/80 border border-[#DCE9FA] dark:border-slate-700/60 text-xs shadow-2xs hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-[#1769F5] dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs border border-blue-100 dark:border-slate-600">
                      <Smartphone className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-extrabold text-[11px] text-[#102A63] dark:text-slate-200 tracking-tight">Mobile App</span>
                  </div>
                  <p className="text-[10px] text-[#526783] dark:text-slate-400 leading-normal mb-2 font-medium">
                    Install AutoApply AI on home screen.
                  </p>
                  <button
                    onClick={() => {
                      if (onCloseMobile) onCloseMobile();
                      window.dispatchEvent(new CustomEvent("trigger-pwa-install"));
                    }}
                    className="w-full py-1.5 px-2.5 rounded-full btn-gradient text-white font-extrabold text-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Download className="w-3 h-3" />
                    <span>Install Mobile App</span>
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex justify-center">
                  <button
                    onClick={() => {
                      if (onCloseMobile) onCloseMobile();
                      window.dispatchEvent(new CustomEvent("trigger-pwa-install"));
                    }}
                    title="Install Mobile App (PWA)"
                    className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-slate-800 text-[#1769F5] dark:text-blue-400 flex items-center justify-center border border-blue-200/80 dark:border-slate-700 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )
            )}
          </div>
        ))}
      </div>

      {/* Collapse/Expand Toggle Footer for Desktop & Laptops */}
      {onToggleCollapse && (
        <div className="p-2 border-t border-[#E2E8F0] dark:border-slate-800/80 hidden md:block bg-slate-50/50 dark:bg-[#0B1220]">
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar (give more details)" : "Collapse sidebar (give more screen space)"}
            className={cn(
              "w-full flex items-center rounded-xl p-2 text-xs font-semibold text-[#526783] dark:text-slate-400 hover:text-[#1769F5] dark:hover:text-blue-300 hover:bg-white dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer",
              collapsed ? "justify-center" : "justify-between"
            )}
          >
            {!collapsed && (
              <span className="text-[11px] font-bold">Collapse Sidebar</span>
            )}
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-[#1769F5]" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
