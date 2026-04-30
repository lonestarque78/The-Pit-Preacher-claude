"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type SelectedItem = {
  name: string;
  category: string;
  quantity: number;
  weight: string;
  notes: string;
  smokerId: string | null;
};

type Smoker = {
  id: string;
  name: string;
  wood: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const BEEF = [
  "Whole Packer Brisket", "Brisket Flat", "Brisket Point",
  "Prime Rib / Standing Rib Roast", "Beef Tenderloin",
  "Beef Short Ribs (Plate)", "Dino Ribs", "Ribeye",
  "Tomahawk Ribeye", "Smoked Hamburgers", "Smoked Meatloaf",
  "Chuck Roast", "Tri-Tip",
];

const PORK = [
  "Pork Butt / Boston Butt", "Pork Picnic Shoulder", "Whole Hog",
  "Baby Back Ribs", "Spare Ribs", "St. Louis Cut Ribs",
  "Pork Belly (Whole)", "Pork Belly Burnt Ends", "Pork Loin",
  "Pork Tenderloin", "Smoked Fresh Ham", "Thick Cut Pork Chops",
  "Porchetta",
];

const CHICKEN = [
  "Whole Chicken", "Spatchcock Chicken", "Chicken Thighs",
  "Chicken Wings", "Chicken Drumsticks", "Cornish Game Hens",
];

const SEAFOOD = [
  "Whole Salmon Fillet", "Whole Fish", "Oysters", "Shrimp", "Tandoori Prawns",
];

const APPETIZERS = [
  "Jalapeño Poppers", "Armadillo Eggs", "Bacon Wrapped Anything",
  "Smoked Deviled Eggs", "Smoked Sausage Links", "Boudin Balls",
  "Jalapeño Cheddar Sausage", "Andouille Sausage", "Smoked Queso",
  "Seekh Kebabs", "Chicken Tikka", "Smoked Paneer Tikka",
];

const SIDES = [
  "Smoked Mac and Cheese", "Smoked Baked Beans", "Smoked Baked Potatoes",
  "Smoked Twice Baked Potatoes", "Corn on the Cob", "Smoked Cream Corn",
  "Smoked Jalapeño Cornbread", "Brussels Sprouts", "Smoked Asparagus",
  "Smoked Collard Greens", "Santa Maria Pinquito Beans",
  "Portobello Mushroom Caps", "Stuffed Bell Peppers",
  "Smoked Peach Cobbler", "Smoked Brownies", "Smoked Deviled Eggs",
];

const MEAT_TABS = [
  { key: "beef",    label: "Beef",    items: BEEF },
  { key: "pork",    label: "Pork",    items: PORK },
  { key: "chicken", label: "Chicken", items: CHICKEN },
  { key: "seafood", label: "Seafood", items: SEAFOOD },
];

const CATEGORIES = [
  { key: "meats",      label: "Meats" },
  { key: "sides",      label: "Sides" },
  { key: "appetizers", label: "Appetizers" },
];

const COOKING_STYLES = [
  { key: "texas",       label: "Texas BBQ",         desc: "Beef-forward. Salt and pepper. Post oak smoke. No sauce required." },
  { key: "kansas_city", label: "Kansas City",        desc: "Everything smokes here. Sweet, thick sauce. Famous for burnt ends." },
  { key: "memphis",     label: "Memphis",            desc: "Pork rules. Dry rubs or wet — you choose. Complex spice blends." },
  { key: "carolina",    label: "Carolina",           desc: "Whole hog tradition. Vinegar-based sauces. Regional pride runs deep." },
  { key: "backyard",    label: "Backyard Classic",   desc: "No rules. Just good fire, good company, and good food." },
  { key: "competition", label: "Competition Style",  desc: "Every detail matters. Tight bark, clean slice, perfect turn-in box." },
];

const VERSES = [
  "The stall is not failure. The stall is patience being tested.",
  "Low and slow is not a temperature. It is a way of life.",
  "If you tend to the pit with pride, the meat will preach on its own.",
];

// ─── Time slots: 10am–10pm in 30min increments ────────────────────────────────

const TIME_SLOTS: string[] = [];
for (let h = 10; h <= 22; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 22) TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatTimeSlot(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr ?? "0", 10);
  const m = mStr ?? "00";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${period}`;
}

function formatEatingTime(iso: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "var(--color-bg-alt)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--space-4)",
  marginBottom: "var(--space-4)",
};

const sectionHeading: React.CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: "1.35rem",
  marginBottom: "6px",
  marginTop: 0,
};

const sectionSub: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  color: "var(--color-text-muted)",
  fontSize: "0.92rem",
  marginBottom: "var(--space-3)",
};

const tileGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: "var(--space-2)",
};

const stepperBtn: React.CSSProperties = {
  width: "30px",
  height: "30px",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  cursor: "pointer",
  color: "var(--color-text)",
  fontFamily: "var(--font-ui)",
  fontSize: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const miniInput: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "0.82rem",
  boxSizing: "border-box" as const,
};

const fieldInput: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "0.95rem",
  boxSizing: "border-box" as const,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const supabase = createClient();

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [activeMeatTab, setActiveMeatTab] = useState("beef");
  const [otherVisible, setOtherVisible] = useState<Record<string, boolean>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [cookingStyle, setCookingStyle] = useState("");

  // Date/time picker state
  const [next14Days] = useState<Date[]>(() =>
    Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      return d;
    })
  );
  const [pickerDate, setPickerDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [pickerTime, setPickerTime] = useState("18:00");

  const [flavorSmoke, setFlavorSmoke] = useState(7);
  const [flavorBark, setFlavorBark] = useState(8);
  const [flavorTenderness, setFlavorTenderness] = useState(7);
  const [smokers, setSmokers] = useState<Smoker[]>([{ id: "s1", name: "", wood: "" }]);
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [verseIdx, setVerseIdx] = useState(0);
  const [verseVisible, setVerseVisible] = useState(true);

  // Compute eating time ISO string from picker state
  const eatingTime = (() => {
    const d = new Date(pickerDate);
    const [hStr, mStr] = pickerTime.split(":");
    d.setHours(parseInt(hStr ?? "18", 10), parseInt(mStr ?? "0", 10), 0, 0);
    return d.toISOString();
  })();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  // Verse rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setVerseVisible(false);
      setTimeout(() => {
        setVerseIdx(prev => (prev + 1) % VERSES.length);
        setVerseVisible(true);
      }, 500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Auto-assign to sole named smoker
  useEffect(() => {
    const named = smokers.filter(s => s.name.trim());
    if (named.length === 1) {
      const firstId = named[0]!.id;
      setSelectedItems(prev => {
        if (prev.every(i => i.smokerId === firstId)) return prev;
        return prev.map(i => ({ ...i, smokerId: firstId }));
      });
    }
  }, [smokers]);

  // ── Item helpers ─────────────────────────────────────────────────────────────

  const toggleItem = (name: string, category: string) => {
    const exists = selectedItems.some(i => i.name === name && i.category === category);
    if (exists) {
      setSelectedItems(prev => prev.filter(i => !(i.name === name && i.category === category)));
    } else {
      const named = smokers.filter(s => s.name.trim());
      const autoSmokerId = named.length === 1 ? named[0]!.id : null;
      setSelectedItems(prev => [...prev, { name, category, quantity: 1, weight: "", notes: "", smokerId: autoSmokerId }]);
    }
  };

  const updateItem = (name: string, category: string, updates: Partial<SelectedItem>) => {
    setSelectedItems(prev => prev.map(i =>
      i.name === name && i.category === category ? { ...i, ...updates } : i
    ));
  };

  const addOtherItem = (key: string, category: string) => {
    const text = (otherText[key] || "").trim();
    if (!text) return;
    toggleItem(text, category);
    setOtherText(prev => ({ ...prev, [key]: "" }));
    setOtherVisible(prev => ({ ...prev, [key]: false }));
  };

  // ── Smoker helpers ───────────────────────────────────────────────────────────

  const updateSmoker = (id: string, updates: Partial<Smoker>) =>
    setSmokers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

  const addSmoker = () => {
    if (smokers.length >= 3) return;
    const newId = `s${Date.now()}`;
    setSmokers(prev => [...prev, { id: newId, name: "", wood: "" }]);
    setSelectedItems(prev => prev.map(i => ({ ...i, smokerId: null })));
  };

  const removeSmoker = (id: string) => {
    setSmokers(prev => prev.filter(s => s.id !== id));
    setSelectedItems(prev => prev.map(i => i.smokerId === id ? { ...i, smokerId: null } : i));
  };

  // ── Build ────────────────────────────────────────────────────────────────────

  const namedSmokers = smokers.filter(s => s.name.trim());
  const hasItems = selectedItems.length > 0;
  const hasUnassigned = namedSmokers.length > 1 && selectedItems.some(i => i.smokerId === null);
  const isBuildDisabled = !hasItems || !eatingTime || hasUnassigned;

  const handleBuild = async () => {
    setAuthError(false);
    if (!user) { setAuthError(true); return; }
    setSaving(true);

    const { data, error } = await supabase
      .from("meal_prep_sessions")
      .insert({
        user_id: user.id,
        selected_items: selectedItems,
        cooking_style: cookingStyle,
        eating_time: eatingTime,
        flavor_smoke: flavorSmoke,
        flavor_bark: flavorBark,
        flavor_tenderness: flavorTenderness,
        notes: "",
        tools: smokers,
      })
      .select()
      .single();

    setSaving(false);

    if (error || !data) {
      console.error(error);
      alert("Error saving prep session");
      return;
    }

    window.location.href = `/cook/create?session=${data.id}`;
  };

  // ── Tile renderer ────────────────────────────────────────────────────────────

  const renderTile = (name: string, category: string) => {
    const sel = selectedItems.find(i => i.name === name && i.category === category);
    const isMeat = category === "meats";

    return (
      <div
        key={name}
        onClick={() => toggleItem(name, category)}
        style={{
          background: sel ? "rgba(255,106,0,0.08)" : "var(--color-bg)",
          border: sel ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-3)",
          cursor: "pointer",
          transition: "border-color 0.12s, background 0.12s",
        }}
      >
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", lineHeight: 1.35 }}>{name}</div>

        {sel && (
          <div onClick={e => e.stopPropagation()} style={{ marginTop: "var(--space-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <button
                onClick={() => updateItem(name, category, { quantity: Math.max(1, sel.quantity - 1) })}
                style={stepperBtn}
              >−</button>
              <span style={{ fontFamily: "var(--font-ui)", minWidth: "20px", textAlign: "center", fontSize: "0.9rem" }}>
                {sel.quantity}
              </span>
              <button
                onClick={() => updateItem(name, category, { quantity: sel.quantity + 1 })}
                style={stepperBtn}
              >+</button>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>qty</span>
            </div>
            {isMeat && (
              <input
                value={sel.weight}
                onChange={e => updateItem(name, category, { weight: e.target.value })}
                placeholder="Weight (lbs)"
                style={{ ...miniInput, marginBottom: "5px" }}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  const renderOtherTile = (key: string, category: string) => {
    const visible = otherVisible[key];
    return (
      <div
        key="__other__"
        style={{
          background: "var(--color-bg)",
          border: "1px dashed var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-3)",
          cursor: visible ? "default" : "pointer",
          minHeight: "44px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        onClick={() => !visible && setOtherVisible(prev => ({ ...prev, [key]: true }))}
      >
        {!visible ? (
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
            + Other
          </span>
        ) : (
          <div onClick={e => e.stopPropagation()}>
            <input
              autoFocus
              value={otherText[key] || ""}
              onChange={e => setOtherText(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder="Enter item name..."
              style={miniInput}
              onKeyDown={e => { if (e.key === "Enter") addOtherItem(key, category); }}
            />
            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              <button
                onClick={() => addOtherItem(key, category)}
                style={{
                  padding: "4px 12px",
                  background: "var(--color-accent)", color: "white",
                  border: "none", borderRadius: "var(--radius-sm)",
                  cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: "0.82rem",
                }}
              >Add</button>
              <button
                onClick={() => setOtherVisible(prev => ({ ...prev, [key]: false }))}
                style={{
                  padding: "4px 10px",
                  background: "var(--color-bg)", color: "var(--color-text-muted)",
                  border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)",
                  cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: "0.82rem",
                }}
              >Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Panel content ────────────────────────────────────────────────────────────

  const meatsCount      = selectedItems.filter(i => i.category === "meats").length;
  const sidesCount      = selectedItems.filter(i => i.category === "sides").length;
  const appetizersCount = selectedItems.filter(i => i.category === "appetizers").length;

  const categoryCount: Record<string, number> = {
    meats: meatsCount,
    sides: sidesCount,
    appetizers: appetizersCount,
  };

  const categoryLabel: Record<string, string> = {
    meats: "Meats",
    sides: "Sides",
    appetizers: "Appetizers",
  };

  const renderPanelContent = () => {
    if (openPanel === "meats") {
      return (
        <>
          <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)", flexWrap: "wrap" }}>
            {MEAT_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveMeatTab(tab.key)}
                style={{
                  padding: "6px 18px",
                  background: "none",
                  border: "none",
                  borderBottom: activeMeatTab === tab.key ? "2px solid var(--color-accent)" : "2px solid transparent",
                  color: activeMeatTab === tab.key ? "var(--color-accent)" : "var(--color-text-muted)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  paddingLeft: 0,
                  paddingRight: "var(--space-3)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={tileGrid}>
            {MEAT_TABS.find(t => t.key === activeMeatTab)!.items.map(name => renderTile(name, "meats"))}
            {renderOtherTile(`meats-${activeMeatTab}`, "meats")}
          </div>
        </>
      );
    }
    if (openPanel === "appetizers") {
      return (
        <div style={tileGrid}>
          {APPETIZERS.map(name => renderTile(name, "appetizers"))}
          {renderOtherTile("appetizers", "appetizers")}
        </div>
      );
    }
    if (openPanel === "sides") {
      return (
        <div style={tileGrid}>
          {SIDES.map(name => renderTile(name, "sides"))}
          {renderOtherTile("sides", "sides")}
        </div>
      );
    }
    return null;
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div>

      {/* ── FLOATING PANEL OVERLAY ── */}
      {openPanel && (
        <>
          <div
            onClick={() => setOpenPanel(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 100,
            }}
          />
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(680px, 95vw)",
            maxHeight: "80vh",
            overflowY: "auto",
            background: "var(--color-bg-alt)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            zIndex: 101,
          }}>
            {/* Panel header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--space-3)",
              paddingBottom: "var(--space-3)",
              borderBottom: "1px solid var(--color-border)",
            }}>
              <div>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem" }}>
                  {categoryLabel[openPanel]}
                </span>
                {(categoryCount[openPanel] ?? 0) > 0 && (
                  <span style={{
                    marginLeft: "var(--space-2)",
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.8rem",
                    color: "var(--color-accent)",
                  }}>
                    {categoryCount[openPanel]} selected
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpenPanel(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-text-muted)",
                  fontSize: "1.5rem",
                  lineHeight: 1,
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >×</button>
            </div>

            {renderPanelContent()}
          </div>
        </>
      )}

      {/* ── HERO ── */}
      <div style={{
        background: `
          radial-gradient(ellipse at 50% 110%, rgba(232,98,10,0.15) 0%, transparent 55%),
          linear-gradient(180deg, #0c0a08 0%, #1a1008 40%, #0c0a08 100%)
        `,
        padding: "5rem 2rem 3rem",
        textAlign: "center",
      }}>
        <p style={{
          fontFamily:    "var(--font-ui)",
          color:         "#C9973A",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          fontSize:      "0.75rem",
          marginTop:     0,
          marginBottom:  "var(--space-3)",
        }}>
          ✦ Lone Star Que ✦
        </p>

        <p style={{
          fontFamily:   "var(--font-heading)",
          fontStyle:    "italic",
          color:        "#C9973A",
          fontSize:     "clamp(1rem, 2.5vw, 1.4rem)",
          fontWeight:   400,
          marginTop:    0,
          marginBottom: "var(--space-2)",
        }}>
          The Gospel of Great BBQ
        </p>

        <h1 style={{ margin: "0 0 var(--space-3)", lineHeight: 1.05 }}>
          <span style={{
            display:    "block",
            fontFamily: "var(--font-heading)",
            color:      "#F5E6C8",
            fontSize:   "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 400,
          }}>The</span>
          <span style={{
            display:    "inline",
            fontFamily: "var(--font-heading)",
            color:      "#F5E6C8",
            fontSize:   "clamp(3rem, 8vw, 7rem)",
            fontWeight: 900,
            fontStyle:  "normal",
          }}>Pit</span>
          {" "}
          <span style={{
            display:              "inline",
            fontFamily:           "var(--font-heading)",
            color:                "transparent",
            WebkitTextStroke:     "2px #C9973A",
            fontSize:             "clamp(3rem, 8vw, 7rem)",
            fontWeight:           900,
            fontStyle:            "italic",
          }}>Preacher</span>
        </h1>

        <p style={{
          fontFamily:   "var(--font-body)",
          color:        "#8a7a6a",
          fontSize:     "1rem",
          marginTop:    0,
          marginBottom: 0,
        }}>
          Every great cook starts with a plan. Build yours below.
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--color-border, #2a2a2a)" }} />

      {/* ── ROTATING VERSE ── */}
      <div style={{ textAlign: "center", padding: "var(--space-5) var(--space-4) 0" }}>
        <p style={{
          fontFamily: "var(--font-body)",
          fontStyle:  "italic",
          color:      "var(--color-text-muted)",
          fontSize:   "0.9rem",
          margin:     "0 auto",
          maxWidth:   "520px",
          lineHeight: 1.7,
          opacity:    verseVisible ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}>
          &ldquo;{VERSES[verseIdx]}&rdquo;
        </p>
      </div>

      {/* ── MEAL PREP BUILDER ── */}
      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "var(--space-5) var(--space-4) 80px" }}>

        {/* SECTION 1: ITEM PICKER */}
        <div style={card}>
          <h2 style={sectionHeading}>What are you cooking?</h2>
          <p style={sectionSub}>Select everything going on the pit. Tap a category to open.</p>

          {/* Category card row */}
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", marginBottom: "var(--space-2)" }}>
            {CATEGORIES.map(cat => {
              const count = categoryCount[cat.key] ?? 0;
              const catItems = selectedItems.filter(i => i.category === cat.key);
              return (
                <div
                  key={cat.key}
                  onClick={() => setOpenPanel(cat.key)}
                  style={{
                    flex:         "1 1 200px",
                    background:   "var(--color-bg)",
                    border:       count > 0 ? "2px solid var(--color-accent)" : "2px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding:      "var(--space-3) var(--space-4)",
                    cursor:       "pointer",
                    transition:   "border-color 0.12s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: count > 0 ? "var(--space-2)" : 0 }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem" }}>{cat.label}</span>
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                      {count > 0 ? `${count} selected` : "Tap to add"}
                    </span>
                  </div>
                  {catItems.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {catItems.map(item => (
                        <span
                          key={item.name}
                          style={{
                            border:       "1px solid var(--color-accent)",
                            fontFamily:   "var(--font-ui)",
                            fontSize:     "0.75rem",
                            padding:      "4px 8px",
                            borderRadius: "12px",
                            color:        "var(--color-accent)",
                            whiteSpace:   "nowrap" as const,
                          }}
                        >
                          {item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: COOKING STYLE */}
        <div style={card}>
          <h2 style={sectionHeading}>Cooking Style</h2>
          <p style={sectionSub}>Set the tradition. Shape the plan.</p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "var(--space-3)",
          }}>
            {COOKING_STYLES.map(style => (
              <div
                key={style.key}
                onClick={() => setCookingStyle(cookingStyle === style.key ? "" : style.key)}
                style={{
                  padding:      "var(--space-3)",
                  background:   cookingStyle === style.key ? "var(--color-bg)" : "var(--color-bg-alt)",
                  border:       cookingStyle === style.key ? "2px solid var(--color-accent)" : "2px solid transparent",
                  borderRadius: "var(--radius-md)",
                  cursor:       "pointer",
                  transition:   "border-color 0.12s",
                }}
              >
                <div style={{ fontFamily: "var(--font-heading)", marginBottom: "4px" }}>{style.label}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.45 }}>
                  {style.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: EATING TIME */}
        <div style={card}>
          <h2 style={sectionHeading}>When are you eating?</h2>
          <p style={sectionSub}>This is the anchor. Everything calculates backward from this moment.</p>

          {/* Day pills */}
          <div style={{
            display:        "flex",
            gap:            "var(--space-2)",
            overflowX:      "auto",
            paddingBottom:  "var(--space-2)",
            marginBottom:   "var(--space-3)",
            scrollbarWidth: "none" as const,
          }}>
            {next14Days.map((day, i) => {
              const selected = isSameDay(day, pickerDate);
              return (
                <button
                  key={i}
                  onClick={() => setPickerDate(day)}
                  style={{
                    flexShrink:   0,
                    padding:      "8px 14px",
                    background:   selected ? "var(--color-accent)" : "var(--color-bg)",
                    color:        selected ? "white" : "var(--color-text)",
                    border:       selected ? "none" : "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    cursor:       "pointer",
                    textAlign:    "center" as const,
                    transition:   "background 0.12s",
                    minWidth:     "64px",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", textTransform: "uppercase" as const, letterSpacing: "0.05em", opacity: 0.8 }}>
                    {day.toLocaleDateString(undefined, { weekday: "short" })}
                  </div>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 700, lineHeight: 1.1 }}>
                    {day.getDate()}
                  </div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", opacity: 0.8 }}>
                    {day.toLocaleDateString(undefined, { month: "short" })}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Time pills */}
          <div style={{
            display:        "flex",
            gap:            "var(--space-1)",
            flexWrap:       "wrap",
          }}>
            {TIME_SLOTS.map(slot => {
              const selected = pickerTime === slot;
              return (
                <button
                  key={slot}
                  onClick={() => setPickerTime(slot)}
                  style={{
                    padding:      "6px 12px",
                    background:   selected ? "var(--color-accent)" : "var(--color-bg)",
                    color:        selected ? "white" : "var(--color-text-muted)",
                    border:       selected ? "none" : "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    cursor:       "pointer",
                    fontFamily:   "var(--font-ui)",
                    fontSize:     "0.82rem",
                    transition:   "background 0.12s",
                  }}
                >
                  {formatTimeSlot(slot)}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: FLAVOR AUTOGRAPH */}
        <div style={card}>
          <h2 style={sectionHeading}>Your Flavor Autograph</h2>
          <p style={sectionSub}>These three settings shape your entire cook plan.</p>

          {(
            [
              { label: "Smoke Intensity",   value: flavorSmoke,      set: setFlavorSmoke },
              { label: "Bark Preference",   value: flavorBark,       set: setFlavorBark },
              { label: "Tenderness Target", value: flavorTenderness, set: setFlavorTenderness },
            ] as { label: string; value: number; set: (n: number) => void }[]
          ).map(({ label, value, set }) => (
            <div key={label} style={{ marginBottom: "var(--space-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontFamily: "var(--font-ui)", fontSize: "0.95rem" }}>{label}</label>
                <span style={{
                  fontFamily: "var(--font-heading)",
                  color:      "var(--color-accent)",
                  fontSize:   "1.15rem",
                  minWidth:   "24px",
                  textAlign:  "right",
                }}>
                  {value}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={value}
                onChange={e => set(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--color-accent)", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                <span>1</span>
                <span>10</span>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 5: PIT SETUP */}
        <div style={card}>
          <h2 style={sectionHeading}>Your Pit Setup</h2>
          <p style={sectionSub}>Tell the Preacher what you&rsquo;re cooking on.</p>

          {smokers.map((smoker, idx) => (
            <div
              key={smoker.id}
              style={{
                background:   "var(--color-bg)",
                border:       "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding:      "var(--space-3)",
                marginBottom: "var(--space-3)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: "1rem" }}>Smoker {idx + 1}</span>
                {idx > 0 && (
                  <button
                    onClick={() => removeSmoker(smoker.id)}
                    style={{
                      background: "none", border: "none",
                      color: "var(--color-text-muted)", cursor: "pointer",
                      fontSize: "1.1rem", lineHeight: 1,
                    }}
                  >×</button>
                )}
              </div>
              <input
                value={smoker.name}
                onChange={e => updateSmoker(smoker.id, { name: e.target.value })}
                placeholder="Weber Smokefire EX6, offset, kamado, kettle..."
                style={{ ...fieldInput, marginBottom: "var(--space-2)" }}
              />
              <input
                value={smoker.wood}
                onChange={e => updateSmoker(smoker.id, { wood: e.target.value })}
                placeholder="Post oak, hickory, cherry, competition blend..."
                style={fieldInput}
              />
            </div>
          ))}

          {smokers.length < 3 && (
            <button
              onClick={addSmoker}
              style={{
                padding:      "10px 20px",
                background:   "none",
                border:       "1px solid var(--color-accent)",
                color:        "var(--color-accent)",
                borderRadius: "var(--radius-md)",
                cursor:       "pointer",
                fontFamily:   "var(--font-ui)",
                fontSize:     "0.9rem",
              }}
            >
              + Add Another Smoker
            </button>
          )}
        </div>

        {/* SECTION 6: SMOKER ASSIGNMENT — only when 2+ named smokers */}
        {hasItems && namedSmokers.length > 1 && (
          <div style={card}>
            <h2 style={sectionHeading}>Assign Items to Smokers</h2>
            <p style={sectionSub}>Tell the Preacher which pit is cooking what.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {selectedItems.map(item => (
                <div
                  key={`${item.category}-${item.name}`}
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "space-between",
                    gap:            "var(--space-3)",
                    padding:        "var(--space-2) var(--space-3)",
                    background:     "var(--color-bg)",
                    borderRadius:   "var(--radius-md)",
                    border:         item.smokerId
                      ? "1px solid var(--color-border)"
                      : "1px solid var(--color-accent)",
                    flexWrap: "wrap" as const,
                  }}
                >
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.9rem" }}>
                    {item.name}
                    {item.quantity > 1 && (
                      <span style={{ color: "var(--color-text-muted)" }}> ×{item.quantity}</span>
                    )}
                  </span>
                  <select
                    value={item.smokerId || ""}
                    onChange={e => updateItem(item.name, item.category, { smokerId: e.target.value || null })}
                    style={{
                      padding:      "6px 10px",
                      background:   "var(--color-bg-alt)",
                      border:       "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      color:        "var(--color-text)",
                      fontFamily:   "var(--font-body)",
                      fontSize:     "0.875rem",
                      minWidth:     "200px",
                      cursor:       "pointer",
                    }}
                  >
                    <option value="">Assign to smoker...</option>
                    {namedSmokers.map(s => (
                      <option key={s.id} value={s.id}>
                        Smoker {smokers.indexOf(s) + 1}{s.name ? ` — ${s.name}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 7: LIVE PREP SUMMARY */}
        <div style={card}>
          <h2 style={sectionHeading}>Your Cook at a Glance</h2>

          {!hasItems ? (
            <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", fontSize: "0.92rem" }}>
              No items selected yet. Pick something from the pit above.
            </p>
          ) : (
            <>
              {namedSmokers.length > 1 ? (
                <>
                  {namedSmokers.map(smoker => {
                    const assigned = selectedItems.filter(i => i.smokerId === smoker.id);
                    return (
                      <div key={smoker.id} style={{ marginBottom: "var(--space-3)" }}>
                        <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", marginBottom: "4px" }}>
                          Smoker {smokers.indexOf(smoker) + 1}
                          {smoker.name ? ` — ${smoker.name}` : ""}
                        </div>
                        {assigned.length === 0 ? (
                          <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
                            No items assigned yet
                          </p>
                        ) : (
                          <ul style={{ margin: 0, paddingLeft: "var(--space-4)", fontFamily: "var(--font-body)", fontSize: "0.875rem", lineHeight: 1.7 }}>
                            {assigned.map(i => (
                              <li key={i.name}>
                                {i.name}{i.quantity > 1 ? ` ×${i.quantity}` : ""}
                                {i.weight ? ` (${i.weight} lbs)` : ""}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                  {selectedItems.some(i => i.smokerId === null) && (
                    <div style={{ marginBottom: "var(--space-3)" }}>
                      <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", color: "var(--color-accent)", marginBottom: "4px" }}>
                        Unassigned
                      </div>
                      <ul style={{ margin: 0, paddingLeft: "var(--space-4)", fontFamily: "var(--font-body)", fontSize: "0.875rem", lineHeight: 1.7 }}>
                        {selectedItems.filter(i => i.smokerId === null).map(i => (
                          <li key={`${i.category}-${i.name}`}>{i.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <ul style={{ margin: "0 0 var(--space-3)", paddingLeft: "var(--space-4)", fontFamily: "var(--font-body)", fontSize: "0.875rem", lineHeight: 1.7 }}>
                  {selectedItems.map(i => (
                    <li key={`${i.category}-${i.name}`}>
                      {i.name}{i.quantity > 1 ? ` ×${i.quantity}` : ""}
                      {i.weight ? ` (${i.weight} lbs)` : ""}
                    </li>
                  ))}
                </ul>
              )}

              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-3)" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", marginBottom: "5px" }}>
                  <strong>Style:</strong>{" "}
                  {cookingStyle
                    ? COOKING_STYLES.find(s => s.key === cookingStyle)?.label
                    : <span style={{ color: "var(--color-text-muted)" }}>Not selected</span>}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", marginBottom: "5px" }}>
                  <strong>Eating Time:</strong>{" "}
                  {eatingTime
                    ? formatEatingTime(eatingTime)
                    : <span style={{ color: "var(--color-text-muted)" }}>Not set</span>}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", marginBottom: 0 }}>
                  <strong>Flavor Autograph:</strong> Smoke {flavorSmoke} · Bark {flavorBark} · Tenderness {flavorTenderness}
                </p>
              </div>

              {hasUnassigned && (
                <div style={{
                  marginTop:    "var(--space-3)",
                  padding:      "var(--space-2) var(--space-3)",
                  background:   "var(--color-bg)",
                  borderRadius: "var(--radius-sm)",
                  borderLeft:   "3px solid var(--color-accent)",
                }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-accent)", margin: 0 }}>
                    Assign all items to a smoker before building your plan.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* SECTION 8: BUILD BUTTON */}
        <div>
          <button
            onClick={handleBuild}
            disabled={isBuildDisabled || saving}
            style={{
              width:        "100%",
              padding:      "var(--space-4)",
              background:   isBuildDisabled || saving ? "var(--color-bg-alt)" : "var(--color-accent)",
              color:        isBuildDisabled || saving ? "var(--color-text-muted)" : "white",
              border:       "none",
              borderRadius: "var(--radius-lg)",
              fontFamily:   "var(--font-heading)",
              fontSize:     "1.25rem",
              cursor:       isBuildDisabled || saving ? "not-allowed" : "pointer",
              transition:   "background 0.15s",
            }}
          >
            {saving ? "Building..." : "Build My Cook Plan"}
          </button>

          {authError && (
            <div style={{ textAlign: "center", marginTop: "var(--space-3)", fontFamily: "var(--font-body)", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Sign in to save your cook plan. </span>
              <Link href="/auth/login" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
                Sign in
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
