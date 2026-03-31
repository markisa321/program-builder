import { useState, useRef } from 'react';
import { DEFAULT_EXERCISES, SESSIONS } from './data';
import { load, store } from './storage';
import { generateExcel } from './excel';
import ExerciseSelect from './ExerciseSelect';

const emptySession = () => ({
  coreA: { static: "", dynamic: "" }, coreB: { static: "", dynamic: "" },
  ex1: { a: "", b: "" }, ex2: { a: "", b: "" }, ex3: { a: "", b: "" }
});
const emptyClient = (name) => ({ name, t1: emptySession(), t2: emptySession(), t3: emptySession() });

export default function App() {
  const [exercises, setExercises] = useState(() => load("tp-exercises", DEFAULT_EXERCISES));
  const [clients, setClients] = useState(() => load("tp-clients", []));
  const [activeClient, setActiveClient] = useState(null);
  const [view, setView] = useState("clients");
  const [newCat, setNewCat] = useState("");
  const [newEx, setNewEx] = useState({ cat: "", name: "" });
  const [newClientName, setNewClientName] = useState("");
  const [toast, setToast] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCats, setExpandedCats] = useState({});
  const fileInputRef = useRef(null);

  const saveAll = (ex, cl) => { store("tp-exercises", ex); store("tp-clients", cl); };
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // ── Exercise management ──
  const addCategory = () => {
    if (!newCat.trim()) return;
    const u = { ...exercises, [newCat.trim()]: [] };
    setExercises(u); saveAll(u, clients); setNewCat(""); showToast("Kategorija dodana");
  };
  const addExercise = () => {
    if (!newEx.cat || !newEx.name.trim()) return;
    const u = { ...exercises, [newEx.cat]: [...(exercises[newEx.cat] || []), newEx.name.trim()] };
    setExercises(u); saveAll(u, clients); setNewEx({ cat: "", name: "" }); showToast("Vježba dodana");
  };
  const deleteExercise = (cat, idx) => {
    const u = { ...exercises, [cat]: exercises[cat].filter((_, i) => i !== idx) };
    setExercises(u); saveAll(u, clients);
  };
  const deleteCategory = cat => {
    const u = { ...exercises }; delete u[cat];
    setExercises(u); saveAll(u, clients); showToast("Kategorija obrisana");
  };

  // ── Client management ──
  const addClient = () => {
    if (!newClientName.trim()) return;
    const cl = [...clients, emptyClient(newClientName.trim())];
    setClients(cl); saveAll(exercises, cl); setNewClientName(""); showToast("Klijent dodan");
  };
  const deleteClient = idx => {
    if (!confirm(`Obrisati ${clients[idx].name}?`)) return;
    const cl = clients.filter((_, i) => i !== idx);
    setClients(cl); saveAll(exercises, cl);
    if (activeClient === idx) { setActiveClient(null); setView("clients"); }
    else if (activeClient > idx) setActiveClient(activeClient - 1);
  };
  const duplicateClient = idx => {
    const src = clients[idx];
    const cl = [...clients, { ...JSON.parse(JSON.stringify(src)), name: src.name + " (kopija)" }];
    setClients(cl); saveAll(exercises, cl); showToast("Klijent kopiran");
  };
  const updateSession = (ci, sk, path, val) => {
    const cl = JSON.parse(JSON.stringify(clients));
    const p = path.split("."); let o = cl[ci][sk];
    for (let i = 0; i < p.length - 1; i++) o = o[p[i]];
    o[p[p.length - 1]] = val;
    setClients(cl); saveAll(exercises, cl);
  };

  // ── Backup ──
  const exportJSON = () => {
    const data = JSON.stringify({ exercises, clients }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "program_builder_backup.json"; a.click(); URL.revokeObjectURL(a.href);
    showToast("Backup exportovan!");
  };
  const importJSON = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.exercises) setExercises(data.exercises);
        if (data.clients) { setClients(data.clients); setActiveClient(null); setView("clients"); }
        saveAll(data.exercises || exercises, data.clients || clients);
        showToast("Backup učitan!");
      } catch { showToast("Greška pri učitavanju fajla!"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  const resetAll = () => {
    if (!confirm("Resetovati SVE podatke na default? Ovo briše sve klijente i custom vježbe.")) return;
    setExercises(DEFAULT_EXERCISES); setClients([]); setActiveClient(null); setView("clients");
    saveAll(DEFAULT_EXERCISES, []); showToast("Resetovano na default");
  };

  const client = activeClient !== null ? clients[activeClient] : null;

  const navItems = [
    { k: "clients", l: "Klijenti" },
    { k: "exercises", l: "Baza vježbi" },
    { k: "backup", l: "Backup" },
    ...(client ? [{ k: "program", l: client.name }] : [])
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {toast && <div className="toast">{toast}</div>}

      {/* ── HEADER ── */}
      <div className="header">
        <div className="header-title">
          <span style={{ color: "#4472C4" }}>●</span>
          <span style={{ color: "#70AD47" }}>●</span>
          <span style={{ color: "#ED7D31" }}>●</span>
          {" "}CTR Program Builder
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {navItems.map(t => (
            <button key={t.k} onClick={() => setView(t.k)}
              className={`nav-btn ${view === t.k ? 'active' : 'inactive'}`}>{t.l}</button>
          ))}
        </div>
      </div>

      <div className="container">

        {/* ══════ CLIENTS ══════ */}
        {view === "clients" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              <input value={newClientName} onChange={e => setNewClientName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addClient()} placeholder="Ime klijenta (npr. Klijent 11)"
                className="input-primary" style={{ flex: "1 1 250px" }} />
              <button onClick={addClient} className="btn-blue">+ Dodaj klijenta</button>
            </div>

            {!clients.length && (
              <div style={{ textAlign: "center", padding: 60, color: "#999", fontSize: 15 }}>
                Nema klijenata. Dodaj prvog iznad.
              </div>
            )}

            <div className="client-grid">
              {clients.map((cl, i) => (
                <div key={i} className="card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{cl.name}</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => duplicateClient(i)} className="btn-sm btn-copy">Kopiraj</button>
                      <button onClick={() => deleteClient(i)} className="btn-sm btn-del">Obriši</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                    {SESSIONS.map(s => {
                      const t = cl[s.key];
                      const filled = [t.coreA.static, t.coreA.dynamic, t.coreB.static, t.coreB.dynamic,
                        t.ex1.a, t.ex1.b, t.ex2.a, t.ex2.b, t.ex3.a, t.ex3.b].filter(Boolean).length;
                      return <div key={s.key} className="progress-pill" style={{ background: s.light, color: s.color }}>{filled}/10</div>;
                    })}
                  </div>
                  <button onClick={() => { setActiveClient(i); setView("program"); }} className="btn-dark">
                    Uredi program →
                  </button>
                </div>
              ))}
            </div>

            {clients.length > 0 && (
              <div style={{ marginTop: 24, textAlign: "center" }}>
                <button onClick={() => generateExcel(clients)} className="btn-green"
                  style={{ padding: "12px 32px", fontSize: 15, fontWeight: 700, boxShadow: "0 2px 8px rgba(112,173,71,.3)" }}>
                  ⬇ Exportuj sve klijente u Excel
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════ EXERCISES ══════ */}
        {view === "exercises" && (
          <div>
            <div className="card" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}>
              <div style={{ flex: "1 1 200px" }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>Nova kategorija</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === "Enter" && addCategory()}
                    placeholder="Naziv kategorije" className="input-sm" style={{ flex: 1 }} />
                  <button onClick={addCategory} className="btn-blue" style={{ padding: "8px 14px", fontSize: 12 }}>+</button>
                </div>
              </div>
              <div style={{ flex: "2 1 350px" }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>Nova vježba</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <select value={newEx.cat} onChange={e => setNewEx({ ...newEx, cat: e.target.value })}
                    className="input-sm" style={{ minWidth: 140 }}>
                    <option value="">Kategorija...</option>
                    {Object.keys(exercises).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input value={newEx.name} onChange={e => setNewEx({ ...newEx, name: e.target.value })}
                    onKeyDown={e => e.key === "Enter" && addExercise()}
                    placeholder="Naziv vježbe" className="input-sm" style={{ flex: 1 }} />
                  <button onClick={addExercise} className="btn-green" style={{ padding: "8px 14px", fontSize: 12 }}>+</button>
                </div>
              </div>
            </div>

            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Pretraži vježbe..."
              className="input-primary" style={{ marginBottom: 12 }} />

            {Object.entries(exercises).map(([cat, exs]) => {
              const filtered = searchTerm ? exs.filter(e => e.toLowerCase().includes(searchTerm.toLowerCase())) : exs;
              if (searchTerm && !filtered.length) return null;
              const expanded = expandedCats[cat] || searchTerm;
              return (
                <div key={cat} className="card" style={{ marginBottom: 8, overflow: "hidden" }}>
                  <div onClick={() => setExpandedCats(p => ({ ...p, [cat]: !p[cat] }))} style={{
                    padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
                    cursor: "pointer", background: expanded ? "#f8f9fb" : "#fff"
                  }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{cat}</span>
                      <span style={{ fontSize: 12, color: "#999", marginLeft: 8 }}>({filtered.length})</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button onClick={e => { e.stopPropagation(); deleteCategory(cat); }}
                        style={{ fontSize: 11, color: "#c00", background: "none", border: "none", cursor: "pointer" }}>Obriši kat.</button>
                      <span style={{ fontSize: 12, color: "#999" }}>{expanded ? "▲" : "▼"}</span>
                    </div>
                  </div>
                  {expanded && (
                    <div style={{ padding: "4px 14px 10px" }}>
                      {filtered.map((ex, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
                          <span>{ex}</span>
                          <button onClick={() => deleteExercise(cat, exs.indexOf(ex))}
                            style={{ fontSize: 14, color: "#c00", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══════ BACKUP ══════ */}
        {view === "backup" && (
          <div style={{ maxWidth: 500, margin: "0 auto" }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 16, fontSize: 18 }}>Backup & Restore</h3>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 20, lineHeight: 1.6 }}>
                Exportuj backup fajl (.json) sa svim klijentima i vježbama. Importuj ga na bilo kojem uređaju da vratiš podatke.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={exportJSON} className="btn-blue" style={{ padding: 12, width: "100%" }}>
                  ⬇ Exportuj backup (JSON)
                </button>
                <button onClick={() => fileInputRef.current.click()} className="btn-green" style={{ padding: 12, width: "100%" }}>
                  ⬆ Importuj backup (JSON)
                </button>
                <input ref={fileInputRef} type="file" accept=".json" onChange={importJSON} style={{ display: "none" }} />
                <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "8px 0" }} />
                <button onClick={resetAll} style={{
                  padding: 12, background: "#fff", color: "#c00", border: "1px solid #fcc",
                  borderRadius: 8, fontWeight: 600, fontSize: 14, width: "100%"
                }}>⟲ Reset na default</button>
              </div>
            </div>
          </div>
        )}

        {/* ══════ PROGRAM EDITOR ══════ */}
        {view === "program" && client && (
          <div>
            <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input value={client.name} onChange={e => {
                const cl = [...clients]; cl[activeClient] = { ...cl[activeClient], name: e.target.value };
                setClients(cl); saveAll(exercises, cl);
              }} style={{
                fontSize: 20, fontWeight: 700, border: "none", background: "transparent",
                borderBottom: "2px solid #e0e3eb", padding: "4px 0", fontFamily: "inherit", flex: "1 1 200px"
              }} />
              <button onClick={() => generateExcel([client])} className="btn-green" style={{ padding: "8px 16px", fontSize: 13 }}>
                ⬇ Excel (ovaj klijent)
              </button>
              <button onClick={() => setView("clients")} style={{
                padding: "8px 16px", background: "rgba(0,0,0,.06)", color: "#333",
                border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13
              }}>← Nazad</button>
            </div>

            {SESSIONS.map((sess, si) => {
              const t = client[sess.key];
              return (
                <div key={sess.key} style={{ marginBottom: 20, animation: "slideIn .3s" }}>
                  <div className="session-header" style={{ background: sess.color }}>
                    TRENING {si + 1} — {sess.label}
                  </div>
                  <div className="session-body" style={{ border: `1px solid ${sess.color}30` }}>
                    {/* Core A */}
                    <div className="grid-core" style={{ marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center" }}>A</div>
                      <div>
                        <div className="label-sm">S (static)</div>
                        <ExerciseSelect exercises={exercises} value={t.coreA.static}
                          onChange={v => updateSession(activeClient, sess.key, "coreA.static", v)} placeholder="Core static..." />
                      </div>
                      <div>
                        <div className="label-sm">M (dynamic)</div>
                        <ExerciseSelect exercises={exercises} value={t.coreA.dynamic}
                          onChange={v => updateSession(activeClient, sess.key, "coreA.dynamic", v)} placeholder="Core dynamic..." />
                      </div>
                    </div>
                    {/* Core B */}
                    <div className="grid-core" style={{ marginBottom: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center" }}>B</div>
                      <div>
                        <div className="label-sm">S (static)</div>
                        <ExerciseSelect exercises={exercises} value={t.coreB.static}
                          onChange={v => updateSession(activeClient, sess.key, "coreB.static", v)} placeholder="Core static..." />
                      </div>
                      <div>
                        <div className="label-sm">M (dynamic)</div>
                        <ExerciseSelect exercises={exercises} value={t.coreB.dynamic}
                          onChange={v => updateSession(activeClient, sess.key, "coreB.dynamic", v)} placeholder="Core dynamic..." />
                      </div>
                    </div>
                    {/* Exercises */}
                    <div style={{ borderTop: "2px solid #f0f1f5", paddingTop: 12 }}>
                      {[["1", "ex1"], ["2", "ex2"], ["3", "ex3"]].map(([num, key]) => (
                        <div key={key} className="grid-exercises">
                          <div className="ex-num"><span>{num}a</span><span>{num}b</span></div>
                          <div>
                            <ExerciseSelect exercises={exercises} value={t[key].a}
                              onChange={v => updateSession(activeClient, sess.key, `${key}.a`, v)} placeholder={`${num}a vježba...`} />
                          </div>
                          <div>
                            <ExerciseSelect exercises={exercises} value={t[key].b}
                              onChange={v => updateSession(activeClient, sess.key, `${key}.b`, v)} placeholder={`${num}b vježba...`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
