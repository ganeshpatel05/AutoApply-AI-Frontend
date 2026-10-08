import { useEffect, useState, useRef } from "react";
import { api } from "../api/client";
import type { Resume as ResumeType, ResumeScore, CandidateProfile } from "../types";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Award, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Mail, 
  Phone, 
  AlertCircle,
  TrendingUp,
  Globe,
  Link as LinkIcon,
  Wand2,
  User,
  PlusCircle,
  Copy,
  Check
} from "lucide-react";
import { cn } from "../utils/cn";

export function Resume() {
  const [activeTab, setActiveTab] = useState<"view" | "builder">("view");
  const [resume, setResume] = useState<ResumeType | null>(null);
  const [score, setScore] = useState<ResumeScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadStep, setUploadStep] = useState<"" | "Uploading..." | "Parsing..." | "Analyzing..." | "Complete">("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autofillLoading, setAutofillLoading] = useState(false);

  // Resume Builder Form State
  const [formData, setFormData] = useState({
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadActiveResume = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ success: boolean; resume: ResumeType }>("/api/resumes/active");
      if (res.success && res.resume) {
        setResume(res.resume);
        try {
          const scoreRes = await api.get<{ success: boolean; score: ResumeScore }>("/api/resumes/active/score");
          if (scoreRes.success) setScore(scoreRes.score);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveResume();
  }, []);

  const processFile = async (file: File) => {
    if (!file || !file.name.endsWith(".pdf")) {
      alert("Please upload a valid PDF file.");
      return;
    }

    try {
      setUploadStep("Uploading...");
      const formData = new FormData();
      formData.append("file", file);

      setUploadStep("Parsing...");
      await new Promise(r => setTimeout(r, 400));
      
      setUploadStep("Analyzing...");
      const uploadRes = await api.post("/api/resumes/upload", formData);
      
      if (uploadRes) {
        setUploadStep("Complete");
        await loadActiveResume();
        setActiveTab("view");
      }
    } catch (err: any) {
      alert(err.message || "Failed to parse resume.");
    } finally {
      setTimeout(() => setUploadStep(""), 1500);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleAutofillFromProfile = async () => {
    try {
      setAutofillLoading(true);
      const res = await api.get<{ success: boolean; profile: CandidateProfile }>("/api/profile");
      if (res.success && res.profile) {
        const p = res.profile;
        setFormData(prev => ({
          ...prev,
          name: p.full_name || prev.name,
          email: p.email || prev.email,
          phone: p.phone || prev.phone,
          location: p.location || prev.location,
          linkedin: p.linkedin || prev.linkedin,
          github: p.github || prev.github,
          skills: Array.isArray(p.skills) ? p.skills.join(", ") : prev.skills,
          experience: p.experience || prev.experience,
          education: p.education || prev.education
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAutofillLoading(false);
    }
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter at least your Full Name.");
      return;
    }

    try {
      setIsGenerating(true);
      const skillsArray = formData.skills
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        skills: skillsArray
      };

      const res = await api.post<{ success: boolean; resume: ResumeType; score: ResumeScore }>("/api/resumes/generate", payload);
      
      if (res.success) {
        if (res.resume) setResume(res.resume);
        if (res.score) setScore(res.score);
        setActiveTab("view");
        await loadActiveResume();
      }
    } catch (err: any) {
      alert(err.message || "Failed to generate resume.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyRawText = () => {
    if (resume?.raw_text) {
      navigator.clipboard.writeText(resume.raw_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EBF5FF] text-[#1769F5] border border-blue-200/80 dark:bg-blue-950/70 dark:border-blue-800 dark:text-blue-300 mb-2">
            <Sparkles className="w-3 h-3 text-[#1769F5] dark:text-blue-400" />
            <span>ATS Resume Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#102A63] dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Resume Intelligence & Builder</span>
          </h1>
          <p className="text-xs text-[#526783] dark:text-slate-400 mt-1 font-medium">
            Upload your PDF resume or enter details to build & analyze an ATS-optimized candidate profile.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#F0F7FF] dark:bg-slate-800/80 p-1.5 rounded-2xl border border-[#DCE9FA] dark:border-slate-700/60 shadow-2xs">
          <button
            onClick={() => setActiveTab("view")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer",
              activeTab === "view"
                ? "bg-white dark:bg-slate-900 text-[#1769F5] dark:text-blue-400 shadow-xs"
                : "text-[#526783] dark:text-slate-400 hover:text-[#1769F5]"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> <span>Active Resume</span>
          </button>
          <button
            onClick={() => setActiveTab("builder")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer",
              activeTab === "builder"
                ? "btn-gradient shadow-xs"
                : "text-[#526783] dark:text-slate-400 hover:text-[#1769F5]"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" /> <span>AI Builder</span>
          </button>
        </div>
      </div>

      {/* VIEW TAB: Upload & Active Resume */}
      {activeTab === "view" && (
        <div className="space-y-4 sm:space-y-5">
          {/* Upload Drag & Drop Dropzone */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "bg-white dark:bg-[#0E1726] border-2 border-dashed rounded-2xl p-5 sm:p-6 md:p-8 text-center transition-all shadow-xs relative overflow-hidden",
              isDragOver ? "border-[#1769F5] bg-blue-500/5" : "border-blue-200 dark:border-slate-700 hover:border-[#1769F5]/70",
              uploadStep && "pointer-events-none opacity-90"
            )}
          >
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />

            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-[#1769F5] via-[#5241E2] to-[#792BEE] text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
              {uploadStep ? (
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>

            <h3 className="text-sm sm:text-base font-black text-[#102A63] dark:text-white mb-1 tracking-tight">
              {uploadStep ? uploadStep : "Upload your resume PDF"}
            </h3>
            <p className="text-xs text-[#526783] dark:text-slate-400 mb-4 max-w-md mx-auto font-medium leading-relaxed">
              Drag & drop your PDF file here, or click to browse. ResumeMind will parse your skills, work history, and contact details automatically.
            </p>

            <div className="flex flex-wrap justify-center gap-2.5">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={!!uploadStep}
                className="btn-gradient px-4 py-2 rounded-full text-xs font-black shadow-md inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-98"
              >
                <FileText className="w-3.5 h-3.5" /> <span>Select PDF File</span>
              </button>
              <button
                onClick={() => setActiveTab("builder")}
                className="btn-secondary-white px-4 py-2 rounded-full text-xs font-bold shadow-2xs inline-flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <PlusCircle className="w-3.5 h-3.5" /> <span>Enter Details & Generate</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-72 bg-white dark:bg-[#0E1726] rounded-2xl animate-pulse border border-[#E2E8F0] dark:border-slate-800"></div>
          ) : resume ? (
            <div className="space-y-4 sm:space-y-5">
              {/* Active Profile Header Card */}
              <div className="bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-[#1769F5] via-[#5241E2] to-[#792BEE] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20 shrink-0">
                    {resume.name ? resume.name.charAt(0).toUpperCase() : "C"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-black text-[#102A63] dark:text-white tracking-tight">{resume.name}</h2>
                      <span className="flex items-center gap-1 px-2.5 py-0.5 bg-[#E8FAF0] text-[#059669] border border-[#B7E4C7] dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 rounded-full text-[11px] font-black shadow-2xs">
                        <CheckCircle2 className="w-3 h-3" /> Active Profile
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-[#526783] dark:text-slate-400 mt-1 font-semibold">
                      {resume.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#1769F5]" /> {resume.email}</span>}
                      {resume.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#1769F5]" /> {resume.phone}</span>}
                      {resume.linkedin && <a href={resume.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#1769F5] dark:text-blue-400 hover:underline"><Globe className="w-3 h-3" /> LinkedIn</a>}
                      {resume.github && <a href={resume.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#1769F5] dark:text-blue-400 hover:underline"><LinkIcon className="w-3 h-3" /> GitHub</a>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {resume.raw_text && (
                    <button
                      onClick={handleCopyRawText}
                      className="btn-secondary-white px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[#1769F5]" />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                  )}

                  {/* Overall Score Badge */}
                  {score && (
                    <div className="flex items-center gap-2.5 bg-[#FFFBEB] dark:bg-amber-950/30 border border-[#FEF3C7] dark:border-amber-900/50 rounded-xl p-2.5 shrink-0 shadow-2xs">
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-black text-[#D97706] dark:text-amber-400 tracking-tight">{score.total}%</div>
                        <div className="text-[9px] uppercase tracking-wider text-[#526783] dark:text-slate-400 font-extrabold">ATS Score</div>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-xs">
                        <Award className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Resume Score Breakdown & AI Recommendations */}
              {score && (
                <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
                  {/* Detailed Metrics */}
                  <div className="md:col-span-1 bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#526783] dark:text-slate-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#1769F5]" /> Score Breakdown
                    </h4>

                    <div className="space-y-3.5 text-xs">
                      <div>
                        <div className="flex justify-between font-black mb-1.5 text-[#102A63] dark:text-white">
                          <span>Skills Coverage</span>
                          <span className="text-[#1769F5] dark:text-blue-400">{score.skills}%</span>
                        </div>
                        <div className="h-2 bg-[#F0F7FF] dark:bg-slate-800 rounded-full overflow-hidden border border-blue-100 dark:border-slate-700">
                          <div className="h-full bg-gradient-to-r from-[#1769F5] to-[#5241E2] rounded-full" style={{ width: `${score.skills}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-black mb-1.5 text-[#102A63] dark:text-white">
                          <span>Experience Depth</span>
                          <span className="text-[#792BEE] dark:text-purple-400">{score.experience}%</span>
                        </div>
                        <div className="h-2 bg-[#FAF5FF] dark:bg-slate-800 rounded-full overflow-hidden border border-purple-100 dark:border-slate-700">
                          <div className="h-full bg-gradient-to-r from-[#5241E2] to-[#792BEE] rounded-full" style={{ width: `${score.experience}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-black mb-1.5 text-[#102A63] dark:text-white">
                          <span>Education & Background</span>
                          <span className="text-[#10B981] dark:text-emerald-400">{score.education}%</span>
                        </div>
                        <div className="h-2 bg-[#F0FDF4] dark:bg-slate-800 rounded-full overflow-hidden border border-emerald-100 dark:border-slate-700">
                          <div className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full" style={{ width: `${score.education}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-black mb-1.5 text-[#102A63] dark:text-white">
                          <span>Content Quality</span>
                          <span className="text-[#D97706] dark:text-amber-400">{score.content}%</span>
                        </div>
                        <div className="h-2 bg-[#FFFBEB] dark:bg-slate-800 rounded-full overflow-hidden border border-amber-100 dark:border-slate-700">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: `${score.content}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actionable AI Recommendations */}
                  <div className="md:col-span-2 bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#526783] dark:text-slate-400 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Actionable Recommendations
                      </h4>
                      <ul className="space-y-2.5 text-xs text-[#526783] dark:text-slate-300">
                        {score.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-2.5 p-2.5 bg-[#F8FAFD] dark:bg-slate-800/60 rounded-xl border border-[#E2E8F0] dark:border-slate-700 font-medium">
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Extracted Skills */}
              <div className="bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#526783] dark:text-slate-400 mb-4 flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#1769F5]" /> Extracted Skills ({resume.skills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill, i) => (
                    <span key={i} className="px-3.5 py-1.5 bg-[#EBF5FF] border border-[#C3E0FF] text-[#1769F5] dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300 rounded-full text-xs font-bold shadow-2xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience & Education Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#526783] dark:text-slate-400 mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#5241E2]" /> Experience & Projects Summary
                  </h4>
                  <div className="text-xs text-[#526783] dark:text-slate-300 whitespace-pre-wrap bg-[#F8FAFD] dark:bg-slate-850/60 p-4 rounded-xl border border-[#E2E8F0] dark:border-slate-800 leading-relaxed max-h-64 overflow-y-auto font-mono">
                    {resume.experience || "No experience section parsed."}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#526783] dark:text-slate-400 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#10B981]" /> Education & Background
                  </h4>
                  <div className="text-xs text-[#526783] dark:text-slate-300 whitespace-pre-wrap bg-[#F8FAFD] dark:bg-slate-850/60 p-4 rounded-xl border border-[#E2E8F0] dark:border-slate-800 leading-relaxed max-h-64 overflow-y-auto font-mono">
                    {resume.education || "No education section parsed."}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-14 bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 rounded-3xl p-8 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#EBF5FF] text-[#1769F5] dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <FileText className="w-7 h-7" />
              </div>
              <p className="text-sm font-black text-[#102A63] dark:text-white mb-1">No active resume available</p>
              <p className="text-xs text-[#526783] dark:text-slate-400 mb-5">Upload a PDF or use the AI generator to activate your candidate profile.</p>
              <button
                onClick={() => setActiveTab("builder")}
                className="btn-gradient px-5 py-2.5 rounded-full text-xs font-black shadow-md inline-flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Sparkles className="w-4 h-4" /> <span>Build & Generate Resume Now</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* BUILDER TAB: Interactive Resume Details Form */}
      {activeTab === "builder" && (
        <form onSubmit={handleGenerateSubmit} className="space-y-4 sm:space-y-5 bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-slate-800 pb-3.5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F5EEFF] text-[#792BEE] border border-purple-200/80 dark:bg-purple-950/70 dark:border-purple-800 dark:text-purple-300 mb-1.5">
                <Wand2 className="w-3 h-3 text-[#792BEE] dark:text-purple-400" />
                <span>AI Builder Studio</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#102A63] dark:text-white tracking-tight">
                Input Resume Details
              </h2>
              <p className="text-xs text-[#526783] dark:text-slate-400 mt-0.5 font-medium">
                Fill out your details to auto-generate a structured, ATS-optimized candidate resume.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutofillFromProfile}
              disabled={autofillLoading}
              className="btn-secondary-white px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {autofillLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1769F5]" />
              ) : (
                <User className="w-3.5 h-3.5 text-[#1769F5]" />
              )}
              <span>Auto-Fill from Profile</span>
            </button>
          </div>

          {/* Contact Details Grid */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-[#526783] dark:text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#1769F5]" /> Personal & Contact Details
            </h3>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ganesh Patel"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-saas w-full px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="ganesh@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="input-saas w-full px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="input-saas w-full px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Indore, MP, India"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="input-saas w-full px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/ganeshpatel"
                  value={formData.linkedin}
                  onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                  className="input-saas w-full px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/ganeshpatel05"
                  value={formData.github}
                  onChange={e => setFormData({ ...formData, github: e.target.value })}
                  className="input-saas w-full px-3 py-2 text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1">
              Professional Summary / Objective
            </label>
            <textarea
              rows={2}
              placeholder="Full Stack Developer with experience building scalable Web Apps using Python, React, and FastAPI..."
              value={formData.summary}
              onChange={e => setFormData({ ...formData, summary: e.target.value })}
              className="input-saas w-full px-3 py-2 text-xs font-medium resize-y font-sans"
            />
          </div>

          {/* Technical Skills */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1">
              Technical Skills (comma-separated)
            </label>
            <input
              type="text"
              placeholder="Python, React, TypeScript, FastAPI, SQLite, Docker, Git, Tailwind CSS"
              value={formData.skills}
              onChange={e => setFormData({ ...formData, skills: e.target.value })}
              className="input-saas w-full px-3 py-2 text-xs font-medium"
            />
          </div>

          {/* Experience & Projects */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#5241E2]" /> Work Experience
              </label>
              <textarea
                rows={4}
                placeholder="Software Engineer Intern at Tech Corp (Jan 2024 - Present)&#10;- Built microservices with Python and FastAPI&#10;- Optimized database queries reducing response time by 30%"
                value={formData.experience}
                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                className="input-saas w-full px-3 py-2 text-xs font-medium resize-y font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-[#1769F5]" /> Key Projects
              </label>
              <textarea
                rows={4}
                placeholder="AutoApply AI - Job Search Automation System&#10;- Developed AI-driven application tracking agent&#10;- Integrated Ollama for ATS resume scoring"
                value={formData.projects}
                onChange={e => setFormData({ ...formData, projects: e.target.value })}
                className="input-saas w-full px-3 py-2 text-xs font-medium resize-y font-mono"
              />
            </div>
          </div>

          {/* Education */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#10B981]" /> Education & Background
            </label>
            <textarea
              rows={2}
              placeholder="B.Tech in Computer Science & Engineering - XYZ University (2020 - 2024) | CGPA: 8.5/10"
              value={formData.education}
              onChange={e => setFormData({ ...formData, education: e.target.value })}
              className="input-saas w-full px-3 py-2 text-xs font-medium resize-y font-mono"
            />
          </div>

          {/* AI Enhancement Option */}
          <div className="flex items-center gap-2.5 p-3 bg-[#F8FAFD] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700/60 rounded-xl">
            <input
              type="checkbox"
              id="enhance_ai"
              checked={formData.enhance_with_ai}
              onChange={e => setFormData({ ...formData, enhance_with_ai: e.target.checked })}
              className="w-4 h-4 text-[#1769F5] rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="enhance_ai" className="text-xs text-[#102A63] dark:text-slate-200 font-bold cursor-pointer flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Polish & optimize wording with AI (Ollama LLM)</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab("view")}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-[#526783] hover:text-[#102A63] dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="btn-gradient px-6 py-2.5 rounded-full text-xs font-black shadow-md inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> <span>Generating ATS Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" /> <span>Generate ATS Resume</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
