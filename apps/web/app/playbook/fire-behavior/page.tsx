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
        intro="Your pit is only as good as the fire inside it. Understanding how heat moves, where it concentrates, and how airflow controls it is the difference between a cook you manage and one that manages you."
      >

        <SectionHeader>How Heat Moves</SectionHeader>
        <SectionContent>
          <p>Heat moves through your pit three ways: convection, conduction, and radiation. All three are happening at once. The ratio between them depends on your pit type and how you run it.</p>
          <p>Convection is hot air moving. It's the primary cook mechanism in most pits. Hot air rises from the fire, circulates through the cooking chamber, and transfers heat to the meat. The faster the airflow, the more aggressive the convective heat.</p>
          <p>Conduction is direct contact heat transfer — grates to meat. It's a smaller factor in low and slow cooking but matters for searing and when meat sits directly on a surface for a long time.</p>
          <p>Radiation is infrared heat coming off the fire, coals, or hot surfaces. In an offset with a big coal bed or a kamado running hot, radiant heat is significant. It browns surfaces fast and can create hot spots if your meat is too close to the source.</p>
        </SectionContent>

        <SectionHeader>Airflow is the Throttle</SectionHeader>
        <SectionContent>
          <p>Fire needs oxygen to burn. Airflow controls how hot your fire burns and how efficiently it burns. Your intake vents feed oxygen to the fire. Your exhaust vents pull air through the system. Together they create the draft that keeps your fire alive.</p>
          <p>More airflow means a hotter, more active fire. Less airflow means a cooler, slower burn. This is how you dial in your temperature — not by adding or removing fuel, but by controlling how much air your fire gets.</p>
          <p>A common mistake is chasing temperature with fuel. If your pit is running cool, the instinct is to add more wood or charcoal. But if your vents are choked down, more fuel just smothers the fire. Open your intake first. Let the fire breathe before you add anything.</p>
        </SectionContent>

        <SectionHeader>Hot Spots and Cold Zones</SectionHeader>
        <SectionContent>
          <p>Every pit has hot spots and cold zones. The area closest to the firebox in an offset runs hotter. The far end of the cooking chamber runs cooler. On a kettle, the area directly over the coals is a hot zone. The indirect side is your cooking zone.</p>
          <p>Knowing your pit's heat map is one of the most valuable things you can learn. A cheap oven thermometer placed at grate level at different positions will tell you more about your pit than any gauge mounted in the lid. Lid thermometers measure air temperature at lid height — often 50°F or more hotter than what the meat is actually experiencing at grate level.</p>
          <p>Use hot spots intentionally. Finish a brisket flat in the hot zone for bark development. Start a pork shoulder in the cooler zone for a longer, slower render. Work the heat map, don't fight it.</p>
        </SectionContent>

        <SectionHeader>Clean Fire vs Dirty Fire</SectionHeader>
        <SectionContent>
          <p>Clean fire burns hot and produces thin, blue-gray smoke. That's the smoke you want on your meat. It carries the flavor compounds that make BBQ taste like BBQ.</p>
          <p>Dirty fire smolders. It produces thick, white or black smoke loaded with creosote and particulates. Meat cooked in dirty smoke tastes bitter and acrid. A thick white smoke cloud pouring out of your pit is a warning, not a feature.</p>
          <p>Clean fire comes from dry, seasoned wood and enough airflow to keep combustion complete. Wet wood, green wood, and starved airflow all produce dirty fire. If your smoke looks wrong, fix the fire before you worry about anything else.</p>
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
