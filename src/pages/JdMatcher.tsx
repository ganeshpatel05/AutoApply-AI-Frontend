import { useState, useEffect, useRef } from "react";
import { api } from "../api/client";
import type { Job, Resume, MatchResult } from "../types";
import { 
  Target, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Sparkles, 
  Mail, 
  ArrowRight,
  Upload,
  FileText,
  Briefcase,
  Layers,
  Award,
  FileCheck,
  Globe
} from "lucide-react";
import { cn } from "../utils/cn";
import { useNavigate } from "react-router-dom";

export function JdMatcher() {
  // Resume state
  const [resumeMode, setResumeMode] = useState<"upload" | "paste" | "select">("upload");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);
  const [parsedResumeData, setParsedResumeData] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);

  // Job state
  const [jobMode, setJobMode] = useState<"custom" | "pipeline">("custom");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [companyType, setCompanyType] = useState("MNC (Multi National Company)");
  const [isMnc, setIsMnc] = useState(true);
  const [jdText, setJdText] = useState("");
  const [pipelineJobs, setPipelineJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  // Match state
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load existing jobs and saved resumes
    api.get<{ success: boolean; jobs: Job[] }>("/api/jobs/")
      .then(res => {
        setPipelineJobs(res.jobs || []);
        if (res.jobs && res.jobs.length > 0) setSelectedJobId(res.jobs[0].id);
      })
      .catch(console.error);

    api.get<{ success: boolean; resumes: Resume[] }>("/api/resumes/")
      .then(res => {
        setSavedResumes(res.resumes || []);
        const active = res.resumes?.find(r => r.is_active === 1);
        if (active) setSelectedResumeId(active.id);
        else if (res.resumes && res.resumes.length > 0) setSelectedResumeId(res.resumes[0].id);
      })
      .catch(console.error);
  }, []);

  const handleFileUpload = async (file: File) => {
    setResumeFile(file);
    setUploading(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post<{ success: boolean; data: any }>("/api/resumes/upload", formData);
      if (res.success && res.data) {
        setParsedResumeData(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to parse resume file.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleMatch = async () => {
    setLoading(true);
    setMatchResult(null);
    setErrorMessage(null);

    try {
      // Determine JD content
      let finalJd = jdText;
      let finalTitle = jobTitle || "Target Role";
      let finalCompany = company || "Target Company";

      if (jobMode === "pipeline" && selectedJobId) {
        const foundJob = pipelineJobs.find(j => j.id === selectedJobId);
        if (foundJob) {
          finalJd = `${foundJob.description || ""} ${foundJob.requirements || ""}`;
          finalTitle = foundJob.title;
          finalCompany = foundJob.company;
        }
      }

      if (!finalJd.trim()) {
        setErrorMessage("Please enter or select a Job Description.");
        setLoading(false);
        return;
      }

      // Determine Resume content
      let payloadResumeText: string | undefined = undefined;
      let payloadResumeId: number | undefined = undefined;

      if (resumeMode === "upload") {
        if (parsedResumeData?.raw_text) {
          payloadResumeText = parsedResumeData.raw_text;
        } else {
          setErrorMessage("Please upload a resume file first.");
          setLoading(false);
          return;
        }
      } else if (resumeMode === "paste") {
        if (!resumeText.trim()) {
          setErrorMessage("Please paste your resume text.");
          setLoading(false);
          return;
        }
        payloadResumeText = resumeText;
      } else if (resumeMode === "select") {
        if (!selectedResumeId) {
          setErrorMessage("Please select a saved resume.");
          setLoading(false);
          return;
        }
        payloadResumeId = selectedResumeId;
      }

      const res = await api.post<{ success: boolean; match_result: MatchResult }>("/api/jobs/match-custom", {
        jd_text: finalJd,
        job_title: finalTitle,
        company: finalCompany,
        company_type: companyType,
        is_mnc: isMnc,
        resume_text: payloadResumeText,
        resume_id: payloadResumeId
      });

      if (res.success && res.match_result) {
        setMatchResult(res.match_result);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Resume vs JD comparison failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToCoverLetter = () => {
    if (jobMode === "pipeline" && selectedJobId) {
      navigate(`/cover-letters?job_id=${selectedJobId}`);
    } else {
      navigate(`/cover-letters`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EBF5FF] text-[#1769F5] border border-blue-200/80 dark:bg-blue-950/70 dark:border-blue-800 dark:text-blue-300 mb-1.5">
            <Sparkles className="w-3 h-3 text-[#1769F5] dark:text-blue-400" />
            <span>AI Resume Comparison Engine</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-[#102A63] dark:text-white tracking-tight">
            Resume ↔ Job Matcher Studio
          </h1>
          <p className="text-[11px] sm:text-xs text-[#526783] dark:text-slate-400 mt-0.5 max-w-2xl font-medium leading-relaxed">
            Select or upload your candidate resume on the left, input the target Job Description on the right.
            Our multi-agent ATS scoring compares keywords, skills, and experience to evaluate alignment.
          </p>
        </div>

        <button
          onClick={handleMatch}
          disabled={loading || uploading}
          className="btn-gradient px-5 py-2.5 rounded-full text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
          <span>{loading ? "Calculating Match..." : "Compare & Calculate Match %"}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-3.5 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main 2-Column Side-by-Side Split View */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
        
        {/* LEFT COLUMN: RESUME SECTION */}
        <div className="bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3.5">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] dark:border-slate-800 pb-3 mb-4 gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#1769F5] to-[#5241E2] text-white flex items-center justify-center font-black text-xs shadow-2xs">
                  1
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-[#102A63] dark:text-white tracking-tight">Resume (Candidate Profile)</h2>
                  <p className="text-[10px] sm:text-[11px] text-[#526783] dark:text-slate-400 font-medium">Upload file, paste text, or select active profile</p>
                </div>
              </div>

              {/* Resume Mode Tabs */}
              <div className="flex bg-[#F0F7FF] dark:bg-slate-800/80 p-1 rounded-2xl border border-[#DCE9FA] dark:border-slate-700/60 text-xs font-bold">
                <button
                  onClick={() => setResumeMode("upload")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs",
                    resumeMode === "upload" ? "bg-white dark:bg-slate-900 text-[#1769F5] dark:text-blue-400 shadow-2xs font-black" : "text-[#526783] dark:text-slate-400 hover:text-[#1769F5]"
                  )}
                >
                  <Upload className="w-3.5 h-3.5" /> <span>Upload</span>
                </button>
                <button
                  onClick={() => setResumeMode("paste")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs",
                    resumeMode === "paste" ? "bg-white dark:bg-slate-900 text-[#1769F5] dark:text-blue-400 shadow-2xs font-black" : "text-[#526783] dark:text-slate-400 hover:text-[#1769F5]"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" /> <span>Paste</span>
                </button>
                <button
                  onClick={() => setResumeMode("select")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs",
                    resumeMode === "select" ? "bg-white dark:bg-slate-900 text-[#1769F5] dark:text-blue-400 shadow-2xs font-black" : "text-[#526783] dark:text-slate-400 hover:text-[#1769F5]"
                  )}
                >
                  <FileCheck className="w-3.5 h-3.5" /> <span>Saved</span>
                </button>
              </div>
            </div>

            {/* Resume Mode Content */}
            {resumeMode === "upload" && (
              <div className="space-y-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.docx,.txt" 
                  className="hidden" 
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-blue-200 dark:border-slate-700 hover:border-[#1769F5] bg-[#F8FAFD] dark:bg-slate-800/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all rounded-2xl p-5 sm:p-6 text-center cursor-pointer flex flex-col items-center justify-center space-y-2.5"
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-[#1769F5] animate-spin" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#EBF5FF] text-[#1769F5] dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center shadow-2xs">
                      <Upload className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-[#102A63] dark:text-white">
                      {resumeFile ? resumeFile.name : "Click or Drag & Drop PDF / DOCX Resume"}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-[#526783] dark:text-slate-400 mt-0.5 font-medium">
                      Supported formats: PDF, DOCX, TXT (Max 10MB)
                    </p>
                  </div>
                </div>

                {parsedResumeData && (
                  <div className="bg-[#E8FAF0] dark:bg-emerald-950/40 border border-[#B7E4C7] dark:border-emerald-800/80 rounded-2xl p-4 space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between text-xs font-black text-[#059669] dark:text-emerald-300">
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Resume Parsed Successfully</span>
                      <span className="text-[10px] bg-white dark:bg-emerald-900/60 px-2 py-0.5 rounded-full font-bold">{parsedResumeData.word_count || 0} words</span>
                    </div>
                    <div className="text-xs text-[#526783] dark:text-slate-300 font-medium">
                      <p><strong className="text-[#102A63] dark:text-white">Name:</strong> {parsedResumeData.name}</p>
                      {parsedResumeData.email && <p><strong className="text-[#102A63] dark:text-white">Email:</strong> {parsedResumeData.email}</p>}
                    </div>
                    {parsedResumeData.skills && parsedResumeData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {parsedResumeData.skills.slice(0, 10).map((sk: string, i: number) => (
                          <span key={i} className="text-[10px] px-2.5 py-0.5 bg-white dark:bg-emerald-900/50 text-[#059669] dark:text-emerald-300 font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                            {sk}
                          </span>
                        ))}
                        {parsedResumeData.skills.length > 10 && (
                          <span className="text-[10px] text-[#526783] dark:text-slate-400 self-center font-bold">+{parsedResumeData.skills.length - 10} more</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {resumeMode === "paste" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#102A63] dark:text-slate-200 block">Paste Resume Text</label>
                <textarea
                  rows={10}
                  placeholder="Paste candidate resume experience, skills, and summary here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="input-saas w-full p-4 text-xs font-mono leading-relaxed"
                />
                <div className="text-[10px] text-right text-[#526783] dark:text-slate-400 font-medium">
                  {resumeText.length} characters
                </div>
              </div>
            )}

            {resumeMode === "select" && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#102A63] dark:text-slate-200 block">Select Saved Resume Profile</label>
                {savedResumes.length === 0 ? (
                  <p className="text-xs text-[#526783] dark:text-slate-400 p-4 bg-[#F8FAFD] dark:bg-slate-800/60 rounded-2xl border border-[#E2E8F0] dark:border-slate-700">
                    No saved resumes found in database. Switch to 'Upload' or 'Paste'.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {savedResumes.map(r => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedResumeId(r.id)}
                        className={cn(
                          "w-full text-left p-3.5 rounded-2xl transition-all border text-xs flex items-center justify-between cursor-pointer",
                          selectedResumeId === r.id
                            ? "bg-[#EBF5FF] dark:bg-blue-950/70 border-blue-300 dark:border-blue-800 text-[#1769F5] dark:text-blue-300 font-bold shadow-2xs"
                            : "bg-white dark:bg-slate-850/60 border-[#E2E8F0] dark:border-slate-800 text-[#526783] dark:text-slate-300 hover:border-blue-200"
                        )}
                      >
                        <div>
                          <div className="font-black text-[#102A63] dark:text-white">{r.name}</div>
                          <div className="text-[11px] text-[#526783] dark:text-slate-400">{r.email || "No email provided"}</div>
                        </div>
                        {r.is_active === 1 && (
                          <span className="text-[10px] bg-[#E8FAF0] text-[#059669] border border-[#B7E4C7] dark:bg-emerald-950 dark:border-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                            Active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: JOB TITLE & DESCRIPTION SECTION */}
        <div className="bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3.5">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] dark:border-slate-800 pb-3 mb-4 gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#5241E2] to-[#792BEE] text-white flex items-center justify-center font-black text-xs shadow-2xs">
                  2
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-[#102A63] dark:text-white tracking-tight">Job Details (Target Role Side)</h2>
                  <p className="text-[10px] sm:text-[11px] text-[#526783] dark:text-slate-400 font-medium">Enter Job Title & Description or choose pipeline job</p>
                </div>
              </div>

              {/* Job Mode Selector */}
              <div className="flex bg-[#F5EEFF] dark:bg-slate-800/80 p-1 rounded-2xl border border-[#E9D5FF] dark:border-slate-700/60 text-xs font-bold">
                <button
                  onClick={() => setJobMode("custom")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs",
                    jobMode === "custom" ? "bg-white dark:bg-slate-900 text-[#792BEE] dark:text-purple-400 shadow-2xs font-black" : "text-[#526783] dark:text-slate-400 hover:text-[#792BEE]"
                  )}
                >
                  <Briefcase className="w-3.5 h-3.5" /> <span>Custom Job</span>
                </button>
                <button
                  onClick={() => setJobMode("pipeline")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs",
                    jobMode === "pipeline" ? "bg-white dark:bg-slate-900 text-[#792BEE] dark:text-purple-400 shadow-2xs font-black" : "text-[#526783] dark:text-slate-400 hover:text-[#792BEE]"
                  )}
                >
                  <Layers className="w-3.5 h-3.5" /> <span>Pipeline ({pipelineJobs.length})</span>
                </button>
              </div>
            </div>

            {/* Job Mode Content */}
            {jobMode === "custom" ? (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1 block">Job Title *</label>
                    <input 
                      type="text"
                      placeholder="e.g. Senior Full Stack Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="input-saas w-full px-3 py-2 text-xs sm:text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1 block">Company Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Google / Microsoft"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="input-saas w-full px-3 py-2 text-xs sm:text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1 block">Company Category</label>
                    <select
                      value={companyType}
                      onChange={(e) => {
                        setCompanyType(e.target.value);
                        if (e.target.value.includes("MNC")) setIsMnc(true);
                      }}
                      className="input-saas w-full px-3 py-2 text-xs sm:text-sm font-medium cursor-pointer"
                    >
                      <option value="MNC (Multi National Company)">🏢 MNC (Multi National Company)</option>
                      <option value="Product-Based MNC">🚀 Product-Based MNC</option>
                      <option value="Service-Based MNC">⚙️ Service-Based MNC</option>
                      <option value="Startup">⚡ Startup / High Growth</option>
                      <option value="Corporate / Enterprise">🏛️ Corporate / Enterprise</option>
                      <option value="Public Sector / Govt">🏛️ Public Sector / Govt</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1 block">MNC Status</label>
                    <button
                      type="button"
                      onClick={() => setIsMnc(!isMnc)}
                      className={cn(
                        "w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer",
                        isMnc
                          ? "bg-[#EBF5FF] dark:bg-blue-950/70 border-blue-300 dark:border-blue-800 text-[#1769F5] dark:text-blue-300 shadow-2xs"
                          : "bg-white dark:bg-slate-800 border-[#E2E8F0] dark:border-slate-700 text-[#526783] dark:text-slate-400"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#1769F5]" /> Multi National Company (MNC)
                      </span>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-black", isMnc ? "bg-[#1769F5] text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500")}>
                        {isMnc ? "YES (MNC)" : "NO"}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#102A63] dark:text-slate-200 mb-1 block">Job Description & Requirements *</label>
                  <textarea 
                    rows={5}
                    placeholder="Paste the full job description text, skills requirements, and qualifications here..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    className="input-saas w-full p-3 text-xs font-mono leading-relaxed"
                  />
                  <div className="text-[10px] text-right text-[#526783] dark:text-slate-400 font-medium">
                    {jdText.length} characters
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#102A63] dark:text-slate-200 block">Select Job from Active Pipeline</label>
                {pipelineJobs.length === 0 ? (
                  <p className="text-xs text-[#526783] dark:text-slate-400 p-4 bg-[#F8FAFD] dark:bg-slate-800/60 rounded-2xl border border-[#E2E8F0] dark:border-slate-700">
                    No jobs found in pipeline. Switch to 'Custom Job' to paste job details.
                  </p>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                    {pipelineJobs.map(j => (
                      <button
                        key={j.id}
                        onClick={() => setSelectedJobId(j.id)}
                        className={cn(
                          "w-full text-left p-3.5 rounded-2xl transition-all border text-xs flex items-center justify-between cursor-pointer",
                          selectedJobId === j.id
                            ? "bg-[#F5EEFF] dark:bg-purple-950/70 border-purple-300 dark:border-purple-800 text-[#792BEE] dark:text-purple-300 font-bold shadow-2xs"
                            : "bg-white dark:bg-slate-850/60 border-[#E2E8F0] dark:border-slate-800 text-[#526783] dark:text-slate-300 hover:border-purple-200"
                        )}
                      >
                        <div className="truncate pr-2">
                          <div className="font-black text-[#102A63] dark:text-white truncate">{j.title}</div>
                          <div className="text-[11px] text-[#526783] dark:text-slate-400 truncate">{j.company} • {j.location}</div>
                        </div>
                        <div className="shrink-0 text-right flex flex-col items-end gap-1">
                          <span className="text-[10px] font-bold text-[#792BEE] bg-[#F5EEFF] dark:bg-purple-950 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                            {j.source}
                          </span>
                          <span className="text-[9px] font-bold text-[#1769F5] bg-[#EBF5FF] dark:bg-blue-950 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-blue-200 dark:border-blue-800">
                            <Globe className="w-2.5 h-2.5 text-[#1769F5]" /> MNC
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MATCH RESULTS DISPLAY DASHBOARD */}
      {matchResult && (
        <div className="bg-white dark:bg-[#0E1726] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5 animate-in fade-in duration-500">
          
          {/* Main Score Banner */}
          <div className="flex flex-col md:flex-row items-center gap-5 sm:gap-6 p-4 sm:p-5 bg-gradient-to-r from-[#F8FAFD] via-[#F0F7FF] to-[#FAF5FF] dark:from-slate-850/70 dark:via-blue-950/20 dark:to-purple-950/20 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-2xs">
            {/* Radial Score Gauge */}
            <div className="relative shrink-0 flex items-center justify-center">
              <svg className="w-28 h-28 sm:w-32 sm:h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="50" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                <circle 
                  cx="64" cy="64" r="50" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={314}
                  strokeDashoffset={314 - (314 * matchResult.ats_score) / 100}
                  strokeLinecap="round"
                  className={cn(
                    "transition-all duration-1000 ease-out",
                    matchResult.ats_score >= 80 ? "text-[#059669]" :
                    matchResult.ats_score >= 60 ? "text-[#1769F5]" :
                    matchResult.ats_score >= 40 ? "text-[#D97706]" : "text-rose-500"
                  )}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-black text-[#102A63] dark:text-white tracking-tight">
                  {Math.round(matchResult.ats_score)}%
                </span>
                <span className="text-[9px] text-[#526783] dark:text-slate-400 font-black uppercase tracking-wider">
                  Match Score
                </span>
              </div>
            </div>

            {/* Score Text & Summary */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-2xs",
                  matchResult.ats_score >= 80 ? "bg-[#E8FAF0] border-[#B7E4C7] text-[#059669] dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300" :
                  matchResult.ats_score >= 60 ? "bg-[#EBF5FF] border-[#C3E0FF] text-[#1769F5] dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300" :
                  matchResult.ats_score >= 40 ? "bg-[#FFFBEB] border-[#FDE68A] text-[#D97706] dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300" :
                  "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300"
                )}>
                  {matchResult.recommendation}
                </span>
                <span className="text-xs text-[#526783] dark:text-slate-400 font-semibold truncate">
                  Role: <strong className="text-[#102A63] dark:text-white font-black">{matchResult.job_title}</strong> @ {matchResult.company}
                </span>
                {(matchResult.is_mnc || matchResult.company_type) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#EBF5FF] border border-blue-200/80 text-[#1769F5] dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300 rounded-full text-[10px] font-bold">
                    <Globe className="w-2.5 h-2.5 text-[#1769F5]" /> {matchResult.company_type || "MNC"}
                  </span>
                )}
              </div>

              <p className="text-[11px] sm:text-xs text-[#526783] dark:text-slate-300 leading-relaxed font-medium">
                {matchResult.ats_score >= 80
                  ? "Outstanding alignment! Your resume closely matches the key requirements and tech stack for this role."
                  : matchResult.ats_score >= 60
                  ? "Strong foundation found. Incorporate a few missing keywords to boost your ranking to top tier."
                  : "Moderate match. Consider updating your resume bullet points to highlight skills requested in this job posting."}
              </p>

              <div className="pt-1">
                <button
                  onClick={handleGoToCoverLetter}
                  className="btn-gradient px-4 py-2 rounded-full text-xs font-black shadow-md inline-flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Mail className="w-3.5 h-3.5" /> <span>Generate Tailored Cover Letter</span> <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* 5-Component ATS Score Breakdown with Pastel Cards */}
          {matchResult.breakdown && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#526783] dark:text-slate-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#1769F5]" /> Multi-Component ATS Analysis Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3">
                
                <div className="bg-[#F0F7FF] dark:bg-blue-950/30 border border-[#DCE9FA] dark:border-blue-900/40 rounded-xl p-3 text-center shadow-2xs">
                  <div className="text-[9px] sm:text-[10px] text-[#526783] dark:text-slate-400 font-extrabold uppercase mb-1">Skills (40%)</div>
                  <div className="text-base sm:text-lg font-black text-[#1769F5] dark:text-blue-400">{matchResult.breakdown.skill_score || 0} / 40</div>
                  <div className="w-full bg-blue-200/50 dark:bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                    <div className="bg-[#1769F5] h-1 rounded-full" style={{ width: `${((matchResult.breakdown.skill_score || 0) / 40) * 100}%` }}></div>
                  </div>
                </div>

                <div className="bg-[#F5EEFF] dark:bg-purple-950/30 border border-[#E9D5FF] dark:border-purple-900/40 rounded-xl p-3 text-center shadow-2xs">
                  <div className="text-[9px] sm:text-[10px] text-[#526783] dark:text-slate-400 font-extrabold uppercase mb-1">Keywords (25%)</div>
                  <div className="text-base sm:text-lg font-black text-[#792BEE] dark:text-purple-400">{matchResult.breakdown.keyword_score || 0} / 25</div>
                  <div className="w-full bg-purple-200/50 dark:bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                    <div className="bg-[#792BEE] h-1 rounded-full" style={{ width: `${((matchResult.breakdown.keyword_score || 0) / 25) * 100}%` }}></div>
                  </div>
                </div>

                <div className="bg-[#FAF5FF] dark:bg-indigo-950/30 border border-[#EEDDFF] dark:border-indigo-900/40 rounded-xl p-3 text-center shadow-2xs">
                  <div className="text-[9px] sm:text-[10px] text-[#526783] dark:text-slate-400 font-extrabold uppercase mb-1">Experience (15%)</div>
                  <div className="text-base sm:text-lg font-black text-[#5241E2] dark:text-indigo-400">{matchResult.breakdown.exp_score || 0} / 15</div>
                  <div className="w-full bg-indigo-200/50 dark:bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                    <div className="bg-[#5241E2] h-1 rounded-full" style={{ width: `${((matchResult.breakdown.exp_score || 0) / 15) * 100}%` }}></div>
                  </div>
                </div>

                <div className="bg-[#F0FDF4] dark:bg-emerald-950/30 border border-[#D1FAE5] dark:border-emerald-900/40 rounded-xl p-3 text-center shadow-2xs">
                  <div className="text-[9px] sm:text-[10px] text-[#526783] dark:text-slate-400 font-extrabold uppercase mb-1">Education (10%)</div>
                  <div className="text-base sm:text-lg font-black text-[#059669] dark:text-emerald-400">{matchResult.breakdown.edu_score || 0} / 10</div>
                  <div className="w-full bg-emerald-200/50 dark:bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                    <div className="bg-[#059669] h-1 rounded-full" style={{ width: `${((matchResult.breakdown.edu_score || 0) / 10) * 100}%` }}></div>
                  </div>
                </div>

                <div className="bg-[#FFFBEB] dark:bg-amber-950/30 border border-[#FEF3C7] dark:border-amber-900/40 rounded-xl p-3 text-center shadow-2xs">
                  <div className="text-[9px] sm:text-[10px] text-[#526783] dark:text-slate-400 font-extrabold uppercase mb-1">Similarity (10%)</div>
                  <div className="text-base sm:text-lg font-black text-[#D97706] dark:text-amber-400">{matchResult.breakdown.sim_score || 0} / 10</div>
                  <div className="w-full bg-amber-200/50 dark:bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                    <div className="bg-[#D97706] h-1 rounded-full" style={{ width: `${((matchResult.breakdown.sim_score || 0) / 10) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Matched vs Missing Keywords Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Matched Keywords */}
            <div className="bg-[#F0FDF4] dark:bg-emerald-950/20 border border-[#D1FAE5] dark:border-emerald-900/40 rounded-3xl p-6 shadow-2xs">
              <h4 className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-[#059669] dark:text-emerald-400 mb-4">
                <CheckCircle2 className="w-4 h-4" /> Matched Skills & Keywords ({matchResult.matched_keywords?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {matchResult.matched_keywords?.map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-white dark:bg-emerald-900/50 border border-[#B7E4C7] dark:border-emerald-800 text-[#059669] dark:text-emerald-300 rounded-full text-xs font-bold shadow-2xs">
                    ✓ {kw}
                  </span>
                ))}
                {(!matchResult.matched_keywords || matchResult.matched_keywords.length === 0) && (
                  <span className="text-xs text-[#526783] dark:text-slate-400 font-medium">No overlapping tech keywords identified.</span>
                )}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="bg-[#FFF1F2] dark:bg-rose-950/20 border border-[#FECDD3] dark:border-rose-900/40 rounded-3xl p-6 shadow-2xs">
              <h4 className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-4">
                <XCircle className="w-4 h-4" /> Missing Keywords in Resume ({matchResult.missing_keywords?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {matchResult.missing_keywords?.map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-white dark:bg-rose-900/50 border border-[#FECDD3] dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-full text-xs font-bold shadow-2xs">
                    ! {kw}
                  </span>
                ))}
                {(!matchResult.missing_keywords || matchResult.missing_keywords.length === 0) && (
                  <span className="text-xs text-[#059669] font-bold">
                    All major required keywords are present!
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Strategic Advice */}
          <div className="bg-[#F8FAFD] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700/60 rounded-3xl p-6 flex items-start gap-4 shadow-2xs">
            <Sparkles className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-black text-xs uppercase tracking-wider text-[#102A63] dark:text-white">
                Actionable Resume Optimization Advice
              </h4>
              <p className="text-xs text-[#526783] dark:text-slate-300 leading-relaxed font-medium">
                {matchResult.ats_score >= 80 
                  ? "Your resume shows high keyword density and strong alignment. Make sure to tailor your cover letter to highlight project outcomes related to these skills."
                  : `To improve your ATS match score from ${Math.round(matchResult.ats_score)}% to 90%+, consider naturally incorporating key missing terms (such as ${matchResult.missing_keywords?.slice(0, 4).join(", ") || "relevant domain skills"}) into your resume work experience bullets.`}
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
