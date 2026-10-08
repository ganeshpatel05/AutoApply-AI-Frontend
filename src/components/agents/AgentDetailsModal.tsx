import React, { useState, useEffect, useRef } from "react";
import { api } from "../../api/client";
import type { 
  Job, 
  Resume, 
  Application, 
  AgentLog, 
  ResumeScore, 
  MatchResult, 
  CoverLetterResponseData,
  SystemStatus 
} from "../../types";
import {
  X,
  Play,
  Upload,
  Search,
  Bot,
  FileSignature,
  CheckCircle,
  CheckCircle2,
  Loader2,
  Activity,
  Sparkles,
  Layers,
  BrainCircuit,
  Copy,
  BookmarkPlus,
  ExternalLink,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  Wand2,
  Check,
  Target,
  Bookmark,
  BookmarkCheck
} from "lucide-react";
import { cn } from "../../utils/cn";
import { getValidJobUrl, handleOpenOriginalPosting } from "../../utils/url";

interface AgentDetailsModalProps {
  agentTag: string;
  onClose: () => void;
  systemStatus: SystemStatus | null;
  logs: AgentLog[];
  onLogsRefresh: () => void;
}

export function AgentDetailsModal({
  agentTag,
  onClose,
  systemStatus,
  logs,
  onLogsRefresh
}: AgentDetailsModalProps) {
  // Modal backdrop lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Agent Meta Configuration
  const agentMeta: Record<string, {
    name: string;
    role: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    description: string;
    capabilities: string[];
    requiresOllama: boolean;
  }> = {
    Orchestrator: {
      name: "Orchestrator",
      role: "Pipeline Master",
      icon: Layers,
      color: "text-violet-500",
      bg: "bg-violet-500/10 border-violet-500/20",
      description: "Coordinates end-to-end career automation: Resume Parsing → Job Scouting → ATS Scoring → Cover Letter Writing → Application Tracking.",
      capabilities: [
        "Sequential multi-agent execution pipeline",
        "Automated fallback management and error recovery",
        "Parallel cover letter generation and application logging",
        "Real-time execution status stream and audit logs"
      ],
      requiresOllama: false,
    },
    ResumeMind: {
      name: "ResumeMind",
      role: "Resume Intelligence",
      icon: BrainCircuit,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
      description: "Parses PDF/DOCX resumes, extracts skills & experience, calculates multi-metric ATS scores, and generates actionable AI improvements.",
      capabilities: [
        "Multi-format PDF & DOCX text extraction",
        "Skill categorization & contact detail parsing",
        "5-Component ATS quality scoring engine",
        "AI-powered bullet point enhancement & resume builder"
      ],
      requiresOllama: false,
    },
    Scout: {
      name: "Scout",
      role: "Job Discovery",
      icon: Search,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      description: "Discovers, normalizes, deduplicates, and indexes job listings from live scrapers and structured job databases.",
      capabilities: [
        "Role, location, & experience-based job search",
        "Deduplication via SHA-256 job content hashing",
        "Live web scraping & curated dataset mode",
        "SQLite job indexing with instant bookmarking"
      ],
      requiresOllama: false,
    },
    Matcher: {
      name: "Matcher",
      role: "ATS Scorer",
      icon: Bot,
      color: "text-orange-500",
      bg: "bg-orange-500/10 border-orange-500/20",
      description: "Evaluates candidate resumes against job descriptions using a 5-factor ATS scoring algorithm (Skills 40%, Keywords 25%, Experience 15%, Education 10%, Text Similarity 10%).",
      capabilities: [
        "5-Component mathematical match scoring",
        "Green matched vs red missing keyword extraction",
        "MNC & enterprise job alignment categorization",
        "Actionable resume optimization recommendations"
      ],
      requiresOllama: false,
    },
    Scribe: {
      name: "Scribe",
      role: "Cover Letter Writer",
      icon: FileSignature,
      color: "text-violet-500",
      bg: "bg-violet-500/10 border-violet-500/20",
      description: "Crafts personalized, 4-5 paragraph job-specific cover letters grounded strictly in candidate experience with zero hallucination.",
      capabilities: [
        "Local Ollama LLM integration (Mistral/Llama)",
        "Strict anti-hallucination grounded fallback engine",
        "Tone & length customization (Professional, Confident, Concise)",
        "PDF download, copy-to-clipboard, & application tracking"
      ],
      requiresOllama: true,
    },
    Tracker: {
      name: "Tracker",
      role: "Application Tracker",
      icon: CheckCircle,
      color: "text-sky-500",
      bg: "bg-sky-500/10 border-sky-500/20",
      description: "Manages job application lifecycle stages across a persistent Kanban pipeline (Saved → Applied → Screening → Interview → Offer → Rejected).",
      capabilities: [
        "Persistent SQLite application state management",
        "Kanban stage filtering & status transitions",
        "Application notes, activity logs, & date tracking",
        "Optional SMTP email submission integration"
      ],
      requiresOllama: false,
    },
  };

  const meta = agentMeta[agentTag] || agentMeta["Orchestrator"];

  // Calculate live Agent Status
  const agentLogs = logs.filter(l => l.agent_name.toLowerCase().includes(agentTag.toLowerCase()));
  const latestLog = agentLogs[0];
  const ollamaOnline = systemStatus?.ollama?.status === "connected";

  let statusColor = "bg-emerald-500";
  let statusBadge = "Available";

  if (meta.requiresOllama && !ollamaOnline) {
    statusColor = "bg-amber-500";
    statusBadge = "Offline LLM";
  } else if (latestLog?.status === "Running") {
    statusColor = "bg-blue-500 animate-ping";
    statusBadge = "Executing Task";
  } else if (latestLog?.status === "Error") {
    statusColor = "bg-red-500";
    statusBadge = "Last Task Error";
  } else if (latestLog?.status === "Completed") {
    statusColor = "bg-emerald-500";
    statusBadge = "Ready";
  }

  // ─── STATE FOR EACH AGENT WORKBENCH ─────────────────────────────────────
  
  // 1. Orchestrator State
  const [orchRole, setOrchRole] = useState("Software Engineer");
  const [orchLocation, setOrchLocation] = useState("Bangalore");
  const [orchExp, setOrchExp] = useState("0-2");
  const [orchCoverCount, setOrchCoverCount] = useState(3);
  const [orchDemoMode, setOrchDemoMode] = useState(true);
  const [orchRunning, setOrchRunning] = useState(false);
  const [orchResultMsg, setOrchResultMsg] = useState("");

  // 2. ResumeMind State
  const [resumeTab, setResumeTab] = useState<"active" | "upload" | "builder">("active");
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [resumeScore, setResumeScore] = useState<ResumeScore | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resume Builder Form
  const [builderData, setBuilderData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    summary: "",
    skills: "",
    experience: "",
    projects: "",
    education: "",
    enhance_with_ai: true
  });
  const [building, setBuilding] = useState(false);

  // 3. Scout State
  const [scoutRole, setScoutRole] = useState("Software Engineer");
  const [scoutLocation, setScoutLocation] = useState("Bangalore");
  const [scoutExp, setScoutExp] = useState("0-2");
  const [scoutDemoMode, setScoutDemoMode] = useState(true);
  const [scoutLoading, setScoutLoading] = useState(false);
  const [discoveredJobs, setDiscoveredJobs] = useState<Job[]>([]);
  const [scoutMsg, setScoutMsg] = useState("");

  // 4. Matcher State
  const [matchResumeText, setMatchResumeText] = useState("");
  const [matchJdText, setMatchJdText] = useState("");
  const [matchJobTitle, setMatchJobTitle] = useState("Software Developer");
  const [matchCompany, setMatchCompany] = useState("Target Company");
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matchError, setMatchError] = useState("");

  // 5. Scribe State
  const [scribeTone, setScribeTone] = useState<"Professional" | "Confident" | "Concise" | "Enthusiastic">("Professional");
  const [scribeLength, setScribeLength] = useState<"Short" | "Standard" | "Detailed">("Standard");
  const [scribeJobId, setScribeJobId] = useState<number | null>(null);
  const [scribeJobs, setScribeJobs] = useState<Job[]>([]);
  const [scribeLoading, setScribeLoading] = useState(false);
  const [scribeData, setScribeData] = useState<CoverLetterResponseData | null>(null);
  const [scribeContent, setScribeContent] = useState("");
  const [scribeCopied, setScribeCopied] = useState(false);
  const [scribeError, setScribeError] = useState("");
  const [scribeSaveMsg, setScribeSaveMsg] = useState("");

  // 6. Tracker State
  const [applications, setApplications] = useState<Application[]>([]);
  const [trackerJobs, setTrackerJobs] = useState<Job[]>([]);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newAppJobId, setNewAppJobId] = useState<number | null>(null);
  const [newAppStatus, setNewAppStatus] = useState("Saved");
  const [newAppNotes, setNewAppNotes] = useState("");
  const [addingApp, setAddingApp] = useState(false);
  const [trackerSearch, setTrackerSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // ─── INITIALIZATION LOGIC FOR SELECTED AGENT ────────────────────────────
  useEffect(() => {
    if (agentTag === "ResumeMind") {
      loadResumeMindData();
    } else if (agentTag === "Scout") {
      loadInitialJobs();
    } else if (agentTag === "Matcher") {
      loadMatcherInitialData();
    } else if (agentTag === "Scribe") {
      loadScribeInitialData();
    } else if (agentTag === "Tracker") {
      loadTrackerData();
    }
  }, [agentTag]);

  // ResumeMind Data Loader
  const loadResumeMindData = async () => {
    setResumeLoading(true);
    try {
      const res = await api.get<{ success: boolean; resume: Resume }>("/api/resumes/active");
      if (res.success && res.resume) {
        setActiveResume(res.resume);
        try {
          const scoreRes = await api.get<{ success: boolean; score: ResumeScore }>("/api/resumes/active/score");
          if (scoreRes.success) setResumeScore(scoreRes.score);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResumeLoading(false);
    }
  };

  // Scout Initial Jobs
  const loadInitialJobs = async () => {
    try {
      const res = await api.get<{ success: boolean; jobs: Job[] }>("/api/jobs/");
      if (res.success && Array.isArray(res.jobs)) {
        setDiscoveredJobs(res.jobs.slice(0, 6));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Matcher Initial Data
  const loadMatcherInitialData = async () => {
    try {
      const [resumesRes, jobsRes] = await Promise.all([
        api.get<{ success: boolean; resume: Resume }>("/api/resumes/active"),
        api.get<{ success: boolean; jobs: Job[] }>("/api/jobs/")
      ]);
      if (resumesRes?.success && resumesRes.resume?.raw_text) {
        setMatchResumeText(resumesRes.resume.raw_text);
      }
      if (jobsRes?.success && jobsRes.jobs?.length > 0) {
        const j = jobsRes.jobs[0];
        setMatchJobTitle(j.title);
        setMatchCompany(j.company);
        const fullDesc = `${j.description || ""} ${j.requirements || ""}`.trim();
        setMatchJdText(fullDesc || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Scribe Initial Data
  const loadScribeInitialData = async () => {
    try {
      const [resumesRes, jobsRes] = await Promise.all([
        api.get<{ success: boolean; resume: Resume }>("/api/resumes/active"),
        api.get<{ success: boolean; jobs: Job[] }>("/api/jobs/")
      ]);
      if (resumesRes?.success && resumesRes.resume) {
        setActiveResume(resumesRes.resume);
      }
      if (jobsRes?.success && Array.isArray(jobsRes.jobs)) {
        setScribeJobs(jobsRes.jobs);
        if (jobsRes.jobs.length > 0) {
          setScribeJobId(jobsRes.jobs[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Tracker Data Loader
  const loadTrackerData = async () => {
    setTrackerLoading(true);
    try {
      const [appsRes, jobsRes] = await Promise.all([
        api.get<{ success: boolean; applications: Application[] }>("/api/applications/"),
        api.get<{ success: boolean; jobs: Job[] }>("/api/jobs/")
      ]);
      if (appsRes?.success && Array.isArray(appsRes.applications)) {
        setApplications(appsRes.applications);
      }
      if (jobsRes?.success && Array.isArray(jobsRes.jobs)) {
        setTrackerJobs(jobsRes.jobs);
        if (jobsRes.jobs.length > 0) setNewAppJobId(jobsRes.jobs[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTrackerLoading(false);
    }
  };

  // ─── ACTION HANDLERS FOR EACH AGENT ─────────────────────────────────────

  // Orchestrator Action
  const handleRunOrchestratorPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrchRunning(true);
    setOrchResultMsg("");
    try {
      await api.post("/api/agents/run-pipeline", {
        role: orchRole,
        location: orchLocation,
        experience: orchExp,
        generate_cover_letters_count: orchCoverCount,
        demo_mode: orchDemoMode
      });
      setOrchResultMsg(`Multi-Agent Pipeline started in background for role '${orchRole}'!`);
      setTimeout(() => setOrchResultMsg(""), 5000);
      onLogsRefresh();
    } catch (err) {
      alert((err as any).message || "Failed to start pipeline");
    } finally {
      setOrchRunning(false);
    }
  };

  // ResumeMind Actions
  const handleResumeFileUpload = async (file: File) => {
    if (!file || !file.name.match(/\.(pdf|docx|txt)$/i)) {
      alert("Please upload a supported file (.pdf, .docx, or .txt)");
      return;
    }
    setUploadProgress("Uploading & Parsing...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/api/resumes/upload", formData);
      if (res) {
        setUploadProgress("Analyzing...");
        await loadResumeMindData();
        setResumeTab("active");
        onLogsRefresh();
      }
    } catch (err) {
      alert((err as any).message || "Resume upload failed");
    } finally {
      setUploadProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleBuildResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderData.name.trim()) {
      alert("Full Name is required.");
      return;
    }
    setBuilding(true);
    try {
      const skillsArray = builderData.skills.split(",").map(s => s.trim()).filter(Boolean);
      const payload = { ...builderData, skills: skillsArray };
      const res = await api.post<{ success: boolean; resume: Resume; score: ResumeScore }>("/api/resumes/generate", payload);
      if (res.success) {
        await loadResumeMindData();
        setResumeTab("active");
        onLogsRefresh();
      }
    } catch (err) {
      alert((err as any).message || "Resume generation failed");
    } finally {
      setBuilding(false);
    }
  };

  // Scout Action
  const handleRunScoutSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setScoutLoading(true);
    setScoutMsg("");
    try {
      const res = await api.post<{ success: boolean; count: number; jobs: Job[] }>("/api/jobs/search-new", {
        role: scoutRole,
        location: scoutLocation,
        experience: scoutExp,
        demo_mode: scoutDemoMode
      });
      if (res.success) {
        setDiscoveredJobs(res.jobs || []);
        setScoutMsg(`Scout discovered and indexed ${res.count} jobs for '${scoutRole}'!`);
        onLogsRefresh();
      }
    } catch (err) {
      alert((err as any).message || "Scout job search failed");
    } finally {
      setScoutLoading(false);
    }
  };

  const handleToggleSaveJob = async (jobId: number) => {
    try {
      const res = await api.post<{ success: boolean; is_saved: number }>(`/api/jobs/${jobId}/toggle-save`);
      setDiscoveredJobs(discoveredJobs.map(j => j.id === jobId ? { ...j, is_saved: res.is_saved } : j));
    } catch (err) {
      console.error(err);
    }
  };

  // Matcher Action
  const handleRunMatch = async () => {
    if (!matchJdText.trim()) {
      setMatchError("Please enter a target Job Description.");
      return;
    }
    setMatching(true);
    setMatchError("");
    setMatchResult(null);
    try {
      const res = await api.post<{ success: boolean; match_result: MatchResult }>("/api/jobs/match-custom", {
        jd_text: matchJdText,
        job_title: matchJobTitle,
        company: matchCompany,
        resume_text: matchResumeText
      });
      if (res.success && res.match_result) {
        setMatchResult(res.match_result);
        onLogsRefresh();
      }
    } catch (err) {
      setMatchError((err as any).message || "Matching calculation failed");
    } finally {
      setMatching(false);
    }
  };

  // Scribe Actions
  const handleGenerateCoverLetter = async () => {
    if (!activeResume) {
      setScribeError("No active resume profile found. Please upload a resume first.");
      return;
    }
    if (!scribeJobId) {
      setScribeError("Please select a target job from the dropdown.");
      return;
    }
    setScribeLoading(true);
    setScribeError("");
    try {
      const res = await api.post<{ success: boolean; data: CoverLetterResponseData }>("/api/cover-letters/generate", {
        job_id: scribeJobId,
        tone: scribeTone,
        length: scribeLength,
        variation: 1
      });
      if (res.success && res.data) {
        setScribeData(res.data);
        setScribeContent(res.data.content);
        onLogsRefresh();
      }
    } catch (err) {
      setScribeError((err as any).message || "Cover letter generation failed");
    } finally {
      setScribeLoading(false);
    }
  };

  const handleSaveCoverLetterToApp = async () => {
    if (!scribeJobId || !scribeContent) return;
    try {
      await api.post("/api/applications/", {
        job_id: scribeJobId,
        status: "Saved",
        cover_letter: scribeContent
      });
      setScribeSaveMsg("Cover letter & job saved to Application Tracker!");
      setTimeout(() => setScribeSaveMsg(""), 4000);
    } catch (err) {
      alert((err as any).message || "Failed to save application");
    }
  };

  // Tracker Actions
  const handleUpdateAppStatus = async (appId: number, status: string, notes?: string) => {
    try {
      await api.put(`/api/applications/${appId}/status`, { status, notes });
      setApplications(applications.map(a => a.id === appId ? { ...a, status, notes: notes !== undefined ? notes : a.notes } : a));
      if (selectedApp?.id === appId) {
        setSelectedApp(prev => prev ? { ...prev, status, notes: notes !== undefined ? notes : prev.notes } : null);
      }
      onLogsRefresh();
    } catch (err) {
      alert((err as any).message || "Failed to update status");
    }
  };

  const handleDeleteApp = async (appId: number) => {
    if (!confirm("Delete this tracked application record?")) return;
    try {
      await api.delete(`/api/applications/${appId}`);
      setApplications(applications.filter(a => a.id !== appId));
      if (selectedApp?.id === appId) setSelectedApp(null);
      onLogsRefresh();
    } catch (err) {
      alert((err as any).message || "Failed to delete application");
    }
  };

  const handleCreateNewApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppJobId) return;
    setAddingApp(true);
    try {
      const res = await api.post<{ success: boolean; application: Application }>("/api/applications/", {
        job_id: newAppJobId,
        status: newAppStatus,
        notes: newAppNotes
      });
      if (res.success) {
        await loadTrackerData();
        setNewAppNotes("");
        setShowAddForm(false);
        onLogsRefresh();
      }
    } catch (err) {
      alert((err as any).message || "Failed to create application");
    } finally {
      setAddingApp(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // RENDER WORKBENCH COMPONENT ACCORDING TO SELECTED AGENT
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden my-auto">
        
        {/* Modal Top Banner */}
        <div className="p-5 md:p-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/80 backdrop-blur-md flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs shrink-0", meta.bg, meta.color)}>
              <meta.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg md:text-xl font-black text-[var(--text-primary)] tracking-tight">{meta.name} Agent</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] shadow-2xs flex items-center gap-1.5">
                  <span className={cn("w-2 h-2 rounded-full", statusColor)}></span>
                  <span>{statusBadge}</span>
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">{meta.role} • {meta.description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition-all cursor-pointer shrink-0"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">

          {/* ───────────────────────────────────────────────────────────── */}
          {/* A. ORCHESTRATOR WORKBENCH */}
          {/* ───────────────────────────────────────────────────────────── */}
          {agentTag === "Orchestrator" && (
            <div className="space-y-6">
              {/* Pipeline Sub-agents Status Diagram */}
              <div className="saas-card rounded-2xl p-5 shadow-xs border border-[var(--border-color)] space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-500" /> Multi-Agent Execution Pipeline Stages
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
                  {[
                    { name: "ResumeMind", role: "Resume Parse", tag: "ResumeMind", icon: BrainCircuit, color: "text-blue-500" },
                    { name: "Scout", role: "Job Search", tag: "Scout", icon: Search, color: "text-emerald-500" },
                    { name: "Matcher", role: "ATS Score", tag: "Matcher", icon: Bot, color: "text-orange-500" },
                    { name: "Scribe", role: "Cover Letters", tag: "Scribe", icon: FileSignature, color: "text-violet-500" },
                    { name: "Tracker", role: "Track Apps", tag: "Tracker", icon: CheckCircle, color: "text-sky-500" },
                  ].map((sub, idx) => {
                    const subLogs = logs.filter(l => l.agent_name.toLowerCase().includes(sub.tag.toLowerCase()));
                    const latestSub = subLogs[0];
                    const isRunning = latestSub?.status === "Running";
                    const isCompleted = latestSub?.status === "Completed";
                    const isError = latestSub?.status === "Error";

                    return (
                      <div key={sub.name} className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl flex flex-col justify-between space-y-2 relative shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[var(--text-muted)]">Step #{idx + 1}</span>
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            isRunning ? "bg-blue-500 animate-ping" :
                            isCompleted ? "bg-emerald-500" :
                            isError ? "bg-red-500" : "bg-gray-400"
                          )}></span>
                        </div>
                        <div>
                          <div className="font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
                            <sub.icon className={cn("w-3.5 h-3.5", sub.color)} />
                            <span>{sub.name}</span>
                          </div>
                          <div className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5">{sub.role}</div>
                        </div>
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded text-center uppercase tracking-wide",
                          isRunning ? "bg-blue-500/10 text-blue-500" :
                          isCompleted ? "bg-emerald-500/10 text-emerald-600" :
                          isError ? "bg-red-500/10 text-red-500" : "bg-gray-500/10 text-gray-500"
                        )}>
                          {isRunning ? "Running" : isCompleted ? "Completed" : isError ? "Error" : "Ready"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trigger Form */}
              <form onSubmit={handleRunOrchestratorPipeline} className="saas-card rounded-2xl p-5 shadow-xs border border-[var(--border-color)] space-y-4 text-xs">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-500" /> Execute Complete Pipeline
                </h3>

                {orchResultMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>{orchResultMsg}</span>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">Target Job Role</label>
                    <input
                      type="text"
                      value={orchRole}
                      onChange={e => setOrchRole(e.target.value)}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">Location</label>
                    <input
                      type="text"
                      value={orchLocation}
                      onChange={e => setOrchLocation(e.target.value)}
                      placeholder="Bangalore, Remote"
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">Experience Level</label>
                    <select
                      value={orchExp}
                      onChange={e => setOrchExp(e.target.value)}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                    >
                      <option value="0-2">0-2 Years</option>
                      <option value="2-5">2-5 Years</option>
                      <option value="5+">5+ Years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">Cover Letters to Generate</label>
                    <select
                      value={orchCoverCount}
                      onChange={e => setOrchCoverCount(Number(e.target.value))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                    >
                      <option value={1}>Top 1 Job</option>
                      <option value={3}>Top 3 Jobs</option>
                      <option value={5}>Top 5 Jobs</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="orchDemoMode"
                      checked={orchDemoMode}
                      onChange={e => setOrchDemoMode(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <label htmlFor="orchDemoMode" className="text-xs text-[var(--text-secondary)] cursor-pointer font-medium">
                      Fast Demo Mode (instant dataset scraping)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={orchRunning}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-98"
                  >
                    {orchRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 text-emerald-200 fill-emerald-200" />}
                    {orchRunning ? "Executing 5 Agents..." : "Trigger Multi-Agent Pipeline"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* B. RESUMEMIND WORKBENCH */}
          {/* ───────────────────────────────────────────────────────────── */}
          {agentTag === "ResumeMind" && (
            <div className="space-y-6">
              {/* Tab Switcher */}
              <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                <button
                  onClick={() => setResumeTab("active")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer",
                    resumeTab === "active" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs" : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                  )}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Resume Profile
                </button>
                <button
                  onClick={() => setResumeTab("upload")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer",
                    resumeTab === "upload" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs" : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                  )}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload PDF / DOCX
                </button>
                <button
                  onClick={() => setResumeTab("builder")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer",
                    resumeTab === "builder" ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xs" : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                  )}
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-300" /> Build & Generate
                </button>
              </div>

              {resumeTab === "active" && (
                resumeLoading ? (
                  <div className="h-64 flex items-center justify-center text-blue-500">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : activeResume ? (
                  <div className="space-y-5 text-xs">
                    {/* Active Profile Info */}
                    <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                          {activeResume.name ? activeResume.name.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[var(--text-primary)]">{activeResume.name}</h4>
                          <p className="text-[11px] text-[var(--text-muted)]">{activeResume.email} • {activeResume.phone}</p>
                        </div>
                      </div>
                      {resumeScore && (
                        <div className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-center">
                          <span className="text-lg font-black text-amber-600 dark:text-amber-400">{resumeScore.total}%</span>
                          <span className="block text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-extrabold">ATS Score</span>
                        </div>
                      )}
                    </div>

                    {/* Breakdown */}
                    {resumeScore && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="saas-card p-4 rounded-xl space-y-2 border border-[var(--border-color)]">
                          <h5 className="font-extrabold text-[11px] text-[var(--text-muted)] uppercase">Score Metrics</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between font-bold"><span>Skills</span><span>{resumeScore.skills}%</span></div>
                            <div className="flex justify-between font-bold"><span>Experience</span><span>{resumeScore.experience}%</span></div>
                            <div className="flex justify-between font-bold"><span>Education</span><span>{resumeScore.education}%</span></div>
                            <div className="flex justify-between font-bold"><span>Content</span><span>{resumeScore.content}%</span></div>
                          </div>
                        </div>

                        <div className="saas-card p-4 rounded-xl space-y-2 border border-[var(--border-color)]">
                          <h5 className="font-extrabold text-[11px] text-[var(--text-muted)] uppercase">AI Suggestions</h5>
                          <ul className="space-y-1 text-[11px] text-[var(--text-secondary)]">
                            {resumeScore.suggestions.map((s, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Extracted Skills */}
                    <div className="saas-card p-4 rounded-xl border border-[var(--border-color)]">
                      <h5 className="font-extrabold text-[11px] text-[var(--text-muted)] uppercase mb-2">Parsed Skills ({activeResume.skills.length})</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {activeResume.skills.map((sk, i) => (
                          <span key={i} className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 rounded-lg font-semibold">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs text-[var(--text-muted)]">
                    No active resume. Switch to 'Upload PDF / DOCX' to parse a resume.
                  </div>
                )
              )}

              {resumeTab === "upload" && (
                <div className="space-y-4 text-xs">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleResumeFileUpload(f);
                    }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-blue-500/40 hover:border-blue-500 bg-blue-500/5 p-8 rounded-2xl text-center cursor-pointer transition-all space-y-3"
                  >
                    {uploadProgress ? (
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                    ) : (
                      <Upload className="w-8 h-8 text-blue-500 mx-auto" />
                    )}
                    <div>
                      <p className="font-extrabold text-sm text-[var(--text-primary)]">
                        {uploadProgress || "Click or Drag & Drop PDF / DOCX Resume"}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1">
                        ResumeMind will extract contact details, skills, education, and work history automatically.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {resumeTab === "builder" && (
                <form onSubmit={handleBuildResumeSubmit} className="space-y-4 text-xs">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[var(--text-secondary)] mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={builderData.name}
                        onChange={e => setBuilderData({ ...builderData, name: e.target.value })}
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[var(--text-secondary)] mb-1">Email</label>
                      <input
                        type="email"
                        value={builderData.email}
                        onChange={e => setBuilderData({ ...builderData, email: e.target.value })}
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">Skills (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="Python, React, TypeScript, FastAPI, SQL"
                      value={builderData.skills}
                      onChange={e => setBuilderData({ ...builderData, skills: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">Experience Summary</label>
                    <textarea
                      rows={3}
                      value={builderData.experience}
                      onChange={e => setBuilderData({ ...builderData, experience: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={building}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    {building ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                    {building ? "Building ATS Resume..." : "Generate ATS Resume Profile"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* C. SCOUT WORKBENCH */}
          {/* ───────────────────────────────────────────────────────────── */}
          {agentTag === "Scout" && (
            <div className="space-y-6">
              <form onSubmit={handleRunScoutSearch} className="saas-card rounded-2xl p-4 border border-[var(--border-color)] space-y-4 text-xs">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-500" /> Scout Job Discovery Settings
                </h3>

                {scoutMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>{scoutMsg}</span>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">Job Role</label>
                    <input
                      type="text"
                      value={scoutRole}
                      onChange={e => setScoutRole(e.target.value)}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">Location</label>
                    <input
                      type="text"
                      value={scoutLocation}
                      onChange={e => setScoutLocation(e.target.value)}
                      placeholder="e.g. Bangalore, Remote"
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">Experience</label>
                    <select
                      value={scoutExp}
                      onChange={e => setScoutExp(e.target.value)}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                    >
                      <option value="0-2">0-2 Years</option>
                      <option value="2-5">2-5 Years</option>
                      <option value="5+">5+ Years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">Scraper Mode</label>
                    <select
                      value={scoutDemoMode ? "demo" : "live"}
                      onChange={e => setScoutDemoMode(e.target.value === "demo")}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                    >
                      <option value="demo">Demo Dataset (Instant)</option>
                      <option value="live">Live Web Scraper</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={scoutLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-98"
                  >
                    {scoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {scoutLoading ? "Scouting Jobs..." : "Run Job Scout Agent"}
                  </button>
                </div>
              </form>

              {/* Discovered Jobs List */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
                  <span>Discovered Job Listings ({discoveredJobs.length})</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Saved in SQLite database</span>
                </h4>

                {discoveredJobs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)]">
                    No jobs discovered yet. Click 'Run Job Scout Agent' above.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    {discoveredJobs.map(job => (
                      <div key={job.id} className="p-3.5 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-emerald-500/30 rounded-xl space-y-2 shadow-2xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-extrabold text-xs text-[var(--text-primary)] truncate">{job.title}</h5>
                            <p className="text-[11px] text-[var(--text-secondary)] font-semibold">{job.company} • <span className="text-[var(--text-muted)]">{job.location || "Remote"}</span></p>
                          </div>
                          <button
                            onClick={() => handleToggleSaveJob(job.id)}
                            className="text-[var(--text-muted)] hover:text-emerald-500 transition-colors p-1"
                            title={job.is_saved ? "Saved" : "Save job"}
                          >
                            {job.is_saved ? <BookmarkCheck className="w-4 h-4 text-emerald-500" /> : <Bookmark className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)] text-[10px]">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {job.ats_score > 0 ? `${Math.round(job.ats_score)}% Match` : "Unscored"}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleOpenOriginalPosting(e, job)}
                              className={cn(
                                "text-[var(--text-muted)] hover:text-blue-500 cursor-pointer bg-transparent border-0 p-0 transition-colors font-medium",
                                !getValidJobUrl(job) && "opacity-70"
                              )}
                              title={getValidJobUrl(job) ? `Open original posting on ${job.source || 'platform'}` : "Original job posting URL is unavailable"}
                              aria-label="Open original posting"
                            >
                              Source: {job.source}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleOpenOriginalPosting(e, job)}
                              className={cn(
                                "flex items-center gap-0.5 cursor-pointer bg-transparent border-0 p-0 transition-colors",
                                getValidJobUrl(job) ? "text-blue-500 hover:underline" : "text-gray-400 hover:underline"
                              )}
                              title={getValidJobUrl(job) ? "Open original posting" : "Original job posting URL is unavailable"}
                              aria-label="Open original posting"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* D. MATCHER WORKBENCH */}
          {/* ───────────────────────────────────────────────────────────── */}
          {agentTag === "Matcher" && (
            <div className="space-y-6 text-xs">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Resume side */}
                <div className="space-y-2">
                  <label className="font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" /> Candidate Resume Text
                  </label>
                  <textarea
                    rows={6}
                    value={matchResumeText}
                    onChange={e => setMatchResumeText(e.target.value)}
                    placeholder="Paste candidate resume experience, skills, and summary..."
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                {/* Job side */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={matchJobTitle}
                      onChange={e => setMatchJobTitle(e.target.value)}
                      placeholder="Job Title"
                      className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
                    />
                    <input
                      type="text"
                      value={matchCompany}
                      onChange={e => setMatchCompany(e.target.value)}
                      placeholder="Company Name"
                      className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <textarea
                    rows={5}
                    value={matchJdText}
                    onChange={e => setMatchJdText(e.target.value)}
                    placeholder="Paste job description requirements..."
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              {matchError && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-600 dark:text-red-400 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{matchError}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleRunMatch}
                  disabled={matching}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  {matching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                  {matching ? "Calculating Match..." : "Run ATS Match Scoring Agent"}
                </button>
              </div>

              {/* Match Result Display */}
              {matchResult && (
                <div className="saas-card rounded-2xl p-5 border border-[var(--border-color)] space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-6 p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                    <div className="text-center shrink-0">
                      <div className="text-3xl font-black text-orange-500">{Math.round(matchResult.ats_score)}%</div>
                      <div className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-extrabold">ATS Match</div>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[var(--text-primary)]">{matchResult.recommendation}</h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">Job: {matchResult.job_title} @ {matchResult.company}</p>
                    </div>
                  </div>

                  {/* Matched & Missing Chips */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
                      <h5 className="font-extrabold text-emerald-600 dark:text-emerald-400">Matched Skills ({matchResult.matched_keywords?.length || 0})</h5>
                      <div className="flex flex-wrap gap-1">
                        {matchResult.matched_keywords?.map((k, i) => (
                          <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-semibold">✓ {k}</span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-2">
                      <h5 className="font-extrabold text-rose-600 dark:text-rose-400">Missing Skills ({matchResult.missing_keywords?.length || 0})</h5>
                      <div className="flex flex-wrap gap-1">
                        {matchResult.missing_keywords?.map((k, i) => (
                          <span key={i} className="px-2 py-0.5 bg-rose-500/10 text-rose-700 dark:text-rose-300 rounded text-[10px] font-semibold">! {k}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* E. SCRIBE WORKBENCH */}
          {/* ───────────────────────────────────────────────────────────── */}
          {agentTag === "Scribe" && (
            <div className="space-y-6 text-xs">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Target Job</label>
                  <select
                    value={scribeJobId || ""}
                    onChange={e => setScribeJobId(Number(e.target.value))}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                  >
                    {scribeJobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title} — {j.company}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Tone</label>
                  <select
                    value={scribeTone}
                    onChange={e => setScribeTone(e.target.value as any)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Confident">Confident</option>
                    <option value="Concise">Concise</option>
                    <option value="Enthusiastic">Enthusiastic</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Length</label>
                  <select
                    value={scribeLength}
                    onChange={e => setScribeLength(e.target.value as any)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                  >
                    <option value="Short">Short (200 words)</option>
                    <option value="Standard">Standard (300 words)</option>
                    <option value="Detailed">Detailed (400 words)</option>
                  </select>
                </div>
              </div>

              {scribeError && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-600 dark:text-red-400 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{scribeError}</span>
                </div>
              )}

              {scribeSaveMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{scribeSaveMsg}</span>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={scribeLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  {scribeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                  {scribeLoading ? "Writing Cover Letter..." : "Run Scribe AI Agent"}
                </button>
              </div>

              {/* Cover Letter Content Box */}
              {scribeContent && (
                <div className="saas-card rounded-2xl p-5 border border-[var(--border-color)] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                    <span className="font-bold text-violet-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Model: {scribeData?.model || "AI Grounded Engine"}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(scribeContent);
                          setScribeCopied(true);
                          setTimeout(() => setScribeCopied(false), 2000);
                        }}
                        className="px-3 py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {scribeCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-blue-500" />}
                        {scribeCopied ? "Copied" : "Copy"}
                      </button>

                      <button
                        onClick={handleSaveCoverLetterToApp}
                        className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <BookmarkPlus className="w-3 h-3" /> Save to Tracker
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={12}
                    value={scribeContent}
                    onChange={e => setScribeContent(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-xs text-[var(--text-primary)] font-serif leading-relaxed focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* F. TRACKER WORKBENCH */}
          {/* ───────────────────────────────────────────────────────────── */}
          {agentTag === "Tracker" && (
            <div className="space-y-6 text-xs">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={trackerSearch}
                  onChange={e => setTrackerSearch(e.target.value)}
                  className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] max-w-xs"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> {showAddForm ? "Hide Form" : "Track New Job"}
                  </button>
                  <span className="font-extrabold text-[var(--text-muted)]">
                    Total Tracked: {applications.length}
                  </span>
                </div>
              </div>

              {/* Add App Form */}
              {showAddForm && (
                <form onSubmit={handleCreateNewApplication} className="p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl space-y-3 animate-in fade-in">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Target Job</label>
                      <select
                        value={newAppJobId || ""}
                        onChange={e => setNewAppJobId(Number(e.target.value))}
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs"
                      >
                        {trackerJobs.map(j => (
                          <option key={j.id} value={j.id}>{j.title} — {j.company}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Initial Stage</label>
                      <select
                        value={newAppStatus}
                        onChange={e => setNewAppStatus(e.target.value)}
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs"
                      >
                        {["Saved", "Applied", "Screening", "Interview", "Offer", "Rejected", "Withdrawn"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Notes</label>
                    <input
                      type="text"
                      value={newAppNotes}
                      onChange={e => setNewAppNotes(e.target.value)}
                      placeholder="e.g. Applied via company career site..."
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={addingApp}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {addingApp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      Add to Application Tracker
                    </button>
                  </div>
                </form>
              )}

              {/* Selected Application Modal Detail */}
              {selectedApp && (
                <div className="p-4 bg-[var(--bg-primary)] border border-blue-500/30 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold uppercase text-[9px]">{selectedApp.status}</span>
                      <h4 className="font-extrabold text-sm text-[var(--text-primary)] mt-0.5">{selectedApp.job_title}</h4>
                      <p className="text-[11px] text-[var(--text-secondary)]">{selectedApp.company} • {selectedApp.location || "Remote"}</p>
                    </div>
                    <button onClick={() => setSelectedApp(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {getValidJobUrl(selectedApp) ? (
                    <button 
                      type="button"
                      onClick={(e) => handleOpenOriginalPosting(e, selectedApp)} 
                      className="text-blue-500 hover:underline flex items-center gap-1 text-[11px] cursor-pointer bg-transparent border-0 p-0 font-medium"
                      title="Open original posting"
                    >
                      Open Job Posting <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleOpenOriginalPosting(e, selectedApp)}
                      className="text-gray-400 dark:text-gray-600 text-[11px] italic cursor-pointer bg-transparent border-0 p-0 hover:underline"
                      title="Original job posting URL is unavailable"
                    >
                      URL Unavailable
                    </button>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                    <button
                      onClick={() => handleDeleteApp(selectedApp.id)}
                      className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Application
                    </button>
                    <button
                      onClick={() => setSelectedApp(null)}
                      className="px-3 py-1 bg-[var(--bg-hover)] text-[var(--text-primary)] rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              )}

              {trackerLoading ? (
                <div className="h-48 flex items-center justify-center text-blue-500">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : applications.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)]">
                  No applications tracked yet.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {applications
                    .filter(a => !trackerSearch || a.job_title.toLowerCase().includes(trackerSearch.toLowerCase()) || a.company.toLowerCase().includes(trackerSearch.toLowerCase()))
                    .map(app => (
                      <div 
                        key={app.id} 
                        onClick={() => setSelectedApp(app)}
                        className="p-3.5 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-blue-500/30 rounded-xl flex items-center justify-between gap-3 shadow-2xs cursor-pointer transition-all hover:scale-[1.01]"
                      >
                        <div className="min-w-0 flex-1">
                          <h5 className="font-extrabold text-xs text-[var(--text-primary)] truncate">{app.job_title}</h5>
                          <p className="text-[11px] text-[var(--text-secondary)] font-medium truncate">{app.company} • {app.location || "Remote"}</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                          <span className="font-bold text-blue-500">{Math.round(app.ats_score)}% ATS</span>

                          <select
                            value={app.status}
                            onChange={e => handleUpdateAppStatus(app.id, e.target.value)}
                            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-primary)] font-bold focus:outline-none"
                          >
                            {["Saved", "Applied", "Screening", "Interview", "Offer", "Rejected", "Withdrawn"].map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Stream */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/80 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-[var(--text-muted)] font-mono text-[11px]">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>Agent Logs ({agentLogs.length} entries for {agentTag})</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[var(--bg-hover)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close Agent View
          </button>
        </div>

      </div>
    </div>
  );
}
