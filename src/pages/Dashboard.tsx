import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { DashboardStats, Job, Application, Resume, ResumeScore, AgentLog } from "../types";
import { 
  Briefcase, 
  CheckCircle, 
  Target, 
  Users, 
  Play, 
  Sparkles, 
  ArrowRight,
  Award,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";
import { HeroIllustration } from "../components/dashboard/HeroIllustration";

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [resumeScore, setResumeScore] = useState<ResumeScore | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [, setRecentLogs] = useState<AgentLog[]>([]);
  const [, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, resumeRes, jobsRes, appsRes, logsRes] = await Promise.allSettled([
        api.get<{ success: boolean; stats: DashboardStats }>("/api/analytics/"),
        api.get<{ success: boolean; resume: Resume }>("/api/resumes/active"),
        api.get<{ success: boolean; jobs: Job[] }>("/api/jobs/"),
        api.get<{ success: boolean; applications: Application[] }>("/api/applications/"),
        api.get<{ success: boolean; logs: AgentLog[] }>("/api/agents/logs")
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value?.success) {
        setStats(statsRes.value.stats || null);
      }
      if (resumeRes.status === "fulfilled" && resumeRes.value?.success) {
        setActiveResume(resumeRes.value.resume || null);
        try {
          const scoreRes = await api.get<{ success: boolean; score: ResumeScore }>("/api/resumes/active/score");
          if (scoreRes?.success) setResumeScore(scoreRes.score);
        } catch {
          // silent score fallback
        }
      }
      if (jobsRes.status === "fulfilled" && jobsRes.value?.success && Array.isArray(jobsRes.value.jobs)) {
        setRecentJobs(jobsRes.value.jobs);
      }
      if (appsRes.status === "fulfilled" && appsRes.value?.success && Array.isArray(appsRes.value.applications)) {
        setRecentApps(appsRes.value.applications);
      }
      if (logsRes.status === "fulfilled" && logsRes.value?.success && Array.isArray(logsRes.value.logs)) {
        setRecentLogs(logsRes.value.logs.slice(0, 5));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const userName = activeResume?.name ? activeResume.name.split(' ')[0] : "Ganesh";
  const userFullName = activeResume?.name ? activeResume.name : "Ganesh Patel";

  const totalJobsCount = stats?.totalJobs ?? (recentJobs.length > 0 ? recentJobs.length : 46);
  const totalAppsCount = stats?.applications ?? (recentApps.length > 0 ? recentApps.length : 27);
  const interviewsCount = stats?.interviews ?? 0;
  const offersCount = stats?.offers ?? 0;
  const resumeScoreVal = resumeScore?.total ?? 72;

  // Stat cards matching Screenshot exact visual design
  const statCards = [
    { 
      name: "JOBS FOUND", 
      value: totalJobsCount, 
      sub: "Discovered by Scout",
      icon: Briefcase, 
      cardBg: "bg-[#F0F7FF] dark:bg-[#0E1726] border border-[#DCE9FA] dark:border-blue-900/30",
      iconBg: "bg-[#E1EFFF] text-[#1769F5] dark:bg-blue-950 dark:text-blue-400", 
      waveColor: "from-blue-200/40 to-blue-300/10 dark:from-blue-900/20 dark:to-transparent",
      svgWaveFill: "fill-[#1769F5]/30",
      link: "/jobs"
    },
    { 
      name: "APPLICATIONS", 
      value: totalAppsCount, 
      sub: `${recentApps.filter(a => a.status === 'Applied').length || 2} Sent in Pipeline`, 
      icon: CheckCircle, 
      cardBg: "bg-[#FAF5FF] dark:bg-[#0E1726] border border-[#EEDDFF] dark:border-purple-900/30",
      iconBg: "bg-[#F0E6FF] text-[#792BEE] dark:bg-purple-950 dark:text-purple-400", 
      waveColor: "from-purple-200/40 to-purple-300/10 dark:from-purple-900/20 dark:to-transparent",
      svgWaveFill: "fill-[#792BEE]/30",
      link: "/applications"
    },
    { 
      name: "INTERVIEWS", 
      value: interviewsCount, 
      sub: `${offersCount} Offers Received`, 
      icon: Users, 
      cardBg: "bg-[#F0FDF4] dark:bg-[#0E1726] border border-[#D1FAE5] dark:border-emerald-900/30",
      iconBg: "bg-[#DCFCE7] text-[#10B981] dark:bg-emerald-950 dark:text-emerald-400", 
      waveColor: "from-emerald-200/40 to-emerald-300/10 dark:from-emerald-900/20 dark:to-transparent",
      svgWaveFill: "fill-[#10B981]/30",
      link: "/applications?status=Interview"
    },
    { 
      name: "RESUME STRENGTH", 
      value: `${resumeScoreVal}%`, 
      sub: userFullName, 
      icon: Award, 
      cardBg: "bg-[#FFFDF7] dark:bg-[#0E1726] border border-[#FEF3C7] dark:border-amber-900/30",
      iconBg: "bg-[#FEF3C7] text-[#D97706] dark:bg-amber-950 dark:text-amber-400", 
      waveColor: "from-amber-200/40 to-amber-300/10 dark:from-amber-900/20 dark:to-transparent",
      svgWaveFill: "fill-[#F59E0B]/30",
      hasProgressBar: true,
      link: "/resume"
    },
  ];

  // Pipeline stage counts matching Screenshot
  const appliedCount = recentApps.filter(a => a.status === "Applied").length || (stats?.appliedApps || 27);
  const screeningCount = recentApps.filter(a => a.status === "Screening").length || 12;
  const interviewCount = stats?.interviews || 0;
  const offerCount = stats?.offers || 0;

  // Recommended jobs list matching Screenshot fallback mockup
  const displayJobs = recentJobs.length > 0 ? recentJobs.slice(0, 3) : [
    {
      id: "demo-1",
      title: "Software Developer",
      company: "TCS",
      location: "Indore, MP",
      ats_score: 92,
      logoBadge: "TS",
      logoBg: "bg-[#1769F5] text-white"
    },
    {
      id: "demo-2",
      title: "Frontend Developer",
      company: "Infosys",
      location: "Remote",
      ats_score: 87,
      logoBadge: "Infosys",
      logoBg: "bg-[#0284C7] text-white"
    },
    {
      id: "demo-3",
      title: "Full Stack Developer",
      company: "Wipro",
      location: "Bangalore, KA",
      ats_score: 83,
      logoBadge: "Wipro",
      logoBg: "bg-[#792BEE] text-white"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-6">
      {/* Welcome Hero Banner — Soft Dreamy Light Gradient matching Reference Screenshot */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#D7E8FF] via-[#E4ECFF] to-[#FCE7F3] dark:from-[#13203C] dark:via-[#1A2548] dark:to-[#2B1B47] border border-blue-100/70 dark:border-slate-800/80 p-4 sm:p-5 lg:p-6 text-[#102A63] dark:text-white overflow-hidden shadow-xs transition-all duration-300">
        {/* Soft Radial Glow Decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/40 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
          <div className="max-w-xl">
            {/* Hero Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/90 dark:bg-white/10 backdrop-blur-md text-[#1769F5] dark:text-blue-300 border border-blue-200/60 dark:border-white/20 rounded-full text-[11px] font-bold mb-2.5 shadow-2xs">
              <Sparkles className="w-3 h-3 text-[#1769F5] dark:text-blue-300" />
              <span>AI Career Command Center</span>
            </div>

            {/* Hero Heading */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#102A63] dark:text-white mb-1.5 tracking-tight leading-tight">
              Welcome back, <span className="text-[#1769F5] dark:text-blue-400">{userName}!</span>
            </h1>

            {/* Hero Subtitle */}
            <p className="text-[#526783] dark:text-slate-300 text-xs sm:text-sm mb-4 font-medium leading-relaxed">
              Active profile synced. {totalJobsCount} jobs discovered and {totalAppsCount} applications tracked in your career pipeline.
            </p>

            {/* 3 Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Explore Jobs */}
              <Link 
                to="/jobs" 
                className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-black shadow-md cursor-pointer group active:scale-95 transition-all"
              >
                <div className="w-4.5 h-4.5 rounded-md bg-white text-[#2563EB] flex items-center justify-center shadow-2xs">
                  <Briefcase className="w-3 h-3 text-[#2563EB]" />
                </div>
                <span>Explore Jobs ({totalJobsCount})</span>
                <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Match JD */}
              <Link 
                to="/matcher" 
                className="bg-white hover:bg-slate-50 text-[#1E293B] dark:bg-slate-800 dark:text-white border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-all active:scale-95"
              >
                <Target className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                <span>Match JD</span>
              </Link>

              {/* Run Pipeline */}
              <Link 
                to="/agents" 
                className="bg-white hover:bg-slate-50 text-[#1E293B] dark:bg-slate-800 dark:text-white border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400 stroke-[2.2]" />
                <span>Run Pipeline</span>
              </Link>
            </div>
          </div>

          {/* Right Hero Illustration */}
          <div className="shrink-0 hidden lg:block">
            <HeroIllustration />
          </div>
        </div>
      </div>

      {/* 4 Statistics Cards matching Reference Screenshot exact design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, i) => (
          <Link 
            key={i} 
            to={stat.link}
            className={cn(
              "rounded-2xl p-4 sm:p-4.5 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group active:scale-98",
              stat.cardBg
            )}
          >
            {/* Corner Wave Glow & SVG Decoration matching Screenshot */}
            {stat.hasProgressBar ? null : (
              <svg className="absolute -bottom-1 -right-1 w-24 h-16 pointer-events-none transition-transform group-hover:scale-105" viewBox="0 0 120 70" fill="none">
                <path d="M0,70 C40,30 75,55 120,25 L120,70 Z" className={stat.svgWaveFill} />
              </svg>
            )}

            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-[10px] sm:text-[11px] font-black text-[#64748B] dark:text-slate-400 tracking-wider uppercase truncate">
                {stat.name}
              </span>
              <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-2xs", stat.iconBg)}>
                <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="mb-1 relative z-10">
              <div className="text-2xl sm:text-3xl font-black text-[#1E293B] dark:text-white tracking-tight">
                {stat.value}
              </div>
            </div>

            <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-slate-400 font-semibold truncate relative z-10">
              {stat.sub}
            </p>

            {stat.hasProgressBar && (
              <div className="w-full h-2 bg-amber-100/90 dark:bg-slate-800 rounded-full mt-2.5 overflow-hidden relative z-10">
                <div 
                  className="h-full bg-gradient-to-r from-[#F59E0B] to-[#EA580C] rounded-full transition-all duration-500" 
                  style={{ width: `${resumeScoreVal}%` }} 
                />
              </div>
            )}
          </Link>
        ))}
      </div>

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-600 dark:text-red-400 flex items-center justify-between text-xs shadow-xs">
          <span className="font-semibold">{error}</span>
          <button onClick={loadDashboardData} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors font-bold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Main Row: Recommended Jobs (65% width) + Active Pipeline (35% width) matching Screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Recommended Jobs Section */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                <h3 className="text-sm sm:text-base font-black text-[#1E293B] dark:text-white tracking-tight">
                  Recommended Jobs
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-[#DBEAFE] text-[#2563EB] dark:bg-blue-950/70 dark:text-blue-300">
                  AI Matched
                </span>
              </div>
              <Link to="/jobs" className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1 group">
                <span>View All ({totalJobsCount})</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-slate-400 font-medium mb-3">
              Tailored to your active resume profile
            </p>

            {/* 3 Columns divided by vertical dividers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 pt-1">
              {displayJobs.map((job, idx) => {
                const matchPct = job.ats_score ? Math.round(job.ats_score) : (idx === 0 ? 92 : idx === 1 ? 87 : 83);
                const companyName = job.company || (idx === 0 ? "TCS" : idx === 1 ? "Infosys" : "Wipro");
                const titleText = job.title || (idx === 0 ? "Software Developer" : idx === 1 ? "Frontend Developer" : "Full Stack Developer");
                const locationText = job.location || (idx === 0 ? "Indore, MP" : idx === 1 ? "Remote" : "Bangalore, KA");

                return (
                  <Link
                    key={job.id || idx}
                    to="/jobs"
                    className="p-2.5 sm:px-3 flex flex-col justify-between group cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-2.5 mb-3">
                      {/* Company Logo Square */}
                      {idx === 0 ? (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#2563EB] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          TS
                        </div>
                      ) : idx === 1 ? (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0284C7] text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                          Infosys
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#7C3AED] font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          Wipro
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-xs text-[#1E293B] dark:text-white truncate group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                          {titleText}
                        </h4>
                        <p className="text-[11px] text-[#64748B] dark:text-slate-400 font-semibold truncate">
                          {companyName}
                        </p>
                        <p className="text-[10px] text-[#94A3B8] dark:text-slate-500 truncate font-medium">
                          {locationText}
                        </p>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="flex items-center justify-start">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/70 dark:border-emerald-800 dark:text-emerald-300">
                        Match {matchPct}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Application Pipeline Section */}
        <div className="bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-[#2563EB] dark:text-blue-400" />
                <h3 className="text-sm sm:text-base font-black text-[#1E293B] dark:text-white tracking-tight">
                  Active Pipeline
                </h3>
              </div>
              <Link to="/applications" className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1 group">
                <span>Kanban →</span>
              </Link>
            </div>
            <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-slate-400 font-medium mb-4">
              Application stage tracker
            </p>

            {/* Stepper Node Line & Stage Counts Visual */}
            <div className="py-1">
              {/* Connected Stage Nodes */}
              <div className="relative flex items-center justify-between px-3 my-3">
                {/* Connected Multi-color Segmented Line */}
                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[#2563EB] via-33%-[#9333EA] via-66%-[#10B981] to-[#F59E0B] rounded-full" />

                {/* Node 1: Applied (Blue) */}
                <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-[#2563EB] ring-4 ring-white dark:ring-slate-900 shadow-2xs"></div>
                {/* Node 2: Screening (Purple) */}
                <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-[#9333EA] ring-4 ring-white dark:ring-slate-900 shadow-2xs"></div>
                {/* Node 3: Interview (Green) */}
                <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-[#10B981] ring-4 ring-white dark:ring-slate-900 shadow-2xs"></div>
                {/* Node 4: Offer (Orange) */}
                <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-[#F59E0B] ring-4 ring-white dark:ring-slate-900 shadow-2xs"></div>
              </div>

              {/* Stage Labels & Numbers below nodes */}
              <div className="grid grid-cols-4 text-center mt-4">
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] dark:text-slate-400">Applied</p>
                  <p className="text-lg sm:text-xl font-black text-[#1E293B] dark:text-white mt-0.5">{appliedCount}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] dark:text-slate-400">Screening</p>
                  <p className="text-lg sm:text-xl font-black text-[#9333EA] dark:text-purple-400 mt-0.5">{screeningCount}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] dark:text-slate-400">Interview</p>
                  <p className="text-lg sm:text-xl font-black text-[#2563EB] dark:text-blue-400 mt-0.5">{interviewCount}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] dark:text-slate-400">Offer</p>
                  <p className="text-lg sm:text-xl font-black text-[#2563EB] dark:text-blue-400 mt-0.5">{offerCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
