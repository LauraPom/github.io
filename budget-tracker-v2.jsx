import React, { useEffect, useState, useCallback, useRef } from "react";
import { Settings, Plus, RotateCcw, Trash2, Home, LayoutGrid, X, Check } from "lucide-react";

const STORAGE_KEY = "budget-tracker-state-v2";

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function defaultState() {
  const now = new Date();
  return {
    monthLabel: `${MONTHS_FR[now.getMonth()]} ${now.getFullYear()}`,
    budgetMensuel: 900,
    objectifMax: 750,
    defaultIncrement: 5,
    mascot: "blob",
    spent: 0,
    presets: [1, 5, 10, 20],
    history: [],
  };
}

function fmt(n) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n));
}

function mood(spent, objectifMax) {
  const ratio = objectifMax > 0 ? spent / objectifMax : 0;
  if (ratio < 0.7) return { key: "happy", color: "#6FE7C4", dark: "#1E7A5F", text: "Ça roule tranquille ✌️" };
  if (ratio < 1) return { key: "neutral", color: "#FFD166", dark: "#8A6A1A", text: "Ça se resserre un peu 👀" };
  return { key: "worried", color: "#FF6B6B", dark: "#8A2E2E", text: "Aïe, ça déborde ! 🫠" };
}

function BlobFace({ moodKey, size = 40, color }) {
  const eyesY = 18;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="blob-face">
      <circle cx="20" cy="20" r="19" fill={color} />
      <circle cx="14" cy={eyesY} r="2.6" fill="#241B3A" />
      <circle cx="26" cy={eyesY} r="2.6" fill="#241B3A" />
      {moodKey === "happy" && (
        <path d="M12 25 Q20 33 28 25" stroke="#241B3A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      )}
      {moodKey === "neutral" && (
        <path d="M13 27 Q20 27 27 27" stroke="#241B3A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      )}
      {moodKey === "worried" && (
        <path d="M12 29 Q20 22 28 29" stroke="#241B3A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      )}
      <style>{`
        .blob-face { animation: bobble 2.4s ease-in-out infinite; }
        @keyframes bobble {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(-2deg); }
        }
      `}</style>
    </svg>
  );
}

function CatFace({ moodKey, size = 40 }) {
  const fur = "#FBD9B4";
  const ear = moodKey === "worried" ? -50 : moodKey === "neutral" ? -12 : 0;
  const eyeR = moodKey === "worried" ? 3.4 : 4.2;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="blob-face">
      <g style={{ transformOrigin: "10px 11px", transform: `rotate(${ear}deg)` }}>
        <path d="M4 15 L8 3 L16 13 Z" fill={fur} />
        <path d="M6.5 12.5 L9 6 L13 11.5 Z" fill="#FFB6C1" />
      </g>
      <g style={{ transformOrigin: "30px 11px", transform: `rotate(${-ear}deg)` }}>
        <path d="M36 15 L32 3 L24 13 Z" fill={fur} />
        <path d="M33.5 12.5 L31 6 L27 11.5 Z" fill="#FFB6C1" />
      </g>
      <circle cx="20" cy="22" r="17" fill={fur} />
      <circle cx="12" cy="26" r="3.4" fill="#FFB6C1" opacity="0.6" />
      <circle cx="28" cy="26" r="3.4" fill="#FFB6C1" opacity="0.6" />
      {moodKey === "happy" ? (
        <>
          <path d="M10.5 19 Q13.5 15.5 16.5 19" stroke="#241B3A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M23.5 19 Q26.5 15.5 29.5 19" stroke="#241B3A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="14" cy="20" r={eyeR} fill="#241B3A" />
          <circle cx="26" cy="20" r={eyeR} fill="#241B3A" />
          <circle cx="15.1" cy="18.8" r="1.1" fill="#FFF6F0" />
          <circle cx="27.1" cy="18.8" r="1.1" fill="#FFF6F0" />
        </>
      )}
      {moodKey === "worried" && (
        <>
          <path d="M10.5 16 L15.5 17.8" stroke="#241B3A" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M29.5 16 L24.5 17.8" stroke="#241B3A" strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      <path d="M20 24 L18.6 25.8 L21.4 25.8 Z" fill="#E0916B" />
      {moodKey === "happy" && (
        <path d="M15 27.5 Q20 31 25 27.5" stroke="#241B3A" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      {moodKey === "neutral" && (
        <path d="M16 28 Q20 29.4 24 28" stroke="#241B3A" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      {moodKey === "worried" && (
        <path d="M16 29.5 Q20 26.5 24 29.5" stroke="#241B3A" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      <g stroke="#C99B6E" strokeWidth="1.1" strokeLinecap="round">
        <line x1="6" y1="24" x2="14" y2="25" />
        <line x1="6" y1="27.5" x2="14" y2="27" />
        <line x1="34" y1="24" x2="26" y2="25" />
        <line x1="34" y1="27.5" x2="26" y2="27" />
      </g>
      <style>{`
        .blob-face { animation: bobble 2.4s ease-in-out infinite; }
        @keyframes bobble {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(-2deg); }
        }
      `}</style>
    </svg>
  );
}

function AppleFace({ moodKey, size = 40 }) {
  const skin = moodKey === "happy" ? "#8DE39C" : moodKey === "neutral" ? "#FFD166" : "#C97B4A";
  const leafAngle = moodKey === "happy" ? -20 : moodKey === "neutral" ? 0 : 35;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="blob-face">
      <rect x="18.5" y="1" width="3" height="8" rx="1.4" fill="#7A5230" />
      <ellipse
        cx="23"
        cy="6"
        rx="6.5"
        ry="3.2"
        fill="#3E8560"
        style={{ transformOrigin: "20px 4px", transform: `rotate(${leafAngle}deg)`, transition: "transform 0.4s ease" }}
      />
      <path
        d="M20 8 Q13 3 8 10 Q3 16 4 24 Q5 35 20 38 Q35 35 36 24 Q37 16 32 10 Q27 3 20 8 Z"
        fill={skin}
        style={{ transition: "fill 0.4s ease" }}
      />
      {moodKey === "worried" && (
        <>
          <ellipse cx="12" cy="24" rx="2.6" ry="2" fill="#8A4A2E" opacity="0.5" />
          <ellipse cx="27" cy="29" rx="2" ry="1.6" fill="#8A4A2E" opacity="0.5" />
        </>
      )}
      <style>{`
        .blob-face { animation: bobble 2.4s ease-in-out infinite; }
        @keyframes bobble {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(-2deg); }
        }
      `}</style>
    </svg>
  );
}

function PlantFace({ moodKey, size = 40 }) {
  const leafColor = moodKey === "happy" ? "#6FE7C4" : moodKey === "neutral" ? "#FFD166" : "#D97757";
  const angle = moodKey === "happy" ? 35 : moodKey === "neutral" ? 58 : 82;
  const leaf = (x, y, rot, flip) => (
    <ellipse
      cx={x}
      cy={y}
      rx="7"
      ry="3.4"
      fill={leafColor}
      style={{
        transformOrigin: `${x}px ${y}px`,
        transform: `rotate(${flip ? angle : -angle}deg)`,
        transition: "transform 0.4s ease, fill 0.4s ease",
      }}
    />
  );
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="plant-face">
      <line x1="20" y1="27" x2="20" y2="13" stroke="#3E8560" strokeWidth="2.4" strokeLinecap="round" />
      {leaf(13, 13, angle, false)}
      {leaf(27, 13, angle, true)}
      {leaf(20, 8, angle * 0.6, false)}
      {moodKey === "happy" && <circle cx="20" cy="5" r="2.6" fill="#FF8FE0" />}
      <rect x="10" y="27" width="20" height="12" rx="4" fill="#C97B4A" />
      <rect x="10" y="27" width="20" height="4" rx="2" fill="#B96A3C" />
      <style>{`
        .plant-face { animation: bobble 2.4s ease-in-out infinite; }
        @keyframes bobble {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px); }
        }
      `}</style>
    </svg>
  );
}

function Mascot({ type, moodKey, size = 40, color }) {
  if (type === "chat") return <CatFace moodKey={moodKey} size={size} />;
  if (type === "plante") return <PlantFace moodKey={moodKey} size={size} />;
  if (type === "pomme") return <AppleFace moodKey={moodKey} size={size} />;
  return <BlobFace moodKey={moodKey} size={size} color={color} />;
}

function BigNumber({ value, size = 56 }) {
  return (
    <span
      key={Math.round(value)}
      style={{
        fontFamily: "'Baloo 2', 'Nunito', ui-rounded, system-ui, sans-serif",
        fontWeight: 700,
        fontSize: size,
        color: "#FFF6F0",
        display: "inline-block",
        animation: "popNum 0.35s cubic-bezier(.34,1.56,.64,1)",
        letterSpacing: "-1px",
      }}
    >
      {fmt(value)}
      <style>{`
        @keyframes popNum {
          0% { transform: scale(0.7); opacity: 0.4; }
          60% { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </span>
  );
}

function clampPct(p) {
  return Math.min(96, Math.max(4, p * 100));
}

function JarMeter({ spent, objectifMax, budgetMensuel, color }) {
  const scaleMax = Math.max(objectifMax, budgetMensuel, spent, 1);
  const pct = Math.min(1, spent / scaleMax);
  const objectifPct = Math.min(1, objectifMax / scaleMax);
  const budgetPct = Math.min(1, budgetMensuel / scaleMax);
  return (
    <div style={{ position: "relative", paddingTop: 20 }}>
      <div
        className="jar-tag"
        style={{ left: `${clampPct(budgetPct)}%`, color: "#FFF6F0" }}
      >
        budget
      </div>
      <div className="jar">
        <div className="jar-liquid" style={{ width: `${pct * 100}%`, background: color }} />
        <div className="jar-marker jar-marker-objectif" style={{ left: `${objectifPct * 100}%` }} />
        <div className="jar-marker jar-marker-budget" style={{ left: `${budgetPct * 100}%` }} />
      </div>
      <style>{`
        .jar {
          position: relative;
          width: 100%;
          height: 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          overflow: hidden;
          box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);
        }
        .jar-liquid {
          position: absolute; top: 0; bottom: 0; left: 0;
          border-radius: 999px;
          transition: width 0.5s cubic-bezier(.34,1.56,.64,1), background 0.4s ease;
        }
        .jar-marker {
          position: absolute; top: -3px; bottom: -3px; width: 2px;
          transform: translateX(-1px);
        }
        .jar-marker-objectif {
          background: rgba(255,246,240,0.35);
        }
        .jar-marker-budget {
          background: #FFF6F0;
          box-shadow: 0 0 6px rgba(255,246,240,0.7);
        }
        .jar-tag {
          position: absolute;
          top: 0;
          transform: translateX(-50%);
          font-family: 'Nunito', sans-serif;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}

function Flyups({ items }) {
  return (
    <>
      {items.map((f) => (
        <span
          key={f.id}
          style={{
            position: "absolute",
            left: "50%",
            top: "40%",
            transform: "translateX(-50%)",
            fontFamily: "'Baloo 2', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "#FFF6F0",
            pointerEvents: "none",
            animation: "flyUp 0.9s ease-out forwards",
          }}
        >
          +{fmt(f.amount)}
        </span>
      ))}
      <style>{`
        @keyframes flyUp {
          0% { opacity: 0; transform: translate(-50%, 0) scale(0.8); }
          20% { opacity: 1; transform: translate(-50%, -6px) scale(1.1); }
          100% { opacity: 0; transform: translate(-50%, -46px) scale(1); }
        }
      `}</style>
    </>
  );
}

function PhoneFrame({ children }) {
  return (
    <div className="phone">
      <div className="notch" />
      <div className="statusbar">
        <span>9:41</span>
        <span>100%</span>
      </div>
      <div className="phone-content">{children}</div>
      <style>{`
        .phone {
          width: 320px; max-width: 100%;
          background: #1a1330;
          border-radius: 34px;
          border: 6px solid #0d0819;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          position: relative;
          padding-bottom: 10px;
          margin: 0 auto;
        }
        .notch { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); width: 90px; height: 18px; background: #0d0819; border-radius: 10px; }
        .statusbar { display: flex; justify-content: space-between; font-size: 11px; color: #C9BCE0; font-family: 'Nunito', system-ui, sans-serif; padding: 14px 22px 4px 22px; }
        .phone-content { padding: 10px 16px 16px 16px; min-height: 460px; }
      `}</style>
    </div>
  );
}

export default function BudgetTrackerApp() {
  const [state, setState] = useState(null);
  const [tab, setTab] = useState("widget");
  const [showSettings, setShowSettings] = useState(false);
  const [newPreset, setNewPreset] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [flyups, setFlyups] = useState([]);
  const [pulse, setPulse] = useState(0);
  const flyupId = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        setState(res && res.value ? JSON.parse(res.value) : defaultState());
      } catch (e) {
        setState(defaultState());
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(next), false);
    } catch (e) {
      /* best-effort */
    }
  }, []);

  const updateState = useCallback(
    (updater) => {
      setState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        persist(next);
        return next;
      });
    },
    [persist]
  );

  if (!state) {
    return <div style={{ padding: 40, color: "#FFF6F0", fontFamily: "sans-serif" }}>Chargement…</div>;
  }

  const addSpend = (amount, withFx) => {
    if (!amount || amount <= 0) return;
    updateState((prev) => ({
      ...prev,
      spent: prev.spent + amount,
      history: [{ id: Date.now(), amount, ts: Date.now() }, ...prev.history].slice(0, 100),
    }));
    if (withFx) {
      const id = ++flyupId.current;
      setFlyups((f) => [...f, { id, amount }]);
      setPulse((p) => p + 1);
      setTimeout(() => setFlyups((f) => f.filter((x) => x.id !== id)), 900);
    }
  };

  const removeHistoryEntry = (id) => {
    updateState((prev) => {
      const entry = prev.history.find((h) => h.id === id);
      if (!entry) return prev;
      return { ...prev, spent: Math.max(0, prev.spent - entry.amount), history: prev.history.filter((h) => h.id !== id) };
    });
  };

  const resetMonth = () => {
    updateState((prev) => {
      const now = new Date();
      return { ...prev, monthLabel: `${MONTHS_FR[now.getMonth()]} ${now.getFullYear()}`, spent: 0, history: [] };
    });
  };

  const addPreset = () => {
    const v = parseFloat(newPreset);
    if (!v || v <= 0 || state.presets.includes(v)) return;
    updateState((prev) => ({ ...prev, presets: [...prev.presets, v].sort((a, b) => a - b).slice(0, 6) }));
    setNewPreset("");
  };
  const removePreset = (v) => updateState((prev) => ({ ...prev, presets: prev.presets.filter((p) => p !== v) }));

  const m = mood(state.spent, state.objectifMax);

  const colors = {
    bg: "#241B3A",
    panel: "#34275A",
    panel2: "#3E2F68",
    input: "#2A2050",
    text: "#FFF6F0",
    muted: "#C9BCE0",
    accent: "#FF8FE0",
  };

  const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700&family=Nunito:wght@400;600;700&display=swap');`;

  const WidgetTile = ({ size = 96 }) => (
    <div
      onClick={() => addSpend(state.defaultIncrement, true)}
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: `linear-gradient(155deg, ${m.color}, ${m.dark})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
        animation: pulse ? "tilePulse 0.35s ease" : "none",
        overflow: "visible",
      }}
      key={"tile-" + pulse}
    >
      <span
        style={{
          fontFamily: "'Baloo 2', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: size * 0.32,
          color: "#241B3A",
        }}
      >
        {fmt(state.spent)}
      </span>
      <Flyups items={flyups} />
      <style>{`
        @keyframes tilePulse {
          0% { transform: scale(1); }
          40% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );

  return (
    <div
      style={{
        background: `radial-gradient(circle at 20% 0%, #3A2A64 0%, ${colors.bg} 55%)`,
        minHeight: "100%",
        padding: "24px 12px",
        fontFamily: "'Nunito', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
      }}
    >
      <style>{fontImport}</style>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: "3px", color: colors.accent, textTransform: "uppercase", fontWeight: 700 }}>
          Prototype
        </div>
        <div style={{ fontSize: 22, color: colors.text, fontWeight: 700, fontFamily: "'Baloo 2', sans-serif" }}>
          Buddy
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, background: colors.panel, padding: 4, borderRadius: 14 }}>
        {[
          { id: "widget", label: "Écran d'accueil", icon: Home },
          { id: "app", label: "Application", icon: LayoutGrid },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 10, border: "none",
              background: tab === id ? colors.accent : "transparent",
              color: tab === id ? "#241B3A" : colors.muted,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {tab === "widget" && (
        <PhoneFrame>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, padding: "4px" }}>
            <div style={{ textAlign: "center" }}>
              <WidgetTile size={54} />
            </div>
            {["Photos", "Mail", "Notes", "Météo", "Musique", "Cam", "Plans"].map((name, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: colors.panel2, margin: "0 auto 4px" }} />
                <span style={{ fontSize: 9, color: colors.muted }}>{name}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: colors.muted, lineHeight: 1.5 }}>
            Widget 1×1 : un tap ajoute<br />
            <strong style={{ color: colors.text }}>+{fmt(state.defaultIncrement)}</strong> automatiquement
          </div>
        </PhoneFrame>
      )}

      {tab === "app" && (
        <div style={{ width: 340, maxWidth: "100%" }}>
          <div style={{ background: colors.panel, borderRadius: 22, padding: 22, marginBottom: 12, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: colors.muted, fontWeight: 700 }}>{state.monthLabel}</span>
              <button
                onClick={() => setShowSettings(true)}
                style={{ background: colors.panel2, border: "none", borderRadius: 10, padding: 8, cursor: "pointer" }}
              >
                <Settings size={15} color={colors.muted} />
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 4px" }}>
              <Mascot type={state.mascot || "blob"} moodKey={m.key} size={64} color={m.color} />
            </div>
            <BigNumber value={state.spent} size={48} />

            <div style={{ margin: "22px 0 6px" }}>
              <JarMeter spent={state.spent} objectifMax={state.objectifMax} budgetMensuel={state.budgetMensuel} color={m.color} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: colors.muted, fontFamily: "'Nunito', sans-serif" }}>
              <span>0</span>
              <span>objectif {fmt(state.objectifMax)}</span>
            </div>

            <div style={{ marginTop: 12, fontSize: 13, color: colors.text, fontWeight: 700 }}>{m.text}</div>
          </div>

          <div style={{ background: colors.panel, borderRadius: 22, padding: 20, marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: colors.muted, marginBottom: 10, fontWeight: 700 }}>Ajouter une dépense</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {state.presets.map((p) => (
                <button
                  key={p}
                  onClick={() => addSpend(p, false)}
                  style={{
                    flex: "1 1 20%", background: colors.input, border: "none", borderRadius: 12,
                    padding: "10px 0", color: colors.text, fontFamily: "'Baloo 2', sans-serif",
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  +{p}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Autre montant"
                type="number"
                style={{ flex: 1, background: colors.input, border: "none", borderRadius: 12, padding: "10px 12px", color: colors.text, fontFamily: "'Nunito', sans-serif", fontSize: 13 }}
              />
              <button
                onClick={() => {
                  const v = parseFloat(customAmount);
                  if (v > 0) {
                    addSpend(v, false);
                    setCustomAmount("");
                  }
                }}
                style={{ background: colors.accent, border: "none", borderRadius: 12, padding: "0 14px", color: "#241B3A", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div style={{ background: colors.panel, borderRadius: 22, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: colors.muted, fontWeight: 700 }}>Historique</span>
              <button onClick={resetMonth} style={{ display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "none", color: colors.muted, fontSize: 11, cursor: "pointer" }}>
                <RotateCcw size={12} /> Nouveau mois
              </button>
            </div>
            {state.history.length === 0 ? (
              <div style={{ fontSize: 12, color: colors.muted, textAlign: "center", padding: "16px 0" }}>
                Rien pour l'instant, allez-y molo 🌱
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                {state.history.map((h) => (
                  <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: colors.input, borderRadius: 10 }}>
                    <span style={{ fontSize: 11, color: colors.muted }}>
                      {new Date(h.ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span style={{ fontSize: 14, color: colors.text, fontFamily: "'Baloo 2', sans-serif", fontWeight: 700 }}>+{fmt(h.amount)}</span>
                    <button onClick={() => removeHistoryEntry(h.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: colors.muted }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showSettings && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(20,12,40,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
          <div style={{ background: colors.panel, borderRadius: 22, padding: 22, width: 320, maxWidth: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 15, color: colors.text, fontWeight: 700, fontFamily: "'Baloo 2', sans-serif" }}>Réglages</span>
              <button onClick={() => setShowSettings(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X size={18} color={colors.muted} />
              </button>
            </div>

            <label style={{ fontSize: 11, color: colors.muted, fontWeight: 700 }}>Budget mensuel</label>
            <input
              type="number"
              value={state.budgetMensuel}
              onChange={(e) => updateState((prev) => ({ ...prev, budgetMensuel: parseFloat(e.target.value) || 0 }))}
              style={{ width: "100%", marginTop: 6, marginBottom: 14, background: colors.input, border: "none", borderRadius: 12, padding: "10px 12px", color: colors.text, fontSize: 13 }}
            />

            <label style={{ fontSize: 11, color: colors.muted, fontWeight: 700 }}>Objectif de dépense max</label>
            <input
              type="number"
              value={state.objectifMax}
              onChange={(e) => updateState((prev) => ({ ...prev, objectifMax: parseFloat(e.target.value) || 0 }))}
              style={{ width: "100%", marginTop: 6, marginBottom: 14, background: colors.input, border: "none", borderRadius: 12, padding: "10px 12px", color: colors.text, fontSize: 13 }}
            />

            <label style={{ fontSize: 11, color: colors.muted, fontWeight: 700 }}>Montant du widget (1 tap)</label>
            <input
              type="number"
              value={state.defaultIncrement}
              onChange={(e) => updateState((prev) => ({ ...prev, defaultIncrement: parseFloat(e.target.value) || 0 }))}
              style={{ width: "100%", marginTop: 6, marginBottom: 16, background: colors.input, border: "none", borderRadius: 12, padding: "10px 12px", color: colors.text, fontSize: 13 }}
            />

            <label style={{ fontSize: 11, color: colors.muted, fontWeight: 700 }}>Personnage</label>
            <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 16 }}>
              {[
                { id: "blob", label: "Blob" },
                { id: "chat", label: "Chaton" },
                { id: "plante", label: "Plante" },
                { id: "pomme", label: "Pomme" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateState((prev) => ({ ...prev, mascot: opt.id }))}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    padding: "10px 4px",
                    borderRadius: 14,
                    border: (state.mascot || "blob") === opt.id ? `2px solid ${colors.accent}` : "2px solid transparent",
                    background: colors.input,
                    cursor: "pointer",
                  }}
                >
                  <Mascot type={opt.id} moodKey={m.key} size={34} color={m.color} />
                  <span style={{ fontSize: 10, color: colors.text, fontWeight: 700 }}>{opt.label}</span>
                </button>
              ))}
            </div>

            <label style={{ fontSize: 11, color: colors.muted, fontWeight: 700 }}>Boutons rapides (dans l'app)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, marginBottom: 10 }}>
              {state.presets.map((p) => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 6, background: colors.input, borderRadius: 10, padding: "6px 8px" }}>
                  <span style={{ fontSize: 12, color: colors.text, fontWeight: 700 }}>+{p}</span>
                  <button onClick={() => removePreset(p)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                    <X size={11} color={colors.muted} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number"
                value={newPreset}
                onChange={(e) => setNewPreset(e.target.value)}
                placeholder="Nouveau montant"
                style={{ flex: 1, background: colors.input, border: "none", borderRadius: 12, padding: "8px 12px", color: colors.text, fontSize: 12 }}
              />
              <button onClick={addPreset} style={{ background: colors.accent, border: "none", borderRadius: 12, padding: "0 12px", color: "#241B3A", cursor: "pointer" }}>
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              style={{
                width: "100%", marginTop: 18, background: "#6FE7C4", border: "none", borderRadius: 12,
                padding: "10px 0", color: "#241B3A", fontWeight: 700, fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Nunito', sans-serif",
              }}
            >
              <Check size={14} /> Terminé
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
