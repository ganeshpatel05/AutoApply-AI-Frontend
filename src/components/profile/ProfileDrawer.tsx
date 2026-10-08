import { useEffect } from "react";
import { X, User, Sparkles } from "lucide-react";
import { useProfile } from "../../context/ProfileContext";
import { Profile } from "../../pages/Profile";

export function ProfileDrawer() {
  const { isProfileOpen, closeProfile } = useProfile();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isProfileOpen) {
        closeProfile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProfileOpen, closeProfile]);

  if (!isProfileOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Candidate Profile Panel"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeProfile}
      />

      {/* Slide-Over Drawer Container */}
      <div className="relative w-full max-w-4xl bg-[var(--bg-primary)] h-full shadow-2xl border-l border-[var(--border-color)] flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="h-14 px-5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 p-0.5 shadow-xs flex items-center justify-center">
              <div className="w-full h-full bg-[var(--bg-secondary)] rounded-[6px] flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">
                  Candidate Profile Panel
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[9px] uppercase tracking-wider border border-blue-500/20 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> AI Profile
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={closeProfile}
            className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-transparent hover:border-[var(--border-color)] transition-all cursor-pointer"
            title="Close Candidate Profile Panel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <Profile />
        </div>
      </div>
    </div>
  );
}
