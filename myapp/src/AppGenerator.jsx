import { useState, useEffect, useCallback } from "react";

const DEFAULT_CONFIGS = {
  crm: {
    appName: "CRM Dashboard",
    theme: "dark",
    primaryColor: "#6366f1",
    pages: [
      {
        name: "Contacts",
        icon: "👥",
        components: [
          {
            type: "stats",
            metrics: [
              { label: "Total Contacts", value: "1,284", change: "+12%" },
              { label: "Active Deals", value: "42", change: "+5%" },
              { label: "Revenue", value: "$84,200", change: "+18%" },
              { label: "Closed Won", value: "28", change: "+3%" }
            ]
          },
          {
            type: "toolbar",
            actions: ["Add Contact", "Import CSV", "Export"]
          },
          {
            type: "table",
            title: "All Contacts",
            fields: ["name", "email", "company", "status", "value"],
            data: [
              { name: "Alice Johnson", email: "alice@acme.com", company: "Acme Corp", status: "Active", value: "$12,000" },
              { name: "Bob Smith", email: "bob@globex.com", company: "Globex", status: "Lead", value: "$8,500" },
              { name: "Carol White", email: "carol@initech.com", company: "Initech", status: "Active", value: "$22,000" },
              { name: "David Brown", email: "david@umbrella.com", company: "Umbrella", status: "Inactive", value: "$3,200" },
              { name: "Eve Davis", email: "eve@hooli.com", company: "Hooli", status: "Active", value: "$17,800" }
            ]
          }
        ]
      },
      {
        name: "Add Contact",
        icon: "➕",
        components: [
          {
            type: "form",
            title: "New Contact",
            fields: [
              { name: "name", label: "Full Name", type: "text", required: true },
              { name: "email", label: "Email", type: "email", required: true },
              { name: "company", label: "Company", type: "text" },
              { name: "phone", label: "Phone", type: "tel" },
              { name: "status", label: "Status", type: "select", options: ["Lead", "Active", "Inactive"] },
              { name: "value", label: "Deal Value", type: "text" }
            ]
          }
        ]
      }
    ]
  },
  inventory: {
    appName: "Inventory Manager",
    theme: "light",
    primaryColor: "#10b981",
    pages: [
      {
        name: "Products",
        icon: "📦",
        components: [
          {
            type: "stats",
            metrics: [
              { label: "Total Products", value: "3,421", change: "+8%" },
              { label: "Low Stock", value: "23", change: "-2%" },
              { label: "Categories", value: "18", change: "0%" },
              { label: "Total Value", value: "$421K", change: "+14%" }
            ]
          },
          {
            type: "toolbar",
            actions: ["Add Product", "Import CSV", "Generate Report"]
          },
          {
            type: "table",
            title: "Product List",
            fields: ["sku", "name", "category", "stock", "price", "status"],
            data: [
              { sku: "PRD-001", name: "Wireless Mouse", category: "Electronics", stock: 142, price: "$29.99", status: "In Stock" },
              { sku: "PRD-002", name: "USB Hub", category: "Electronics", stock: 8, price: "$49.99", status: "Low Stock" },
              { sku: "PRD-003", name: "Desk Lamp", category: "Furniture", stock: 67, price: "$34.99", status: "In Stock" },
              { sku: "PRD-004", name: "Notebook", category: "Stationery", stock: 0, price: "$4.99", status: "Out of Stock" },
              { sku: "PRD-005", name: "Monitor Stand", category: "Furniture", stock: 31, price: "$79.99", status: "In Stock" }
            ]
          }
        ]
      },
      {
        name: "Add Product",
        icon: "➕",
        components: [
          {
            type: "form",
            title: "New Product",
            fields: [
              { name: "sku", label: "SKU", type: "text", required: true },
              { name: "name", label: "Product Name", type: "text", required: true },
              { name: "category", label: "Category", type: "select", options: ["Electronics", "Furniture", "Stationery", "Other"] },
              { name: "stock", label: "Initial Stock", type: "number" },
              { name: "price", label: "Price", type: "text" },
              { name: "description", label: "Description", type: "text" }
            ]
          }
        ]
      }
    ]
  }
};

