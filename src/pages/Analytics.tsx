import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { DashboardStats, AtsBreakdownData, ConversionDetailsData } from "../types";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { 
  Loader2, 
  TrendingUp, 
  Award, 
  Briefcase, 
  CheckCircle, 
  PieChart, 
  X, 
  Target, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  BarChart3
} from "lucide-react";
import { cn } from "../utils/cn";

export function Analytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [atsModalOpen, setAtsModalOpen] = useState(false);
  const [atsData, setAtsData] = useState<AtsBreakdownData | null>(null);
  const [loadingAts, setLoadingAts] = useState(false);

  const [conversionModalOpen, setConversionModalOpen] = useState(false);
  const [conversionData, setConversionData] = useState<ConversionDetailsData | null>(null);
  const [loadingConversion, setLoadingConversion] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ success: boolean; stats: DashboardStats }>("/api/analytics/");
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load career analytics metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleOpenAtsModal = async () => {
    setAtsModalOpen(true);
    if (!atsData) {
      try {
        setLoadingAts(true);
        const res = await api.get<{ success: boolean; ats: AtsBreakdownData }>("/api/analytics/ats-breakdown");
        if (res.success && res.ats) {
          setAtsData(res.ats);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoadingAts(false);
      }
    }
  };

  const handleOpenConversionModal = async () => {
    setConversionModalOpen(true);
    if (!conversionData) {
      try {
        setLoadingConversion(true);
        const res = await api.get<{ success: boolean; conversion: ConversionDetailsData }>("/api/analytics/conversion-details");
        if (res.success && res.conversion) {
          setConversionData(res.conversion);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoadingConversion(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-blue-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs font-semibold text-[var(--text-secondary)]">Loading real-time career analytics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 saas-card rounded-2xl text-center space-y-4 max-w-md mx-auto my-12 border border-red-500/20">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-base font-bold text-[var(--text-primary)]">Failed to Load Analytics</h3>
        <p className="text-xs text-[var(--text-secondary)]">{error || "Unable to retrieve analytics dataset."}</p>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all"
        >
          Retry Data Connection
        </button>
      </div>
    );
  }

  // Calculate conversion rate safely
  const appliedCount = stats.appliedApps || 0;
  const interviewsCount = stats.interviews || 0;
  const conversionRate = appliedCount > 0 
    ? ((interviewsCount / appliedCount) * 100).toFixed(1)
    : "0.0";

  // Stage counts & colors for funnel chart
  const funnelData = [
    { name: "Discovered", stage: "Discovered", count: stats.totalJobs || 0, fill: "#3b82f6", route: "/jobs" },
    { name: "Saved", stage: "Saved", count: stats.savedJobs || 0, fill: "#6366f1", route: "/applications?status=Saved" },
    { name: "Applied", stage: "Applied", count: stats.appliedApps || 0, fill: "#8b5cf6", route: "/applications?status=Applied" },
    { name: "Screening", stage: "Screening", count: stats.screeningApps || 0, fill: "#38bdf8", route: "/applications?status=Screening" },
    { name: "Interview", stage: "Interview", count: stats.interviews || 0, fill: "#ec4899", route: "/applications?status=Interview" },
    { name: "Offers", stage: "Offer", count: stats.offers || 0, fill: "#10b981", route: "/applications?status=Offer" },
    { name: "Rejected", stage: "Rejected", count: stats.rejected || 0, fill: "#ef4444", route: "/applications?status=Rejected" }
  ];

  const handleBarClick = (entry: typeof funnelData[0]) => {
    if (entry.route) {
      navigate(entry.route);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 max-w-6xl mx-auto pb-6">
      {/* Top Header */}
      <div className="bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md p-3.5 sm:p-4 md:p-5 saas-card rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-base sm:text-lg lg:text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Career Analytics & Performance Metrics
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
            Click any metric card, chart stage, or breakdown row to view deep analytics and candidate records.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold shrink-0">
          <Sparkles className="w-3.5 h-3.5" /> Real-Time Database Sync
        </div>
      </div>

      {/* Top Interactive Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* CARD 1: Conversion Rate Card */}
        <div 
          onClick={handleOpenConversionModal}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleOpenConversionModal()}
          tabIndex={0}
          role="button"
          aria-label="Open detailed conversion analytics"
          className="saas-card rounded-2xl p-4 sm:p-4.5 shadow-xs relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-emerald-500/40 active:scale-98 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">Conversion Rate</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--text-primary)] tracking-tight">{conversionRate}%</div>
          <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] mt-1 font-medium flex items-center justify-between">
            <span>Interview ratio</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] group-hover:underline">Details →</span>
          </p>
        </div>

        {/* CARD 2: AVG ATS Score Card */}
        <div 
          onClick={handleOpenAtsModal}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleOpenAtsModal()}
          tabIndex={0}
          role="button"
          aria-label="Open detailed ATS score breakdown"
          className="saas-card rounded-2xl p-4 sm:p-4.5 shadow-xs relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-blue-500/40 active:scale-98 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">Avg ATS Score</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/12 text-blue-600 dark:text-blue-400 border border-blue-500/25 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {stats.averageAtsScore > 0 ? `${stats.averageAtsScore.toFixed(1)}%` : "N/A"}
          </div>
          <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] mt-1 font-medium flex items-center justify-between">
            <span>Across scored jobs</span>
            <span className="text-blue-600 dark:text-blue-400 font-extrabold text-[10px] group-hover:underline">Analysis →</span>
          </p>
        </div>

        {/* CARD 3: Total Discovered Card */}
        <div 
          onClick={() => navigate("/jobs")}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/jobs")}
          tabIndex={0}
          role="button"
          aria-label="Navigate to Scout discovered jobs list"
          className="saas-card rounded-2xl p-4 sm:p-4.5 shadow-xs relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-violet-500/40 active:scale-98 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-purple-600"></div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">Total Discovered</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-violet-500/12 text-violet-600 dark:text-violet-400 border border-violet-500/25 group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--text-primary)] tracking-tight">{stats.totalJobs}</div>
          <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] mt-1 font-medium flex items-center justify-between">
            <span>Scout parsed jobs</span>
            <span className="text-violet-600 dark:text-violet-400 font-extrabold text-[10px] group-hover:underline">Scout List →</span>
          </p>
        </div>

        {/* CARD 4: Offers Received Card */}
        <div 
          onClick={() => navigate("/applications?status=Offer")}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/applications?status=Offer")}
          tabIndex={0}
          role="button"
          aria-label="Filter applications by Offer status"
          className="saas-card rounded-2xl p-4 sm:p-4.5 shadow-xs relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-amber-500/40 active:scale-98 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">Offers Received</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400 border border-amber-500/25 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--text-primary)] tracking-tight">{stats.offers}</div>
          <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] mt-1 font-medium flex items-center justify-between">
            <span>Pipeline offers</span>
            <span className="text-amber-600 dark:text-amber-400 font-extrabold text-[10px] group-hover:underline">View Offers →</span>
          </p>
        </div>

      </div>

      {/* Main Interactive Funnel Chart */}
      <div className="saas-card rounded-2xl p-4 sm:p-5 md:p-6 shadow-xs border border-[var(--border-color)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-5 gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-500" /> Interactive Application Pipeline Funnel
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Click any bar or stage legend below to navigate to the filtered applications list.
            </p>
          </div>
          <div className="text-[10px] sm:text-[11px] font-bold text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg border border-[var(--border-color)] self-start sm:self-auto">
            Clickable Stage Filter Enabled
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={funnelData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="var(--text-secondary)" 
                tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 700 }} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="var(--text-secondary)" 
                tick={{ fill: 'currentColor', fontSize: 12 }} 
                tickLine={false} 
                axisLine={false} 
                allowDecimals={false} 
              />
              <Tooltip 
                cursor={{ fill: 'var(--bg-hover)', opacity: 0.6 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.fill }}></span>
                          {data.name} Stage
                        </div>
                        <div className="text-[var(--text-secondary)] font-semibold">
                          Total Count: <strong className="text-[var(--text-primary)]">{data.count}</strong>
                        </div>
                        <div className="text-blue-500 font-extrabold text-[10px] pt-1">
                          Click bar to filter view →
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="count" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={65}
                className="cursor-pointer"
              >
                {funnelData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill} 
                    onClick={() => handleBarClick(entry)}
                    className="hover:opacity-85 transition-opacity cursor-pointer"
                  />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        {/* Interactive Stage Legend Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 pt-4 border-t border-[var(--border-color)]">
          {funnelData.map((stage) => (
            <button
              key={stage.name}
              onClick={() => navigate(stage.route)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer hover:scale-102 active:scale-95 shadow-2xs"
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stage.fill }}></span>
              <span>{stage.name}</span>
              <span className="px-1.5 py-0.2 rounded-md bg-[var(--bg-card)] text-[11px] font-black text-[var(--text-secondary)] border border-[var(--border-color)]">
                {stage.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Breakdown Details Grid */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
        
        {/* Left Side: Pipeline Stage Counts List */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 shadow-xs">
          <h4 className="font-bold text-sm text-[var(--text-primary)] mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-500" /> Pipeline Stage Breakdown
            </span>
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-extrabold">Click to Filter</span>
          </h4>

          <div className="divide-y divide-[var(--border-color)] text-xs">
            <div 
              onClick={() => navigate("/applications?status=Saved")}
              className="py-2 sm:py-2.5 flex justify-between items-center hover:bg-[var(--bg-hover)] px-2 rounded-lg transition-colors cursor-pointer group"
            >
              <span className="text-[var(--text-secondary)] font-medium group-hover:text-blue-500 transition-colors">Saved Opportunities</span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[var(--text-primary)]">{stats.savedJobs}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div 
              onClick={() => navigate("/applications?status=Applied")}
              className="py-2 sm:py-2.5 flex justify-between items-center hover:bg-[var(--bg-hover)] px-2 rounded-lg transition-colors cursor-pointer group"
            >
              <span className="text-[var(--text-secondary)] font-medium group-hover:text-violet-500 transition-colors">Applications Submitted</span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[var(--text-primary)]">{stats.appliedApps}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div 
              onClick={() => handleOpenConversionModal()}
              className="py-2 sm:py-2.5 flex justify-between items-center hover:bg-[var(--bg-hover)] px-2 rounded-lg transition-colors cursor-pointer group"
            >
              <span className="text-[var(--text-secondary)] font-medium group-hover:text-indigo-500 transition-colors">Emails Sent via SMTP</span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[var(--text-primary)]">{stats.emailsSent}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div 
              onClick={() => navigate("/applications?status=Interview")}
              className="py-2 sm:py-2.5 flex justify-between items-center hover:bg-[var(--bg-hover)] px-2 rounded-lg transition-colors cursor-pointer group"
            >
              <span className="text-[var(--text-secondary)] font-medium group-hover:text-emerald-500 transition-colors">Interviews Scheduled</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.interviews}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div 
              onClick={() => navigate("/applications?status=Rejected")}
              className="py-2 sm:py-2.5 flex justify-between items-center hover:bg-[var(--bg-hover)] px-2 rounded-lg transition-colors cursor-pointer group"
            >
              <span className="text-[var(--text-secondary)] font-medium group-hover:text-red-500 transition-colors">Rejections</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-500 dark:text-red-400">{stats.rejected}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Performance Insights & Strategic Advice */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3.5">
          <div>
            <h4 className="font-bold text-sm text-[var(--text-primary)] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Career Performance Insights
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
              Your average ATS match score across evaluated job descriptions is{" "}
              <strong className="text-[var(--text-primary)] font-black">
                {stats.averageAtsScore > 0 ? `${stats.averageAtsScore.toFixed(1)}%` : "N/A"}
              </strong>.
              {" "}Current pipeline interview conversion rate is <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{conversionRate}%</strong>.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={handleOpenAtsModal}
                className="w-full text-left p-3 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/15 text-xs text-[var(--text-secondary)] transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <strong className="text-blue-600 dark:text-blue-400 block mb-0.5 font-bold">Inspect ATS Match Breakdown</strong>
                  <span>View top matched vs missing skills across all job specs.</span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/matcher")}
                className="w-full text-left p-3 rounded-xl bg-violet-500/5 hover:bg-violet-500/10 border border-violet-500/15 text-xs text-[var(--text-secondary)] transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <strong className="text-violet-600 dark:text-violet-400 block mb-0.5 font-bold">Optimize Resume in JD Studio</strong>
                  <span>Compare candidate resume against target job description.</span>
                </div>
                <Target className="w-4 h-4 text-violet-500 shrink-0 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-xs text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-emerald-600 dark:text-emerald-400 block mb-1 font-bold">Actionable Conversion Tip:</strong>
            Generate personalized, job-grounded cover letters in Cover Letter Studio before moving saved jobs to 'Applied'. Grounded letters boost interview invitation rates by up to 35%.
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ATS SCORE DETAILED ANALYTICS MODAL / DRAWER */}
      {/* ========================================================================= */}
      {atsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[var(--text-primary)]">ATS Score Analytics & Keyword Breakdown</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Calculated from actual resume vs job description matching engine.</p>
                </div>
              </div>
              <button 
                onClick={() => setAtsModalOpen(false)} 
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {loadingAts || !atsData ? (
                <div className="flex items-center justify-center h-48 text-blue-500">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <>
                  {/* Summary Banner */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Average ATS Score</span>
                      <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{atsData.average_ats}%</div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">Across all scored jobs</p>
                    </div>

                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Evaluated Job Specs</span>
                      <div className="text-3xl font-black text-[var(--text-primary)]">{atsData.total_scored_jobs} / {atsData.total_jobs}</div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">Jobs scored in database</p>
                    </div>

                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Top Tier Match (80%+)</span>
                      <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                        {atsData.distribution["90_100"] + atsData.distribution["80_89"]}
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">High potential matches</p>
                    </div>
                  </div>

                  {/* Score Distribution Breakdown */}
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 space-y-3">
                    <h4 className="font-extrabold text-xs text-[var(--text-primary)] uppercase tracking-wider">Score Distribution Spectrum</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className="text-emerald-600 dark:text-emerald-400">90% - 100% (Exceptional Match)</span>
                          <span>{atsData.distribution["90_100"]} jobs</span>
                        </div>
                        <div className="w-full bg-[var(--bg-card)] rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${atsData.total_scored_jobs > 0 ? (atsData.distribution["90_100"] / atsData.total_scored_jobs) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className="text-blue-600 dark:text-blue-400">80% - 89% (Strong Match)</span>
                          <span>{atsData.distribution["80_89"]} jobs</span>
                        </div>
                        <div className="w-full bg-[var(--bg-card)] rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${atsData.total_scored_jobs > 0 ? (atsData.distribution["80_89"] / atsData.total_scored_jobs) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className="text-amber-600 dark:text-amber-400">70% - 79% (Moderate Match)</span>
                          <span>{atsData.distribution["70_79"]} jobs</span>
                        </div>
                        <div className="w-full bg-[var(--bg-card)] rounded-full h-2">
                          <div 
                            className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${atsData.total_scored_jobs > 0 ? (atsData.distribution["70_79"] / atsData.total_scored_jobs) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className="text-rose-600 dark:text-rose-400">Below 70% (Requires Optimization)</span>
                          <span>{atsData.distribution["60_69"] + atsData.distribution["below_60"]} jobs</span>
                        </div>
                        <div className="w-full bg-[var(--bg-card)] rounded-full h-2">
                          <div 
                            className="bg-rose-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${atsData.total_scored_jobs > 0 ? ((atsData.distribution["60_69"] + atsData.distribution["below_60"]) / atsData.total_scored_jobs) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scored Jobs List */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs text-[var(--text-primary)] uppercase tracking-wider flex items-center justify-between">
                      <span>Individual Job ATS Match Records ({atsData.scored_jobs.length})</span>
                      <span className="text-[10px] text-[var(--text-muted)]">Sorted by ATS score</span>
                    </h4>

                    {atsData.scored_jobs.length === 0 ? (
                      <div className="p-8 text-center bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl space-y-3">
                        <Target className="w-8 h-8 text-blue-500 mx-auto" />
                        <p className="text-xs text-[var(--text-secondary)] font-medium">No scored jobs found yet.</p>
                        <button
                          onClick={() => {
                            setAtsModalOpen(false);
                            navigate("/matcher");
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-xs"
                        >
                          Run JD Matcher Now
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {atsData.scored_jobs.map((job) => (
                          <div key={job.id} className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-extrabold text-sm text-[var(--text-primary)]">{job.title}</h5>
                                <p className="text-xs text-[var(--text-secondary)] font-medium">{job.company} • {job.location || "Remote"}</p>
                              </div>
                              <span className={cn(
                                "px-3 py-1 rounded-xl text-xs font-black border",
                                job.ats_score >= 80 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                job.ats_score >= 60 ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              )}>
                                {Math.round(job.ats_score)}% Match
                              </span>
                            </div>

                            {/* Keywords tags */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {job.matched_keywords?.slice(0, 5).map((kw, i) => (
                                <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-md text-[10px] font-semibold">
                                  ✓ {kw}
                                </span>
                              ))}
                              {job.missing_keywords?.slice(0, 5).map((kw, i) => (
                                <span key={i} className="px-2 py-0.5 bg-rose-500/10 text-rose-700 dark:text-rose-300 rounded-md text-[10px] font-semibold">
                                  ! {kw}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
                              <button
                                onClick={() => {
                                  setAtsModalOpen(false);
                                  navigate(`/jobs?job_id=${job.id}`);
                                }}
                                className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-[11px] font-bold transition-all"
                              >
                                View in Scout →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-secondary)]">
              <button
                onClick={() => {
                  setAtsModalOpen(false);
                  navigate("/matcher");
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Target className="w-3.5 h-3.5" /> Run JD Matcher Studio
              </button>
              <button
                onClick={() => setAtsModalOpen(false)}
                className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONVERSION ANALYTICS DETAILED MODAL / DRAWER */}
      {/* ========================================================================= */}
      {conversionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[var(--text-primary)]">Application Pipeline Conversion Analytics</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Step-by-step conversion ratios calculated from live application records.</p>
                </div>
              </div>
              <button 
                onClick={() => setConversionModalOpen(false)} 
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {loadingConversion || !conversionData ? (
                <div className="flex items-center justify-center h-48 text-emerald-500">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <>
                  {/* Calculation Formula Callout */}
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-emerald-700 dark:text-emerald-300 font-medium space-y-1">
                    <strong className="font-extrabold block uppercase tracking-wider text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" /> Metric Formula & Logically Consistent Calculation
                    </strong>
                    <p className="text-xs leading-relaxed">
                      Conversion Rate = <strong>(Interviews Scheduled / Applications Submitted) × 100</strong>.
                      {" "}Current numerator = {conversionData.stats.interviews || 0} interviews; denominator = {conversionData.stats.applied_apps || 0} applications.
                    </p>
                  </div>

                  {/* Ratios Metrics Grid */}
                  <div className="grid sm:grid-cols-4 gap-3">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Interview Rate</span>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {conversionData.conversion_rates.interview_rate}%
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">Interviews / Applied</p>
                    </div>

                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Offer Rate</span>
                      <div className="text-2xl font-black text-amber-500">
                        {conversionData.conversion_rates.offer_rate}%
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">Offers / Applied</p>
                    </div>

                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Interview → Offer</span>
                      <div className="text-2xl font-black text-blue-500">
                        {conversionData.conversion_rates.interview_to_offer_rate}%
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">Offers / Interviews</p>
                    </div>

                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Discovered → Applied</span>
                      <div className="text-2xl font-black text-purple-500">
                        {conversionData.conversion_rates.discovered_to_applied_rate}%
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">Applied / Discovered</p>
                    </div>
                  </div>

                  {/* Stage-by-stage counts table */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs text-[var(--text-primary)] uppercase tracking-wider">
                      Application Stage Volume Breakdown
                    </h4>

                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden divide-y divide-[var(--border-color)] text-xs">
                      <div 
                        onClick={() => {
                          setConversionModalOpen(false);
                          navigate("/jobs");
                        }}
                        className="p-3.5 flex items-center justify-between hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></div>
                          <span className="font-bold text-[var(--text-primary)]">Stage 1: Discovered Opportunities</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-[var(--text-primary)]">{conversionData.stats.total_jobs} jobs</span>
                          <span className="text-blue-500 font-bold text-[11px]">View Jobs →</span>
                        </div>
                      </div>

                      <div 
                        onClick={() => {
                          setConversionModalOpen(false);
                          navigate("/applications?status=Saved");
                        }}
                        className="p-3.5 flex items-center justify-between hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full bg-indigo-500 shrink-0"></div>
                          <span className="font-bold text-[var(--text-primary)]">Stage 2: Saved Applications</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-[var(--text-primary)]">{conversionData.stats.saved_jobs} applications</span>
                          <span className="text-blue-500 font-bold text-[11px]">View Saved →</span>
                        </div>
                      </div>

                      <div 
                        onClick={() => {
                          setConversionModalOpen(false);
                          navigate("/applications?status=Applied");
                        }}
                        className="p-3.5 flex items-center justify-between hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full bg-purple-500 shrink-0"></div>
                          <span className="font-bold text-[var(--text-primary)]">Stage 3: Applications Submitted</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-[var(--text-primary)]">{conversionData.stats.applied_apps} applications</span>
                          <span className="text-blue-500 font-bold text-[11px]">View Applied →</span>
                        </div>
                      </div>

                      <div 
                        onClick={() => {
                          setConversionModalOpen(false);
                          navigate("/applications?status=Interview");
                        }}
                        className="p-3.5 flex items-center justify-between hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></div>
                          <span className="font-bold text-[var(--text-primary)]">Stage 4: Interviews Scheduled</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-emerald-600 dark:text-emerald-400">{conversionData.stats.interviews} interviews</span>
                          <span className="text-blue-500 font-bold text-[11px]">View Interviews →</span>
                        </div>
                      </div>

                      <div 
                        onClick={() => {
                          setConversionModalOpen(false);
                          navigate("/applications?status=Offer");
                        }}
                        className="p-3.5 flex items-center justify-between hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></div>
                          <span className="font-bold text-[var(--text-primary)]">Stage 5: Offers Received</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-amber-500">{conversionData.stats.offers} offers</span>
                          <span className="text-blue-500 font-bold text-[11px]">View Offers →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-secondary)]">
              <button
                onClick={() => {
                  setConversionModalOpen(false);
                  navigate("/applications");
                }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                Open Full Kanban Pipeline
              </button>
              <button
                onClick={() => setConversionModalOpen(false)}
                className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-xs font-bold cursor-pointer"
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
