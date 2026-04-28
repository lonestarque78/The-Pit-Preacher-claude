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
  "Beef Short Ribs (Plate)", "Chuck Short Ribs", "Ribeye",
  "Tomahawk Ribeye", "Smoked Hamburgers", "Smoked Meatloaf",
  "Chuck Roast", "Beef Cheeks", "Tri-Tip",
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
  "Smoked Deviled Eggs", "Burnt Ends (Brisket Point)", "Pork Belly Burnt Ends",
  "Smoked Queso", "Seekh Kebabs", "Chicken Tikka", "Smoked Paneer Tikka",
];

const SIDES = [
  "Smoked Mac and Cheese", "Pit Beans with Brisket Drippings",
  "Smoked Baked Beans", "Smoked Potatoes", "Smoked Twice Baked Potatoes",
  "Corn on the Cob", "Smoked Cream Corn", "Smoked Jalapeño Cornbread",
  "Smoked Collard Greens", "Smoked Queso", "Santa Maria Pinquito Beans",
  "Portobello Mushroom Caps", "Whole Cauliflower", "Stuffed Bell Peppers",
  "Smoked Peach Cobbler", "Smoked Brownies",
];

const MEAT_TABS = [
  { key: "beef", label: "Beef", items: BEEF },
  { key: "pork", label: "Pork", items: PORK },
  { key: "chicken", label: "Chicken", items: CHICKEN },
  { key: "seafood", label: "Seafood", items: SEAFOOD },
];

