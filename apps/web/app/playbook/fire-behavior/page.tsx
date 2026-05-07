// app/playbook/fire-behavior/page.tsx

import PlaybookLayout from "@/components/playbook/PlaybookLayout";
import PlaybookArticle from "@/components/playbook/PlaybookArticle";
import SectionHeader from "@/components/playbook/SectionHeader";
import SectionContent from "@/components/playbook/SectionContent";
import CommonMistakes from "@/components/playbook/CommonMistakes";
import Fixes from "@/components/playbook/Fixes";
import PitVariations from "@/components/playbook/PitVariations";
import PreacherNote from "@/components/playbook/PreacherNote";
import RelatedLinks from "@/components/playbook/RelatedLinks";

export default function FireBehaviorPage() {
  return (
    <PlaybookLayout breadcrumb={[{ label: "Fire Behavior" }]}>
      <PlaybookArticle
        module="Module 02 — Basic+"
        title="Fire Behavior"
        intro="Your pit is only as good as the fire inside it. Learn how heat moves. Where it concentrates. How airflow controls it. That's the difference between a cook you manage and one that manages you."
      >

        <SectionHeader>How Heat Moves</SectionHeader>
        <SectionContent>
          <p>Heat moves three ways. Convection. Conduction. Radiation. All happen at once. The ratio depends on your pit type. How you run it.</p>
          <p>Convection is hot air moving. It's the main cook in most pits. Hot air rises from the fire. Circulates through the chamber. Transfers heat to the meat. Faster airflow means more aggressive heat.</p>
          <p>Conduction is direct contact. Grates to meat. Smaller factor in low and slow. Matters for searing. When meat sits on a surface long.</p>
          <p>Radiation is infrared heat. Off the fire, coals, hot surfaces. Significant in offset with big coal bed. Kamado running hot. Browns surfaces fast. Creates hot spots if meat is too close.</p>
        </SectionContent>

        <SectionHeader>Airflow is the Throttle</SectionHeader>
        <SectionContent>
          <p>Airflow controls how hot your fire burns. How efficiently it burns. Intake vents feed oxygen to the fire. Exhaust vents pull air through. Together they create the draft. Keeps your fire alive.</p>
          <p>More airflow means hotter fire. More active. Less airflow means cooler. Slower burn. This is how you dial temperature. Not by adding fuel. By controlling air.</p>
          <p>Don't chase temperature with fuel. If pit is cool, instinct is add wood or charcoal. But if vents are choked, more fuel smothers the fire. Open intake first. Let fire breathe. Then add fuel.</p>
        </SectionContent>

        <SectionHeader>Hot Spots and Cold Zones</SectionHeader>
        <SectionContent>
          <p>Every pit has hot spots. Cold zones. Closest to firebox in offset runs hotter. Far end runs cooler. On kettle, over coals is hot zone. Indirect side is cooking zone.</p>
          <p>Know your pit's heat map. Cheap oven thermometer at grate level. Different positions. Tells you more than lid gauge. Lid measures air at lid height. Often 50°F hotter than grate level.</p>
          <p>Use hot spots intentionally. Finish brisket flat in hot zone for bark. Start pork shoulder in cooler zone for longer render. Work the heat map. Don't fight it.</p>
        </SectionContent>

        <SectionHeader>Clean Fire vs Dirty Fire</SectionHeader>
        <SectionContent>
          <p>Clean fire burns hot. Produces thin blue-gray smoke. That's the smoke you want. Carries flavor compounds. Makes BBQ taste like BBQ.</p>
          <p>Dirty fire smolders. Produces thick white or black smoke. Loaded with creosote. Particulates. Meat tastes bitter. Acrid. Thick white cloud is warning. Not feature.</p>
          <p>Clean fire from dry seasoned wood. Enough airflow for complete combustion. Wet wood. Green wood. Starved airflow produce dirty fire. If smoke looks wrong, fix fire first.</p>
        </SectionContent>

        <CommonMistakes
          items={[
            "Trusting the lid thermometer. It reads air temp at lid height, not grate temp where the meat sits.",
            "Adding fuel when the pit is cool instead of opening the intake vents first.",
            "Running thick white smoke and calling it good. That's dirty fire, not flavor.",
            "Ignoring hot spots instead of mapping and using them intentionally.",
            "Choking the exhaust vent to control temperature. Keep the exhaust open and control temp with the intake.",
          ]}
        />

        <Fixes
          items={[
            "Place a thermometer at grate level near the meat to get an accurate cook temp reading.",
            "Adjust intake vents first when chasing temperature. Add fuel only after vents are open.",
            "Aim for thin blue-gray smoke. If it's thick and white, let the fire burn hotter before putting meat on.",
            "Run the exhaust vent fully open at all times. Use only the intake to control your temperature.",
            "Learn your pit's heat map with a test run before a serious cook.",
          ]}
        />

        <PitVariations
          variations={[
            { pit: "Offset", note: "Convection-dominant. Hot near the firebox, cool at the far end. Rotate meat if you don't have a baffle. Clean fire is critical — offsets punish dirty smoke more than any other pit." },
            { pit: "Pellet", note: "Fan-driven convection makes heat very even. Hot spots are minimal. Fire management is automated but you still need clean pellets and a clean firepot." },
            { pit: "Kamado", note: "Ceramic walls retain and radiate heat. Very efficient. Small vent adjustments have big effects — move slowly when dialing in temp. Radiant heat from the lump is significant." },
            { pit: "Kettle", note: "Two-zone setup is your best friend. Coals on one side, meat on the other. Use the vents to dial temp. Bottom vent is your intake, top vent is exhaust." },
            { pit: "Drum", note: "Convection-heavy with high humidity from the meat drippings. Runs hot for its size. Intake control is critical — drums respond fast to vent changes." },
            { pit: "Cabinet / Vertical", note: "Heat rises from the bottom firebox through the cooking chamber. Even heat distribution. Watch the bottom rack — it runs hotter." },
            { pit: "Electric", note: "No fire management required. Heat is electric. Smoke comes from a wood chip tray. Focus on chip quality and moisture for flavor." },
          ]}
        />

        <PreacherNote>
          A clean fire forgives a lot of sins. A dirty one creates new ones.
        </PreacherNote>

        <RelatedLinks
          links={[
            { label: "Meat Science", href: "/playbook/meat-science" },
            { label: "The Holy Trinity", href: "/playbook/holy-trinity" },
            { label: "Troubleshooting", href: "/playbook/troubleshooting" },
          ]}
        />

      </PlaybookArticle>
    </PlaybookLayout>
  );
}