function StatsWidget({ metrics, primaryColor }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
      {(metrics || []).map((m, i) => (
        <div key={i} style={{ background: "var(--card-bg)", borderRadius: "12px", padding: "20px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>{m.label || "Metric"}</div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--text)" }}>{m.value || "—"}</div>
          {m.change && (
            <div style={{
              fontSize: "12px",
              color: m.change.startsWith("+") ? "#10b981" : m.change.startsWith("-") ? "#ef4444" : "var(--text-muted)",
              marginTop: "4px"
            }}>{m.change}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function TableWidget({ title, fields, data, primaryColor }) {
  const [search, setSearch] = useState("");
  const safeFields = Array.isArray(fields) && fields.length > 0 ? fields : ["name", "value"];
  const safeData = Array.isArray(data) ? data : [];
  const filtered = safeData.filter(row =>
    safeFields.some(f => String(row[f] || "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ background: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden", marginBottom: "24px" }}>
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
        <h3 style={{ margin: 0, fontSize: "16px", color: "var(--text)" }}>{title || "Data Table"}</h3>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          style={{
            padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)",
            background: "var(--bg)", color: "var(--text)", fontSize: "13px", width: "200px"
          }}
        />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg)" }}>
              {safeFields.map(f => (
                <th key={f} style={{
                  padding: "12px 16px", textAlign: "left", fontSize: "12px",
                  fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em"
                }}>
                  {f}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={safeFields.length} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                  No records found
                </td>
              </tr>
            ) : filtered.map((row, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                {safeFields.map(f => (
                  <td key={f} style={{ padding: "12px 16px", fontSize: "14px", color: "var(--text)" }}>
                    {f === "status" ? (
                      <span style={{
                        padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                        background:
                          row[f] === "Active" || row[f] === "In Stock" ? "#d1fae5" :
                          row[f] === "Low Stock" ? "#fef3c7" :
                          row[f] === "Lead" ? "#e0e7ff" : "#fee2e2",
                        color:
                          row[f] === "Active" || row[f] === "In Stock" ? "#065f46" :
                          row[f] === "Low Stock" ? "#92400e" :
                          row[f] === "Lead" ? "#3730a3" : "#991b1b"
                      }}>
                        {row[f]}
                      </span>
                    ) : String(row[f] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FormWidget({ title, fields, primaryColor, onSubmit }) {
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const safeFields = Array.isArray(fields) ? fields : [];

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
    if (onSubmit) onSubmit(values);
    setValues({});
  };

  return (
    <div style={{
      background: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border)",
      padding: "24px", marginBottom: "24px", maxWidth: "600px"
    }}>
      <h3 style={{ margin: "0 0 20px", fontSize: "16px", color: "var(--text)" }}>{title || "Form"}</h3>
      {submitted && (
        <div style={{ background: "#d1fae5", color: "#065f46", padding: "10px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
          ✅ Submitted successfully!
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {safeFields.map((f, i) => (
          <div key={i} style={{ gridColumn: f.type === "text" && i === safeFields.length - 1 ? "1 / -1" : "auto" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-muted)", marginBottom: "6px" }}>
              {f.label || f.name}{f.required && <span style={{ color: "#ef4444" }}> *</span>}
            </label>
            {f.type === "select" ? (
              <select
                value={values[f.name] || ""}
                onChange={e => setValues({ ...values, [f.name]: e.target.value })}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: "8px",
                  border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "14px"
                }}
              >
                <option value="">Select...</option>
                {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={f.type || "text"}
                value={values[f.name] || ""}
                onChange={e => setValues({ ...values, [f.name]: e.target.value })}
                placeholder={`Enter ${f.label || f.name}`}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: "8px",
                  border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
                  fontSize: "14px", boxSizing: "border-box"
                }}
              />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        style={{
          marginTop: "20px", padding: "10px 24px", borderRadius: "8px", border: "none",
          background: primaryColor || "#6366f1", color: "#fff", fontWeight: "600", fontSize: "14px", cursor: "pointer"
        }}
      >
        Submit
      </button>
    </div>
  );
}

function ToolbarWidget({ actions, primaryColor }) {
  const [csvUploaded, setCsvUploaded] = useState(false);
  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
      {(actions || []).map((action, i) => (
        <button
          key={i}
          onClick={() => { if (action.toLowerCase().includes("csv")) setCsvUploaded(true); }}
          style={{
            padding: "9px 18px", borderRadius: "8px",
            border: i === 0 ? "none" : "1px solid var(--border)",
            background: i === 0 ? (primaryColor || "#6366f1") : "var(--card-bg)",
            color: i === 0 ? "#fff" : "var(--text)",
            fontWeight: "500", fontSize: "14px", cursor: "pointer"
          }}
        >
          {action}
        </button>
      ))}
      {csvUploaded && (
        <div style={{ padding: "9px 16px", background: "#d1fae5", color: "#065f46", borderRadius: "8px", fontSize: "14px" }}>
          📤 CSV import panel opened
        </div>
      )}
    </div>
  );
}

function renderComponent(comp, idx, primaryColor) {
  if (!comp || !comp.type) return (
    <div key={idx} style={{ color: "var(--text-muted)", padding: "12px" }}>Unknown component</div>
  );
  switch (comp.type) {
    case "stats":   return <StatsWidget   key={idx} metrics={comp.metrics} primaryColor={primaryColor} />;
    case "table":   return <TableWidget   key={idx} title={comp.title} fields={comp.fields} data={comp.data} primaryColor={primaryColor} />;
    case "form":    return <FormWidget    key={idx} title={comp.title} fields={comp.fields} primaryColor={primaryColor} />;
    case "toolbar": return <ToolbarWidget key={idx} actions={comp.actions} primaryColor={primaryColor} />;
    default: return (
      <div key={idx} style={{ padding: "12px", color: "var(--text-muted)", background: "var(--card-bg)", borderRadius: "8px", marginBottom: "12px" }}>
        Unknown component: {comp.type}
      </div>
    );
  }
}

export default function AppGenerator() {
  const [template, setTemplate] = useState("crm");
  const [config, setConfig] = useState(DEFAULT_CONFIGS.crm);
  const [jsonText, setJsonText] = useState(JSON.stringify(DEFAULT_CONFIGS.crm, null, 2));
  const [jsonError, setJsonError] = useState(null);
  const [activePage, setActivePage] = useState(0);
  const [showJson, setShowJson] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const isDark = config.theme === "dark";
  const primaryColor = config.primaryColor || "#6366f1";

  const cssVars = isDark
    ? { "--bg": "#0f172a", "--card-bg": "#1e293b", "--border": "#334155", "--text": "#f1f5f9", "--text-muted": "#94a3b8" }
    : { "--bg": "#f8fafc", "--card-bg": "#ffffff", "--border": "#e2e8f0", "--text": "#1e293b", "--text-muted": "#64748b" };

  const switchTemplate = (t) => {
    setTemplate(t);
    setConfig(DEFAULT_CONFIGS[t]);
    setJsonText(JSON.stringify(DEFAULT_CONFIGS[t], null, 2));
    setJsonError(null);
    setActivePage(0);
  };

  const applyJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setConfig(parsed);
      setJsonError(null);
      setActivePage(0);
    } catch (e) {
      setJsonError(e.message);
    }
  }, [jsonText]);

  useEffect(() => {
    const timer = setTimeout(applyJson, 800);
    return () => clearTimeout(timer);
  }, [jsonText, applyJson]);

  const handleLogin = () => {
    if (!email) { setLoginError("Email is required"); return; }
    if (!password) { setLoginError("Password is required"); return; }
    setLoggedIn(true);
  };

  if (!loggedIn) {
    return (
      <div style={{ ...cssVars, minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ background: "var(--card-bg)", borderRadius: "16px", padding: "40px", border: "1px solid var(--border)", width: "100%", maxWidth: "400px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>⚡</div>
            <h1 style={{ margin: 0, fontSize: "24px", color: "var(--text)", fontWeight: "700" }}>AppGen</h1>
            <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>Sign in to continue</p>
          </div>
          {loginError && (
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
              {loginError}
            </div>
          )}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-muted)", marginBottom: "6px" }}>Email</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "8px",
                border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
                fontSize: "14px", boxSizing: "border-box"
              }}
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-muted)", marginBottom: "6px" }}>Password</label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "8px",
                border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
                fontSize: "14px", boxSizing: "border-box"
              }}
            />
          </div>
          <button
            onClick={handleLogin}
            style={{
              width: "100%", padding: "12px", borderRadius: "8px", border: "none",
              background: primaryColor, color: "#fff", fontWeight: "600", fontSize: "15px",
              cursor: "pointer", marginBottom: "12px"
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setEmail("demo@appgen.com"); setPassword("demo"); setLoggedIn(true); }}
            style={{
              width: "100%", padding: "12px", borderRadius: "8px",
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text)", fontWeight: "500", fontSize: "14px", cursor: "pointer"
            }}
          >
            Demo User →
          </button>
        </div>
      </div>
    );
  }

  const pages = Array.isArray(config.pages) ? config.pages : [];
  const currentPage = pages[activePage] || { name: "Page", components: [] };

  return (
    <div style={{ ...cssVars, minHeight: "100vh", background: "var(--bg)", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{
        background: "var(--card-bg)", borderBottom: "1px solid var(--border)",
        padding: "0 24px", display: "flex", alignItems: "center", gap: "16px", height: "56px"
      }}>
        <span style={{ fontSize: "20px", fontWeight: "700", color: primaryColor }}>⚡ AppGen</span>
        <div style={{ display: "flex", gap: "8px", marginLeft: "8px" }}>
          {["crm", "inventory"].map(t => (
            <button key={t} onClick={() => switchTemplate(t)}
              style={{
                padding: "6px 14px", borderRadius: "6px", border: "none",
                background: template === t ? primaryColor : "transparent",
                color: template === t ? "#fff" : "var(--text-muted)",
                fontWeight: "500", fontSize: "13px", cursor: "pointer"
              }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => setShowJson(!showJson)}
            style={{
              padding: "6px 14px", borderRadius: "6px", border: "1px solid var(--border)",
              background: showJson ? primaryColor : "transparent",
              color: showJson ? "#fff" : "var(--text)",
              fontSize: "13px", cursor: "pointer", fontWeight: "500"
            }}
          >
            {"{ } JSON"}
          </button>
          <button
            onClick={() => setLoggedIn(false)}
            style={{
              padding: "6px 14px", borderRadius: "6px", border: "1px solid var(--border)",
              background: "transparent", color: "var(--text-muted)", fontSize: "13px", cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>
        {/* Sidebar */}
        <div style={{
          width: "200px", background: "var(--card-bg)", borderRight: "1px solid var(--border)",
          padding: "16px 12px", flexShrink: 0
        }}>
          <div style={{
            fontSize: "11px", fontWeight: "600", color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", padding: "0 8px"
          }}>
            {config.appName || "App"}
          </div>
          {pages.map((page, i) => (
            <button key={i} onClick={() => setActivePage(i)}
              style={{
                width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: "8px", border: "none",
                background: activePage === i ? primaryColor + "20" : "transparent",
                color: activePage === i ? primaryColor : "var(--text)",
                fontWeight: activePage === i ? "600" : "400",
                fontSize: "14px", cursor: "pointer", marginBottom: "2px",
                display: "flex", alignItems: "center", gap: "8px"
              }}>
              <span>{page.icon || "📄"}</span> {page.name || `Page ${i + 1}`}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "20px", color: "var(--text)", fontWeight: "700" }}>
            {currentPage.icon} {currentPage.name}
          </h2>
          {Array.isArray(currentPage.components) && currentPage.components.length > 0
            ? currentPage.components.map((comp, i) => renderComponent(comp, i, primaryColor))
            : (
              <div style={{
                color: "var(--text-muted)", padding: "40px", textAlign: "center",
                background: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border)"
              }}>
                No components on this page
              </div>
            )
          }
        </div>

        {/* JSON Editor */}
        {showJson && (
          <div style={{
            width: "380px", background: "var(--card-bg)", borderLeft: "1px solid var(--border)",
            display: "flex", flexDirection: "column", flexShrink: 0
          }}>
            <div style={{
              padding: "12px 16px", borderBottom: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)" }}>Live JSON Config</span>
              {jsonError
                ? <span style={{ fontSize: "11px", color: "#ef4444" }}>⚠ Invalid JSON</span>
                : <span style={{ fontSize: "11px", color: "#10b981" }}>✓ Valid</span>
              }
            </div>
            <textarea
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              style={{
                flex: 1, padding: "16px",
                background: isDark ? "#0f172a" : "#f8fafc",
                color: "var(--text)", border: "none", outline: "none",
                fontFamily: "monospace", fontSize: "12px", lineHeight: "1.6", resize: "none"
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
