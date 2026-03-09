import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useAccess } from "./AccessContext";
import { lsGetWishlist } from "./FlashCard";
import { useStockModal } from "./StockModal";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

const GOLD   = "#D4A017";
const NAVY   = "#0D1B2A";
const RED    = "#C0392B";

function SectionHeader({ label }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.32em",
      color: "rgba(212,160,23,0.55)", marginBottom: 12, marginTop: 8,
      fontFamily: "'DM Sans',sans-serif" }}>
      {label}
    </div>
  );
}

function Row({ icon, label, sub, onClick, color = "#c8dae8", danger = false, rightEl }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "12px 16px", borderRadius: 10, cursor: onClick ? "pointer" : "default",
        background: hov && onClick ? "rgba(255,255,255,0.04)" : "transparent",
        transition: "background .15s",
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: danger ? RED : color,
          fontFamily: "'DM Sans',sans-serif" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#3d5570", marginTop: 1 }}>{sub}</div>}
      </div>
      {rightEl && <div style={{ flexShrink: 0 }}>{rightEl}</div>}
      {onClick && !rightEl && <span style={{ color: "#3d5570", fontSize: 16 }}>›</span>}
    </div>
  );
}

function UsageBar({ label, used, total, color = GOLD }) {
  const pct = Math.min((used / total) * 100, 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: pct >= 100 ? RED : color }}>
          {used} / {total} used
        </span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: pct >= 100 ? RED : color,
          borderRadius: 99, transition: "width .6s ease" }}/>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate               = useNavigate();
  const { user, signOut }      = useAuth();
  const { userData, isPaid }   = useAccess();
  const { openModal }          = useStockModal();
  const [wishlist, setWishlist] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting,  setDeleting]    = useState(false);
  const [visible,   setVisible]     = useState(false);

  useEffect(() => {
    if (!user) { navigate("/signup"); return; }
    window.scrollTo(0, 0);
    setTimeout(() => setVisible(true), 60);
    setWishlist(lsGetWishlist());
  }, [user, navigate]);

  const fu = (d = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(16px)",
    transition: `opacity .6s ease ${d}ms, transform .6s cubic-bezier(.22,1,.36,1) ${d}ms`,
  });

  const reportsViewed = userData?.usage?.reportsViewed?.length ?? 0;
  const dcfOpened     = userData?.usage?.dcfOpened?.length     ?? 0;

  const joinedAt = user?.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      if (user?.email) {
        const userKey = user.email.toLowerCase().replace(/[.#$[\]]/g, "_");
        await deleteDoc(doc(db, "users", userKey));
      }
    } catch(e) { console.warn("Delete error:", e); }
    signOut();
    navigate("/");
  }

  if (!user) return null;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <style>{`
        @media(max-width:640px){ .vc-profile-root { padding-top: 120px !important; } }
      `}</style>

      <div className="vc-profile-root" style={{
        background: `linear-gradient(160deg, ${NAVY} 0%, #060e1a 100%)`,
        minHeight: "100vh", color: "#e2e8f0",
        fontFamily: "'DM Sans', sans-serif", paddingTop: 96,
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 18px 80px" }}>

          {/* ── PROFILE CARD ── */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(212,160,23,0.18)`,
            borderRadius: 16, padding: "22px 20px", marginBottom: 12, ...fu(0) }}>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              {/* Avatar */}
              <div style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                background: `linear-gradient(135deg, rgba(212,160,23,0.3), rgba(212,160,23,0.08))`,
                border: `2px solid rgba(212,160,23,0.3)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 900, color: GOLD,
                fontFamily: "'Playfair Display',serif" }}>
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#fff",
                    fontFamily: "'Playfair Display',serif" }}>
                    {user.name}
                  </div>
                  {isPaid ? (
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "1.2px",
                      background: `linear-gradient(135deg, ${GOLD}, #f8dc72)`,
                      color: NAVY, padding: "3px 9px", borderRadius: 99 }}>
                      ★ PREMIUM
                    </span>
                  ) : (
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1px",
                      color: "rgba(212,160,23,0.5)",
                      border: "1px solid rgba(212,160,23,0.25)", padding: "3px 9px", borderRadius: 99 }}>
                      FREE
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#5a7a94", marginTop: 3 }}>{user.email}</div>
                <div style={{ fontSize: 11, color: "#3d5570", marginTop: 2 }}>Member since {joinedAt}</div>
                {isPaid && userData?.paidAt && (
                  <div style={{ fontSize: 11, color: "rgba(39,174,96,0.7)", marginTop: 2 }}>
                    Premium since {new Date(userData.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── MY RESEARCH ── */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: "16px 16px 8px", marginBottom: 12, ...fu(80) }}>
            <SectionHeader label="MY RESEARCH" />
            <UsageBar label="Reports viewed" used={reportsViewed} total={isPaid ? reportsViewed || 1 : 3} color={GOLD}/>
            <UsageBar label="DCF models opened" used={dcfOpened} total={isPaid ? dcfOpened || 1 : 3} color="#4FC3F7"/>
            <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 4 }}>
              <Link to="/research-universe" style={{
                flex: 1, padding: "9px", borderRadius: 8, textAlign: "center",
                background: "rgba(212,160,23,0.08)", border: "1px solid rgba(212,160,23,0.2)",
                color: GOLD, fontSize: 11, fontWeight: 800, letterSpacing: "0.5px",
                textDecoration: "none", fontFamily: "'DM Sans',sans-serif",
              }}>
                VIEW ALL REPORTS →
              </Link>
              <Link to="/research-universe" onClick={e => { e.preventDefault(); navigate("/dcf/BAJFINANCE"); }} style={{
                flex: 1, padding: "9px", borderRadius: 8, textAlign: "center",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#94a3b8", fontSize: 11, fontWeight: 800, letterSpacing: "0.5px",
                textDecoration: "none", fontFamily: "'DM Sans',sans-serif",
              }}>
                BUILD DCF →
              </Link>
            </div>
          </div>

          {/* ── SAVED DCF MODELS ── */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: "16px", marginBottom: 12, ...fu(120) }}>
            <SectionHeader label="MY SAVED DCF MODELS" />
            <div style={{ fontSize: 12, color: "#3d5570", textAlign: "center", padding: "12px 0",
              lineHeight: 1.6 }}>
              📂 Coming soon — save and revisit your DCF assumptions
            </div>
          </div>

          {/* ── MY PORTFOLIO ── */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: "8px 4px", marginBottom: 12, ...fu(160) }}>
            <div style={{ padding: "0 12px" }}><SectionHeader label="MY PORTFOLIO" /></div>
            <Row icon="⚖️" label="Portfolio Simulator" sub="Build, weight and backtest your portfolio"
              onClick={() => navigate("/my-portfolio")}/>
          </div>

          {/* ── MY WISHLIST ── */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: "8px 4px", marginBottom: 12, ...fu(200) }}>
            <div style={{ padding: "0 12px" }}><SectionHeader label="MY WISHLIST" /></div>
            {wishlist.length === 0 ? (
              <div style={{ fontSize: 12, color: "#3d5570", padding: "8px 16px 12px", lineHeight: 1.6 }}>
                ❤️ No stocks saved yet — tap the heart icon on any stock
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "4px 16px 12px" }}>
                {wishlist.map(ticker => (
                  <button key={ticker} onClick={() => openModal(ticker)} style={{
                    padding: "6px 14px", borderRadius: 99, border: `1px solid rgba(212,160,23,0.25)`,
                    background: "rgba(212,160,23,0.06)", color: GOLD,
                    fontSize: 12, fontWeight: 800, cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.5px",
                  }}>
                    {ticker}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── ACCOUNT ── */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: "8px 4px", marginBottom: 12, ...fu(240) }}>
            <div style={{ padding: "0 12px" }}><SectionHeader label="MY ACCOUNT" /></div>

            {!isPaid && (
              <Row icon="⚡" label="Upgrade to Premium"
                sub="Unlock all reports, DCF models & unlimited portfolio runs"
                color={GOLD}
                onClick={() => navigate("/upgrade")}
                rightEl={
                  <span style={{ fontSize: 10, fontWeight: 800, background: GOLD,
                    color: NAVY, padding: "4px 10px", borderRadius: 99 }}>
                    ₹999/yr
                  </span>
                }
              />
            )}
            <Row icon="🔓" label="Sign Out" sub="You can sign back in anytime"
              onClick={async () => { await signOut(); navigate("/"); }}/>
            <Row icon="🗑️" label="Delete Account" sub="Permanently removes your data"
              danger onClick={() => setShowDelete(true)}/>
          </div>

        </div>

        {/* ── DELETE CONFIRM MODAL ── */}
        {showDelete && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)", zIndex: 999,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#0d1b2a", border: "1px solid rgba(192,57,43,0.3)",
              borderRadius: 16, padding: "28px 24px", maxWidth: 360, width: "100%",
              textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fff",
                fontFamily: "'Playfair Display',serif", marginBottom: 8 }}>
                Delete your account?
              </div>
              <div style={{ fontSize: 12, color: "#5a7a94", lineHeight: 1.7, marginBottom: 20 }}>
                This will permanently delete your profile, usage history and all saved data. This cannot be undone.
              </div>
              <button onClick={handleDeleteAccount} disabled={deleting} style={{
                width: "100%", padding: "12px", background: RED, color: "#fff",
                border: "none", borderRadius: 8, fontWeight: 800, fontSize: 12,
                letterSpacing: "0.1em", cursor: deleting ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans',sans-serif", marginBottom: 8, opacity: deleting ? 0.7 : 1,
              }}>
                {deleting ? "DELETING…" : "YES, DELETE MY ACCOUNT"}
              </button>
              <button onClick={() => setShowDelete(false)} style={{
                width: "100%", padding: "11px", background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
                color: "#5a7a94", fontSize: 12, fontWeight: 700,
                cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}