// app/playbook/pit-types/page.tsx

import PlaybookLayout from "@/components/playbook/PlaybookLayout";
import PlaybookArticle from "@/components/playbook/PlaybookArticle";
import SectionHeader from "@/components/playbook/SectionHeader";
import SectionContent from "@/components/playbook/SectionContent";
import PreacherNote from "@/components/playbook/PreacherNote";
import RelatedLinks from "@/components/playbook/RelatedLinks";
import { createServerClient } from "@/lib/supabase-server";
import { getTier } from "@/lib/premium";
import Link from "next/link";

const PITS = [
  {
    key: "offset",
    label: "Offset Smoker",
    aliases: ["offset", "stick burner", "stick-burner"],
    description: "The gold standard for traditional BBQ. Fire lives in a separate firebox. Heat and smoke travel through the cooking chamber via convection. Demands active fire management but rewards you with unmatched smoke flavor and bark.",
    strengths: ["Deep smoke penetration", "Superior bark development", "High capacity for large cooks"],
    watch: ["Hot spots near the firebox", "Requires consistent fire tending", "Steep learning curve on fire management"],
    tips: "Rotate meat every hour if you don't have a baffle plate. Keep a coal bed going and add splits on top. Chase blue smoke, not white.",
  },
  {
    key: "pellet",
    label: "Pellet Grill",
    aliases: ["pellet", "pellet grill", "pellet smoker", "smokefire", "traeger", "weber smokefire", "recteq", "pit boss"],
    description: "Set-it-and-nearly-forget-it cooking. An auger feeds wood pellets into a firepot. A fan circulates heat. Temperature is electronically controlled. Smoke flavor is milder than a stick burner but consistency is hard to beat.",
    strengths: ["Precise temperature control", "Even heat distribution", "Low active management required"],
    watch: ["Milder smoke flavor than offset", "Pellet quality affects everything", "Firepot needs regular cleaning"],
    tips: "Use a smoke tube in the first two hours for added smoke exposure. Keep your hopper full and your firepot clean. High-quality pellets make a real difference.",
  },
  {
    key: "kamado",
    label: "Kamado",
    aliases: ["kamado", "big green egg", "bge", "vision", "primo", "ceramic"],
    description: "Ceramic walls retain heat with extraordinary efficiency. Burns lump charcoal. Holds temperature for hours on a small amount of fuel. Capable of both low and slow smoking and high-heat searing.",
    strengths: ["Exceptional heat retention", "Very fuel efficient", "Versatile — smoke to sear"],
    watch: ["Small vent adjustments have big effects", "Limited cooking capacity", "Slow to cool down if you overshoot temp"],
    tips: "Make small vent adjustments and wait five minutes before making another. Stabilize temperature before putting meat on. Add wood chunks directly into the lump for smoke.",
  },
  {
    key: "kettle",
    label: "Kettle Grill",
    aliases: ["kettle", "weber kettle", "charcoal grill"],
    description: "The backyard classic. Two-zone charcoal setup turns a simple grill into a capable smoker. Indirect heat on one side, coal bed on the other. Limited capacity but highly capable in the right hands.",
    strengths: ["Affordable and accessible", "Great bark development", "Two-zone setup is versatile"],
    watch: ["Limited cook capacity", "More active management than set-and-forget pits", "Temperature swings if you're not watching vents"],
    tips: "Snake method or charcoal baskets on one side give you better temperature control for long cooks. Top vent stays open. Control temp with the bottom vent only.",
  },
  {
    key: "drum",
    label: "Ugly Drum Smoker",
    aliases: ["drum", "uds", "ugly drum", "barrel smoker"],
    description: "Simple, efficient, and effective. A steel drum with a charcoal basket at the bottom and grates at the top. High humidity from meat drippings keeps things moist. Runs hotter than most pits for its size.",
    strengths: ["Very moist cooking environment", "Fuel efficient", "Excellent for large cuts"],
    watch: ["Runs hotter than expected", "Less smoke flavor than offset", "Vent response is fast — don't over-adjust"],
    tips: "Don't overload with wood — the enclosed environment amplifies smoke. Start with less than you think you need. Vent adjustments take effect quickly.",
  },
  {
    key: "cabinet",
    label: "Cabinet / Vertical Smoker",
    aliases: ["cabinet", "vertical", "cabinet smoker", "vertical smoker", "vault", "assassin", "lone star grillz vertical"],
    description: "Heat rises from a firebox at the bottom through multiple cooking racks. Even heat distribution across all levels. High capacity. Popular for competition teams and serious backyard cooks.",
    strengths: ["High cooking capacity", "Even heat top to bottom", "Great smoke circulation"],
    watch: ["Bottom rack runs hotter", "Large fuel consumption on charcoal models", "Takes time to dial in"],
    tips: "Rotate racks if cooking multiple items. Bottom rack is best for items that need more heat. Keep the water pan full if your model has one.",
  },
  {
    key: "electric",
    label: "Electric Smoker",
    aliases: ["electric", "electric smoker", "masterbuilt"],
    description: "Heat comes from an electric element. Smoke comes from a wood chip tray. The most beginner-friendly option. Temperature holds steady with no fire management. Smoke flavor is the lightest of any pit type.",
    strengths: ["Easiest temperature control", "Great for beginners", "Consistent results"],
    watch: ["Lightest smoke flavor of any pit", "Bark development is difficult", "Limited chip tray capacity"],
    tips: "Add chips only in the first two hours. Crack the vent slightly to let moisture escape and help bark develop. Finish at higher heat if bark is a priority.",
  },
];

