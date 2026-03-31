import { useState, useRef } from 'react';

export default function ExerciseSelect({ value, onChange, exercises, placeholder }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const grouped = {};
  Object.entries(exercises).forEach(([cat, exs]) => {
    const f = exs.filter(e => !filter || e.toLowerCase().includes(filter.toLowerCase()));
    if (f.length) grouped[cat] = f;
  });

  return (
    <div style={{ position: "relative", flex: 1 }}>
      {open && <div className="dropdown-overlay" onClick={() => { setOpen(false); setFilter(""); }} />}
      <div onClick={() => setOpen(!open)} style={{
        padding: "7px 10px", border: "1px solid #d0d5dd", borderRadius: 6, cursor: "pointer", fontSize: 13,
        minHeight: 32, display: "flex", alignItems: "center", justifyContent: "space-between",
        background: value ? "#fff" : "#fafafa", color: value ? "#1a1a2e" : "#999"
      }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "90%" }}>
          {value || placeholder || "Odaberi vježbu..."}
        </span>
        <span style={{ fontSize: 10, color: "#999" }}>▼</span>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
          background: "#fff", border: "1px solid #d0d5dd", borderRadius: 6,
          boxShadow: "0 8px 24px rgba(0,0,0,.12)", maxHeight: 280, overflow: "hidden",
          display: "flex", flexDirection: "column", minWidth: 280
        }}>
          <input autoFocus value={filter} onChange={e => setFilter(e.target.value)}
            placeholder="Pretraži..." style={{
              padding: "8px 10px", border: "none", borderBottom: "1px solid #eee",
              outline: "none", fontSize: 13, fontFamily: "inherit"
            }} />
          <div style={{ overflowY: "auto", maxHeight: 230 }}>
            <div onClick={() => { onChange(""); setOpen(false); setFilter(""); }}
              style={{ padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "#999", borderBottom: "1px solid #f5f5f5" }}>
              — Ukloni —
            </div>
            {Object.entries(grouped).map(([cat, exs]) => (
              <div key={cat}>
                <div style={{
                  padding: "5px 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  color: "#8a8fa3", background: "#f8f9fb", letterSpacing: .8, position: "sticky", top: 0
                }}>{cat}</div>
                {exs.map(ex => (
                  <div key={ex} onClick={() => { onChange(ex); setOpen(false); setFilter(""); }}
                    style={{
                      padding: "6px 14px", cursor: "pointer", fontSize: 13,
                      background: value === ex ? "#e8f0fe" : "transparent",
                      fontWeight: value === ex ? 600 : 400
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
                    onMouseLeave={e => e.currentTarget.style.background = value === ex ? "#e8f0fe" : "transparent"}
                  >{ex}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
