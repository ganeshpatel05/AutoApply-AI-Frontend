import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { Job, Resume, CoverLetterMatchSummary, CoverLetterResponseData } from "../types";
import { 
  Mail, 
  Sparkles, 
  Copy, 
  Loader2, 
  Save, 
  CheckCircle2, 
  FileEdit, 
  AlertCircle,
  Download,
  UserCheck,
  Briefcase,
  TrendingUp,
  RotateCw,
  FileText,
  AlertTriangle,
  BookmarkPlus
} from "lucide-react";
import { cn } from "../utils/cn";

export function CoverLetters() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [tone, setTone] = useState<"Professional" | "Confident" | "Concise" | "Enthusiastic">("Professional");
  const [length, setLength] = useState<"Short" | "Standard" | "Detailed">("Standard");
  const [variation, setVariation] = useState<number>(1);
  
  const [loading, setLoading] = useState(false);
  const [progressStage, setProgressStage] = useState<string>("");
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterResponseData | null>(null);
  const [matchSummary, setMatchSummary] = useState<CoverLetterMatchSummary | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [appSavedSuccess, setAppSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    // Load Active Resume
    api.get<{ success: boolean; resume: Resume }>("/api/resumes/active")
      .then(res => {
        if (res.success && res.resume) {
          setActiveResume(res.resume);
        }
      })
      .catch(() => setActiveResume(null));

    // Load Jobs
    api.get<{ success: boolean; jobs: Job[] }>("/api/jobs/")
      .then(res => {
        setJobs(res.jobs || []);
        if (res.jobs && res.jobs.length > 0) {
          setSelectedJobId(res.jobs[0].id);
          loadExistingLetter(res.jobs[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const loadExistingLetter = async (jobId: number) => {
    setErrorMsg("");
    try {
      const res = await api.get<{
        success: boolean;
        cover_letter?: { content: string };
        match_summary?: CoverLetterMatchSummary;
      }>(`/api/cover-letters/${jobId}`);

      if (res.match_summary) {
        setMatchSummary(res.match_summary);
      }

      if (res.cover_letter) {
        setCoverLetterData({
          content: res.cover_letter.content,
          used_ai: true,
          model: "Saved Record",
          match_summary: res.match_summary
        });
        setEditedContent(res.cover_letter.content);
      } else {
        setCoverLetterData(null);
        setEditedContent("");
      }
    } catch {
      setCoverLetterData(null);
      setEditedContent("");
    }
  };

  const handleSelectJob = (id: number) => {
    setSelectedJobId(id);
    setIsEditing(false);
    setVariation(1);
    loadExistingLetter(id);
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const handleGenerate = async (newVariation?: number) => {
    if (!activeResume) {
      setErrorMsg("Please upload a resume first before generating a personalized cover letter.");
      return;
    }

    if (!selectedJobId && !selectedJob) {
      setErrorMsg("Please select a job before generating a cover letter.");
      return;
    }

    const targetVar = newVariation !== undefined ? newVariation : variation;
    setErrorMsg("");
    setLoading(true);
    setIsEditing(false);

    // Realistic Progress Stage Animations
    const stages = [
      "Analyzing candidate resume profile...",
      "Parsing target job description requirements...",
      "Performing Resume-JD match analysis...",
      "Selecting top relevant projects & experience...",
      "Generating personalized cover letter via Ollama AI...",
      "Validating content quality and constraints..."
    ];

    let stageIdx = 0;
    setProgressStage(stages[0]);
    const interval = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) {
        setProgressStage(stages[stageIdx]);
      }
    }, 700);

    try {
      const payload = {
        job_id: selectedJobId,
        tone,
        length,
        variation: targetVar
      };

      const res = await api.post<{ success: boolean; data: CoverLetterResponseData }>("/api/cover-letters/generate", payload);
      clearInterval(interval);

      if (res.success && res.data) {
        setCoverLetterData(res.data);
        setEditedContent(res.data.content);
        if (res.data.match_summary) {
          setMatchSummary(res.data.match_summary);
        }
        if (newVariation !== undefined) {
          setVariation(targetVar);
        }
      }
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err.message || "Failed to generate cover letter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    const nextVar = variation + 1;
    handleGenerate(nextVar);
  };

  const handleSaveEdit = async () => {
    if (!selectedJobId) return;
    try {
      await api.put(`/api/cover-letters/${selectedJobId}`, { content: editedContent });
      if (coverLetterData) {
        setCoverLetterData({ ...coverLetterData, content: editedContent });
      }
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save changes");
    }
  };

  const handleSaveToApplication = async () => {
    if (!selectedJobId) return;
    try {
      await api.post("/api/applications/", {
        job_id: selectedJobId,
        status: "Saved",
        cover_letter: editedContent
      });
      setAppSavedSuccess(true);
      setTimeout(() => setAppSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save application");
    }
  };

  const handleCopy = () => {
    const textToCopy = isEditing ? editedContent : (coverLetterData?.content || "");
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPdf = () => {
    const textToPrint = isEditing ? editedContent : (coverLetterData?.content || "");
    if (!textToPrint) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popup windows to download/print the cover letter PDF.");
      return;
    }

    const title = selectedJob ? `${selectedJob.title} - ${selectedJob.company} Cover Letter` : "Cover Letter";
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Georgia, 'Times New Roman', serif;
              line-height: 1.7;
              margin: 50px 60px;
              color: #1a1a1a;
              font-size: 13pt;
              background: #fff;
            }
            pre {
              white-space: pre-wrap;
              font-family: inherit;
            }
          </style>
        </head>
        <body>
          <pre>${textToPrint.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 saas-card rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              AI Scribe Agent
            </span>
            <span className="text-[11px] font-bold text-[var(--text-muted)]">• 100% Anti-Hallucination</span>
          </div>
          <h2 className="text-base sm:text-lg lg:text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2.5 tracking-tight">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span>AI Cover Letter Studio</span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
            Generate tailored, job-specific cover letters grounded in candidate resume evidence & JD matching requirements.
          </p>
        </div>

        {/* Candidate Status Indicator */}
        <div className="flex items-center gap-2.5 bg-[var(--bg-primary)] px-3.5 py-2 rounded-xl border border-[var(--border-color)] shadow-2xs shrink-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs">
            <div className="font-extrabold text-[var(--text-primary)] max-w-[150px] truncate">
              {activeResume ? activeResume.name || "Active Resume" : "No Resume Uploaded"}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 font-semibold">
              {activeResume ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Synced & Ready
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-bold">Upload resume</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* No Resume Alert */}
      {!activeResume && (
        <div className="p-3.5 bg-amber-500/12 border border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-xl flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500" />
            <span className="font-medium">
              <strong className="font-extrabold">Resume Required:</strong> Upload your resume to enable personalized cover letter generation.
            </span>
          </div>
          <a href="/resume" className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-extrabold hover:from-amber-600 hover:to-orange-600 transition-all shadow-2xs shrink-0 text-xs">
            Upload Resume
          </a>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-4 lg:gap-5">
        
        {/* Left Column (4/12): Job Selection & Options */}
        <div className="lg:col-span-4 space-y-3.5">
          
          {/* Job Selector Panel */}
          <div className="saas-card rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Select Target Job ({jobs.length})
              </h3>
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {jobs.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                  No pipeline jobs found. Scrape or save jobs in the Jobs tab to select them here.
                </div>
              ) : (
                jobs.map(job => (
                  <button
                    key={job.id}
                    onClick={() => handleSelectJob(job.id)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-xl transition-all border flex flex-col justify-between gap-1 cursor-pointer active:scale-99",
                      selectedJobId === job.id 
                        ? "bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400 font-semibold shadow-xs" 
                        : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-blue-500/30 hover:bg-[var(--bg-hover)]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-xs text-[var(--text-primary)] truncate">{job.title}</div>
                      {job.ats_score > 0 && (
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.2 rounded-md font-mono font-black border shrink-0",
                          job.ats_score >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                          job.ats_score >= 60 ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" :
                          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        )}>
                          {Math.round(job.ats_score)}%
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] flex items-center justify-between">
                      <span className="truncate font-medium">{job.company}</span>
                      <span className="truncate text-[10px] opacity-80">{job.location || "Remote"}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Tone & Length Settings */}
          <div className="saas-card rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3 text-xs">
            <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-color)] pb-2">
              Generation Parameters
            </h3>

            {/* Tone */}
            <div>
              <label className="font-bold text-[var(--text-secondary)] block mb-1 text-[11px]">Writing Tone</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["Professional", "Confident", "Concise", "Enthusiastic"] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={cn(
                      "py-1.5 px-2 rounded-xl border font-bold transition-all text-[10px] sm:text-[11px] text-center cursor-pointer",
                      tone === t 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-xs" 
                        : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Length */}
            <div>
              <label className="font-bold text-[var(--text-secondary)] block mb-1 text-[11px]">Letter Length</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["Short", "Standard", "Detailed"] as const).map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLength(l)}
                    className={cn(
                      "py-1.5 px-1.5 rounded-xl border font-bold transition-all text-[10px] sm:text-[11px] text-center cursor-pointer",
                      length === l 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-xs" 
                        : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleGenerate(1)}
              disabled={loading || !activeResume || !selectedJobId}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-black transition-all shadow-md hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
              {loading ? "Generating Letter..." : coverLetterData ? "Regenerate Cover Letter" : "Generate Cover Letter"}
            </button>
          </div>

          {/* Match Analysis Breakdown */}
          {matchSummary && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-violet-500" /> Resume-JD Match
                </h3>
                <span className="px-2 py-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold rounded-lg text-[10px]">
                  {Math.round(matchSummary.score)}% — {matchSummary.recommendation}
                </span>
              </div>

              {/* Strong Matches */}
              <div>
                <label className="font-semibold text-[var(--text-secondary)] block mb-1 text-[10px]">Strong Matches:</label>
                <div className="flex flex-wrap gap-1">
                  {matchSummary.strong_matches.slice(0, 6).map((m, i) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md text-[9px] font-medium">
                      ✓ {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skill Gaps */}
              {matchSummary.missing_skills.length > 0 && (
                <div>
                  <label className="font-semibold text-[var(--text-muted)] block mb-1 text-[10px]">Skill Gaps (Not Claimed):</label>
                  <div className="flex flex-wrap gap-1">
                    {matchSummary.missing_skills.slice(0, 4).map((m, i) => (
                      <span key={i} className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md text-[9px] font-medium">
                        ! {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Projects */}
              {matchSummary.selected_projects && matchSummary.selected_projects.length > 0 && (
                <div>
                  <label className="font-semibold text-[var(--text-secondary)] block mb-1 text-[10px]">Featured Project Highlight:</label>
                  <div className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[10px]">
                    <div className="font-bold text-[var(--text-primary)] truncate">{matchSummary.selected_projects[0].title}</div>
                    <div className="text-[var(--text-muted)] line-clamp-2 text-[9px] mt-0.5">
                      {matchSummary.selected_projects[0].description}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (8/12): Document Display & Editor */}
        <div className="lg:col-span-8 saas-card rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[480px] lg:min-h-[520px]">
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 space-y-3.5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg text-white">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
                <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] animate-pulse">Scribe AI Agent at Work</h4>
                <p className="text-xs text-violet-600 dark:text-violet-400 font-bold mt-1">{progressStage}</p>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] max-w-sm font-medium">
                Evaluating candidate experience against job requirements and enforcing strict anti-hallucination rules.
              </p>
            </div>
          ) : !coverLetterData ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                <FileText className="w-7 h-7 opacity-80" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] mb-1">Tailored Cover Letter Canvas</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md font-medium leading-relaxed">
                Select a target job from your pipeline and click <strong className="text-[var(--text-primary)]">'Generate Cover Letter'</strong> to create a personalized, 4–5 paragraph application letter grounded in your actual projects and experience.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col space-y-3.5">
              
              {/* Header Toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {coverLetterData.used_ai ? (
                    <span className="px-2.5 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 shadow-2xs">
                      <Sparkles className="w-3 h-3 text-amber-400" /> {coverLetterData.model || "Ollama Local"}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 className="w-3 h-3" /> Smart Grounded Engine
                    </span>
                  )}

                  <span className="text-[11px] font-mono font-bold text-[var(--text-muted)] px-2 py-0.5 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    {editedContent.split(/\s+/).filter(Boolean).length} words
                  </span>

                  {variation > 1 && (
                    <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">
                      v{variation}
                    </span>
                  )}
                </div>

                {/* Toolbar Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={handleRegenerate}
                    className="px-2.5 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-[var(--border-color)] cursor-pointer active:scale-95 shadow-2xs"
                    title="Generate alternative phrasing/opening"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-blue-500" />
                    <span className="hidden sm:inline">Regenerate</span>
                  </button>

                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-2.5 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-[var(--border-color)] cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <FileEdit className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{isEditing ? "Done" : "Edit"}</span>
                  </button>

                  {isEditing && (
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  )}

                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    title="Download as PDF / Print document"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">PDF</span>
                  </button>

                  <button
                    onClick={handleSaveToApplication}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    title="Save cover letter to Application Tracker record"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Track</span>
                  </button>
                </div>
              </div>

              {/* Offline / Diagnostic Info Banner */}
              {coverLetterData.error && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Diagnostic Note:</strong> {coverLetterData.error}. Grounded fallback engine was used.
                  </span>
                </div>
              )}

              {/* Feedback Success Notifications */}
              {saveSuccess && (
                <p className="text-xs text-emerald-500 font-extrabold text-right">✓ Cover letter changes saved to database record!</p>
              )}
              {appSavedSuccess && (
                <p className="text-xs text-amber-500 font-extrabold text-right">✓ Saved to Application Tracker!</p>
              )}

              {/* Document Paper Container */}
              <div className="flex-1 bg-white dark:bg-[#111927] border border-[var(--border-color)] rounded-2xl p-4 sm:p-6 md:p-8 overflow-y-auto min-h-[340px] max-h-[580px] shadow-xs font-serif">
                {isEditing ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-full min-h-[320px] bg-transparent text-xs sm:text-sm text-[var(--text-primary)] font-serif leading-relaxed focus:outline-none resize-none"
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-serif text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-normal">
                    {editedContent}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