function normalizePitKey(smokerType: string): string | null {
  if (!smokerType) return null;
  const lower = smokerType.toLowerCase();
  for (const pit of PITS) {
    if (pit.aliases.some((alias) => lower.includes(alias))) {
      return pit.key;
    }
  }
  return null;
}

export default async function KnowYourPitPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userPitKey: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("public.profiles")
      .select("smoker_type")
      .eq("id", user.id)
      .single();
    if (profile?.smoker_type) {
      userPitKey = normalizePitKey(profile.smoker_type);
    }
  }

  const userPit = PITS.find((p) => p.key === userPitKey) ?? null;
  const otherPits = PITS.filter((p) => p.key !== userPitKey);

  return (
    <PlaybookLayout breadcrumb={[{ label: "Know Your Pit" }]}>
      <PlaybookArticle
        module="Module 04 — Basic+"
        title="Know Your Pit"
        intro="Every pit has a personality. The way it holds heat, moves air, and takes smoke is different. The sooner you understand yours, the sooner you stop fighting it and start working with it."
      >

        {/* Personalized pit — shown first if profile has smoker_type */}
        {userPit ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <SectionHeader>{userPit.label}</SectionHeader>
              <span className="text-[10px] font-mono tracking-widest uppercase bg-[#2a1e0a] border border-[#c9a96e] text-[#c9a96e] px-2 py-1 rounded-sm -mt-3">
                Your Pit
              </span>
            </div>
            <SectionContent>
              <p>{userPit.description}</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-mono tracking-widest uppercase text-[#7a6a55] mb-2">Strengths</p>
                  <ul className="space-y-1">
                    {userPit.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[#4CAF50] shrink-0">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-mono tracking-widest uppercase text-[#7a6a55] mb-2">Watch For</p>
                  <ul className="space-y-1">
                    {userPit.watch.map((w, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[#c9a96e] shrink-0">—</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 border-l-2 border-[#c9a96e] pl-4">
                <p className="text-xs font-mono tracking-widest uppercase text-[#7a6a55] mb-1">Pit Tip</p>
                <p>{userPit.tips}</p>
              </div>
            </SectionContent>
          </div>
        ) : user ? (
          <div className="border border-[#2a2218] rounded-sm bg-[#141210] p-5 mb-2">
            <p className="text-sm text-[#9a8a75]">
              Set your smoker type in your{" "}
              <Link href="/account" className="text-[#c9a96e] hover:underline">
                profile
              </Link>{" "}
              and we'll highlight your pit here.
            </p>
          </div>
        ) : null}

        {/* Divider if personalized pit shown */}
        {userPit && (
          <div className="border-t border-[#2a2218] pt-2">
            <p className="text-xs font-mono tracking-widest uppercase text-[#7a6a55]">
              All Pit Types
            </p>
          </div>
        )}

        {/* All other pits */}
        {otherPits.map((pit) => (
          <div key={pit.key}>
            <SectionHeader>{pit.label}</SectionHeader>
            <SectionContent>
              <p>{pit.description}</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-mono tracking-widest uppercase text-[#7a6a55] mb-2">Strengths</p>
                  <ul className="space-y-1">
                    {pit.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[#4CAF50] shrink-0">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-mono tracking-widest uppercase text-[#7a6a55] mb-2">Watch For</p>
                  <ul className="space-y-1">
                    {pit.watch.map((w, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[#c9a96e] shrink-0">—</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 border-l-2 border-[#2a2218] pl-4">
                <p className="text-xs font-mono tracking-widest uppercase text-[#7a6a55] mb-1">Pit Tip</p>
                <p>{pit.tips}</p>
              </div>
            </SectionContent>
          </div>
        ))}

        <PreacherNote>
          You don't beat your pit into submission. You learn its language.
        </PreacherNote>

        <RelatedLinks
          links={[
            { label: "Fire Behavior", href: "/playbook/fire-behavior" },
            { label: "The Holy Trinity", href: "/playbook/holy-trinity" },
            { label: "Troubleshooting", href: "/playbook/troubleshooting" },
          ]}
        />

      </PlaybookArticle>
    </PlaybookLayout>
  );
}
