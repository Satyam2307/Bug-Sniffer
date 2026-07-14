import React, { useState, useEffect } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : window.location.origin);

const issueLabels = {
  zero_byte_file: "Zero-byte Asset",
  malformed_svg: "Malformed SVG File",
  malformed_xml: "Malformed XML Document",
  malformed_json: "Malformed JSON Configuration",
};

function IssueIcon({ type }) {
  if (type === "zero_byte_file") {
    return <span className="issue-icon empty-icon">0B</span>;
  }
  if (type === "malformed_json") {
    return <span className="issue-icon json-icon">{"{}"}</span>;
  }
  return <span className="issue-icon code-icon">{"</>"}</span>;
}

function FindingCard({ finding, repo, expanded, onToggleCode }) {
  const label = issueLabels[finding.issue_type] || finding.issue_type;
  const isCopiable = !!finding.content_snippet;

  // Build GitHub URL if repo is valid owner/name format
  const githubFileUrl = repo && repo.includes("/")
    ? `https://github.com/${repo}/blob/main/${finding.file_path}`
    : null;

  const [copied, setCopied] = useState(false);

  function handleCopyPath() {
    navigator.clipboard.writeText(finding.file_path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article className="finding-card">
      <div className="finding-top">
        <div className="finding-file">
          <IssueIcon type={finding.issue_type} />
          <div className="file-info">
            <div className="finding-path" title={finding.file_path}>
              {finding.file_path}
            </div>
            <div className="finding-type">{label}</div>
          </div>
        </div>

        <div className="right-meta">
          <span className={`confidence confidence-${finding.confidence.toLowerCase()}`}>
            {finding.confidence} Confidence
          </span>
          {githubFileUrl && (
            <a
              href={githubFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
              title="Open file on GitHub"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          )}
        </div>
      </div>

      <div className="ai-explainer-section">
        <div className="ai-header">
          <span className="ai-bot-icon">🤖</span> AI Inspector explanation
        </div>
        <p className="finding-explanation">{finding.explanation}</p>
      </div>

      <div className="card-actions">
        <button type="button" className="card-action-btn" onClick={handleCopyPath}>
          {copied ? "✓ Copied" : "📋 Copy Path"}
        </button>
        {isCopiable && (
          <button type="button" className="card-action-btn" onClick={onToggleCode}>
            {expanded ? "▲ Hide Source Code" : "▼ View Source Code"}
          </button>
        )}
      </div>

      {expanded && isCopiable && (
        <div className="code-preview">
          <div className="code-preview-header">
            <span>{finding.file_path}</span>
            <span>Snippet (Max 1KB)</span>
          </div>
          <pre>
            <code>{finding.content_snippet}</code>
          </pre>
        </div>
      )}
    </article>
  );
}

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Scan Progress simulation states
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStep, setProgressStep] = useState(0);
  const progressSteps = [
    "Resolving repository and fetching meta...",
    "Retrieving recursive file structure...",
    "Validating asset dimensions and integrity...",
    "Analyzing JSON & XML parse parameters...",
    "Invoking LLM for semantic bug summaries..."
  ];

  // UI Control states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedCodePath, setExpandedCodePath] = useState(null);
  const [showDocsModal, setShowDocsModal] = useState(false);

  // Simulation loader effect
  useEffect(() => {
    let interval = null;
    if (loading) {
      setProgressPercent(5);
      setProgressStep(0);
      
      interval = setInterval(() => {
        setProgressPercent((oldPercent) => {
          if (oldPercent >= 98) {
            clearInterval(interval);
            return 98;
          }
          
          const increment = Math.floor(Math.random() * 8) + 2;
          const nextPercent = Math.min(oldPercent + increment, 98);
          
          // Dynamically map percent to step
          if (nextPercent < 20) setProgressStep(0);
          else if (nextPercent < 45) setProgressStep(1);
          else if (nextPercent < 70) setProgressStep(2);
          else if (nextPercent < 88) setProgressStep(3);
          else setProgressStep(4);
          
          return nextPercent;
        });
      }, 500);
    } else {
      setProgressPercent(0);
      setProgressStep(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  async function startScan(targetUrl) {
    if (!targetUrl.trim()) {
      setError("Enter a public GitHub repository URL.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setSearchQuery("");
    setActiveFilter("all");
    setExpandedCodePath(null);

    try {
      const response = await fetch(`${API_URL}/api/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repo_url: targetUrl.trim(),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.detail || "The scan failed.");
      }

      setResult(payload);
    } catch (scanError) {
      setError(
        scanError.message ||
          "Something went wrong while scanning the repository."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    startScan(repoUrl);
  }

  function loadExample(presetUrl) {
    setRepoUrl(presetUrl);
    startScan(presetUrl);
  }

  // Calculate Health Score
  const getHealthStats = () => {
    if (!result) return { score: 100, label: "SAFE", colorClass: "safe" };
    
    const highConfidenceCount = result.findings.filter(f => f.confidence === "High").length;
    const lowConfidenceCount = result.findings.filter(f => f.confidence === "Low").length;
    
    // Penalty: -25 for High confidence bug, -10 for Low confidence bug
    let score = 100 - (highConfidenceCount * 25) - (lowConfidenceCount * 10);
    score = Math.max(score, 0);
    
    let label = "SAFE";
    let colorClass = "safe";
    
    if (score < 60) {
      label = "CRITICAL";
      colorClass = "critical";
    } else if (score < 90) {
      label = "WARNING";
      colorClass = "warning";
    }
    
    return { score, label, colorClass };
  };

  const health = getHealthStats();
  // Circle circumference = 2 * PI * r = 2 * 3.14159 * 45 = 282.7
  const circumference = 282.7;
  const strokeDashoffset = circumference - (circumference * health.score) / 100;

  // Filter & Search Logic
  const filteredFindings = result
    ? result.findings.filter((finding) => {
        // Search Filter
        const matchesSearch =
          finding.file_path.toLowerCase().includes(searchQuery.toLowerCase()) ||
          finding.explanation.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesSearch) return false;

        // Category Tab Filter
        if (activeFilter === "all") return true;
        if (activeFilter === "zero_byte") return finding.issue_type === "zero_byte_file";
        if (activeFilter === "malformed") return finding.issue_type !== "zero_byte_file";
        if (activeFilter === "high") return finding.confidence === "High";
        if (activeFilter === "low") return finding.confidence === "Low";
        
        return true;
      })
    : [];

  const counts = result
    ? {
        all: result.findings.length,
        zero_byte: result.findings.filter(f => f.issue_type === "zero_byte_file").length,
        malformed: result.findings.filter(f => f.issue_type !== "zero_byte_file").length,
        high: result.findings.filter(f => f.confidence === "High").length,
        low: result.findings.filter(f => f.confidence === "Low").length,
      }
    : { all: 0, zero_byte: 0, malformed: 0, high: 0, low: 0 };

  return (
    <main className="page-shell">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      {/* Header bar */}
      <nav className="navbar">
        <div className="brand" onClick={() => { setResult(null); setRepoUrl(""); setError(""); }}>
          <span className="brand-mark">⌁</span>
          <span>Bug Sniffer</span>
        </div>

        <div className="nav-actions">
          <button type="button" className="docs-button" onClick={() => setShowDocsModal(true)}>
            📖 How it works
          </button>
          <div className="nav-label">Hackathon v1.0</div>
        </div>
      </nav>

      {/* Hero / Input Section */}
      <section className="hero">
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          Content-level repo scanner
        </div>

        <h1>
          Audit Silent Bugs
          <br />
          <span>Hiding In Plain Sight.</span>
        </h1>

        <p className="hero-copy">
          Traditional linters catch syntax errors, but miss empty assets and
          malformed markup. Bug Sniffer identifies silent UI-breaking bugs in seconds.
        </p>

        <form className="scan-form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <span className="input-prefix">github.com/</span>
            <input
              type="url"
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              placeholder="owner/repository"
              disabled={loading}
              aria-label="GitHub repository URL"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Auditing...
              </>
            ) : (
              <>
                Sniff Out Bugs
                <span className="button-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="presets-container">
          <button
            type="button"
            className="preset-chip demo-preset"
            onClick={() => loadExample("demo/buggy-repo")}
            disabled={loading}
          >
            🚀 Run Hackathon Demo Repo
          </button>
          <button
            type="button"
            className="preset-chip"
            onClick={() => loadExample("https://github.com/octocat/Spoon-Knife")}
            disabled={loading}
          >
            octocat/Spoon-Knife
          </button>
          <button
            type="button"
            className="preset-chip"
            onClick={() => loadExample("https://github.com/tiangolo/fastapi")}
            disabled={loading}
          >
            tiangolo/fastapi
          </button>
        </div>

        {error && (
          <div className="error-box" role="alert">
            <span>🚨</span>
            <div>
              <strong>Scan failed:</strong> {error}
            </div>
          </div>
        )}
      </section>

      {/* Loading Progress State */}
      {loading && (
        <section className="progress-card">
          <div className="progress-header">
            <span>Inspecting repository assets</span>
            <span className="progress-pulse">● LIVE RUN</span>
          </div>

          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="progress-steps-list">
            {progressSteps.map((step, idx) => {
              let statusClass = "pending";
              let statusLabel = "queued";
              if (progressStep === idx) {
                statusClass = "active";
                statusLabel = "running";
              } else if (progressStep > idx) {
                statusClass = "completed";
                statusLabel = "done";
              }
              return (
                <div key={idx} className={`progress-step-item ${statusClass}`}>
                  <div className="step-indicator">
                    <span className="step-dot" />
                    <span>{step}</span>
                  </div>
                  <span className="step-status">{statusLabel}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Results Dashboard Section */}
      {result && !loading && (
        <section className="results-section">
          
          {/* Dashboard upper grid */}
          <div className="dashboard-grid">
            
            {/* Repo Info card */}
            <div className="overview-card">
              <div className="repo-details">
                <div className="results-eyebrow">
                  <span className="live-badge" /> Scan Complete
                </div>
                <h2>{result.repo}</h2>
                <span className="branch-tag">🌿 {result.branch}</span>
              </div>

              <div className="dashboard-stats">
                <div className="mini-stat">
                  <div className="mini-stat-label">Files Scanned</div>
                  <div className="mini-stat-val success">{result.files_scanned}</div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-label">Bugs Found</div>
                  <div className="mini-stat-val danger">{result.findings.length}</div>
                </div>
              </div>
            </div>

            {/* Health Meter circular card */}
            <div className="health-card">
              <div className="results-eyebrow">Repo Health Index</div>
              <div className="health-meter">
                <svg className="health-svg" viewBox="0 0 100 100">
                  <circle className="health-track" cx="50" cy="50" r="45" />
                  <circle
                    className={`health-value-path health-${health.colorClass}`}
                    cx="50"
                    cy="50"
                    r="45"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="health-score-text">
                  <span className="health-score-val">{health.score}%</span>
                  <span className="health-score-label">Score</span>
                </div>
              </div>
              <div>
                <span className={`health-status-desc ${health.colorClass}`}>{health.label}</span>
                <p className="health-status-sub">
                  {result.findings.length === 0
                    ? "Excellent! No silent issues detected."
                    : `${result.findings.length} silent file defect(s) detected.`}
                </p>
              </div>
            </div>

          </div>

          {/* Warnings & Notes */}
          {result.notes?.length > 0 && (
            <div className="notes-box">
              <strong>Scan Notes & Limits:</strong>
              <ul>
                {result.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Search and filter controls bar */}
          <div className="controls-bar">
            
            {/* Tabs */}
            <div className="filters-tabs">
              <button
                type="button"
                className={`filter-tab ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All Findings <span className="tab-count">{counts.all}</span>
              </button>
              <button
                type="button"
                className={`filter-tab ${activeFilter === "zero_byte" ? "active" : ""}`}
                onClick={() => setActiveFilter("zero_byte")}
              >
                Zero-Byte <span className="tab-count">{counts.zero_byte}</span>
              </button>
              <button
                type="button"
                className={`filter-tab ${activeFilter === "malformed" ? "active" : ""}`}
                onClick={() => setActiveFilter("malformed")}
              >
                Malformed JSON/XML <span className="tab-count">{counts.malformed}</span>
              </button>
              <button
                type="button"
                className={`filter-tab ${activeFilter === "high" ? "active" : ""}`}
                onClick={() => setActiveFilter("high")}
              >
                High Confidence <span className="tab-count">{counts.high}</span>
              </button>
              <button
                type="button"
                className={`filter-tab ${activeFilter === "low" ? "active" : ""}`}
                onClick={() => setActiveFilter("low")}
              >
                Low Confidence <span className="tab-count">{counts.low}</span>
              </button>
            </div>

            {/* Path Search Input */}
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search findings by path..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Findings cards list */}
          {filteredFindings.length === 0 ? (
            <div className="empty-results">
              <div className="empty-check">✓</div>
              <h3>No bugs found in this filter</h3>
              <p>
                {searchQuery
                  ? "No scanned items matched your search query. Try clearing the search."
                  : "All audited repository files passed the content integrity audits successfully."}
              </p>
            </div>
          ) : (
            <div className="findings-list">
              {filteredFindings.map((finding, index) => {
                const cardKey = `${finding.file_path}-${finding.issue_type}-${index}`;
                return (
                  <FindingCard
                    key={cardKey}
                    finding={finding}
                    repo={result.repo}
                    expanded={expandedCodePath === cardKey}
                    onToggleCode={() =>
                      setExpandedCodePath(expandedCodePath === cardKey ? null : cardKey)
                    }
                  />
                );
              })}
            </div>
          )}

        </section>
      )}

      {/* Footer Info */}
      <footer>
        <div className="footer-credits">
          <span>Deterministic Check Layer (High Speed)</span>
          <span>Semantic AI Inference (Groq & Gemini)</span>
          <span>Zero Logging / Stateless Scan</span>
        </div>
        <div className="footer-note">
          Designed for GitHub Security and Asset Quality Audits.
        </div>
      </footer>

      {/* "How it works" Modal */}
      {showDocsModal && (
        <div className="modal-overlay" onClick={() => setShowDocsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setShowDocsModal(false)}>
              ×
            </button>
            <h3>How Bug Sniffer Audits Code</h3>
            
            <div className="modal-flow">
              <div className="flow-step">
                <div className="flow-num">1</div>
                <div className="flow-text">
                  <h4>Fetch Directory Tree</h4>
                  <p>
                    Downloads the recursive repository file tree structure using GitHub REST endpoints without requesting full source files, preserving rate limits.
                  </p>
                </div>
              </div>

              <div className="flow-step">
                <div className="flow-num">2</div>
                <div className="flow-text">
                  <h4>Deterministic Filtering</h4>
                  <p>
                    Applies high-speed static validations: flags zero-byte visual assets and fetches config and vector elements (.json, .svg, .xml) for syntax parse reviews.
                  </p>
                </div>
              </div>

              <div className="flow-step">
                <div className="flow-num">3</div>
                <div className="flow-text">
                  <h4>Semantic Verification</h4>
                  <p>
                    Passes only flagged files and error diagnostics to Gemini/Groq APIs. The AI conducts semantic evaluation, details the exact crash scenario, and scores confidence.
                  </p>
                </div>
              </div>
            </div>

            <button type="button" className="modal-footer-btn" onClick={() => setShowDocsModal(false)}>
              Got It
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
