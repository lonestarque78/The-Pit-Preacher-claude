"use client";



import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { VERSES } from "@/lib/verses";

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
  "Jalapeño Poppers", "Armadillo Eggs", "Bacon Wrapped Shrimp",
  "Bacon Wrapped Scallops", "Smoked Deviled Eggs", "Smoked Sausage Links", "Boudin Balls",
  "Boudin Links", "Jalapeño Cheddar Sausage", "Andouille Sausage", "Smoked Queso",
  "Seekh Kebabs", "Chicken Tikka", "Smoked Paneer Tikka",
];

const SIDES = [
  "Smoked Mac and Cheese", "Smoked Baked Beans", "Smoked Baked Potatoes",
  "Smoked Twice Baked Potatoes", "Corn on the Cob", "Jalapeño Cream Corn",
  "Smoked Jalapeño Cornbread", "Brussels Sprouts", "Smoked Asparagus",
  "Santa Maria Pinquito Beans",
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
  { key: "texas",       label: "Texas BBQ",        desc: "Beef-forward. Salt and pepper. Post oak smoke. No sauce required." },
  { key: "kansas_city", label: "Kansas City",       desc: "Everything smokes here. Sweet, thick sauce. Famous for burnt ends." },
  { key: "memphis",     label: "Memphis",           desc: "Pork rules. Dry rubs or wet — you choose. Complex spice blends." },
  { key: "carolina",    label: "Carolina",          desc: "Whole hog tradition. Vinegar-based sauces. Regional pride runs deep." },
  { key: "backyard",    label: "Backyard Classic",  desc: "No rules. Just good fire, good company, and good food." },
  { key: "competition", label: "Competition Style", desc: "Every detail matters. Tight bark, clean slice, perfect turn-in box." },
];

const STYLE_SUB_OPTIONS: Record<string, { key: string; label: string }[]> = {
  texas:    [{ key: "central_texas", label: "Central Texas" }, { key: "hill_country", label: "Hill Country" }, { key: "texas_bbq", label: "Texas BBQ" }],
  carolina: [{ key: "carolina_eastern", label: "Eastern NC" }, { key: "carolina_western", label: "Western NC" }, { key: "carolina_south", label: "South Carolina" }],
  memphis:  [{ key: "memphis_dry", label: "Dry Rub" }, { key: "memphis_wet", label: "Wet" }],
};


const DAY_ABBRS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_ABBRS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

