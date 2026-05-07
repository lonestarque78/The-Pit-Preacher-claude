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
        intro="Salt. Smoke. Heat. Every great cook comes down to these three. Get one wrong. The other two can't save you."
      >

        <SectionHeader>Salt</SectionHeader>
        <SectionContent>
          <p>Salt is the foundation. Penetrates the meat. Seasons from inside out. Draws moisture to surface. Mixes with rub. Forms bark. Without salt, everything is surface level.</p>
          <p>Kosher salt is standard. Coarse enough to control. Dissolves evenly. No additives. Table salt too fine. Over-seasons fast. Hard to apply evenly. Sea salt works. Costs more. No difference on big cut.</p>
          <p>Apply salt early. Brisket and pork shoulder, salt night before. Rest uncovered in fridge. Gives salt time to penetrate deep. Ribs and chicken, few hours enough. Longer salt works, more even seasoning.</p>
          <p>Don't be shy. Large cuts need more salt than you think. Properly salted brisket looks well coated. Not lightly dusted. If second-guessing, you haven't added enough.</p>
        </SectionContent>

        <SectionHeader>Smoke</SectionHeader>
        <SectionContent>
          <p>Smoke is flavor. Also a tool that can ruin a cook. Goal is smoke ring penetration. Surface flavor. Not bitter acrid crust. Tastes like ashtray.</p>
          <p>Smoke penetration happens early. Before surface dries. Bark sets. First two three hours on pit. Smoke does most work. After, surface sealed. New smoke has diminishing returns.</p>
          <p>Wood choice matters. Fruit woods like apple cherry mild sweet. Good for poultry pork. Oak hickory stronger. Work well on beef. Mesquite burns hot bold. Use sparingly. Dominates everything. Match wood to protein. Intensity you want.</p>
          <p>Smoke ring is pink band under surface. Chemical reaction between myoglobin and nitrogen dioxide. Visual indicator of smoke exposure. Doesn't equal flavor. Don't chase ring. Chase taste.</p>
        </SectionContent>

        <SectionHeader>Heat</SectionHeader>
        <SectionContent>
          <p>Heat is the engine. Drives every process. Salt penetration. Smoke absorption. Collagen breakdown. Fat render. Bark formation. Moisture loss. Too much heat, outrun biology. Too little, never get there.</p>
          <p>225°F to 275°F is low and slow range for most BBQ. 225°F gives maximum time for collagen conversion. Smoke exposure. 275°F moves faster. Better bark on brisket. Neither wrong. Both require understanding meat at those temperatures.</p>
          <p>Consistency matters more than precise number. Pit holds 250°F steady all day beats swings between 200°F 300°F. Stable heat produces predictable results. Erratic heat produces erratic results.</p>
        </SectionContent>

        <SectionHeader>How They Work Together</SectionHeader>
        <SectionContent>
          <p>Trinity is system. Not three independent variables. Salt pulls moisture to surface. Helps smoke adhere. Form bark. Heat drives smoke into meat while surface moist. Cook progresses, heat dries surface. Sets bark. Breaks down interior.</p>
          <p>When something wrong in cook, usually one out of balance. Bland meat is salt problem. Bitter acrid flavor is smoke problem. Tough texture undercooked fat is heat time problem. Diagnose trinity before blame cut.</p>
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
