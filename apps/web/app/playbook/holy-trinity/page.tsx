// app/playbook/holy-trinity/page.tsx

import PlaybookLayout from "@/components/playbook/PlaybookLayout";
import PlaybookArticle from "@/components/playbook/PlaybookArticle";
import SectionHeader from "@/components/playbook/SectionHeader";
import SectionContent from "@/components/playbook/SectionContent";
import CommonMistakes from "@/components/playbook/CommonMistakes";
import Fixes from "@/components/playbook/Fixes";
import PitVariations from "@/components/playbook/PitVariations";
import PreacherNote from "@/components/playbook/PreacherNote";
import RelatedLinks from "@/components/playbook/RelatedLinks";

export default function HolyTrinityPage() {
  return (
    <PlaybookLayout breadcrumb={[{ label: "The Holy Trinity" }]}>
      <PlaybookArticle
        module="Module 03 — Basic+"
        title="The Holy Trinity"
        intro="Salt, smoke, and heat. Every great cook comes down to these three. Get any one of them wrong and the other two can't save you."
      >

        <SectionHeader>Salt</SectionHeader>
        <SectionContent>
          <p>Salt is the foundation. It penetrates the meat, seasons it from the inside out, and draws moisture to the surface where it mixes with the rub and forms the bark. Without salt, everything else is surface level.</p>
          <p>Kosher salt is the standard. It's coarse enough to control, dissolves evenly, and has no additives that affect flavor. Table salt is too fine — it over-seasons fast and is hard to apply evenly. Sea salt works but costs more for no meaningful difference on a big cut.</p>
          <p>Apply salt early. For brisket and pork shoulder, salting the night before and letting it rest uncovered in the fridge gives the salt time to penetrate deep into the muscle. For ribs and chicken, a few hours is enough. The longer the salt has to work, the more evenly seasoned the finished product.</p>
          <p>Don't be shy. Large cuts of meat need more salt than you think. A properly salted brisket should look well coated, not lightly dusted. If you're second-guessing whether you've added enough, you probably haven't.</p>
        </SectionContent>

        <SectionHeader>Smoke</SectionHeader>
        <SectionContent>
          <p>Smoke is flavor, but it's also a tool that can ruin a cook if you misuse it. The goal is smoke ring penetration and surface flavor — not a bitter, acrid crust that tastes like an ashtray.</p>
          <p>Smoke penetration happens early in the cook, before the surface dries out and the bark sets. The first two to three hours on the pit are when smoke does most of its work. After that, the surface is largely sealed and new smoke flavor has diminishing returns.</p>
          <p>Wood choice matters. Fruit woods like apple and cherry are mild and sweet — good for poultry and pork. Oak and hickory are stronger and work well on beef. Mesquite burns hot and bold — use it sparingly or it dominates everything. Match the wood to the protein and the intensity you want.</p>
          <p>The smoke ring — that pink band just under the surface — is a chemical reaction between myoglobin in the meat and nitrogen dioxide in the smoke. It's a visual indicator of smoke exposure but doesn't directly equal flavor. Don't chase the ring. Chase the taste.</p>
        </SectionContent>

        <SectionHeader>Heat</SectionHeader>
        <SectionContent>
          <p>Heat is the engine. It drives every process — salt penetration, smoke absorption, collagen breakdown, fat render, bark formation, and moisture loss. Too much heat and you outrun the biology. Too little and you never get there.</p>
          <p>225°F to 275°F is the low and slow range for most BBQ. 225°F gives you maximum time for collagen conversion and smoke exposure. 275°F moves things along faster and can produce better bark on cuts like brisket. Neither is wrong. Both require understanding what's happening inside the meat at those temperatures.</p>
          <p>Consistency matters more than hitting a precise number. A pit that holds 250°F steady all day beats one that swings between 200°F and 300°F chasing a target. Stable heat produces predictable results. Erratic heat produces erratic results.</p>
        </SectionContent>

        <SectionHeader>How They Work Together</SectionHeader>
        <SectionContent>
          <p>The trinity is a system, not three independent variables. Salt pulls moisture to the surface, which helps smoke adhere and form bark. Heat drives smoke into the meat while the surface is still moist. As the cook progresses, heat dries the surface and sets the bark while continuing to break down the interior.</p>
          <p>When something goes wrong in a cook, it's usually one of these three out of balance. Bland meat is a salt problem. Bitter or acrid flavor is a smoke problem. Tough texture or undercooked fat is a heat and time problem. Diagnose the trinity before you blame the cut.</p>
        </SectionContent>

        <CommonMistakes
          items={[
            "Under-salting large cuts. Big meat needs more salt than feels comfortable.",
            "Applying smoke the entire cook. The first few hours are what matter most.",
            "Using mesquite on everything. It's one of the most overpowering woods available.",
            "Chasing a precise temperature instead of maintaining a consistent range.",
            "Salting right before the cook. Salt needs time to penetrate — give it hours, not minutes.",
          ]}
        />

        <Fixes
          items={[
            "Salt large cuts the night before and rest uncovered in the fridge.",
            "Focus smoke exposure on the first two to three hours of the cook.",
            "Match wood to protein. Fruit woods for poultry and pork. Oak and hickory for beef.",
            "Prioritize temperature consistency over hitting an exact number.",
            "Taste your rub before applying it. If it doesn't taste good on your finger, it won't taste good on the meat.",
          ]}
        />

        <PitVariations
          variations={[
            { pit: "Offset", note: "Smoke exposure is high and continuous. Use restraint with strong woods. Oak or a fruit wood blend works well. Salt the night before — offset cooks run long." },
            { pit: "Pellet", note: "Smoke flavor is milder than stick burners. Use a smoke tube for added exposure in the early hours. Salt and seasoning do more of the flavor work here." },
            { pit: "Kamado", note: "Efficient combustion means less smoke output. Add wood chunks directly to the lump for smoke. The sealed environment holds flavor well." },
            { pit: "Kettle", note: "Short cooks benefit from fruit wood chunks. Salt timing matters more on faster cooks — don't skip the overnight rest for larger cuts." },
            { pit: "Drum", note: "High humidity keeps the surface moist longer, which means smoke absorbs well throughout. Don't overload with wood — the enclosed environment amplifies smoke." },
            { pit: "Cabinet / Vertical", note: "Smoke rises evenly through the chamber. Wood placement near the heat source is key. Salt penetration is the same as any other pit — start early." },
            { pit: "Electric", note: "Smoke output is limited by the chip tray capacity. Add chips in the first two hours only. Salt and heat carry more of the flavor load on electric." },
          ]}
        />

        <PreacherNote>
          Salt seasons it. Smoke flavors it. Heat finishes it. All three have to show up.
        </PreacherNote>

        <RelatedLinks
          links={[
            { label: "Meat Science", href: "/playbook/meat-science" },
            { label: "Fire Behavior", href: "/playbook/fire-behavior" },
            { label: "Finishing Moves", href: "/playbook/finishing-moves" },
          ]}
        />

      </PlaybookArticle>
    </PlaybookLayout>
  );
}
