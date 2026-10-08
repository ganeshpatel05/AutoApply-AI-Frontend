import { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { 
  Menu, 
  Download, 
  Check, 
  Bell,
  X,
  Bot,
  Activity,
  Sun,
  Moon,
  AlertTriangle,
  Home,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { useProfile } from "../../context/ProfileContext";
import { useTheme } from "../../hooks/useTheme";
import { api } from "../../api/client";
import type { SystemStatus, AgentLog, Resume } from "../../types";

interface TopHeaderProps {
  onToggleMobile?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function TopHeader({ onToggleMobile, sidebarCollapsed, onToggleSidebar }: TopHeaderProps) {
  const { isInstalled, openModal } = usePWAInstall();
  const { isProfileOpen, toggleProfile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [recentLogs, setRecentLogs] = useState<AgentLog[]>([]);
  const [userInitials, setUserInitials] = useState("AP");
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get<{ success: boolean; system: SystemStatus }>("/api/system/status");
        if (res.success) setSystemStatus(res.system);
      } catch {
        // silent fallback
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchActiveProfile = async () => {
      try {
        const res = await api.get<{ success: boolean; resume: Resume }>("/api/resumes/active");
        if (res.success && res.resume?.name) {
          const parts = res.resume.name.trim().split(" ");
          if (parts.length >= 2) {
            setUserInitials((parts[0][0] + parts[1][0]).toUpperCase());
          } else if (parts[0]) {
            setUserInitials(parts[0].slice(0, 2).toUpperCase());
          }
        }
      } catch {
        // fallback
      }
    };
    fetchActiveProfile();
  }, []);

  useEffect(() => {
    if (notificationsOpen) {
      api.get<{ success: boolean; logs: AgentLog[] }>("/api/agents/logs")
        .then(res => {
          if (res.success && Array.isArray(res.logs)) {
            setRecentLogs(res.logs.slice(0, 5));
          }
        })
        .catch(() => {});
    }
  }, [notificationsOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getBreadcrumbs = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/jobs":
        return "Jobs";
      case "/resume":
        return "Resume";
      case "/matcher":
        return "JD Matcher";
      case "/cover-letters":
        return "Cover Letters";
      case "/applications":
        return "Applications";
      case "/agents":
        return "AI Agents";
      case "/analytics":
        return "Analytics";
      case "/profile":
        return "Profile";
      case "/settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  const isOllamaConnected = systemStatus?.ollama?.status === "connected";
  const title = getBreadcrumbs();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (onToggleSidebar) onToggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggleSidebar]);

  return (
    <header className="h-16 flex items-center justify-between px-3.5 sm:px-5 md:px-6 bg-white dark:bg-[#0D1526] border-b border-[#E2E8F0] dark:border-slate-800/80 sticky top-0 z-30 text-[#102A63] dark:text-white transition-colors duration-200">
      {/* Left Navigation Title & Active Tab Underline matching Screenshot */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleMobile}
          className="md:hidden text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop / Laptop sidebar collapse toggle */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex text-slate-500 hover:text-[#1769F5] dark:text-slate-400 dark:hover:text-blue-300 p-1.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-slate-800/80 border border-transparent hover:border-blue-100 dark:hover:border-slate-700 transition-all cursor-pointer"
            title={sidebarCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-4.5 h-4.5 text-[#1769F5] dark:text-blue-400" />
            ) : (
              <PanelLeftClose className="w-4.5 h-4.5" />
            )}
          </button>
        )}

        <div className="flex items-center gap-2 relative">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer pb-0.5 relative">
            <Home className="w-4 h-4 text-[#2563EB] dark:text-blue-400 stroke-[2.2]" />
            <div className="relative pb-1">
              <h2 className="text-sm sm:text-base font-extrabold text-[#1E293B] dark:text-white tracking-tight">
                {title}
              </h2>
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#2563EB] rounded-full"></span>
            </div>
          </Link>
        </div>
      </div>

      {/* Right Header Controls matching Screenshot */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Install App Button */}
        <button
          onClick={openModal}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all active:scale-95 cursor-pointer shadow-xs ${
            isInstalled
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
              : "bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white"
          }`}
          title={isInstalled ? "AutoApply AI App Installed" : "Install AutoApply AI App"}
        >
          {isInstalled ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Installed</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Install App</span>
            </>
          )}
        </button>

        {/* AI / Ollama Connection Status Pill matching Screenshot */}
        <Link
          to="/settings"
          className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            isOllamaConnected
              ? "bg-[#ECFDF5] text-[#059669] dark:bg-emerald-950/60 dark:text-emerald-300"
              : "bg-amber-50 text-amber-700 dark:bg-[#D97706]/15 dark:text-amber-400"
          }`}
          title={isOllamaConnected ? "AI Connected (Instant)" : "Ollama Offline (Fallback Mode)"}
        >
          {isOllamaConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#10B981] dark:bg-emerald-400 shrink-0" />
              <span>AI Connected (Instant)</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Ollama Offline (Fallback Mode)</span>
            </>
          )}
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-amber-600 border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer flex items-center justify-center transition-all hover:scale-105"
          title="Toggle Light/Dark Theme"
          aria-label="Toggle Light/Dark Theme"
        >
          {theme === "dark" ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          )}
        </button>

        {/* Notification Button & Flyout Panel matching Screenshot */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs active:scale-95 cursor-pointer relative"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#EF4444] text-white font-black text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-2xs">
              3
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 p-4 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">AI Agent Notifications</h4>
                </div>
                <button 
                  onClick={() => setNotificationsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="py-2 space-y-2 max-h-64 overflow-y-auto my-1">
                {recentLogs.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No recent agent notifications.
                  </div>
                ) : (
                  recentLogs.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 flex items-start gap-2.5 text-xs">
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-[11px] text-blue-600 dark:text-blue-400">{log.agent_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate mt-0.5">{log.action}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  to="/agents"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Full Agent Console →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Circular Avatar Profile Button matching Screenshot ("AP" initials) */}
        <button
          type="button"
          onClick={toggleProfile}
          aria-label="Toggle Candidate Profile Panel"
          aria-expanded={isProfileOpen}
          className={`w-8 h-8 rounded-full bg-[#DBEAFE] dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-300 font-bold text-xs flex items-center justify-center transition-all duration-200 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs cursor-pointer ${
            isProfileOpen ? "ring-2 ring-[#2563EB] scale-105" : "hover:scale-105"
          }`}
          title={isProfileOpen ? "Close Profile Drawer" : "Open Profile Drawer"}
        >
          {userInitials}
        </button>
      </div>
    </header>
  );
}

