import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import type { AgentLog, SystemStatus } from "../types";
import { AgentDetailsModal } from "../components/agents/AgentDetailsModal";
import { 
  Bot, 
  Play, 
  Search, 
  BrainCircuit, 
  FileSignature, 
  CheckCircle, 
  Loader2, 
  Activity, 
  Sparkles, 
  X,
  Layers,
  Server,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { cn } from "../utils/cn";

export function AiAgents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedAgentTag = searchParams.get("agent");

  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loadingSystem, setLoadingSystem] = useState(true);
  
  // Pipeline Trigger Form State
  const [pipelineModalOpen, setPipelineModalOpen] = useState(false);
  const [role, setRole] = useState("Software Engineer");
  const [location, setLocation] = useState("Bangalore");
  const [experience, setExperience] = useState("0-2");
  const [coverCount, setCoverCount] = useState(3);
  const [demoMode, setDemoMode] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [pipelineStartedMsg, setPipelineStartedMsg] = useState("");

  const loadLogs = async () => {
    try {
      const res = await api.get<{ success: boolean; logs: AgentLog[] }>("/api/agents/logs");
      if (res.success && Array.isArray(res.logs)) setLogs(res.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const loadSystemStatus = async (force: boolean = false) => {
    try {
      setLoadingSystem(true);
      const res = await api.get<{ success: boolean; system: SystemStatus }>(`/api/system/status?force=${force}`);
      if (res.success && res.system) {
        setSystemStatus(res.system);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSystem(false);
    }
  };

  useEffect(() => {
    loadLogs();
    loadSystemStatus();
    const interval = setInterval(loadLogs, 4000); // Auto refresh logs every 4s
    return () => clearInterval(interval);
  }, []);

  const handleRunPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriggering(true);
    try {
      await api.post("/api/agents/run-pipeline", {
        role,
        location,
        experience,
        generate_cover_letters_count: coverCount,
        demo_mode: demoMode
      });
      setPipelineModalOpen(false);
      setPipelineStartedMsg(`Multi-Agent Pipeline started for '${role}'!`);
      setTimeout(() => setPipelineStartedMsg(""), 4000);
      await loadLogs();
    } catch (err: any) {
      alert(err.message || "Failed to start pipeline");
    } finally {
      setTriggering(false);
    }
  };

  const handleOpenAgent = (agentTag: string) => {
    setSearchParams({ agent: agentTag });
  };

  const handleCloseAgentModal = () => {
    setSearchParams({});
  };

  // Helper to determine accurate agent status
  const getAgentStatus = (tag: string, requiresOllama: boolean = false) => {
    const ollamaOnline = systemStatus?.ollama?.status === "connected";
    if (requiresOllama && !ollamaOnline) {
      return { label: "Offline", color: "bg-amber-500", text: "Offline LLM", badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
    }

    const agentLogs = logs.filter(l => l.agent_name.toLowerCase().includes(tag.toLowerCase()));
    if (agentLogs.length === 0) {
      return { label: "Ready", color: "bg-emerald-500", text: "Ready", badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
    }
    
    const latest = agentLogs[0];
    if (latest.status === "Running") {
      return { label: "Active", color: "bg-blue-500 animate-ping", text: "Executing Task", badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
    }
    if (latest.status === "Error") {
      return { label: "Failed", color: "bg-red-500", text: "Task Failed", badgeBg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" };
    }
    if (latest.status === "Completed") {
      return { label: "Completed", color: "bg-emerald-500", text: "Completed", badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
    }

    return { label: "Ready", color: "bg-emerald-500", text: "Ready", badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
  };

  const agents = [
    {
      name: "Orchestrator",
      tag: "Orchestrator",
      role: "Pipeline Master",
      description: "Coordinates end-to-end multi-agent execution pipeline.",
      icon: Layers,
      color: "text-violet-500",
      bg: "bg-violet-500/10 border-violet-500/20",
      requiresOllama: false
    },
    {
      name: "ResumeMind",
      tag: "ResumeMind",
      role: "Resume Intelligence",
      description: "Parses PDF resumes, extracts skills & computes 5-factor ATS score.",
      icon: BrainCircuit,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
      requiresOllama: false
    },
    {
      name: "Scout",
      tag: "Scout",
      role: "Job Discovery",
      description: "Discovers, normalizes, & indexes job listings from live scrapers.",
      icon: Search,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      requiresOllama: false
    },
    {
      name: "Matcher",
      tag: "Matcher",
      role: "ATS Scorer",
      description: "Scores candidate resumes against target job descriptions.",
      icon: Bot,
      color: "text-orange-500",
      bg: "bg-orange-500/10 border-orange-500/20",
      requiresOllama: false
    },
    {
      name: "Scribe",
      tag: "Scribe",
      role: "Cover Letter Writer",
      description: "Crafts personalized, 100% truthful cover letters via Ollama AI.",
      icon: FileSignature,
      color: "text-violet-500",
      bg: "bg-violet-500/10 border-violet-500/20",
      requiresOllama: true
    },
    {
      name: "Tracker",
      tag: "Tracker",
      role: "Application Tracker",
      description: "Manages application lifecycle stages in persistent database.",
      icon: CheckCircle,
      color: "text-sky-500",
      bg: "bg-sky-500/10 border-sky-500/20",
      requiresOllama: false
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {pipelineStartedMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4.5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 animate-bounce-in">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>{pipelineStartedMsg}</span>
        </div>
      )}

      {/* Top Command Center Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md p-4 md:p-5 saas-card rounded-2xl shadow-xs">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <span>Multi-Agent Command Center</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
              6 Active Agents
            </span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
            Click any agent card to open its dedicated interactive control drawer and execute actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setPipelineModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer active:scale-98"
          >
            <Play className="w-4 h-4 text-emerald-200 fill-emerald-200" /> Trigger Multi-Agent Pipeline
          </button>
        </div>
      </div>

      {/* Subsystem System Status Bar */}
      <div className="p-3 sm:p-3.5 saas-card rounded-2xl border border-[var(--border-color)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-extrabold text-[var(--text-primary)] text-xs">System Health:</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-[11px] text-[var(--text-primary)]">FastAPI Backend</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-[11px] text-[var(--text-primary)]">SQLite DB</span>
          </div>

          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 border rounded-xl font-bold text-[11px]",
            systemStatus?.ollama?.status === "connected"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
          )}>
            <span className={cn("w-2 h-2 rounded-full", systemStatus?.ollama?.status === "connected" ? "bg-emerald-500" : "bg-amber-500")}></span>
            <span className="truncate max-w-[200px] sm:max-w-none">
              Ollama AI: {systemStatus?.ollama?.status === "connected" ? `Online (${systemStatus.ollama.active_model || 'Connected'})` : "Offline (Fallback Active)"}
            </span>
          </div>
        </div>

        <button
          onClick={() => loadSystemStatus(true)}
          disabled={loadingSystem}
          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition-all self-end sm:self-auto cursor-pointer"
          title="Refresh System Status"
        >
          <RefreshCw className={cn("w-4 h-4", loadingSystem && "animate-spin text-blue-500")} />
        </button>
      </div>

      {/* Agents Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {agents.map((agent) => {
          const status = getAgentStatus(agent.tag, agent.requiresOllama);
          const agentLogs = logs.filter(l => l.agent_name.toLowerCase().includes(agent.tag.toLowerCase()));
          const latestLog = agentLogs[0];

          return (
            <div 
              key={agent.name}
              role="button"
              tabIndex={0}
              onClick={() => handleOpenAgent(agent.tag)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpenAgent(agent.tag);
                }
              }}
              className="saas-card rounded-2xl p-4 sm:p-4.5 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between space-y-3 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-[0.99] relative overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/40 via-indigo-500/40 to-violet-500/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div>
                <div className="flex items-start justify-between mb-2.5 pointer-events-none">
                  <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shadow-2xs group-hover:scale-110 transition-transform duration-200", agent.bg, agent.color)}>
                    <agent.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className={cn("flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-[10px] font-extrabold shadow-2xs", status.badgeBg)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full shadow-xs", status.color)}></span>
                    <span>{status.text}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-extrabold text-sm sm:text-base text-[var(--text-primary)] tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {agent.name}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] font-semibold mb-2">{agent.role}</p>

                <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed font-medium mb-2.5">
                  {agent.description}
                </p>

                {latestLog && (
                  <div className="text-[10px] bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] leading-tight shadow-2xs font-mono pointer-events-none">
                    <span className="font-bold text-[var(--text-primary)] block truncate mb-0.5">{latestLog.action}</span>
                    {latestLog.details && <span className="text-[var(--text-muted)] line-clamp-1">{latestLog.details}</span>}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[10px] sm:text-[11px] text-[var(--text-muted)] font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                <span>Click to open control center</span>
                <span className="font-bold">Open Agent →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Activity Stream Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xs flex flex-col h-[340px] sm:h-[380px]">
        <div className="p-3 sm:p-3.5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/80 backdrop-blur-xs flex items-center justify-between">
          <h3 className="font-extrabold text-[11px] sm:text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" /> Live Agent Activity Stream ({logs.length})
          </h3>
          <span className="text-[10px] text-[var(--text-muted)] font-mono font-medium">Auto-refreshes every 4s</span>
        </div>

        <div className="flex-1 p-3 sm:p-3.5 overflow-y-auto space-y-1.5 font-mono text-xs">
          {loadingLogs ? (
            <div className="flex items-center justify-center h-full text-blue-500">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-[var(--text-muted)] text-center py-12">No agent activity recorded yet.</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="p-2 sm:p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-blue-500/30 rounded-xl transition-all flex items-start gap-2.5 sm:gap-3 shadow-2xs">
                <span className="text-[var(--text-muted)] shrink-0 text-[10px] sm:text-[11px]">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
                <span className={cn(
                  "font-bold shrink-0 w-20 sm:w-24 text-[10px] sm:text-xs",
                  log.status === "Error" ? "text-red-500 dark:text-red-400" :
                  log.status === "Running" ? "text-blue-500" : "text-emerald-600 dark:text-emerald-400"
                )}>
                  [{log.agent_name}]
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-[var(--text-primary)] font-sans font-semibold text-xs">{log.action}</span>
                  {log.details && (
                    <span className="text-[var(--text-muted)] block text-[10px] sm:text-[11px] font-sans mt-0.5 truncate">{log.details}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trigger Pipeline Modal */}
      {pipelineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-500" /> Run Multi-Agent Pipeline
              </h3>
              <button onClick={() => setPipelineModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRunPipeline} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Target Role</label>
                <input 
                  type="text" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Location</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bangalore, Remote"
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Experience Level</label>
                  <select 
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                  >
                    <option value="0-2">0-2 Years</option>
                    <option value="2-5">2-5 Years</option>
                    <option value="5+">5+ Years</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Cover Letters to Write</label>
                  <select 
                    value={coverCount}
                    onChange={(e) => setCoverCount(Number(e.target.value))}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                  >
                    <option value={1}>Top 1 Job</option>
                    <option value={3}>Top 3 Jobs</option>
                    <option value={5}>Top 5 Jobs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Job Discovery Mode</label>
                <select 
                  value={demoMode ? "demo" : "live"}
                  onChange={(e) => setDemoMode(e.target.value === "demo")}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                >
                  <option value="demo">Demo Data Mode (Instant)</option>
                  <option value="live">Live Job Scraper</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={triggering}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {triggering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {triggering ? "Executing Pipeline..." : "Execute 5-Agent Pipeline"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Selected Agent Details Drawer / Modal */}
      {selectedAgentTag && (
        <AgentDetailsModal
          agentTag={selectedAgentTag}
          onClose={handleCloseAgentModal}
          systemStatus={systemStatus}
          logs={logs}
          onLogsRefresh={loadLogs}
        />
      )}
    </div>
  );
}
