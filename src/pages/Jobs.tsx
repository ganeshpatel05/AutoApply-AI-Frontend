import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Job } from "../types";
import { 
  Search, 
  MapPin, 
  Building, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  Target, 
  Mail, 
  CheckCircle, 
  Loader2, 
  Plus,
  X,
  Briefcase,
  DollarSign
} from "lucide-react";
import { cn } from "../utils/cn";
import { Link, useSearchParams } from "react-router-dom";
import { getValidJobUrl, handleOpenOriginalPosting } from "../utils/url";

export function Jobs() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialSavedOnly = searchParams.get("saved") === "true";
  const minAtsParam = searchParams.get("min_ats") ? parseFloat(searchParams.get("min_ats")!) : 0;
  const jobIdParam = searchParams.get("job_id") ? parseInt(searchParams.get("job_id")!, 10) : null;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [filterSavedOnly, setFilterSavedOnly] = useState(initialSavedOnly);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchRole, setSearchRole] = useState("Software Engineer");
  const [searchLocation, setSearchLocation] = useState("Bangalore");
  const [searchExperience, setSearchExperience] = useState("0-2");
  const [searchDemoMode, setSearchDemoMode] = useState(true);
  const [searching, setSearching] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ success: boolean; jobs: Job[] }>(
        `/api/jobs/?search=${encodeURIComponent(search)}&min_ats=${minAtsParam}`
      );
      let fetched = Array.isArray(res?.jobs) ? res.jobs : [];
      if (jobIdParam) {
        fetched = fetched.filter(j => j.id === jobIdParam);
      }
      setJobs(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(loadJobs, 400);
    return () => clearTimeout(delay);
  }, [search, searchParams]);

  const toggleSave = async (jobId: number) => {
    try {
      const res = await api.post<{ success: boolean; is_saved: number }>(`/api/jobs/${jobId}/toggle-save`);
      setJobs(jobs.map(j => j.id === jobId ? { ...j, is_saved: res.is_saved } : j));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDiscoverJobs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      const res = await api.post<{ success: boolean; count: number; jobs: Job[] }>("/api/jobs/search-new", {
        role: searchRole,
        location: searchLocation,
        experience: searchExperience,
        demo_mode: searchDemoMode
      });
      if (res.success) {
        setSearchModalOpen(false);
        showToast(`Discovered ${res.count} jobs for '${searchRole}'!`);
        await loadJobs();
      }
    } catch (err: any) {
      alert(err.message || "Failed to discover jobs");
    } finally {
      setSearching(false);
    }
  };

  const handleTrackApplication = async (jobId: number) => {
    try {
      await api.post("/api/applications/", {
        job_id: jobId,
        status: "Saved"
      });
      showToast("Job added to Application Tracker!");
    } catch (err: any) {
      alert(err.message || "Failed to add to tracker");
    }
  };

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(""), 3500);
  };

  const displayedJobs = filterSavedOnly ? jobs.filter(j => j.is_saved) : jobs;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 animate-bounce-in">
          <CheckCircle className="w-4 h-4" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EBF5FF] text-[#1769F5] border border-blue-200/80 dark:bg-blue-950/70 dark:border-blue-800 dark:text-blue-300 mb-1.5">
            <Sparkles className="w-3 h-3 text-[#1769F5] dark:text-blue-400" />
            <span>Job Discovery Intelligence</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#102A63] dark:text-white tracking-tight">
            Job Discovery Workspace
          </h2>
          <p className="text-[11px] sm:text-xs text-[#526783] dark:text-slate-400 font-medium mt-0.5">
            Search, filter, and track AI-scouted career opportunities matched against your resume.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <button 
            onClick={() => setFilterSavedOnly(!filterSavedOnly)}
            className={cn(
              "px-3 py-2 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs",
              filterSavedOnly 
                ? "bg-[#EBF5FF] border-blue-300 text-[#1769F5] dark:bg-blue-950/70 dark:border-blue-800 dark:text-blue-300" 
                : "bg-white dark:bg-slate-800/80 border-[#E2E8F0] dark:border-slate-700 text-[#526783] dark:text-slate-300 hover:text-[#1769F5] hover:bg-[#F8FAFD]"
            )}
          >
            <Bookmark className={cn("w-3.5 h-3.5", filterSavedOnly ? "text-[#1769F5] fill-[#1769F5]" : "text-[#526783]")} />
            <span>Saved ({jobs.filter(j => j.is_saved).length})</span>
          </button>

          <button 
            onClick={() => setSearchModalOpen(true)}
            className="btn-gradient px-3.5 py-2 rounded-full text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Discover New Jobs</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1769F5]" />
        <input 
          type="text" 
          placeholder="Search roles, skills, or target companies..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#102A63] dark:text-white placeholder:text-[#526783]/60 focus:outline-none focus:border-[#1769F5] focus:ring-2 focus:ring-blue-500/20 shadow-xs transition-all font-medium"
        />
      </div>

      {/* Jobs Listing Grid */}
      {loading && jobs.length === 0 ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 saas-card rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : displayedJobs.length === 0 ? (
        <div className="text-center py-16 saas-card rounded-2xl p-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Building className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-[var(--text-primary)] mb-1">No jobs found</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-sm mx-auto font-medium">
            {filterSavedOnly 
              ? "You haven't saved any jobs yet. Bookmark jobs to review them later." 
              : "No matching jobs found in your database. Trigger Job Scout to discover active opportunities."}
          </p>
          <button 
            onClick={() => setSearchModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-indigo-500/20 transition-all inline-flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Discover Jobs Now
          </button>
        </div>
      ) : (
        <div className="grid gap-3.5">
          {displayedJobs.map(job => (
            <div 
              key={job.id} 
              className="bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-blue-300/80 dark:hover:border-blue-700/60 transition-all duration-200 flex flex-col md:flex-row gap-4 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#1769F5] to-[#5241E2] text-white font-black flex items-center justify-center text-xs sm:text-sm shrink-0 shadow-md shadow-blue-500/15">
                      {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-black text-[#102A63] dark:text-white group-hover:text-[#1769F5] dark:group-hover:text-blue-400 transition-colors tracking-tight truncate">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#526783] dark:text-slate-400 font-semibold mt-0.5 truncate">
                        <span className="text-[#1769F5] dark:text-blue-400 font-black truncate">{job.company}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-[#526783] dark:text-slate-400 shrink-0" /> {job.location || 'Remote'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => toggleSave(job.id)} 
                    className="text-[#526783] hover:text-[#1769F5] dark:text-slate-400 dark:hover:text-blue-400 transition-colors p-1.5 rounded-xl hover:bg-[#F0F7FF] dark:hover:bg-slate-800 cursor-pointer shrink-0"
                    title={job.is_saved ? "Remove from saved" : "Save job"}
                  >
                    {job.is_saved ? (
                      <BookmarkCheck className="w-4.5 h-4.5 text-[#1769F5] fill-[#1769F5]" />
                    ) : (
                      <Bookmark className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>

                {/* Explicit Details Grid: Company, Role, Location, Package */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2.5 p-2.5 rounded-xl bg-[#F8FAFD] dark:bg-slate-850/60 border border-[#EDF2F7] dark:border-slate-800 text-xs">
                  <div className="flex flex-col justify-center min-w-0">
                    <span className="text-[9px] font-bold text-[#526783] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Building className="w-2.5 h-2.5 text-[#1769F5]" /> Company
                    </span>
                    <span className="text-[11px] font-black text-[#1769F5] dark:text-blue-400 truncate mt-0.5" title={job.company}>
                      {job.company || 'N/A'}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center min-w-0">
                    <span className="text-[9px] font-bold text-[#526783] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Briefcase className="w-2.5 h-2.5 text-[#5241E2]" /> Role
                    </span>
                    <span className="text-[11px] font-black text-[#102A63] dark:text-white truncate mt-0.5" title={job.title}>
                      {job.title || 'Developer'}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center min-w-0">
                    <span className="text-[9px] font-bold text-[#526783] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-rose-500" /> Location
                    </span>
                    <span className="text-[11px] font-semibold text-[#526783] dark:text-slate-300 truncate mt-0.5" title={job.location}>
                      {job.location || 'Remote'}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center min-w-0">
                    <span className="text-[9px] font-bold text-[#526783] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <DollarSign className="w-2.5 h-2.5 text-emerald-500" /> Package
                    </span>
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 truncate mt-0.5" title={job.salary || '₹6.5L - ₹10.5L P.A.'}>
                      {job.salary && job.salary !== 'Not specified' ? job.salary : '₹6.5L - ₹10.5L P.A.'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] sm:text-xs text-[#526783] dark:text-slate-300 line-clamp-2 my-2 leading-relaxed font-medium">
                  {job.description || job.requirements || "No description excerpt provided."}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2.5">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold border shadow-2xs",
                    job.ats_score >= 80 ? "bg-[#E8FAF0] text-[#059669] border-[#B7E4C7] dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300" :
                    job.ats_score >= 60 ? "bg-[#EBF5FF] text-[#1769F5] border-[#C3E0FF] dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300" :
                    job.ats_score >= 40 ? "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300" :
                    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                  )}>
                    {job.ats_score > 0 ? `Match ${Math.round(job.ats_score)}%` : "Match Pending"}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                    {job.salary && job.salary !== 'Not specified' ? job.salary : '₹6.5L - ₹10.5L P.A.'}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleOpenOriginalPosting(e, job, showToast)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border transition-all cursor-pointer inline-flex items-center gap-1",
                      getValidJobUrl(job)
                        ? "bg-white dark:bg-slate-800 text-[#526783] dark:text-slate-300 hover:text-[#1769F5] hover:border-blue-300 shadow-2xs"
                        : "bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60"
                    )}
                    title={getValidJobUrl(job) ? `Open original posting on ${job.source || 'platform'}` : "Original job posting URL is unavailable"}
                    aria-label="Open original posting"
                  >
                    <span>{job.source || "Live Platform"}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col justify-end gap-1.5 shrink-0 md:w-34 md:border-l md:border-[#E2E8F0] dark:md:border-slate-800 md:pl-4 pt-2.5 md:pt-0 border-t md:border-t-0">
                <Link
                  to="/matcher"
                  className="btn-secondary-white flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs shadow-2xs font-bold"
                >
                  <Target className="w-3.5 h-3.5" /> <span>Match JD</span>
                </Link>

                <Link
                  to="/cover-letters"
                  className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#F5EEFF] hover:bg-[#EEDDFF] dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-[#792BEE] dark:text-purple-300 border border-[#E9D5FF] dark:border-purple-800/80 rounded-xl text-xs font-bold transition-all active:scale-98 shadow-2xs"
                >
                  <Mail className="w-3.5 h-3.5" /> <span>Cover Letter</span>
                </Link>

                <button
                  onClick={() => handleTrackApplication(job.id)}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#102A63] dark:text-white border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-98 shadow-2xs"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> <span>Track</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleOpenOriginalPosting(e, job, showToast)}
                  className={cn(
                    "p-1.5 text-center rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer border",
                    getValidJobUrl(job)
                      ? "bg-[#F8FAFD] dark:bg-slate-800 border-[#E2E8F0] dark:border-slate-700 text-[#526783] dark:text-slate-300 hover:text-[#1769F5] hover:border-blue-300"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400 opacity-60"
                  )}
                  title={getValidJobUrl(job) ? "Open original posting" : "Original job posting URL is unavailable"}
                  aria-label="Open original posting"
                >
                  <ExternalLink className="w-3.5 h-3.5 mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discover Jobs Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EBF5FF] text-[#1769F5] dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center shadow-2xs">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#102A63] dark:text-white tracking-tight">
                    Discover New Jobs
                  </h3>
                  <p className="text-[11px] text-[#526783] dark:text-slate-400 font-medium">
                    Run the autonomous Job Scout agent
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSearchModalOpen(false)} 
                className="p-1.5 rounded-xl text-[#526783] hover:text-[#102A63] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDiscoverJobs} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1.5">Target Role</label>
                <input 
                  type="text" 
                  value={searchRole}
                  onChange={(e) => setSearchRole(e.target.value)}
                  className="input-saas w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1.5">Location</label>
                <input 
                  type="text" 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="e.g. Bangalore, Remote, Pune"
                  className="input-saas w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1.5">Experience</label>
                  <select 
                    value={searchExperience}
                    onChange={(e) => setSearchExperience(e.target.value)}
                    className="input-saas w-full px-3 py-2.5 text-xs sm:text-sm font-medium cursor-pointer"
                  >
                    <option value="0-2">0 - 2 Years</option>
                    <option value="2-5">2 - 5 Years</option>
                    <option value="5+">5+ Years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1.5">Source Mode</label>
                  <select 
                    value={searchDemoMode ? "demo" : "live"}
                    onChange={(e) => setSearchDemoMode(e.target.value === "demo")}
                    className="input-saas w-full px-3 py-2.5 text-xs sm:text-sm font-medium cursor-pointer"
                  >
                    <option value="demo">Demo Dataset</option>
                    <option value="live">Live Scraper</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={searching}
                  className="btn-gradient w-full py-3 rounded-full text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>{searching ? "Searching & Scraping..." : "Run Job Scout"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
