"use client";
import { createContext, useContext, useState, useCallback } from "react";

const Ctx = createContext(() => {});

const COLORS = {
  success: "#16a34a",
  error:   "#dc2626",
  info:    "#2563eb",
  warning: "#d97706",
};
const ICONS = { success: "✓", error: "✕", info: "ℹ", warning: "⚠" };

function ToastItem({ t, onDismiss }) {
  return (
    <div style={{
      background: COLORS[t.type] || COLORS.success,
      color: "white",
      padding: "12px 16px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      minWidth: "240px",
      maxWidth: "380px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      animation: "slideIn 0.2s ease",
    }}>
      <span style={{ fontSize: "16px", fontWeight: "bold", flexShrink: 0 }}>
        {ICONS[t.type] || ICONS.success}
      </span>
      <span style={{ flex: 1, fontSize: "14px", lineHeight: 1.4 }}>{t.msg}</span>
      <button onClick={onDismiss} style={{
        background: "none", border: "none", color: "rgba(255,255,255,0.75)",
        cursor: "pointer", fontSize: "18px", padding: 0, flexShrink: 0,
      }}>✕</button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [list, setList] = useState([]);

  const toast = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setList(p => [...p, { id, msg, type }]);
    setTimeout(() => setList(p => p.filter(t => t.id !== id)), 4500);
  }, []);

  return (
    <Ctx.Provider value={toast}>
      {children}
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <div style={{
        position: "fixed", bottom: "24px", right: "24px",
        zIndex: 9999, display: "flex", flexDirection: "column", gap: "8px",
        pointerEvents: "none",
      }}>
        {list.map(t => (
          <div key={t.id} style={{ pointerEvents: "auto" }}>
            <ToastItem t={t} onDismiss={() => setList(p => p.filter(x => x.id !== t.id))} />
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