const COOKING_STYLES = [
  { key: "texas", label: "Texas BBQ", desc: "Beef-forward. Salt and pepper. Post oak smoke. No sauce required." },
  { key: "kansas_city", label: "Kansas City", desc: "Everything smokes here. Sweet, thick sauce. Famous for burnt ends." },
  { key: "memphis", label: "Memphis", desc: "Pork rules. Dry rubs or wet — you choose. Complex spice blends." },
  { key: "carolina", label: "Carolina", desc: "Whole hog tradition. Vinegar-based sauces. Regional pride runs deep." },
  { key: "backyard", label: "Backyard Classic", desc: "No rules. Just good fire, good company, and good food." },
  { key: "competition", label: "Competition Style", desc: "Every detail matters. Tight bark, clean slice, perfect turn-in box." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultEatingTime() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T18:00`;
}

function formatEatingTime(value: string) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString(undefined, {
      weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  } catch {
    return value;
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
};

const sectionSub: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  color: "var(--color-text-muted)",
  fontSize: "0.92rem",
  marginBottom: "var(--space-3)",
};

const tileGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
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

export default function PrepPage() {
  const supabase = createClient();

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [activeMeatTab, setActiveMeatTab] = useState("beef");
  const [otherVisible, setOtherVisible] = useState<Record<string, boolean>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [cookingStyle, setCookingStyle] = useState("");
  const [eatingTime, setEatingTime] = useState(defaultEatingTime());
  const [flavorSmoke, setFlavorSmoke] = useState(7);
  const [flavorBark, setFlavorBark] = useState(8);
  const [flavorTenderness, setFlavorTenderness] = useState(7);
  const [smokers, setSmokers] = useState<Smoker[]>([{ id: "s1", name: "", wood: "" }]);
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  // ── Item helpers ────────────────────────────────────────────────────────────

  const toggleItem = (name: string, category: string) => {
    const exists = selectedItems.some(i => i.name === name && i.category === category);
    if (exists) {
      setSelectedItems(prev => prev.filter(i => !(i.name === name && i.category === category)));
    } else {
      setSelectedItems(prev => [...prev, { name, category, quantity: 1, weight: "", notes: "", smokerId: null }]);
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

  // ── Smoker helpers ──────────────────────────────────────────────────────────

  const updateSmoker = (id: string, updates: Partial<Smoker>) =>
    setSmokers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

  const addSmoker = () => {
    if (smokers.length >= 3) return;
    setSmokers(prev => [...prev, { id: `s${prev.length + 1}`, name: "", wood: "" }]);
  };

  const removeSmoker = (id: string) => {
    setSmokers(prev => prev.filter(s => s.id !== id));
    setSelectedItems(prev => prev.map(i => i.smokerId === id ? { ...i, smokerId: null } : i));
  };

  // ── Build helpers ───────────────────────────────────────────────────────────

  const namedSmokers = smokers.filter(s => s.name.trim());
  const hasItems = selectedItems.length > 0;
  const hasUnassigned = namedSmokers.length > 0 && selectedItems.some(i => i.smokerId === null);
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

  // ── Tile renderer ───────────────────────────────────────────────────────────

  const renderTile = (name: string, category: string) => {
    const sel = selectedItems.find(i => i.name === name && i.category === category);
    const isMeat = category === "meats";

    return (
      <div
        key={name}
        onClick={() => toggleItem(name, category)}
        style={{
          background: sel ? "var(--color-bg)" : "var(--color-bg-alt)",
          border: sel ? "2px solid var(--color-accent)" : "2px solid transparent",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-2) var(--space-3)",
          cursor: "pointer",
          transition: "border-color 0.12s",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.88rem", lineHeight: 1.35 }}>{name}</span>
          {sel && (
            <span style={{ color: "var(--color-accent)", fontWeight: 700, flexShrink: 0, fontSize: "0.9rem" }}>✓</span>
          )}
        </div>

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
            <input
              value={sel.notes}
              onChange={e => updateItem(name, category, { notes: e.target.value })}
              placeholder="Notes..."
              style={miniInput}
            />
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
          background: "var(--color-bg-alt)",
          border: "2px dashed var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-2) var(--space-3)",
          cursor: visible ? "default" : "pointer",
          minHeight: "44px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        onClick={() => !visible && setOtherVisible(prev => ({ ...prev, [key]: true }))}
      >
        {!visible ? (
          <span style={{ fontFamily: "var(--font-ui)", color: "var(--color-text-muted)", fontSize: "0.88rem" }}>
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

  // ── Category accordion ──────────────────────────────────────────────────────

  const renderCategoryCard = (key: string, label: string, count: number, content: React.ReactNode) => {
    const open = expandedCategory === key;
    return (
      <div
        key={key}
        style={{
          background: "var(--color-bg)",
          border: open ? "2px solid var(--color-accent)" : "2px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-3)",
          overflow: "hidden",
          transition: "border-color 0.12s",
        }}
      >
        <div
          onClick={() => setExpandedCategory(open ? null : key)}
          style={{
            padding: "var(--space-3) var(--space-4)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem" }}>{label}</span>
            {count > 0 && (
              <span style={{
                marginLeft: "var(--space-2)",
                fontFamily: "var(--font-ui)",
                fontSize: "0.8rem",
                color: "var(--color-accent)",
                background: "var(--color-bg-alt)",
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
              }}>
                {count} selected
              </span>
            )}
          </div>
          <span style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            {open ? "▲" : "▼"}
          </span>
        </div>

        {open && (
          <div style={{ padding: "0 var(--space-4) var(--space-4)" }}>
            {content}
          </div>
        )}
      </div>
    );
  };

  const meatsContent = (
    <>
      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)", flexWrap: "wrap" }}>
        {MEAT_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveMeatTab(tab.key)}
            style={{
              padding: "6px 18px",
              background: activeMeatTab === tab.key ? "var(--color-accent)" : "var(--color-bg-alt)",
              color: activeMeatTab === tab.key ? "white" : "var(--color-text)",
              border: activeMeatTab === tab.key ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontFamily: "var(--font-ui)",
              fontSize: "0.9rem",
              transition: "background 0.12s",
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

  const sidesContent = (
    <div style={tileGrid}>
      {SIDES.map(name => renderTile(name, "sides"))}
      {renderOtherTile("sides", "sides")}
    </div>
  );

  const appetizersContent = (
    <div style={tileGrid}>
      {APPETIZERS.map(name => renderTile(name, "appetizers"))}
      {renderOtherTile("appetizers", "appetizers")}
    </div>
  );

  const meatsCount = selectedItems.filter(i => i.category === "meats").length;
  const sidesCount = selectedItems.filter(i => i.category === "sides").length;
  const appetizersCount = selectedItems.filter(i => i.category === "appetizers").length;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: "920px", margin: "0 auto", padding: "40px var(--space-4) 80px" }}>

      {/* ── SECTION 1: HERO ── */}
      <div style={{ textAlign: "center", marginBottom: "var(--space-5)" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.4rem", marginBottom: "var(--space-2)" }}>
          Meal Prep
        </h1>
        <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", color: "var(--color-accent)", fontSize: "1.15rem" }}>
          Every great cook starts with a plan. Let's build yours.
        </p>
      </div>

      {/* ── SECTION 2: ITEM PICKER ── */}
      <div style={card}>
        <h2 style={sectionHeading}>What are you cooking?</h2>
        <p style={sectionSub}>Select everything going on the pit. Tap a category to expand.</p>

        {renderCategoryCard("meats", "Meats", meatsCount, meatsContent)}
        {renderCategoryCard("sides", "Sides", sidesCount, sidesContent)}
        {renderCategoryCard("appetizers", "Appetizers", appetizersCount, appetizersContent)}
      </div>

      {/* ── SECTION 3: COOKING STYLE ── */}
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
                padding: "var(--space-3)",
                background: cookingStyle === style.key ? "var(--color-bg)" : "var(--color-bg-alt)",
                border: cookingStyle === style.key ? "2px solid var(--color-accent)" : "2px solid transparent",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                transition: "border-color 0.12s",
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

      {/* ── SECTION 4: EATING TIME ── */}
      <div style={card}>
        <h2 style={sectionHeading}>When are you eating?</h2>
        <p style={sectionSub}>This is the anchor. Everything calculates backward from this moment.</p>
        <input
          type="datetime-local"
          value={eatingTime}
          onChange={e => setEatingTime(e.target.value)}
          style={{ ...fieldInput, maxWidth: "340px" }}
        />
      </div>

      {/* ── SECTION 5: FLAVOR AUTOGRAPH ── */}
      <div style={card}>
        <h2 style={sectionHeading}>Your Flavor Autograph</h2>
        <p style={sectionSub}>These three settings shape your entire cook plan.</p>

        {(
          [
            { label: "Smoke Intensity", value: flavorSmoke, set: setFlavorSmoke },
            { label: "Bark Preference", value: flavorBark, set: setFlavorBark },
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

      {/* ── SECTION 6: TOOLS & SMOKERS ── */}
      <div style={card}>
        <h2 style={sectionHeading}>Your Pit Setup</h2>
        <p style={sectionSub}>Tell the Preacher what you're cooking on.</p>

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
      </div>

      {/* ── SECTION 7: SMOKER ASSIGNMENT ── */}
      {hasItems && namedSmokers.length > 0 && (
        <div style={card}>
          <h2 style={sectionHeading}>Assign Items to Smokers</h2>
          <p style={sectionSub}>Tell the Preacher which pit is cooking what.</p>

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
                  border: item.smokerId
                    ? "1px solid var(--color-border)"
                    : "1px solid var(--color-accent)",
                  flexWrap: "wrap",
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
                    padding: "6px 10px",
                    background: "var(--color-bg-alt)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--color-text)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.875rem",
                    minWidth: "200px",
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

      {/* ── SECTION 8: LIVE PREP SUMMARY ── */}
      <div style={card}>
        <h2 style={sectionHeading}>Your Cook at a Glance</h2>

        {!hasItems ? (
          <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", fontSize: "0.92rem" }}>
            No items selected yet. Pick something from the pit above.
          </p>
        ) : (
          <>
            {namedSmokers.length > 0 ? (
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
                marginTop: "var(--space-3)",
                padding: "var(--space-2) var(--space-3)",
                background: "var(--color-bg)",
                borderRadius: "var(--radius-sm)",
                borderLeft: "3px solid var(--color-accent)",
              }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-accent)", margin: 0 }}>
                  Assign all items to a smoker before building your plan.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── SECTION 9: BUILD BUTTON ── */}
      <div>
        <button
          onClick={handleBuild}
          disabled={isBuildDisabled || saving}
          style={{
            width: "100%",
            padding: "var(--space-4)",
            background: isBuildDisabled || saving ? "var(--color-bg-alt)" : "var(--color-accent)",
            color: isBuildDisabled || saving ? "var(--color-text-muted)" : "white",
            border: "none",
            borderRadius: "var(--radius-lg)",
            fontFamily: "var(--font-heading)",
            fontSize: "1.25rem",
            cursor: isBuildDisabled || saving ? "not-allowed" : "pointer",
            transition: "background 0.15s",
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
  );
}
