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
  "Boudin Links", "Jalapeño Cheddar Sausage", "Andouille Sausage", "Smoked Queso",
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

const CATEGORY_EMOJIS: Record<string, string> = {
  meats:      "🥩",
  sides:      "🍽️",
  appetizers: "🔥",
};

const COOKING_STYLES = [
  { key: "texas",       label: "Texas BBQ",        desc: "Beef-forward. Salt and pepper. Post oak smoke. No sauce required." },
  { key: "kansas_city", label: "Kansas City",       desc: "Everything smokes here. Sweet, thick sauce. Famous for burnt ends." },
  { key: "memphis",     label: "Memphis",           desc: "Pork rules. Dry rubs or wet — you choose. Complex spice blends." },
  { key: "carolina",    label: "Carolina",          desc: "Whole hog tradition. Vinegar-based sauces. Regional pride runs deep." },
  { key: "backyard",    label: "Backyard Classic",  desc: "No rules. Just good fire, good company, and good food." },
  { key: "competition", label: "Competition Style", desc: "Every detail matters. Tight bark, clean slice, perfect turn-in box." },
];

const VERSES = [
  "The stall is not failure. The stall is patience being tested.",
  "Low and slow is not a temperature. It is a way of life.",
  "If you tend to the pit with pride, the meat will preach on its own.",
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SETTINGS_TABS = [
  { key: "style",   label: "Style" },
  { key: "eating",  label: "Eating Time" },
  { key: "flavor",  label: "Flavor" },
  { key: "smokers", label: "Smokers" },
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

function getCalendarGrid(year: number, month: number): Date[] {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const grid: Date[] = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    grid.push(new Date(year, month - 1, daysInPrevMonth - i));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push(new Date(year, month, d));
  }
  const remaining = (7 - (grid.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    grid.push(new Date(year, month + 1, d));
  }

  return grid;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

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

const okBtn: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  background: "var(--color-accent)",
  color: "var(--color-bg)",
  border: "none",
  borderRadius: "var(--radius-md)",
  fontFamily: "var(--font-ui)",
  fontSize: "1rem",
  cursor: "pointer",
  marginTop: "var(--space-4)",
};

const rowLabel: React.CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: "0.7rem",
  color: "#C9973A",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  marginBottom: "var(--space-1)",
  marginTop: 0,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const supabase = createClient();

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [activeMeatTab, setActiveMeatTab] = useState("beef");
  const [activeSettingsTab, setActiveSettingsTab] = useState("style");
  const [otherVisible, setOtherVisible] = useState<Record<string, boolean>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [cookingStyle, setCookingStyle] = useState("");

  const [next60Days] = useState<Date[]>(() =>
    Array.from({ length: 60 }, (_, i) => {
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

  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());

  const [flavorSmoke, setFlavorSmoke] = useState(7);
  const [flavorBark, setFlavorBark] = useState(8);
  const [flavorTenderness, setFlavorTenderness] = useState(7);
  const [smokers, setSmokers] = useState<Smoker[]>([{ id: "s1", name: "", wood: "" }]);
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [buildError, setBuildError] = useState("");

  const eatingTime = (() => {
    const d = new Date(pickerDate);
    const [hStr, mStr] = pickerTime.split(":");
    d.setHours(parseInt(hStr ?? "18", 10), parseInt(mStr ?? "0", 10), 0, 0);
    return d.toISOString();
  })();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

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

  // ── Calendar helpers ─────────────────────────────────────────────────────────

  const prevCalendarMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
    else setCalendarMonth(m => m - 1);
  };

  const nextCalendarMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
    else setCalendarMonth(m => m + 1);
  };

  // ── Build ────────────────────────────────────────────────────────────────────

  const namedSmokers = smokers.filter(s => s.name.trim());
  const hasItems = selectedItems.length > 0;
  const hasUnassigned = namedSmokers.length > 1 && selectedItems.some(i => i.smokerId === null);
  const isBuildDisabled = !hasItems || !eatingTime || hasUnassigned;

  const handleBuild = async () => {
    setAuthError(false);
    setBuildError("");
    if (!user) { setAuthError(true); return; }
    setSaving(true);

    // Insert meal_prep_session
    const { data: sessionData, error: sessionError } = await supabase
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

    if (sessionError || !sessionData) {
      console.error(sessionError);
      setBuildError("Failed to save prep session: " + (sessionError?.message ?? "unknown error"));
      setSaving(false);
      return;
    }

    // Insert cook
    const label = selectedItems.map(i => i.name).join(" + ") || "Cook";
    const smokerType = smokers.map(s => s.name).filter(Boolean).join(", ");
    const woodType = smokers.map(s => s.wood).filter(Boolean).join(", ");

    const { data: cook, error: cookError } = await supabase
      .from("cooks")
      .insert({
        user_id: user.id,
        prep_session_id: sessionData.id,
        label,
        cooking_style: cookingStyle,
        smoker_type: smokerType,
        wood_type: woodType,
        eat_time: eatingTime,
        status: "in_progress",
        plan: { tools: smokers, items: selectedItems },
      })
      .select()
      .single();

    if (cookError || !cook?.id) {
      console.error(cookError);
      setBuildError("Failed to create cook: " + (cookError?.message ?? "ID not returned"));
      setSaving(false);
      return;
    }

    // Insert cook_items
    if (selectedItems.length > 0) {
      const { error: itemsError } = await supabase
        .from("cook_items")
        .insert(selectedItems.map(item => ({
          cook_id: cook.id,
          name: item.name,
          notes: item.notes || "",
        })));

      if (itemsError) {
        console.error(itemsError);
        setBuildError("Cook created but failed to save items: " + itemsError.message);
        setSaving(false);
        return;
      }
    }

    window.location.href = `/cook/${cook.id}`;
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
    meats:      "Meats",
    sides:      "Sides",
    appetizers: "Appetizers",
    settings:   "Cook Settings",
  };

  const renderPanelContent = () => {

    // ── Meats ──
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
          <button onClick={() => setOpenPanel(null)} style={okBtn}>OK</button>
        </>
      );
    }

    // ── Appetizers ──
    if (openPanel === "appetizers") {
      return (
        <>
          <div style={tileGrid}>
            {APPETIZERS.map(name => renderTile(name, "appetizers"))}
            {renderOtherTile("appetizers", "appetizers")}
          </div>
          <button onClick={() => setOpenPanel(null)} style={okBtn}>OK</button>
        </>
      );
    }

    // ── Sides ──
    if (openPanel === "sides") {
      return (
        <>
          <div style={tileGrid}>
            {SIDES.map(name => renderTile(name, "sides"))}
            {renderOtherTile("sides", "sides")}
          </div>
          <button onClick={() => setOpenPanel(null)} style={okBtn}>OK</button>
        </>
      );
    }

    // ── Cook Settings ──
    if (openPanel === "settings") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = next60Days[next60Days.length - 1]!;
      const calGrid = getCalendarGrid(calendarYear, calendarMonth);

      const navBtnStyle: React.CSSProperties = {
        background: "none",
        border: "1px solid var(--color-border)",
        color: "var(--color-text)",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        width: "32px",
        height: "32px",
        fontFamily: "var(--font-ui)",
        fontSize: "1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      };

      return (
        <>
          {/* Tab buttons */}
          <div style={{
            display: "flex",
            borderBottom: "1px solid var(--color-border)",
            marginBottom: "var(--space-4)",
          }}>
            {SETTINGS_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveSettingsTab(tab.key)}
                style={{
                  padding: "8px 16px",
                  background: "none",
                  border: "none",
                  borderBottom: activeSettingsTab === tab.key ? "2px solid var(--color-accent)" : "2px solid transparent",
                  color: activeSettingsTab === tab.key ? "var(--color-accent)" : "var(--color-text-muted)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  marginBottom: "-1px",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Style tab */}
          {activeSettingsTab === "style" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-2)" }}>
              {COOKING_STYLES.map(style => (
                <div
                  key={style.key}
                  onClick={() => setCookingStyle(cookingStyle === style.key ? "" : style.key)}
                  style={{
                    padding: "var(--space-3)",
                    background: cookingStyle === style.key ? "var(--color-bg)" : "var(--color-bg-alt)",
                    border: cookingStyle === style.key ? "2px solid var(--color-accent)" : "2px solid transparent",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    transition: "border-color 0.12s",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", marginBottom: "4px" }}>{style.label}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-text-muted)", lineHeight: 1.45 }}>
                    {style.desc}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Eating Time tab */}
          {activeSettingsTab === "eating" && (
            <div>
              {/* Month navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                <button onClick={prevCalendarMonth} style={navBtnStyle}>←</button>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: "1rem" }}>
                  {MONTH_NAMES[calendarMonth]} {calendarYear}
                </span>
                <button onClick={nextCalendarMonth} style={navBtnStyle}>→</button>
              </div>

              {/* Day headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
                {DAY_LABELS.map(d => (
                  <div key={d} style={{
                    textAlign: "center",
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.7rem",
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "4px 0",
                  }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "var(--space-4)" }}>
                {calGrid.map((day, i) => {
                  const isCurrentMonth = day.getMonth() === calendarMonth;
                  const isPast = day < today;
                  const isAfterMax = day > maxDate;
                  const isSelected = isSameDay(day, pickerDate);
                  const isToday = isSameDay(day, today);
                  const clickable = isCurrentMonth && !isPast && !isAfterMax;

                  return (
                    <div
                      key={i}
                      onClick={() => clickable && setPickerDate(new Date(day))}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        cursor: clickable ? "pointer" : "default",
                        background: isSelected ? "var(--color-accent)" : "transparent",
                        color: isSelected
                          ? "white"
                          : !isCurrentMonth || isPast || isAfterMax
                          ? "var(--color-text-muted)"
                          : "var(--color-text)",
                        border: isToday && !isSelected ? "1px solid var(--color-accent)" : "1px solid transparent",
                        opacity: !isCurrentMonth ? 0.25 : 1,
                        fontSize: "0.85rem",
                        fontFamily: "var(--font-ui)",
                        transition: "background 0.1s",
                        boxSizing: "border-box" as const,
                        userSelect: "none" as const,
                      }}
                    >
                      {day.getDate()}
                    </div>
                  );
                })}
              </div>

              {/* Time grid */}
              <div style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "var(--space-2)",
              }}>
                Select a time
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-1)" }}>
                {TIME_SLOTS.map(slot => {
                  const selected = pickerTime === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => setPickerTime(slot)}
                      style={{
                        padding: "8px",
                        background: selected ? "var(--color-accent)" : "var(--color-bg)",
                        color: selected ? "white" : "var(--color-text-muted)",
                        border: selected ? "none" : "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.85rem",
                        transition: "background 0.1s",
                      }}
                    >
                      {formatTimeSlot(slot)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Flavor tab */}
          {activeSettingsTab === "flavor" && (
            <div>
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
                      color: "var(--color-accent)",
                      fontSize: "1.15rem",
                      minWidth: "24px",
                      textAlign: "right",
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
          )}

          {/* Smokers tab */}
          {activeSettingsTab === "smokers" && (
            <div>
              {smokers.map((smoker, idx) => (
                <div
                  key={smoker.id}
                  style={{
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-3)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: "1rem" }}>Smoker {idx + 1}</span>
                    {idx > 0 && (
                      <button
                        onClick={() => removeSmoker(smoker.id)}
                        style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1 }}
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
                    padding: "10px 20px",
                    background: "none",
                    border: "1px solid var(--color-accent)",
                    color: "var(--color-accent)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.9rem",
                  }}
                >
                  + Add Another Smoker
                </button>
              )}

              {/* Assignment section — only when 2+ named smokers and items selected */}
              {hasItems && namedSmokers.length > 1 && (
                <div style={{ marginTop: "var(--space-4)" }}>
                  <div style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "var(--space-2)",
                  }}>
                    Assign Items to Smokers
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    {selectedItems.map(item => (
                      <div
                        key={`${item.category}-${item.name}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "var(--space-3)",
                          padding: "var(--space-2) var(--space-3)",
                          background: "var(--color-bg)",
                          borderRadius: "var(--radius-md)",
                          border: item.smokerId ? "1px solid var(--color-border)" : "1px solid var(--color-accent)",
                          flexWrap: "wrap" as const,
                        }}
                      >
                        <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.9rem" }}>
                          {item.name}
                          {item.quantity > 1 && <span style={{ color: "var(--color-text-muted)" }}> ×{item.quantity}</span>}
                        </span>
                        <select
                          value={item.smokerId || ""}
                          onChange={e => updateItem(item.name, item.category, { smokerId: e.target.value || null })}
                          style={{
                            padding: "6px 10px",
                            background: "var(--color-bg-alt)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "var(--radius-sm)",
                            color: "var(--color-text)",
                            fontFamily: "var(--font-body)",
                            fontSize: "0.875rem",
                            minWidth: "160px",
                            cursor: "pointer",
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
            </div>
          )}

          <button onClick={() => setOpenPanel(null)} style={okBtn}>OK</button>
        </>
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
        padding: "1.5rem 2rem 1rem",
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

        <h1 style={{ margin: 0, lineHeight: 1.05 }}>
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
            display:          "inline",
            fontFamily:       "var(--font-heading)",
            color:            "transparent",
            WebkitTextStroke: "2px #C9973A",
            fontSize:         "clamp(3rem, 8vw, 7rem)",
            fontWeight:       900,
            fontStyle:        "italic",
          }}>Preacher</span>
        </h1>
      </div>

      {/* Gold divider */}
      <div style={{ height: "1px", background: "rgba(201,151,58,0.2)" }} />

      {/* Static verse */}
      <p style={{
        fontFamily: "var(--font-body)",
        fontStyle:  "italic",
        color:      "var(--color-text-muted)",
        fontSize:   "0.85rem",
        textAlign:  "center",
        margin:     "var(--space-2) auto 0",
        maxWidth:   "520px",
        lineHeight: 1.6,
        padding:    "0 var(--space-3)",
      }}>
        &ldquo;{VERSES[0]}&rdquo;
      </p>

      {/* ── MAIN BUILDER ── */}
      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "var(--space-3) var(--space-3) 40px" }}>

        {/* ROW 1 — What are you cooking? */}
        <div style={{ marginBottom: "var(--space-3)" }}>
          <p style={rowLabel}>What are you cooking?</p>
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
            {CATEGORIES.map(cat => {
              const count = categoryCount[cat.key] ?? 0;
              const catItems = selectedItems.filter(i => i.category === cat.key);
              return (
                <div
                  key={cat.key}
                  onClick={() => setOpenPanel(cat.key)}
                  style={{
                    flex: "1",
                    minWidth: "120px",
                    background: "var(--color-bg-alt)",
                    border: count > 0 ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--space-2) var(--space-3)",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "border-color 0.12s",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", marginBottom: count > 0 ? "var(--space-1)" : 0 }}>
                    {cat.label}
                  </div>
                  {count > 0 && (
                    <div style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.75rem",
                      color: "var(--color-accent)",
                      marginBottom: catItems.length > 0 ? "var(--space-1)" : 0,
                    }}>
                      {count} selected
                    </div>
                  )}
                  {catItems.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: "center" }}>
                      {catItems.map(item => (
                        <span
                          key={item.name}
                          style={{
                            border: "1px solid var(--color-accent)",
                            fontFamily: "var(--font-ui)",
                            fontSize: "0.7rem",
                            padding: "2px 6px",
                            borderRadius: "10px",
                            color: "var(--color-accent)",
                            whiteSpace: "nowrap" as const,
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

        {/* ROW 2 — Cook Settings */}
        <div style={{ marginBottom: "var(--space-3)" }}>
          <p style={rowLabel}>Cook Settings</p>
          <div
            onClick={() => setOpenPanel("settings")}
            style={{
              background: "var(--color-bg-alt)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-2) var(--space-3)",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "border-color 0.12s",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{
                display: "flex",
                gap: "var(--space-3)",
                flexWrap: "wrap",
                fontFamily: "var(--font-body)",
                fontSize: "0.8rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.8,
              }}>
                <span>{cookingStyle ? COOKING_STYLES.find(s => s.key === cookingStyle)?.label : "No style selected"}</span>
                <span>·</span>
                <span>{eatingTime ? formatEatingTime(eatingTime) : "No time set"}</span>
                <span>·</span>
                <span>Smoke {flavorSmoke} · Bark {flavorBark} · Tenderness {flavorTenderness}</span>
                <span>·</span>
                <span>{smokers.length} smoker{smokers.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
            <span style={{
              fontFamily: "var(--font-ui)",
              color: "var(--color-text-muted)",
              fontSize: "1.3rem",
              marginLeft: "var(--space-3)",
              flexShrink: 0,
            }}>›</span>
          </div>
        </div>

        {/* BUILD BUTTON */}
        <div style={{ marginBottom: "var(--space-3)" }}>
          <button
            onClick={handleBuild}
            disabled={isBuildDisabled || saving}
            style={{
              width:        "100%",
              padding:      "10px 20px",
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
            {saving ? "Building your cook..." : "Build My Cook Plan"}
          </button>

          {buildError && (
            <div style={{
              marginTop: "var(--space-3)",
              padding: "var(--space-2) var(--space-3)",
              background: "#2a0a0a",
              border: "1px solid #c0392b",
              borderRadius: "var(--radius-sm)",
              color: "#c0392b",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              lineHeight: 1.5,
            }}>
              {buildError}
            </div>
          )}

          {authError && (
            <div style={{ textAlign: "center", marginTop: "var(--space-3)", fontFamily: "var(--font-body)", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Sign in to save your cook plan. </span>
              <Link href="/auth/login" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
                Sign in
              </Link>
            </div>
          )}

          {hasUnassigned && (
            <div style={{
              marginTop: "var(--space-3)",
              padding: "var(--space-2) var(--space-3)",
              background: "var(--color-bg-alt)",
              borderRadius: "var(--radius-sm)",
              borderLeft: "3px solid var(--color-accent)",
            }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-accent)", margin: 0 }}>
                Open Cook Settings → Smokers and assign all items before building your plan.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
