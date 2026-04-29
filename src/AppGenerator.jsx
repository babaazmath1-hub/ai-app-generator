import { useState, useEffect, useCallback } from "react";

// ─── SAMPLE CONFIGS ──────────────────────────────────────────────────────────
const SAMPLE_CONFIGS = {
  crm: {
    app: { name: "CRM Dashboard", theme: "dark", primaryColor: "#6366f1" },
    auth: { required: true, provider: "email" },
    database: {
      tables: [
        {
          name: "contacts",
          fields: [
            { name: "id", type: "uuid", primary: true },
            { name: "name", type: "string", required: true },
            { name: "email", type: "email", required: true },
            { name: "phone", type: "string" },
            { name: "company", type: "string" },
            { name: "status", type: "enum", options: ["lead", "active", "churned"], default: "lead" },
            { name: "created_at", type: "timestamp", auto: true }
          ]
        }
      ]
    },
    pages: [
      {
        id: "dashboard",
        title: "Dashboard",
        icon: "📊",
        components: [
          { type: "stats", items: [
            { label: "Total Contacts", source: "contacts", aggregate: "count", icon: "👥" },
            { label: "Active Leads", source: "contacts", aggregate: "count", filter: { status: "lead" }, icon: "🎯" },
            { label: "Active Clients", source: "contacts", aggregate: "count", filter: { status: "active" }, icon: "✅" }
          ]},
          { type: "table", source: "contacts", limit: 5, title: "Recent Contacts",
            columns: ["name", "email", "company", "status"] }
        ]
      },
      {
        id: "contacts",
        title: "Contacts",
        icon: "👥",
        components: [
          { type: "toolbar", actions: ["add", "export", "import"] },
          { type: "table", source: "contacts", searchable: true,
            columns: ["name", "email", "phone", "company", "status", "created_at"] }
        ]
      },
      {
        id: "add_contact",
        title: "Add Contact",
        icon: "➕",
        components: [
          { type: "form", target: "contacts",
            fields: ["name", "email", "phone", "company", "status"],
            submitLabel: "Save Contact" }
        ]
      }
    ]
  },
  inventory: {
    app: { name: "Inventory Manager", theme: "light", primaryColor: "#10b981" },
    auth: { required: true, provider: "email" },
    database: {
      tables: [
        {
          name: "products",
          fields: [
            { name: "id", type: "uuid", primary: true },
            { name: "sku", type: "string", required: true },
            { name: "name", type: "string", required: true },
            { name: "category", type: "enum", options: ["electronics", "clothing", "food", "other"] },
            { name: "quantity", type: "number", required: true },
            { name: "price", type: "number", required: true },
            { name: "supplier", type: "string" },
            { name: "updated_at", type: "timestamp", auto: true }
          ]
        }
      ]
    },
    pages: [
      {
        id: "dashboard",
        title: "Overview",
        icon: "📦",
        components: [
          { type: "stats", items: [
            { label: "Total Products", source: "products", aggregate: "count", icon: "📦" },
            { label: "Total Value", source: "products", aggregate: "sum", field: "price", icon: "💰" },
            { label: "Low Stock", source: "products", aggregate: "count", filter: { quantity_lt: 10 }, icon: "⚠️" }
          ]},
          { type: "table", source: "products", limit: 5, title: "Low Stock Items",
            columns: ["sku", "name", "quantity", "price"] }
        ]
      },
      {
        id: "products",
        title: "Products",
        icon: "🗃️",
        components: [
          { type: "toolbar", actions: ["add", "export", "import"] },
          { type: "table", source: "products", searchable: true,
            columns: ["sku", "name", "category", "quantity", "price", "supplier"] }
        ]
      },
      {
        id: "add_product",
        title: "Add Product",
        icon: "➕",
        components: [
          { type: "form", target: "products",
            fields: ["sku", "name", "category", "quantity", "price", "supplier"],
            submitLabel: "Add to Inventory" }
        ]
      }
    ]
  }
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_DATA = {
  contacts: [
    { id: "1", name: "Aria Chen", email: "aria@techcorp.io", phone: "+1 555-0101", company: "TechCorp", status: "active", created_at: "2026-04-20" },
    { id: "2", name: "Marcus Webb", email: "m.webb@startup.co", phone: "+1 555-0202", company: "Startup.co", status: "lead", created_at: "2026-04-22" },
    { id: "3", name: "Priya Nair", email: "priya@ventures.in", phone: "+91 98001 23456", company: "Ventures IN", status: "active", created_at: "2026-04-23" },
    { id: "4", name: "James Okafor", email: "james@globalb2b.ng", phone: "+234 801 234 5678", company: "GlobalB2B", status: "churned", created_at: "2026-04-10" },
    { id: "5", name: "Sofia Müller", email: "sofia@designhaus.de", phone: "+49 30 12345678", company: "DesignHaus", status: "lead", created_at: "2026-04-25" },
  ],
  products: [
    { id: "1", sku: "ELEC-001", name: "Wireless Earbuds Pro", category: "electronics", quantity: 142, price: 89.99, supplier: "SoundTech Ltd", updated_at: "2026-04-27" },
    { id: "2", sku: "CLTH-045", name: "Merino Wool Jacket", category: "clothing", quantity: 8, price: 249.00, supplier: "Nordic Fabrics", updated_at: "2026-04-26" },
    { id: "3", sku: "ELEC-023", name: "USB-C Hub 7-in-1", category: "electronics", quantity: 5, price: 49.99, supplier: "ConnectPro", updated_at: "2026-04-25" },
    { id: "4", sku: "FOOD-012", name: "Organic Coffee Blend", category: "food", quantity: 300, price: 18.50, supplier: "BeanRoute Co", updated_at: "2026-04-27" },
    { id: "5", sku: "ELEC-089", name: "Smart LED Desk Lamp", category: "electronics", quantity: 3, price: 75.00, supplier: "LumiTech", updated_at: "2026-04-24" },
  ]
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getTableData(source, filter, limit) {
  let rows = [...(MOCK_DATA[source] || [])];
  if (filter) {
    Object.entries(filter).forEach(([k, v]) => {
      if (k.endsWith("_lt")) rows = rows.filter(r => r[k.replace("_lt", "")] < v);
      else rows = rows.filter(r => r[k] === v);
    });
  }
  return limit ? rows.slice(0, limit) : rows;
}

function getAggregate(source, agg, field, filter) {
  const rows = getTableData(source, filter);
  if (agg === "count") return rows.length;
  if (agg === "sum") return rows.reduce((s, r) => s + (r[field] || 0), 0).toFixed(2);
  return 0;
}

function getFieldDef(config, tableName, fieldName) {
  const table = config?.database?.tables?.find(t => t.name === tableName);
  return table?.fields?.find(f => f.name === fieldName);
}

const STATUS_COLORS = {
  active: "#10b981", lead: "#6366f1", churned: "#ef4444",
  electronics: "#6366f1", clothing: "#f59e0b", food: "#10b981", other: "#6b7280"
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function StatsWidget({ items, config }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
      {items.map((item, i) => {
        const val = getAggregate(item.source, item.aggregate, item.field, item.filter);
        return (
          <div key={i} style={{
            background: "var(--card)", borderRadius: "12px", padding: "20px",
            border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "8px"
          }}>
            <span style={{ fontSize: "28px" }}>{item.icon}</span>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent)", fontFamily: "'Space Mono', monospace" }}>
              {item.aggregate === "sum" ? `$${val}` : val}
            </div>
            <div style={{ fontSize: "13px", color: "var(--muted)", fontWeight: "500" }}>{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function TableWidget({ source, columns, limit, title, searchable, config }) {
  const [search, setSearch] = useState("");
  const tableDef = config?.database?.tables?.find(t => t.name === source);
  let rows = getTableData(source, null, limit);
  if (search) rows = rows.filter(r => columns.some(c => String(r[c] || "").toLowerCase().includes(search.toLowerCase())));

  return (
    <div style={{ background: "var(--card)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden", marginBottom: "20px" }}>
      {(title || searchable) && (
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          {title && <div style={{ fontWeight: "700", fontSize: "15px" }}>{title}</div>}
          {searchable && (
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search..." style={{
                background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "8px",
                padding: "8px 12px", color: "var(--text)", fontSize: "13px", outline: "none", width: "200px"
              }} />
          )}
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "var(--bg)" }}>
              {columns.map(col => (
                <th key={col} style={{ padding: "10px 16px", textAlign: "left", fontWeight: "600", color: "var(--muted)", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                  {col.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ padding: "32px", textAlign: "center", color: "var(--muted)" }}>No records found</td></tr>
            ) : rows.map((row, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                {columns.map(col => {
                  const fieldDef = tableDef?.fields?.find(f => f.name === col);
                  const val = row[col];
                  if (fieldDef?.type === "enum" && STATUS_COLORS[val]) {
                    return (
                      <td key={col} style={{ padding: "10px 16px" }}>
                        <span style={{ background: STATUS_COLORS[val] + "22", color: STATUS_COLORS[val], padding: "3px 10px", borderRadius: "20px", fontWeight: "600", fontSize: "11px" }}>
                          {val}
                        </span>
                      </td>
                    );
                  }
                  if (fieldDef?.type === "number" && col === "price") {
                    return <td key={col} style={{ padding: "10px 16px", fontFamily: "'Space Mono', monospace" }}>${val}</td>;
                  }
                  return <td key={col} style={{ padding: "10px 16px", color: "var(--text)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val ?? <span style={{ color: "var(--muted)" }}>—</span>}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ToolbarWidget({ actions }) {
  const [importOpen, setImportOpen] = useState(false);
  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
      {actions.includes("add") && (
        <button style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 18px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>+ Add New</button>
      )}
      {actions.includes("export") && (
        <button style={{ background: "var(--card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", padding: "9px 18px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>⬇ Export CSV</button>
      )}
      {actions.includes("import") && (
        <button onClick={() => setImportOpen(!importOpen)} style={{ background: "var(--card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", padding: "9px 18px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>⬆ Import CSV</button>
      )}
      {importOpen && (
        <div style={{ width: "100%", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
          <div style={{ fontWeight: "700", marginBottom: "12px" }}>📤 CSV Import</div>
          <div style={{ border: "2px dashed var(--border)", borderRadius: "8px", padding: "32px", textAlign: "center", color: "var(--muted)", fontSize: "14px" }}>
            Drag & drop your CSV file here, or <span style={{ color: "var(--accent)", cursor: "pointer", fontWeight: "600" }}>browse</span>
            <br/><span style={{ fontSize: "12px" }}>Columns will be auto-mapped to schema fields</span>
          </div>
        </div>
      )}
    </div>
  );
}

function FormWidget({ target, fields, submitLabel, config }) {
  const tableDef = config?.database?.tables?.find(t => t.name === target);
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const newErrors = {};
    fields.forEach(f => {
      const fd = tableDef?.fields?.find(x => x.name === f);
      if (fd?.required && !values[f]) newErrors[f] = "Required";
    });
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
    setValues({});
    setErrors({});
  };

  return (
    <div style={{ background: "var(--card)", borderRadius: "12px", border: "1px solid var(--border)", padding: "24px", maxWidth: "560px" }}>
      {submitted && (
        <div style={{ background: "#10b98122", border: "1px solid #10b981", borderRadius: "8px", padding: "12px 16px", color: "#10b981", fontWeight: "600", marginBottom: "20px" }}>
          ✅ Record saved successfully!
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {fields.map(fieldName => {
          const fd = tableDef?.fields?.find(f => f.name === fieldName) || { name: fieldName, type: "string" };
          const label = fieldName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
          const err = errors[fieldName];

          if (fd.type === "enum") {
            return (
              <div key={fieldName}>
                <label style={{ display: "block", fontWeight: "600", fontSize: "13px", marginBottom: "6px", color: fd.required ? "var(--text)" : "var(--muted)" }}>
                  {label}{fd.required && <span style={{ color: "#ef4444" }}> *</span>}
                </label>
                <select value={values[fieldName] || ""} onChange={e => setValues({ ...values, [fieldName]: e.target.value })}
                  style={{ width: "100%", background: "var(--bg)", border: `1px solid ${err ? "#ef4444" : "var(--border)"}`, borderRadius: "8px", padding: "10px 12px", color: "var(--text)", fontSize: "14px", outline: "none" }}>
                  <option value="">Select {label}</option>
                  {(fd.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                {err && <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{err}</div>}
              </div>
            );
          }

          return (
            <div key={fieldName}>
              <label style={{ display: "block", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>
                {label}{fd.required && <span style={{ color: "#ef4444" }}> *</span>}
              </label>
              <input type={fd.type === "email" ? "email" : fd.type === "number" ? "number" : "text"}
                value={values[fieldName] || ""}
                onChange={e => setValues({ ...values, [fieldName]: e.target.value })}
                placeholder={`Enter ${label.toLowerCase()}...`}
                style={{ width: "100%", background: "var(--bg)", border: `1px solid ${err ? "#ef4444" : "var(--border)"}`, borderRadius: "8px", padding: "10px 12px", color: "var(--text)", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              {err && <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{err}</div>}
            </div>
          );
        })}
        <button onClick={handleSubmit} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 24px", fontWeight: "700", fontSize: "14px", cursor: "pointer", marginTop: "8px" }}>
          {submitLabel || "Submit"}
        </button>
      </div>
    </div>
  );
}

function PageRenderer({ page, config }) {
  const renderComponent = (comp, idx) => {
    if (!comp?.type) return <div key={idx} style={{ color: "#ef4444", padding: "12px" }}>⚠ Unknown component</div>;
    switch (comp.type) {
      case "stats": return <StatsWidget key={idx} items={comp.items || []} config={config} />;
      case "table": return <TableWidget key={idx} {...comp} config={config} />;
      case "toolbar": return <ToolbarWidget key={idx} actions={comp.actions || []} />;
      case "form": return <FormWidget key={idx} {...comp} config={config} />;
      default: return <div key={idx} style={{ color: "var(--muted)", padding: "12px", border: "1px dashed var(--border)", borderRadius: "8px" }}>Component type "{comp.type}" not yet implemented</div>;
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "24px", color: "var(--text)" }}>
        {page.icon} {page.title}
      </h2>
      {(page.components || []).map((c, i) => renderComponent(c, i))}
    </div>
  );
}

// ─── JSON EDITOR ──────────────────────────────────────────────────────────────
function JsonEditor({ value, onChange }) {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [err, setErr] = useState(null);

  const handleChange = (v) => {
    setText(v);
    try { onChange(JSON.parse(v)); setErr(null); }
    catch (e) { setErr(e.message); }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontWeight: "700", fontSize: "13px", color: "var(--muted)" }}>CONFIG.JSON</span>
        {err ? <span style={{ color: "#ef4444", fontSize: "12px" }}>⚠ {err}</span> : <span style={{ color: "#10b981", fontSize: "12px" }}>✓ Valid JSON</span>}
      </div>
      <textarea value={text} onChange={e => handleChange(e.target.value)}
        spellCheck={false}
        style={{ flex: 1, background: "transparent", border: "none", color: "var(--text)", fontFamily: "'Space Mono', monospace", fontSize: "12px", padding: "16px", resize: "none", outline: "none", lineHeight: "1.6" }} />
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ config, onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const accent = config?.app?.primaryColor || "#6366f1";

  const login = () => {
    if (!email || !pass) { setErr("All fields required"); return; }
    if (!email.includes("@")) { setErr("Invalid email"); return; }
    onLogin({ email });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "20px" }}>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "380px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "56px", height: "56px", background: accent, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 16px" }}>⚡</div>
          <div style={{ fontWeight: "800", fontSize: "22px", color: "var(--text)" }}>{config?.app?.name || "App"}</div>
          <div style={{ color: "var(--muted)", fontSize: "14px", marginTop: "4px" }}>Sign in to your account</div>
        </div>
        {err && <div style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: "8px", padding: "10px 14px", color: "#ef4444", fontSize: "13px", marginBottom: "16px" }}>{err}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px 14px", color: "var(--text)", fontSize: "14px", outline: "none" }} />
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password"
            onKeyDown={e => e.key === "Enter" && login()}
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px 14px", color: "var(--text)", fontSize: "14px", outline: "none" }} />
          <button onClick={login} style={{ background: accent, color: "#fff", border: "none", borderRadius: "8px", padding: "13px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
            Sign In →
          </button>
          <button onClick={() => onLogin({ email: "demo@example.com" })} style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>
            Continue as Demo User
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function AppGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState("crm");
  const [config, setConfig] = useState(SAMPLE_CONFIGS.crm);
  const [activePage, setActivePage] = useState(null);
  const [view, setView] = useState("preview"); // preview | editor | split
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const accent = config?.app?.primaryColor || "#6366f1";
  const isDark = config?.app?.theme !== "light";

  const cssVars = isDark ? {
    "--bg": "#0f0f13", "--card": "#1a1a24", "--border": "#2a2a3a",
    "--text": "#e8e8f0", "--muted": "#6b6b8a", "--accent": accent
  } : {
    "--bg": "#f5f5f8", "--card": "#ffffff", "--border": "#e2e2ea",
    "--text": "#1a1a2e", "--muted": "#6b6b8a", "--accent": accent
  };

  useEffect(() => {
    setConfig(SAMPLE_CONFIGS[selectedTemplate]);
    setUser(null);
    setActivePage(null);
  }, [selectedTemplate]);

  const pages = config?.pages || [];
  const currentPage = pages.find(p => p.id === activePage) || pages[0];

  if (config?.auth?.required && !user) {
    return (
      <div style={cssVars}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; } :root { ${Object.entries(cssVars).map(([k,v]) => `${k}: ${v}`).join(';') } }`}</style>
        <AuthScreen config={config} onLogin={setUser} />
      </div>
    );
  }

  return (
    <div style={{ ...cssVars, minHeight: "100vh", background: "var(--bg)", color: "var(--text)", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; }
        :root { ${Object.entries(cssVars).map(([k,v]) => `${k}: ${v}`).join(';') } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        textarea, input, select { font-family: inherit; }
        button:hover { opacity: 0.88; transition: opacity 0.15s; }
      `}</style>

      {/* TOP NAV */}
      <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "0 20px", display: "flex", alignItems: "center", gap: "16px", height: "54px", flexShrink: 0 }}>
        <div style={{ fontWeight: "800", fontSize: "15px", color: "var(--accent)", fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap" }}>⚡ AppGen</div>
        <div style={{ width: "1px", height: "24px", background: "var(--border)" }} />

        {/* Template switcher */}
        <div style={{ display: "flex", gap: "6px" }}>
          {Object.keys(SAMPLE_CONFIGS).map(t => (
            <button key={t} onClick={() => setSelectedTemplate(t)} style={{
              background: selectedTemplate === t ? "var(--accent)" : "var(--bg)",
              color: selectedTemplate === t ? "#fff" : "var(--muted)",
              border: "1px solid var(--border)", borderRadius: "6px", padding: "5px 12px",
              fontSize: "12px", fontWeight: "600", cursor: "pointer", textTransform: "capitalize"
            }}>{t}</button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* View switcher */}
        <div style={{ display: "flex", background: "var(--bg)", borderRadius: "8px", padding: "3px", border: "1px solid var(--border)", gap: "2px" }}>
          {[["preview", "👁 Preview"], ["split", "⊟ Split"], ["editor", "{ } JSON"]].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              background: view === v ? "var(--card)" : "transparent",
              color: view === v ? "var(--text)" : "var(--muted)",
              border: "none", borderRadius: "6px", padding: "5px 12px", fontSize: "12px", fontWeight: "600", cursor: "pointer"
            }}>{label}</button>
          ))}
        </div>

        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "30px", height: "30px", background: accent, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#fff" }}>
              {user.email[0].toUpperCase()}
            </div>
            <button onClick={() => setUser(null)} style={{ background: "transparent", border: "none", color: "var(--muted)", fontSize: "12px", cursor: "pointer" }}>Sign out</button>
          </div>
        )}
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", height: "calc(100vh - 54px)" }}>

        {/* JSON EDITOR PANEL */}
        {(view === "editor" || view === "split") && (
          <div style={{ width: view === "split" ? "40%" : "100%", background: "#0d0d14", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <JsonEditor value={config} onChange={setConfig} />
          </div>
        )}

        {/* PREVIEW PANEL */}
        {(view === "preview" || view === "split") && (
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* SIDEBAR */}
            <div style={{ width: "200px", background: "var(--card)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "auto" }}>
              <div style={{ padding: "16px 14px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontWeight: "800", fontSize: "14px", color: "var(--accent)" }}>{config?.app?.name || "App"}</div>
              </div>
              <nav style={{ padding: "8px" }}>
                {pages.map(page => (
                  <button key={page.id} onClick={() => setActivePage(page.id)}
                    style={{
                      width: "100%", textAlign: "left", background: currentPage?.id === page.id ? accent + "22" : "transparent",
                      color: currentPage?.id === page.id ? accent : "var(--muted)",
                      border: "none", borderRadius: "8px", padding: "9px 12px",
                      fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
                    }}>
                    <span>{page.icon}</span> {page.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* PAGE CONTENT */}
            <div style={{ flex: 1, overflow: "auto", padding: "28px 24px" }}>
              {currentPage ? <PageRenderer page={currentPage} config={config} /> : (
                <div style={{ color: "var(--muted)", textAlign: "center", marginTop: "80px" }}>No pages defined in config</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