function getDailyVerse() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return VERSES[dayOfYear % VERSES.length] ?? VERSES[0]!;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const supabase = createClient();

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [activeMeatTab, setActiveMeatTab] = useState("beef");
  const [settingsStep, setSettingsStep] = useState<1 | 2 | 3>(1);
  const [otherVisible, setOtherVisible] = useState<Record<string, boolean>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [cookingStyle, setCookingStyle] = useState("");
  const [styleSubOption, setStyleSubOption] = useState("");

  const [next7Days] = useState<Date[]>(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
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
  const [savedPits, setSavedPits] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [buildError, setBuildError] = useState("");
  const [atCookLimit, setAtCookLimit] = useState(false);

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
    if (openPanel === "settings") {
      setSettingsStep(1);
      if (user) {
        supabase
          .from("pits")
          .select("id, name, type, default_wood")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .then(({ data }) => setSavedPits(data ?? []));
      }
    }
  }, [openPanel, user]);

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
    setBuildError("");
    if (!user) { setAuthError(true); return; }
    setSaving(true);

    // ── FREE TIER COOK LIMIT ────────────────────────────────────────────────────
    const { data: subData } = await supabase.from("subscriptions").select("tier").eq("user_id", user.id).maybeSingle();
    const userTier = subData?.tier ?? "free";

    if (userTier === "free") {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
      const { count: monthlyCount } = await supabase
        .from("cooks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", monthStart)
        .lt("created_at", monthEnd);
      if ((monthlyCount ?? 0) >= 2) {
        setAtCookLimit(true);
        setSaving(false);
        return;
      }
    }

    // Insert meal_prep_session
    const { data: sessionData, error: sessionError } = await supabase
      .from("meal_prep_sessions")
      .insert({
        user_id: user.id,
        selected_items: selectedItems,
        cooking_style: styleSubOption || cookingStyle,
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
        cooking_style: styleSubOption || cookingStyle,
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

    // ── Cook Settings wizard ──
    if (openPanel === "settings") {
      const stepIndicator = (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            {([1, 2, 3] as const).map(step => (
              <div key={step} style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: step < settingsStep ? "#C9973A" : "transparent",
                border: step <= settingsStep ? "2px solid #C9973A" : "2px solid var(--color-text-muted)",
              }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "6px", alignItems: "center" }}>
            {(["Style", "Eating Time", "Smoker Setup"] as const).map((label, i) => (
              <React.Fragment key={label}>
                {i > 0 && <span style={{ color: "var(--color-text-muted)", fontSize: "0.7rem" }}>·</span>}
                <span style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.7rem",
                  color: i + 1 === settingsStep ? "#C9973A" : "var(--color-text-muted)",
                }}>
                  {label}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      );

      // ── Step 1: Style ──
      if (settingsStep === 1) {
        return (
          <>
            {stepIndicator}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
              {COOKING_STYLES.map(style => {
                const isSelected = cookingStyle === style.key;
                const subOpts = STYLE_SUB_OPTIONS[style.key];
                return (
                  <div
                    key={style.key}
                    onClick={() => {
                      const newStyle = cookingStyle === style.key ? "" : style.key;
                      setCookingStyle(newStyle);
                      setStyleSubOption("");
                    }}
                    style={{
                      padding: "var(--space-3)",
                      background: isSelected ? "var(--color-bg)" : "var(--color-bg-alt)",
                      border: isSelected ? "2px solid var(--color-accent)" : "2px solid transparent",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      transition: "border-color 0.12s",
                    }}
                  >
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", marginBottom: "4px" }}>{style.label}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-text-muted)", lineHeight: 1.45 }}>
                      {style.desc}
                    </div>
                    {isSelected && subOpts && (
                      <div
                        onClick={e => e.stopPropagation()}
                        style={{ marginTop: "var(--space-2)", borderTop: "1px solid rgba(201,151,58,0.2)", paddingTop: "var(--space-2)" }}
                      >
                        <div style={{
                          fontFamily: "var(--font-ui)",
                          fontSize: "0.65rem",
                          color: "var(--color-text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: "var(--space-1)",
                        }}>
                          Select your style:
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {subOpts.map(opt => (
                            <button
                              key={opt.key}
                              onClick={() => setStyleSubOption(styleSubOption === opt.key ? "" : opt.key)}
                              style={{
                                border: styleSubOption === opt.key ? "1px solid #C9973A" : "1px solid rgba(201,151,58,0.3)",
                                background: styleSubOption === opt.key ? "#C9973A" : "transparent",
                                color: styleSubOption === opt.key ? "var(--color-bg)" : "var(--color-text-muted)",
                                fontFamily: "var(--font-ui)",
                                fontSize: "0.78rem",
                                padding: "5px 14px",
                                borderRadius: "12px",
                                cursor: "pointer",
                                transition: "background 0.12s, color 0.12s",
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setSettingsStep(2)}
                disabled={!cookingStyle}
                style={{
                  padding: "10px 24px",
                  background: cookingStyle ? "#C9973A" : "var(--color-bg-alt)",
                  color: cookingStyle ? "var(--color-bg)" : "var(--color-text-muted)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.95rem",
                  cursor: cookingStyle ? "pointer" : "not-allowed",
                }}
              >
                Next →
              </button>
            </div>
          </>
        );
      }

      // ── Step 2: Eating Time ──
      if (settingsStep === 2) {
        return (
          <>
            {stepIndicator}
            <div style={{ display: "flex", flexWrap: "nowrap", overflow: "hidden", gap: "6px", marginBottom: "var(--space-3)" }}>
              {next7Days.map((day, i) => {
                const isSelected = isSameDay(day, pickerDate);
                return (
                  <button
                    key={i}
                    onClick={() => setPickerDate(new Date(day))}
                    style={{
                      minWidth: "48px",
                      flex: "1",
                      padding: "6px 8px",
                      borderRadius: "var(--radius-md)",
                      border: isSelected ? "none" : "1px solid rgba(201,151,58,0.2)",
                      background: isSelected ? "#C9973A" : "var(--color-bg)",
                      color: isSelected ? "var(--color-bg)" : "var(--color-text)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem" }}>
                      {DAY_ABBRS[day.getDay()]}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: isSelected ? "var(--color-bg)" : "#C9973A",
                    }}>
                      {day.getDate()}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.65rem",
                      color: isSelected ? "var(--color-bg)" : "var(--color-text-muted)",
                    }}>
                      {MONTH_ABBRS[day.getMonth()]}
                    </span>
                  </button>
                );
              })}
            </div>

            <select
              value={pickerTime}
              onChange={e => setPickerTime(e.target.value)}
              style={{
                background: "var(--color-bg)",
                border: "1px solid rgba(201,151,58,0.3)",
                color: "var(--color-text)",
                fontFamily: "var(--font-body)",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                width: "100%",
                fontSize: "0.95rem",
                marginTop: "var(--space-2)",
                cursor: "pointer",
              }}
            >
              {TIME_SLOTS.map(slot => (
                <option key={slot} value={slot}>{formatTimeSlot(slot)}</option>
              ))}
            </select>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-4)" }}>
              <button
                onClick={() => setSettingsStep(1)}
                style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.9rem", cursor: "pointer", padding: 0 }}
              >
                ← Back
              </button>
              <button
                onClick={() => setSettingsStep(3)}
                style={{
                  padding: "10px 24px",
                  background: "#C9973A",
                  color: "var(--color-bg)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                Next →
              </button>
            </div>
          </>
        );
      }

      // ── Step 3: Smoker Setup + Flavor ──
      if (settingsStep === 3) {
        const smokerReady = smokers.some(s => s.name.trim() && s.wood.trim());
        return (
          <>
            {stepIndicator}

            {/* Pit quick fill */}
            {user && savedPits.length > 0 && (
              <div style={{ marginBottom: "var(--space-3)" }}>
                <div style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.7rem",
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "var(--space-1)",
                }}>
                  Quick fill from your pits:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {savedPits.map(pit => (
                    <button
                      key={pit.id}
                      onClick={() => {
                        const activeSmoker = smokers[0]!;
                        updateSmoker(activeSmoker.id, { name: pit.name, wood: pit.default_wood ?? "" });
                      }}
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.8rem",
                        border: "1px solid rgba(201,151,58,0.3)",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        background: "var(--color-bg)",
                        cursor: "pointer",
                        color: "var(--color-text)",
                      }}
                    >
                      {pit.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Smoker inputs */}
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
                  marginBottom: "var(--space-4)",
                }}
              >
                + Add Another Smoker
              </button>
            )}

            {/* Assignment section — only when 2+ named smokers and items selected */}
            {hasItems && namedSmokers.length > 1 && (
              <div style={{ marginBottom: "var(--space-4)" }}>
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

            {/* Flavor sliders */}
            <div style={{ marginBottom: "var(--space-4)" }}>
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

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={() => setSettingsStep(2)}
                style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.9rem", cursor: "pointer", padding: 0 }}
              >
                ← Back
              </button>
              <button
                onClick={() => setOpenPanel(null)}
                disabled={!smokerReady}
                style={{
                  padding: "10px 24px",
                  background: smokerReady ? "#C9973A" : "var(--color-bg-alt)",
                  color: smokerReady ? "var(--color-bg)" : "var(--color-text-muted)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.95rem",
                  cursor: smokerReady ? "pointer" : "not-allowed",
                }}
              >
                OK — Build My Cook
              </button>
            </div>
          </>
        );
      }
    }

    return null;
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  if (!user) {
    const verse = getDailyVerse();
    return (
      <div style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(201,151,58,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(180,80,20,0.18) 0%, transparent 50%), linear-gradient(180deg, #0e0b07 0%, #1c1108 35%, #0e0b07 100%)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(4rem, 10vw, 7rem) var(--space-4)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.25em", margin: "0 0 var(--space-3)" }}>✦ Lone Star Que ✦</p>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2.2rem, 6vw, 4.5rem)", color: "#F5E6C8", fontWeight: 900, lineHeight: 1.08, margin: "0 0 var(--space-4)", maxWidth: "760px" }}>
          Your Pitmaster<br /><span style={{ color: "transparent", WebkitTextStroke: "2px #C9973A" }}>in Your Pocket</span>
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "clamp(1rem, 2.5vw, 1.2rem)", color: "#A89070", lineHeight: 1.7, maxWidth: "520px", margin: "0 auto var(--space-5)" }}>Cook with confidence. Learn your pit. Understand your meat. Get guidance that fits the way you cook.</p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)" }}>
          <Link href="/auth/login?tab=signup" style={{ display: "inline-block", background: "#C9973A", color: "#111", fontFamily: "var(--font-ui)", fontSize: "1rem", fontWeight: 700, padding: "14px 36px", borderRadius: "var(--radius-md)", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.08em" }}>Start a Cook</Link>
          <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/meet-the-preacher" style={{ fontFamily: "var(--font-ui)", fontSize: "0.85rem", color: "#A89070", textDecoration: "none", borderBottom: "1px solid rgba(201,151,58,0.25)", paddingBottom: "2px" }}>Meet the Preacher</Link>
            <Link href="/how-it-works" style={{ fontFamily: "var(--font-ui)", fontSize: "0.85rem", color: "#A89070", textDecoration: "none", borderBottom: "1px solid rgba(201,151,58,0.25)", paddingBottom: "2px" }}>How It Works</Link>
            <Link href="/features" style={{ fontFamily: "var(--font-ui)", fontSize: "0.85rem", color: "#A89070", textDecoration: "none", borderBottom: "1px solid rgba(201,151,58,0.25)", paddingBottom: "2px" }}>Features</Link>
          </div>
        </div>
        <div style={{ marginTop: "var(--space-6)", borderTop: "1px solid rgba(201,151,58,0.12)", paddingTop: "var(--space-4)", maxWidth: "480px" }}>
          <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", color: "rgba(201,151,58,0.55)", fontSize: "0.85rem", margin: "0 0 4px", lineHeight: 1.65 }}>&ldquo;{verse.text}&rdquo;</p>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.6rem", color: "rgba(201,151,58,0.35)", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>{verse.chapter}</p>
        </div>
      </div>
    );
  }

  const nextMonthStart = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    return d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
  })();

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
        &ldquo;{VERSES[0]?.text}&rdquo;
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
            onClick={() => { if (meatsCount === 0) return; setOpenPanel("settings"); }}
            style={{
              background: "var(--color-bg-alt)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-2) var(--space-3)",
              cursor: meatsCount > 0 ? "pointer" : "default",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "border-color 0.12s",
              opacity: meatsCount > 0 ? 1 : 0.4,
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
                <span>{styleSubOption ? STYLE_SUB_OPTIONS[cookingStyle]?.find(o => o.key === styleSubOption)?.label : cookingStyle ? COOKING_STYLES.find(s => s.key === cookingStyle)?.label : "No style selected"}</span>
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
          {meatsCount === 0 && (
            <p style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.7rem",
              color: "var(--color-text-muted)",
              fontStyle: "italic",
              marginTop: "var(--space-1)",
              marginBottom: 0,
            }}>
              Select your meats first
            </p>
          )}
        </div>

        {/* BUILD BUTTON */}
        <div style={{ marginBottom: "var(--space-3)" }}>
          {atCookLimit ? (
            <div style={{ background: "var(--color-bg-alt)", border: "2px solid #C9973A", borderRadius: "var(--radius-lg)", padding: "var(--space-4)" }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "#F5E6C8", margin: "0 0 var(--space-2)" }}>
                You&apos;ve reached your free cook limit
              </h3>
              <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", fontSize: "0.9rem", margin: "0 0 var(--space-3)", lineHeight: 1.6 }}>
                Free accounts get 2 cooks per month. Your limit resets on {nextMonthStart}. Upgrade to keep cooking.
              </p>
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-2)" }}>
                <Link href="/premium" style={{ display: "inline-block", background: "#C9973A", color: "var(--color-bg)", fontFamily: "var(--font-ui)", fontSize: "0.9rem", padding: "10px 20px", borderRadius: "var(--radius-md)", textDecoration: "none" }}>
                  Upgrade — $3.99/mo →
                </Link>
                <Link href="/premium" style={{ display: "inline-block", background: "transparent", border: "1px solid rgba(201,151,58,0.4)", color: "#C9973A", fontFamily: "var(--font-ui)", fontSize: "0.9rem", padding: "10px 20px", borderRadius: "var(--radius-md)", textDecoration: "none" }}>
                  See Plans
                </Link>
              </div>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)", margin: 0 }}>
                Completed, abandoned, and active cooks all count toward your monthly limit.
              </p>
            </div>
          ) : (
            <>
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
                  <Link href="/auth/login?tab=signup" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
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
            </>
          )}
        </div>

      </div>

      <section style={{ maxWidth: "860px", margin: "var(--space-5) auto 0", padding: "var(--space-4) var(--space-4) var(--space-5)", borderTop: "1px solid rgba(201,151,58,0.1)" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "var(--color-text-muted)", fontWeight: 400, marginBottom: "var(--space-3)" }}>
          The BBQ Cook Planner Built for Real Pitmasters
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.8, marginBottom: "var(--space-3)" }}>
          The Pit Preacher is a BBQ cook planner built by a pitmaster with 25 years of fire, smoke, and hard-earned wisdom. Whether you are smoking a whole packer brisket on an offset, running baby back ribs on a pellet grill, or managing three smokers for a backyard competition — the Pit Preacher builds your cook plan, calculates your brisket timeline, and coaches you from fire to table.
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.8, marginBottom: "var(--space-3)" }}>
          Select your meats, sides, and appetizers. Set your eating time. Tell the Preacher what smoker you are running and what wood is in the hopper. The Pit Preacher builds a complete cook schedule working backward from the moment you want to eat — including when to light the fire, when to wrap, when to rest, and when to slice.
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.8, marginBottom: "var(--space-3)" }}>
          Every cook is logged in your personal BBQ cook journal. Temperatures recorded. Milestones tracked. Lessons saved. The next time you fire up the pit, the Preacher remembers what worked and what did not.
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.8 }}>
          When something goes wrong at the pit — brisket stall lasting too long, dirty smoke, fire running too hot — Pit Rescue Mode gives you an immediate diagnosis and step-by-step fix. The Wood Flavor Lab shows you exactly how every wood affects every meat. And the Preacher is always available in Live Mode to answer the questions that only a real pitmaster can answer.
        </p>
      </section>

    </div>
  );
}
