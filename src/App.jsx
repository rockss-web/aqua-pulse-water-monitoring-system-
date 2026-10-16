import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Bell,
  Check, CheckCircle2, ChevronDown, CircleHelp, Clock3, Droplet, Download,
  Filter, Gauge, LayoutDashboard, MapPin, Menu, Plus, Search, Settings2,
  ShieldCheck, Sparkles, Waves, X, Zap
} from "lucide-react";

const seedReports = [
  { id: "AQ-2048", title: "Possible contamination reported", category: "Water quality", location: "Madhapur, Ward 104", priority: "High", status: "Investigating", reported: "12 min ago", reporter: "Priya S.", description: "Residents reported an unusual smell and discoloration in tap water near the community park." },
  { id: "AQ-2047", title: "Main pipeline leakage", category: "Leakage", location: "Kondapur, Ward 109", priority: "Critical", status: "Assigned", reported: "38 min ago", reporter: "Rahul K.", description: "Water is flowing onto the road from a damaged pipeline joint." },
  { id: "AQ-2046", title: "Low water pressure", category: "Supply issue", location: "Gachibowli, Ward 112", priority: "Medium", status: "Open", reported: "1 hr ago", reporter: "Anonymous", description: "Water pressure has been low in several apartments since early morning." },
  { id: "AQ-2045", title: "Overflowing public tap", category: "Leakage", location: "Kukatpally, Ward 121", priority: "Low", status: "Resolved", reported: "2 hrs ago", reporter: "Ananya R.", description: "A public tap was left running after the morning supply window." },
  { id: "AQ-2044", title: "Drain water mixing concern", category: "Water quality", location: "Ameerpet, Ward 87", priority: "High", status: "Investigating", reported: "3 hrs ago", reporter: "Mohammed A.", description: "Residents are concerned that a nearby drain may be affecting the water line." },
];

const initialReadings = [
  { name: "pH balance", value: "7.2", unit: "pH", state: "Within range", fill: 72 },
  { name: "Turbidity", value: "1.8", unit: "NTU", state: "Within range", fill: 35 },
  { name: "Chlorine", value: "0.4", unit: "mg/L", state: "Within range", fill: 55 },
];

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Complaints", icon: AlertTriangle },
  { label: "Water insights", icon: Activity },
  { label: "Service areas", icon: MapPin },
];

