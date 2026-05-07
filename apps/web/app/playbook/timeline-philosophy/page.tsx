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
        intro="BBQ doesn't run on clock. Meat decides when done. Your job is build timeline gives room to get there. Without leaving guests standing around at 10pm."
      >

        <SectionHeader>Work Backwards From the Table</SectionHeader>
        <SectionContent>
          <p>Start with when you want to eat. That's anchor. Everything else builds backward from that moment.</p>
          <p>If want eat at 6pm, brisket needs one-hour rest, comes off pit by 5pm. 14-hour cook at 225°F, fire lit at 3am. That's start time. Not time feel like waking. Time math requires.</p>
          <p>Most timeline problems are planning problems. Cook didn't run long. Plan didn't account for reality. Build timeline before cook. Not during.</p>
        </SectionContent>

        <SectionHeader>The Buffer Is Not Optional</SectionHeader>
        <SectionContent>
          <p>Every serious cook needs buffer built in. Two hours minimum for large cuts. Buffer is not wasted time. It's insurance.</p>
          <p>If cook finishes early, meat goes into cooler wrapped in towels. Holds at safe temperature four hours without losing quality. Brisket finished two hours early rested in cooler often better than carved right off pit. Extended rest does real work.</p>
          <p>If cook runs long, buffer absorbs it. No scrambling. No cranking heat. No serving tough meat because ran out of time. Buffer separates calm cook from stressful one.</p>
        </SectionContent>

        <SectionHeader>Estimated Cook Times Are Starting Points</SectionHeader>
        <SectionContent>
          <p>Every cook time estimate you've read is range. Not guarantee. 12-pound brisket at 225°F might take 14 hours. Might take 18. Variables. Meat quality. Fat content. Pit consistency. Weather. Humidity. All affect how long biology takes to run course.</p>
          <p>Use estimates to build plan. Don't use to set serving time. Estimate gets in ballpark. Buffer and cooler handle rest.</p>
          <p>Per-pound estimates useful for planning. Unreliable for precision. 14-pound brisket does not take exactly 1.5 hours per pound. Use as rough starting point. Build in buffer. Let probe tenderness tell when actually done.</p>
        </SectionContent>

        <SectionHeader>Managing Multiple Proteins</SectionHeader>
        <SectionContent>
          <p>Cooking multiple proteins at once is timeline problem as much as cooking problem. Everything needs finish around same time without any item suffering for others.</p>
          <p>Anchor timeline to longest cook. Brisket takes longest. Build everything else around it. Pork shoulder goes on with brisket or slightly after. Ribs go on afternoon. Chicken goes on last two hours. Everything lands in window.</p>
          <p>Use cooler as staging tool. Brisket finishes first goes into cooler. Pork shoulder finishes next joins it. Ribs come off last rest briefly. Everything hits table together. Cooler not just for holding. Part of service strategy.</p>
        </SectionContent>

        <SectionHeader>Weather and Environment</SectionHeader>
        <SectionContent>
          <p>Cold weather extends cook times. Wind pulls heat from pit. Makes temperature management harder. Rain affects airflow fire behavior on charcoal wood pits. Not excuses. Variables you need account for.</p>
          <p>Cold weather, add 20 to 30 percent to estimated cook time. Shield pit from wind if possible. Start fire earlier. Meat doesn't know cold outside. Just knows not getting enough heat to move through process at expected pace.</p>
          <p>Hot weather works other way. Pit in direct Texas summer sun runs hotter than same pit in shade in March. Know environment. Adjust estimates accordingly.</p>
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
