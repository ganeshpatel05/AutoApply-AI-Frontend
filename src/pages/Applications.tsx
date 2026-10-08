import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import type { Application, Job } from "../types";
import { 
  Building, 
  MapPin, 
  Calendar, 
  Loader2, 
  Plus, 
  Trash2, 
  ExternalLink, 
  X,
  Users,
  LayoutGrid,
  List
} from "lucide-react";
import { cn } from "../utils/cn";
import { getValidJobUrl, handleOpenOriginalPosting } from "../utils/url";

const KANBAN_COLUMNS = ["Saved", "Applied", "Screening", "Interview", "Offer", "Rejected", "Withdrawn"];

const COLUMN_THEMES: Record<string, { badge: string; dot: string; headerBorder: string }> = {
  Saved: { badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20", dot: "bg-indigo-500", headerBorder: "border-indigo-500/30" },
  Applied: { badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", dot: "bg-blue-500", headerBorder: "border-blue-500/30" },
  Screening: { badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20", dot: "bg-sky-500", headerBorder: "border-sky-500/30" },
  Interview: { badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", dot: "bg-emerald-500", headerBorder: "border-emerald-500/30" },
  Offer: { badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", dot: "bg-amber-500", headerBorder: "border-amber-500/30" },
  Rejected: { badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20", dot: "bg-rose-500", headerBorder: "border-rose-500/30" },
  Withdrawn: { badge: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20", dot: "bg-slate-500", headerBorder: "border-slate-500/30" },
};

export function Applications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status");

  const [apps, setApps] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  
  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // New App Form State
  const [newJobId, setNewJobId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState("Saved");
  const [newNotes, setNewNotes] = useState("");
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appsRes, jobsRes] = await Promise.all([
        api.get<{ success: boolean; applications: Application[] }>("/api/applications/"),
        api.get<{ success: boolean; jobs: Job[] }>("/api/jobs/")
      ]);
      if (appsRes?.success && Array.isArray(appsRes.applications)) setApps(appsRes.applications);
      if (jobsRes?.success && Array.isArray(jobsRes.jobs)) {
        setJobs(jobsRes.jobs);
        if (jobsRes.jobs.length > 0) setNewJobId(jobsRes.jobs[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (appId: number, status: string, notes?: string) => {
    setUpdatingId(appId);
    try {
      await api.put(`/api/applications/${appId}/status`, { status, notes });
      setApps(apps.map(a => a.id === appId ? { ...a, status, notes: notes !== undefined ? notes : a.notes } : a));
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status, notes: notes !== undefined ? notes : selectedApp.notes });
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobId) return;
    setCreating(true);
    try {
      const res = await api.post<{ success: boolean; application: Application }>("/api/applications/", {
        job_id: newJobId,
        status: newStatus,
        notes: newNotes
      });
      if (res.success) {
        setAddModalOpen(false);
        setNewNotes("");
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || "Failed to create application");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteApplication = async (appId: number) => {
    if (!confirm("Are you sure you want to delete this application record?")) return;
    try {
      await api.delete(`/api/applications/${appId}`);
      setApps(apps.filter(a => a.id !== appId));
      if (selectedApp?.id === appId) setSelectedApp(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete application");
    }
  };

  const activeColumns = statusFilter
    ? KANBAN_COLUMNS.filter(c => c.toLowerCase() === statusFilter.toLowerCase())
    : KANBAN_COLUMNS;

  const filteredAppsCount = statusFilter
    ? apps.filter(a => a.status.toLowerCase() === statusFilter.toLowerCase()).length
    : apps.length;

  return (
    <div className="space-y-6">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md p-4 md:p-5 saas-card rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Pipeline Kanban
            </span>
            <span className="text-[11px] font-bold text-[var(--text-muted)]">• {apps.length} Total Applications</span>
          </div>
          <h2 className="text-lg md:text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {statusFilter ? `${statusFilter} Applications` : "Application Pipeline Kanban"}
          </h2>
          <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] font-medium mt-0.5">
            {statusFilter 
              ? `Filtered view showing opportunities in '${statusFilter}' stage.` 
              : "Track and advance target opportunities across pipeline stages."}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#F0F7FF] dark:bg-slate-800 p-1 rounded-xl border border-blue-200/80 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                viewMode === "kanban" 
                  ? "bg-white dark:bg-slate-900 text-[#1769F5] dark:text-blue-300 shadow-2xs font-extrabold" 
                  : "text-[#526783] dark:text-slate-400 hover:text-[#1769F5]"
              )}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                viewMode === "table" 
                  ? "bg-white dark:bg-slate-900 text-[#1769F5] dark:text-blue-300 shadow-2xs font-extrabold" 
                  : "text-[#526783] dark:text-slate-400 hover:text-[#1769F5]"
              )}
              title="Fit to Screen Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table (Fit Screen)</span>
            </button>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-black shadow-md hover:shadow-indigo-500/20 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" /> Add Application
          </button>
        </div>
      </div>

      {/* Quick Stage Filter Badges Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSearchParams({})}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer active:scale-95 shadow-2xs",
            !statusFilter 
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-xs" 
              : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          )}
        >
          All Stages ({apps.length})
        </button>
        {KANBAN_COLUMNS.map(col => {
          const count = apps.filter(a => a.status === col).length;
          const isActive = statusFilter?.toLowerCase() === col.toLowerCase();
          return (
            <button
              key={col}
              onClick={() => setSearchParams({ status: col })}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-2xs",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-xs"
                  : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", COLUMN_THEMES[col]?.dot || "bg-blue-500")}></span>
              <span>{col}</span>
              <span className={cn("text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold", isActive ? "bg-white/20 text-white" : "bg-[var(--bg-card)] text-[var(--text-muted)]")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Status Bar */}
      {statusFilter && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-blue-500/10 border border-blue-500/25 rounded-2xl text-xs text-blue-700 dark:text-blue-300 font-semibold shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold px-2.5 py-0.5 rounded-md bg-blue-500/20 uppercase text-[10px] tracking-wider">
              Filtered Stage: {statusFilter}
            </span>
            <span>
              {filteredAppsCount} application{filteredAppsCount === 1 ? "" : "s"} found
            </span>
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-extrabold transition-all text-xs cursor-pointer shadow-xs active:scale-95"
          >
            Show All Pipeline Stages →
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 text-blue-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : statusFilter && filteredAppsCount === 0 ? (
        /* Empty State for Filtered View (e.g. Interviews) */
        <div className="text-center py-16 saas-card rounded-2xl p-8 shadow-xs max-w-lg mx-auto border-2 border-dashed border-[var(--border-color)]">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-[var(--text-primary)] mb-1">
            {statusFilter === "Interview" ? "No Interviews Scheduled Yet" : `No Applications in '${statusFilter}' Stage`}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-sm mx-auto font-medium leading-relaxed">
            {statusFilter === "Interview"
              ? "When you advance job applications to the Interview stage, upcoming interview records, dates, and notes will appear here."
              : `You currently have no job applications in the ${statusFilter} pipeline stage.`}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setSearchParams({})}
              className="px-4 py-2.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl text-xs font-extrabold transition-all cursor-pointer active:scale-98"
            >
              View Full Pipeline
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer active:scale-98"
            >
              Add Application
            </button>
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* Fit-to-Screen SaaS Data Table View */
        <div className="bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFD] dark:bg-slate-850/80 border-b border-[#E2E8F0] dark:border-slate-800 text-[#526783] dark:text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Job & Company</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Stage Status</th>
                  <th className="py-3 px-4">ATS Match</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF2F7] dark:divide-slate-800/80 font-medium">
                {(statusFilter ? apps.filter(a => a.status.toLowerCase() === statusFilter.toLowerCase()) : apps).map(app => (
                  <tr 
                    key={app.id} 
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EBF5FF] dark:bg-blue-950 text-[#1769F5] dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {app.company ? app.company.charAt(0).toUpperCase() : "J"}
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-[#102A63] dark:text-white block group-hover:text-[#1769F5] dark:group-hover:text-blue-400 transition-colors truncate">
                            {app.job_title}
                          </span>
                          <span className="text-[11px] text-[#526783] dark:text-slate-400 font-semibold block truncate">
                            {app.company}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[#526783] dark:text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{app.location || "Remote"}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer shadow-2xs transition-all",
                          COLUMN_THEMES[app.status]?.badge || "bg-blue-500/10 text-blue-600"
                        )}
                      >
                        {KANBAN_COLUMNS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-full border shadow-2xs",
                        app.ats_score >= 80 ? "bg-[#E8FAF0] text-[#059669] border-[#B7E4C7] dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300" :
                        app.ats_score >= 60 ? "bg-[#EBF5FF] text-[#1769F5] border-[#C3E0FF] dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300" :
                        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                      )}>
                        {Math.round(app.ats_score)}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#526783] dark:text-slate-400 whitespace-nowrap text-[11px] font-mono">
                      {new Date(app.updated_at).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[#1769F5] dark:text-blue-300 hover:bg-blue-50 text-[11px] font-bold shadow-2xs"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(app.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Board Columns */
        <div className="flex gap-3.5 overflow-x-auto pb-4 min-h-[calc(100vh-14rem)] scrollbar-thin">
          {activeColumns.map(column => {
            const columnApps = apps.filter(a => a.status === column);
            const themeInfo = COLUMN_THEMES[column] || COLUMN_THEMES.Saved;
            return (
              <div key={column} className="flex-shrink-0 w-72 sm:w-76 flex flex-col saas-card rounded-2xl overflow-hidden shadow-xs border border-[var(--border-color)]">
                {/* Column Header */}
                <div className={cn("p-3 sm:p-3.5 border-b bg-gradient-to-r from-blue-500/5 to-indigo-500/5 flex justify-between items-center", themeInfo.headerBorder)}>
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full shadow-xs", themeInfo.dot)}></span>
                    <h3 className="font-extrabold text-xs text-[var(--text-primary)] uppercase tracking-wider">{column}</h3>
                  </div>
                  <span className={cn("text-[10px] sm:text-[11px] py-0.5 px-2 rounded-full font-black border", themeInfo.badge)}>
                    {columnApps.length}
                  </span>
                </div>
                
                {/* Cards List */}
                <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2.5">
                  {columnApps.map(app => (
                    <div 
                      key={app.id} 
                      onClick={() => setSelectedApp(app)}
                      className={cn(
                        "bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-blue-500/40 rounded-xl p-3 sm:p-3.5 shadow-2xs cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xs group",
                        updatingId === app.id && "opacity-50 pointer-events-none"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:border-blue-500/30 transition-colors">
                            {app.company ? app.company.charAt(0).toUpperCase() : "J"}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-xs text-[var(--text-primary)] leading-snug truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {app.job_title}
                            </h4>
                            <p className="text-[11px] text-[var(--text-secondary)] font-semibold truncate flex items-center gap-1">
                              <Building className="w-3 h-3 text-blue-500 shrink-0" />
                              <span className="truncate">{app.company}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-xs text-[var(--text-secondary)] mb-2.5 pt-0.5">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <MapPin className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                          <span className="truncate">{app.location || "Remote"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Calendar className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                          <span>{new Date(app.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-[var(--border-color)]">
                        <span className={cn(
                          "text-[10px] font-black px-2 py-0.5 rounded-full border",
                          app.ats_score >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                          app.ats_score >= 60 ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" :
                          "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                        )}>
                          {Math.round(app.ats_score)}%
                        </span>

                        <select
                          value={app.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-2 py-0.5 text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                        >
                          {KANBAN_COLUMNS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  
                  {columnApps.length === 0 && (
                    <div className="text-center py-8 px-3">
                      <p className="text-[11px] text-[var(--text-muted)] font-medium">No applications in this stage</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Application Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h3 className="text-base font-extrabold text-[var(--text-primary)]">Add Job to Pipeline Tracker</h3>
              <button onClick={() => setAddModalOpen(false)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-hover)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1.5">Select Pipeline Job *</label>
                <select
                  value={newJobId || ""}
                  onChange={(e) => setNewJobId(Number(e.target.value))}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-medium"
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title} — {j.company}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1.5">Initial Status Stage</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-medium"
                >
                  {KANBAN_COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1.5">Notes & Interview Reminders</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Applied via LinkedIn referral, HR contact info..."
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creating || !newJobId}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md hover:shadow-indigo-500/20 disabled:opacity-50 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {creating ? "Adding Application..." : "Save Application to Pipeline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Application Detail Drawer / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-2 border-b border-[var(--border-color)]">
              <div>
                <span className={cn(
                  "px-3 py-0.5 font-black rounded-full text-[10px] uppercase tracking-wider border",
                  COLUMN_THEMES[selectedApp.status]?.badge || "bg-blue-500/10 text-blue-600 border-blue-500/20"
                )}>
                  {selectedApp.status}
                </span>
                <h3 className="text-lg font-black text-[var(--text-primary)] mt-1.5 leading-snug">{selectedApp.job_title}</h3>
                <p className="text-xs text-[var(--text-secondary)] font-semibold mt-0.5">{selectedApp.company} • {selectedApp.location || "Remote"}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-hover)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Application Details */}
            <div className="space-y-3 text-xs bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">ATS Match Score:</span>
                <span className="font-bold text-[var(--text-primary)]">{Math.round(selectedApp.ats_score)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Source:</span>
                <button
                  type="button"
                  onClick={(e) => handleOpenOriginalPosting(e, selectedApp)}
                  className={cn(
                    "font-medium cursor-pointer bg-transparent border-0 p-0 transition-colors text-xs",
                    getValidJobUrl(selectedApp)
                      ? "text-blue-600 dark:text-blue-400 hover:underline"
                      : "text-[var(--text-primary)] opacity-80"
                  )}
                  title={getValidJobUrl(selectedApp) ? `Open original posting on ${selectedApp.source || 'platform'}` : "Original job posting URL is unavailable"}
                  aria-label="Open original posting"
                >
                  {selectedApp.source || "Live"}
                </button>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[var(--border-color)]">
                <span className="text-[var(--text-muted)]">Job Link:</span>
                {getValidJobUrl(selectedApp) ? (
                  <button 
                    type="button"
                    onClick={(e) => handleOpenOriginalPosting(e, selectedApp)} 
                    className="text-blue-500 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 text-xs font-medium"
                    title="Open original posting"
                  >
                    Open Posting <ExternalLink className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleOpenOriginalPosting(e, selectedApp)}
                    className="text-gray-400 dark:text-gray-600 text-xs italic cursor-pointer bg-transparent border-0 p-0 hover:underline"
                    title="Original job posting URL is unavailable"
                  >
                    URL Unavailable
                  </button>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-[var(--text-secondary)]">Notes & Activity Logs</label>
              <textarea
                rows={3}
                defaultValue={selectedApp.notes || ""}
                onBlur={(e) => handleStatusChange(selectedApp.id, selectedApp.status, e.target.value)}
                placeholder="Add notes about interview schedule, contact person, or follow-ups..."
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
              <button
                onClick={() => handleDeleteApplication(selectedApp.id)}
                className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Application
              </button>

              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