function StatusPill({ status }) {
  const cls = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-pill ${cls}`}><span className="status-dot" />{status}</span>;
}
function PriorityPill({ priority }) {
  return <span className={`priority ${priority.toLowerCase()}`}>{priority}</span>;
}
function MetricCard({ icon: Icon, label, value, delta, trend = "up", accent }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className={`metric-icon ${accent}`}><Icon size={18} /></span>
        <span className={`metric-change ${trend}`}><ArrowUpRight size={13} />{delta}</span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </article>
  );
}

function App() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem("aquapulse-reports");
      return saved ? JSON.parse(saved) : seedReports;
    } catch { return seedReports; }
  });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [showModal, setShowModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Water quality", location: "", priority: "Medium", description: "" });

  useEffect(() => {
    localStorage.setItem("aquapulse-reports", JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredReports = useMemo(() => reports.filter(r => {
    const haystack = `${r.id} ${r.title} ${r.category} ${r.location} ${r.reporter}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) &&
      (statusFilter === "All statuses" || r.status === statusFilter) &&
      (priorityFilter === "All priorities" || r.priority === priorityFilter);
  }), [reports, query, statusFilter, priorityFilter]);

  const openCount = reports.filter(r => r.status !== "Resolved").length;
  const criticalCount = reports.filter(r => r.priority === "Critical" && r.status !== "Resolved").length;
  const resolvedCount = reports.filter(r => r.status === "Resolved").length;

  function updateStatus(id, status) {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setToast(`${id} marked as ${status.toLowerCase()}.`);
  }

  function submitReport(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim() || !form.description.trim()) {
      setToast("Please complete all required fields.");
      return;
    }
    const nextNumber = Math.max(2048, ...reports.map(r => Number(r.id.replace("AQ-", "")) || 0)) + 1;
    const newReport = {
      id: `AQ-${nextNumber}`,
      title: form.title.trim(),
      category: form.category,
      location: form.location.trim(),
      priority: form.priority,
      status: "Open",
      reported: "Just now",
      reporter: "You",
      description: form.description.trim()
    };
    setReports(prev => [newReport, ...prev]);
    setForm({ title: "", category: "Water quality", location: "", priority: "Medium", description: "" });
    setShowModal(false);
    setActiveNav("Complaints");
    setToast(`Report ${newReport.id} submitted successfully.`);
  }

  function exportCsv() {
    const rows = [
      ["ID", "Title", "Category", "Location", "Priority", "Status", "Reported by"],
      ...filteredReports.map(r => [r.id, r.title, r.category, r.location, r.priority, r.status, r.reporter])
    ];
    const csv = rows.map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aquapulse-complaints.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast("Complaint report exported as CSV.");
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Droplet size={23} fill="currentColor" /></div>
          <div><div className="brand-name">aqua<span>pulse</span></div><div className="brand-caption">WATER INTELLIGENCE</div></div>
          <button className="icon-button sidebar-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18}/></button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="main-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activeNav === label ? "active" : ""}`} onClick={() => { setActiveNav(label); setMobileNav(false); }}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {label === "Complaints" && <span className="nav-count">{openCount}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-section">
          <div className="workspace-label">QUICK ACCESS</div>
          <button className="nav-item" onClick={() => { setShowModal(true); setMobileNav(false); }}><Plus size={18}/><span>Submit a report</span></button>
          <button className="nav-item" onClick={() => { setActiveNav("Water insights"); setMobileNav(false); }}><Gauge size={18}/><span>Quality snapshot</span></button>
        </div>

        <div className="sidebar-spacer" />
        <div className="help-card">
          <div className="help-icon"><CircleHelp size={18}/></div>
          <div className="help-title">Need a hand?</div>
          <div className="help-copy">Learn how to report an issue in your area.</div>
          <button onClick={() => setToast("Help: choose Submit a report and describe the issue and location.")}>Open help centre <ArrowRight size={14}/></button>
        </div>
        <div className="profile-row">
          <div className="avatar">ST</div>
          <div className="profile-copy"><strong>City Water Team</strong><span>Community workspace</span></div>
          <button className="icon-button" aria-label="Settings" onClick={() => setToast("Settings are a demo placeholder in this version.")}><Settings2 size={17}/></button>
        </div>
      </aside>

      {mobileNav && <button className="mobile-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20}/></button>
            <div className="breadcrumb">Workspace <span>/</span> <strong>{activeNav}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className="system-status"><span className="pulse-dot"/><span>All systems operational</span></div>
            <div className="notification-wrap">
              <button className={`icon-button notification-button ${showNotifications ? "selected" : ""}`} onClick={() => setShowNotifications(v => !v)} aria-label="Notifications"><Bell size={18}/><i /></button>
              {showNotifications && <div className="notification-popover"><strong>Notifications</strong><p><span className="notice-dot aqua"/>Water insights use illustrative sample readings.</p><p><span className="notice-dot orange"/>There are {criticalCount} unresolved critical-priority reports.</p><button onClick={() => setShowNotifications(false)}>Got it</button></div>}
            </div>
            <div className="topbar-avatar">CT</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><Sparkles size={13}/> YOUR CITY, IN CLEARER VIEW</div>
              <h1>{activeNav === "Overview" ? "Water, understood." : activeNav}</h1>
              <p className="welcome-subtitle">
                {activeNav === "Overview" ? "A clearer picture of water issues across your community." :
                 activeNav === "Complaints" ? "Review incoming reports, track progress, and keep your community informed." :
                 activeNav === "Water insights" ? "A quick snapshot of water indicators and community signals." :
                 "Explore service-area activity and reported issues by ward."}
              </p>
            </div>
            <button className="primary-button" onClick={() => setShowModal(true)}><Plus size={17}/> New report</button>
          </section>

          {activeNav === "Overview" && (
            <>
              <section className="hero-banner">
                <div className="hero-copy">
                  <div className="hero-tag"><span className="hero-tag-dot"/> COMMUNITY WATER PULSE</div>
                  <h2>Every report helps<br/>build a <em>healthier flow.</em></h2>
                  <p>Spot an issue? Share what you see. Together, we can help the right people act faster.</p>
                  <button className="hero-button" onClick={() => setShowModal(true)}>Report a water issue <ArrowRight size={16}/></button>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="orb orb-one"/><div className="orb orb-two"/><div className="orb orb-three"/>
                  <div className="water-ring ring-one"/><div className="water-ring ring-two"/>
                  <div className="hero-drop"><Droplet size={64} strokeWidth={1.2}/></div>
                  <div className="floating-chip chip-top"><span className="chip-check"><Check size={12}/></span> Community powered</div>
                  <div className="floating-chip chip-bottom"><Activity size={15}/> Signals becoming action</div>
                </div>
                <div className="hero-grid" aria-hidden="true"/>
              </section>

              <section className="metrics-grid">
                <MetricCard icon={AlertTriangle} label="Active reports" value={String(openCount).padStart(2, "0")} delta="+12.8%" accent="metric-aqua"/>
                <MetricCard icon={Clock3} label="Awaiting action" value={String(reports.filter(r => ["Open", "Assigned"].includes(r.status)).length).padStart(2, "0")} delta="Needs review" trend="down" accent="metric-orange"/>
                <MetricCard icon={CheckCircle2} label="Resolved this period" value={String(resolvedCount).padStart(2, "0")} delta="+8.4%" accent="metric-green"/>
                <MetricCard icon={Zap} label="Critical priority" value={String(criticalCount).padStart(2, "0")} delta="Monitor closely" trend="down" accent="metric-purple"/>
              </section>

              <section className="content-grid">
                <article className="panel reports-panel">
                  <div className="panel-heading">
                    <div><div className="panel-kicker">COMMUNITY FEED</div><h3>Recent reports <span className="heading-count">{reports.length}</span></h3></div>
                    <button className="text-button" onClick={() => setActiveNav("Complaints")}>View all <ArrowRight size={15}/></button>
                  </div>
                  <ReportTable reports={reports.slice(0, 4)} updateStatus={updateStatus} compact />
                </article>

                <article className="panel insights-panel">
                  <div className="panel-heading">
                    <div><div className="panel-kicker">WATER SIGNALS</div><h3>Quality snapshot <span className="sample-badge">DEMO</span></h3></div>
                    <button className="mini-icon-button" onClick={() => setActiveNav("Water insights")} aria-label="View water insights"><ArrowUpRight size={17}/></button>
                  </div>
                  <div className="quality-summary">
                    <div className="quality-score"><div className="score-number">92<span>/100</span></div><div className="score-label"><span className="green-dot"/> Illustrative score</div></div>
                    <div className="quality-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="39" className="ring-track"/><circle cx="50" cy="50" r="39" className="ring-progress"/></svg><div className="ring-center"><Droplet size={24}/></div></div>
                  </div>
                  <div className="quality-note"><ShieldCheck size={16}/><span>Sample readings are within the demo's configured reference ranges.</span></div>
                  <div className="reading-list">
                    {initialReadings.map(r => <div className="reading-row" key={r.name}><div className="reading-info"><span>{r.name}</span><strong>{r.value} <small>{r.unit}</small></strong></div><div className="reading-track"><span style={{ width: `${r.fill}%` }}/></div><span className="reading-state">{r.state}</span></div>)}
                  </div>
                  <button className="panel-footer-link" onClick={() => setActiveNav("Water insights")}>Explore water insights <ArrowRight size={15}/></button>
                </article>
              </section>

              <section className="bottom-grid">
                <article className="panel activity-panel">
                  <div className="panel-heading"><div><div className="panel-kicker">WEEKLY MOVEMENT</div><h3>Report activity</h3></div><span className="period-select">Last 7 days <ChevronDown size={14}/></span></div>
                  <div className="chart-legend"><span><i className="legend-dot aqua-dot"/> Reports received</span><span><i className="legend-dot pale-dot"/> Issues resolved</span></div>
                  <div className="chart-wrap">
                    <div className="chart-y-labels"><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div>
                    <svg className="activity-chart" viewBox="0 0 600 170" preserveAspectRatio="none" role="img" aria-label="Illustrative weekly complaint activity chart">
                      <defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#36d7c0" stopOpacity=".22"/><stop offset="100%" stopColor="#36d7c0" stopOpacity="0"/></linearGradient></defs>
                      {[15,50,85,120,155].map(y => <line key={y} x1="0" y1={y} x2="600" y2={y} className="chart-gridline"/>)}
                      <path d="M0,125 C35,118 42,85 85,96 S140,117 170,75 S220,65 255,88 S310,115 340,58 S390,76 425,49 S480,66 510,34 S565,48 600,18 L600,160 L0,160 Z" fill="url(#areaFill)"/>
                      <path d="M0,125 C35,118 42,85 85,96 S140,117 170,75 S220,65 255,88 S310,115 340,58 S390,76 425,49 S480,66 510,34 S565,48 600,18" className="chart-line aqua-line"/>
                      <path d="M0,145 C40,138 55,130 85,132 S140,137 170,118 S220,125 255,124 S310,135 340,105 S390,115 425,95 S480,112 510,88 S565,94 600,74" className="chart-line pale-line"/>
                    </svg>
                  </div>
                  <div className="chart-x-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
                  <p className="chart-footnote">Illustrative trend for interface demonstration, not live civic data.</p>
                </article>

                <article className="panel areas-panel">
                  <div className="panel-heading"><div><div className="panel-kicker">SERVICE COVERAGE</div><h3>Area pulse</h3></div><button className="mini-icon-button" onClick={() => setActiveNav("Service areas")} aria-label="View service areas"><ArrowUpRight size={17}/></button></div>
                  <div className="area-map">
                    <div className="map-grid"/>
                    <svg viewBox="0 0 300 190" className="map-lines" aria-hidden="true">
                      <path d="M-10 44 L78 64 L118 32 L182 58 L235 20 L315 52 M-10 118 L60 100 L108 138 L168 106 L228 134 L310 105 M45 -10 L60 55 L50 100 L82 202 M135 -10 L118 32 L150 80 L108 138 L130 200 M235 -10 L182 58 L200 96 L168 106 L190 200 M-10 165 L60 100 L118 32" />
                    </svg>
                    <button className="map-pin pin-a" onClick={() => { setQuery("Madhapur"); setActiveNav("Complaints"); }}><span/><i>104</i></button>
                    <button className="map-pin pin-b" onClick={() => { setQuery("Kondapur"); setActiveNav("Complaints"); }}><span/><i>109</i></button>
                    <button className="map-pin pin-c" onClick={() => { setQuery("Gachibowli"); setActiveNav("Complaints"); }}><span/><i>112</i></button>
                    <button className="map-pin pin-d" onClick={() => { setQuery("Kukatpally"); setActiveNav("Complaints"); }}><span/><i>121</i></button>
                    <div className="map-label">HYDERABAD · SAMPLE VIEW</div>
                  </div>
                  <div className="area-legend"><span><i className="legend-dot orange-dot"/> Attention needed</span><span><i className="legend-dot aqua-dot"/> Normal activity</span></div>
                  <button className="panel-footer-link" onClick={() => setActiveNav("Service areas")}>View all service areas <ArrowRight size={15}/></button>
                </article>
              </section>
            </>
          )}

          {activeNav === "Complaints" && (
            <section className="panel full-panel">
              <div className="panel-heading complaints-heading">
                <div><div className="panel-kicker">CITIZEN REPORTING</div><h3>All complaints <span className="heading-count">{filteredReports.length}</span></h3><p className="section-sub">Search and filter reports. Update status to demonstrate the workflow.</p></div>
                <div className="heading-actions"><button className="secondary-button" onClick={exportCsv}><Download size={15}/> Export CSV</button><button className="primary-button" onClick={() => setShowModal(true)}><Plus size={16}/> New report</button></div>
              </div>
              <div className="filter-bar">
                <div className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search reports, locations, IDs..." /></div>
                <div className="select-wrap"><Filter size={15}/><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All statuses</option><option>Open</option><option>Assigned</option><option>Investigating</option><option>Resolved</option></select></div>
                <div className="select-wrap"><AlertTriangle size={15}/><select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}><option>All priorities</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div>
                {(query || statusFilter !== "All statuses" || priorityFilter !== "All priorities") && <button className="clear-filters" onClick={() => { setQuery(""); setStatusFilter("All statuses"); setPriorityFilter("All priorities"); }}>Clear</button>}
              </div>
              <ReportTable reports={filteredReports} updateStatus={updateStatus} />
              {filteredReports.length === 0 && <div className="empty-state"><Search size={24}/><strong>No reports match those filters</strong><span>Try another search or clear your filters.</span></div>}
              <div className="table-note"><ShieldCheck size={15}/> Demo mode: reports are saved in this browser only, using local storage.</div>
            </section>
          )}

          {activeNav === "Water insights" && (
            <>
              <section className="insights-hero panel">
                <div><div className="panel-kicker">WATER QUALITY SNAPSHOT · DEMO DATA</div><h2>See the signals.<br/><span>Understand the context.</span></h2><p>These illustrative readings demonstrate how a water-quality panel could be presented. They are not live measurements and must not be used to assess drinking-water safety.</p></div>
                <div className="insight-emblem"><Waves size={56}/><span>DEMO</span></div>
              </section>
              <div className="metrics-grid insight-metrics">
                <MetricCard icon={Droplet} label="pH balance" value="7.2" delta="Sample value" accent="metric-aqua"/>
                <MetricCard icon={Activity} label="Turbidity" value="1.8 NTU" delta="Sample value" accent="metric-orange"/>
                <MetricCard icon={ShieldCheck} label="Free chlorine" value="0.4 mg/L" delta="Sample value" accent="metric-green"/>
                <MetricCard icon={Gauge} label="Sample index" value="92/100" delta="Illustrative only" accent="metric-purple"/>
              </div>
              <section className="panel insights-details">
                <div className="panel-heading"><div><div className="panel-kicker">HOW TO READ THIS</div><h3>Sample indicator guide</h3></div></div>
                <div className="guide-grid">
                  <div className="guide-card"><span className="guide-icon aqua"><Droplet size={19}/></span><strong>pH balance</strong><p>Indicates how acidic or alkaline a water sample is. Actual interpretation depends on applicable standards and sampling conditions.</p></div>
                  <div className="guide-card"><span className="guide-icon orange"><Activity size={19}/></span><strong>Turbidity</strong><p>Measures water cloudiness caused by suspended particles. A single reading cannot establish that water is safe to drink.</p></div>
                  <div className="guide-card"><span className="guide-icon green"><ShieldCheck size={19}/></span><strong>Free chlorine</strong><p>Can help indicate disinfection residual. Required levels vary by context and should be assessed by qualified personnel.</p></div>
                </div>
                <div className="caution-note"><AlertTriangle size={18}/><div><strong>Important safety note</strong><p>This student prototype uses static example values. It has no sensor integration, laboratory validation, or live public-health data connection.</p></div></div>
              </section>
            </>
          )}

          {activeNav === "Service areas" && (
            <section className="panel full-panel">
              <div className="panel-heading"><div><div className="panel-kicker">WARD-LEVEL OVERVIEW</div><h3>Service areas</h3><p className="section-sub">Sample locations based on the demo complaints included with this prototype.</p></div><span className="sample-badge">SAMPLE DATA</span></div>
              <div className="ward-grid">
                {[
                  ["104", "Madhapur", "2 reports", "Attention needed", "attention"],
                  ["109", "Kondapur", "1 report", "High priority", "critical"],
                  ["112", "Gachibowli", "1 report", "Monitoring", "normal"],
                  ["121", "Kukatpally", "1 report", "1 resolved", "resolved"],
                  ["087", "Ameerpet", "1 report", "Attention needed", "attention"],
                  ["ALL", "Citywide view", `${reports.length} reports`, `${openCount} active`, "normal"]
                ].map((w, i) => <button className="ward-card" key={w[0]} onClick={() => { setQuery(w[1] === "Citywide view" ? "" : w[1]); setActiveNav("Complaints"); }}>
                  <div className="ward-top"><span className="ward-number">WARD {w[0]}</span><span className={`ward-state ${w[4]}`}><i/>{w[3]}</span></div><strong>{w[1]}</strong><div className="ward-bottom"><span>{w[2]}</span><ArrowUpRight size={16}/></div>
                </button>)}
              </div>
              <div className="table-note"><MapPin size={15}/> Area labels are illustrative and are not connected to a live geographic information system.</div>
            </section>
          )}

          <footer className="footer"><span>© 2026 AquaPulse · Student project prototype</span><span><span className="footer-dot"/> Built for clearer community water reporting</span></footer>
        </div>
      </main>

      {showModal && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
        <div className="report-modal">
          <div className="modal-header"><div><div className="panel-kicker">COMMUNITY REPORT</div><h2>Report a water issue</h2><p>Share a few details so the issue can be reviewed.</p></div><button className="icon-button" onClick={() => setShowModal(false)} aria-label="Close form"><X size={19}/></button></div>
          <form onSubmit={submitReport}>
            <label>Issue title <span>*</span><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Water leaking near apartment gate" required /></label>
            <div className="form-two-col">
              <label>Issue category <span>*</span><select value={form.category} onChange={e => setForm({...form, category: e.target.value})}><option>Water quality</option><option>Leakage</option><option>Supply issue</option><option>Drainage</option><option>Other</option></select></label>
              <label>Priority <span>*</span><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></label>
            </div>
            <label>Location or landmark <span>*</span><div className="input-with-icon"><MapPin size={16}/><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Area, street, ward..." required /></div></label>
            <label>Description <span>*</span><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What happened? When did you notice it?" rows={4} required /></label>
            <div className="form-hint"><ShieldCheck size={15}/> Please do not include personal or sensitive information.</div>
            <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="primary-button"><Plus size={16}/> Submit report</button></div>
          </form>
        </div>
      </div>}

      {toast && <div className="toast"><span><Check size={15}/></span>{toast}<button onClick={() => setToast("")} aria-label="Dismiss notification"><X size={15}/></button></div>}
    </div>
  );
}

function ReportTable({ reports, updateStatus, compact = false }) {
  return <div className={`table-scroll ${compact ? "compact-table" : ""}`}>
    <table className="reports-table">
      <thead><tr><th>REPORT</th><th>LOCATION</th><th>PRIORITY</th><th>STATUS</th>{!compact && <th>REPORTED</th>}</tr></thead>
      <tbody>{reports.map(r => <tr key={r.id}>
        <td><div className="report-title-cell"><span className={`report-type-icon ${r.category === "Water quality" ? "type-quality" : r.category === "Leakage" ? "type-leak" : "type-supply"}`}>{r.category === "Water quality" ? <Droplet size={15}/> : r.category === "Leakage" ? <Waves size={15}/> : <Activity size={15}/>}</span><div><strong>{r.title}</strong><span>{r.id} · {r.category}</span></div></div></td>
        <td><div className="location-cell"><MapPin size={13}/>{r.location}</div></td>
        <td><PriorityPill priority={r.priority}/></td>
        <td><select className={`status-select ${r.status.toLowerCase().replaceAll(" ", "-")}`} value={r.status} onChange={e => updateStatus(r.id, e.target.value)} aria-label={`Update status for ${r.id}`}><option>Open</option><option>Assigned</option><option>Investigating</option><option>Resolved</option></select></td>
        {!compact && <td className="reported-time">{r.reported}</td>}
      </tr>)}</tbody>
    </table>
  </div>;
}

export default App;
