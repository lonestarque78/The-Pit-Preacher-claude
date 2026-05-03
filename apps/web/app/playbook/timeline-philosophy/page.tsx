// app/playbook/timeline-philosophy/page.tsx

import PlaybookLayout from "@/components/playbook/PlaybookLayout";
import PlaybookArticle from "@/components/playbook/PlaybookArticle";
import SectionHeader from "@/components/playbook/SectionHeader";
import SectionContent from "@/components/playbook/SectionContent";
import CommonMistakes from "@/components/playbook/CommonMistakes";
import Fixes from "@/components/playbook/Fixes";
import PitVariations from "@/components/playbook/PitVariations";
import PreacherNote from "@/components/playbook/PreacherNote";
import RelatedLinks from "@/components/playbook/RelatedLinks";

export default function TimelinePhilosophyPage() {
  return (
    <PlaybookLayout breadcrumb={[{ label: "Timeline Philosophy" }]}>
      <PlaybookArticle
        module="Module 07 — Backyard+"
        title="Timeline Philosophy"
        intro="BBQ doesn't run on a clock. The meat decides when it's done. Your job is to build a timeline that gives it room to get there without leaving your guests standing around at 10pm."
      >

        <SectionHeader>Work Backwards From the Table</SectionHeader>
        <SectionContent>
          <p>Start with when you want to eat. That's your anchor. Everything else builds backward from that moment.</p>
          <p>If you want to eat at 6pm, and your brisket needs a one-hour rest, it needs to come off the pit by 5pm. If it's a 14-hour cook at 225°F, the fire needs to be lit at 3am. That's your start time. Not the time you feel like waking up — the time the math requires.</p>
          <p>Most timeline problems are planning problems. The cook didn't run long — the plan didn't account for reality. Build the timeline before the cook, not during it.</p>
        </SectionContent>

        <SectionHeader>The Buffer Is Not Optional</SectionHeader>
        <SectionContent>
          <p>Every serious cook needs a buffer built in. Two hours minimum for large cuts. The buffer is not wasted time — it's insurance.</p>
          <p>If the cook finishes early, the meat goes into a cooler wrapped in towels. It holds at safe temperature for four hours without losing quality. A brisket that finished two hours early and rested in a cooler is often better than one carved right off the pit. The extended rest does real work.</p>
          <p>If the cook runs long, the buffer absorbs it. No scrambling. No cranking the heat. No serving tough meat because you ran out of time. The buffer is what separates a calm cook from a stressful one.</p>
        </SectionContent>

        <SectionHeader>Estimated Cook Times Are Starting Points</SectionHeader>
        <SectionContent>
          <p>Every cook time estimate you've ever read is a range, not a guarantee. A 12-pound brisket at 225°F might take 14 hours. It might take 18. The variables — meat quality, fat content, pit consistency, weather, humidity — all affect how long the biology takes to run its course.</p>
          <p>Use estimates to build your plan. Don't use them to set your serving time. The estimate gets you in the ballpark. The buffer and the cooler handle the rest.</p>
          <p>Per-pound estimates are useful for planning but unreliable for precision. A 14-pound brisket does not take exactly 1.5 hours per pound. Use them as a rough starting point, build in the buffer, and let probe tenderness tell you when it's actually done.</p>
        </SectionContent>

        <SectionHeader>Managing Multiple Proteins</SectionHeader>
        <SectionContent>
          <p>Cooking multiple proteins at once is a timeline problem as much as a cooking problem. Everything needs to finish around the same time without any one item suffering for the others.</p>
          <p>Anchor your timeline to the longest cook. Brisket takes longest — build everything else around it. Pork shoulder goes on with the brisket or slightly after. Ribs go on in the afternoon. Chicken goes on in the last two hours. Everything lands in the window.</p>
          <p>Use the cooler as a staging tool. Brisket finishes first and goes into the cooler. Pork shoulder finishes next and joins it. Ribs come off last and rest briefly. Everything hits the table together. The cooler is not just for holding — it's part of your service strategy.</p>
        </SectionContent>

        <SectionHeader>Weather and Environment</SectionHeader>
        <SectionContent>
          <p>Cold weather extends cook times. Wind pulls heat from the pit and makes temperature management harder. Rain affects airflow and fire behavior on charcoal and wood pits. These are not excuses — they are variables you need to account for.</p>
          <p>In cold weather, add 20 to 30 percent to your estimated cook time. Shield your pit from wind if possible. Start your fire earlier. The meat doesn't know it's cold outside — it just knows it's not getting enough heat to move through the process at the expected pace.</p>
          <p>Hot weather works the other way. A pit in direct Texas summer sun runs hotter than the same pit in the shade in March. Know your environment and adjust your estimates accordingly.</p>
        </SectionContent>

        <CommonMistakes
          items={[
            "Setting a serving time based on estimated cook time with no buffer.",
            "Cranking heat when the cook is running behind instead of using the cooler to buy time.",
            "Forgetting to account for the rest when planning backward from the table.",
            "Ignoring weather. Cold and wind add real time to a long cook.",
            "Planning multiple proteins to finish at the exact same time with no margin.",
          ]}
        />

        <Fixes
          items={[
            "Always build at least a two-hour buffer into your timeline for large cuts.",
            "Plan backward from the table — eating time minus rest time minus cook time equals start time.",
            "Use the cooler as part of your plan, not just as a backup.",
            "Add 20 to 30 percent to estimated cook times when cooking in cold or windy conditions.",
            "Anchor multi-protein cooks to the longest item and stagger everything else backward from there.",
          ]}
        />

        <PitVariations
          variations={[
            { pit: "Offset", note: "Longest learning curve for consistent temps means more timeline variance. Build a bigger buffer until you know your pit well. Wind affects offsets more than any other style." },
            { pit: "Pellet", note: "Electronic temp control makes timelines more predictable. Shorter buffer needed but never skip it. Cold weather affects pellet consumption and can drop temps — keep the hopper full." },
            { pit: "Kamado", note: "Exceptional heat retention means minimal weather impact. Timeline variance is low once you're dialed in. Shorter buffer is reasonable on a kamado you know well." },
            { pit: "Kettle", note: "Shorter cooks mean tighter timelines. Less buffer needed but the margin for error is smaller. Get your setup right before the meat goes on." },
            { pit: "Drum", note: "Drums run hotter than expected which can shorten timelines. Build your buffer assuming the cook finishes early. It usually does." },
            { pit: "Cabinet / Vertical", note: "Even heat and large capacity make multi-protein cooks more manageable. Stagger start times and use the cooler to align finish times at service." },
            { pit: "Electric", note: "Most predictable timeline of any pit. Weather impact is minimal. Shorter buffer is acceptable but never zero — probe tenderness still varies by cut." },
          ]}
        />

        <PreacherNote>
          The meat is always the boss. Build your timeline around that fact and everything else falls into place.
        </PreacherNote>

        <RelatedLinks
          links={[
            { label: "Meat Science", href: "/playbook/meat-science" },
            { label: "Finishing Moves", href: "/playbook/finishing-moves" },
            { label: "Troubleshooting", href: "/playbook/troubleshooting" },
          ]}
        />

      </PlaybookArticle>
    </PlaybookLayout>
  );
}
