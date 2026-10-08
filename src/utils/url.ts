/**
 * AutoApply AI — Centralized URL Resolution & Security Helper
 * Ensures original job posting URLs from various job boards and platforms are valid,
 * safe (http/https only), properly formatted, and point to a specific job detail page
 * rather than a generic platform homepage or search results page.
 */

const GENERIC_PLATFORM_HOMEPAGES = [
  "linkedin.com",
  "www.linkedin.com",
  "linkedin.com/jobs",
  "www.linkedin.com/jobs",
  "linkedin.com/jobs/search",
  "www.linkedin.com/jobs/search",
  "indeed.com",
  "www.indeed.com",
  "indeed.com/jobs",
  "www.indeed.com/jobs",
  "internshala.com",
  "www.internshala.com",
  "internshala.com/jobs",
  "www.internshala.com/jobs",
  "internshala.com/internships",
  "www.internshala.com/internships",
  "naukri.com",
  "www.naukri.com",
  "wellfound.com",
  "www.wellfound.com",
  "wellfound.com/jobs",
  "www.wellfound.com/jobs",
  "glassdoor.com",
  "www.glassdoor.com",
];

export function getValidJobUrl(job?: Record<string, any> | null): string | null {
  if (!job) return null;

  // Inspect nested job object if present (e.g. app.job or app)
  const targetObj = job.job && typeof job.job === "object" ? { ...job.job, ...job } : job;

  // Inspect URL candidate fields in priority order (preferring verified original posting fields over generic fields)
  const rawUrl =
    targetObj.source_url ||
    targetObj.sourceUrl ||
    targetObj.original_url ||
    targetObj.originalUrl ||
    targetObj.job_url ||
    targetObj.jobUrl ||
    targetObj.url ||
    targetObj.link ||
    targetObj.apply_url ||
    targetObj.applyUrl;

  if (typeof rawUrl !== "string") return null;

  let trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // Unwrap google redirect wrapper if present e.g. https://www.google.com/url?q=...
  if (trimmed.includes("google.com/url?") && trimmed.includes("q=")) {
    try {
      const u = new URL(trimmed.startsWith("//") ? `https:${trimmed}` : trimmed);
      const target = u.searchParams.get("q");
      if (target) trimmed = target.trim();
    } catch {
      // ignore parsing error
    }
  }

  // Reject unsafe schemes, javascript execution, or dummy values
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:") ||
    lower.startsWith("vbscript:") ||
    trimmed === "#" ||
    lower === "about:blank" ||
    lower === "null" ||
    lower === "undefined"
  ) {
    return null;
  }

  // Prepend protocol if missing
  if (trimmed.startsWith("//")) {
    trimmed = `https:${trimmed}`;
  } else if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  // Encode spaces safely in path/query if present
  try {
    trimmed = encodeURI(trimmed);
  } catch {
    // If encodeURI fails, proceed with trimmed
  }

  // Validate using standard URL constructor
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    // Reject generic homepages or platform search result pages without specific job details
    const hostAndPath = `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname}`.replace(/\/$/, "");
    const hostOnly = parsed.hostname.replace(/^www\./, "");
    
    if (
      GENERIC_PLATFORM_HOMEPAGES.includes(hostAndPath) ||
      GENERIC_PLATFORM_HOMEPAGES.includes(hostOnly) ||
      (parsed.pathname === "" || parsed.pathname === "/")
    ) {
      return null;
    }

    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Safely opens the job's original posting URL in a new browser tab.
 * Uses window.open with secure "noopener,noreferrer" features.
 */
export function handleOpenOriginalPosting(
  e?: React.SyntheticEvent | Event | null,
  job?: Record<string, any> | null,
  onError?: (msg: string) => void
): boolean {
  if (e) {
    if (typeof e.preventDefault === "function") e.preventDefault();
    if (typeof e.stopPropagation === "function") e.stopPropagation();
  }

  const validUrl = getValidJobUrl(job);
  if (validUrl) {
    window.open(validUrl, "_blank", "noopener,noreferrer");
    return true;
  } else {
    const errorMsg = "Original job posting URL is unavailable.";
    if (onError) {
      onError(errorMsg);
    } else {
      alert(errorMsg);
    }
    return false;
  }
}


