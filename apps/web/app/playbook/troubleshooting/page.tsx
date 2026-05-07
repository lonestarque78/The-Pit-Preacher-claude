// app/playbook/troubleshooting/page.tsx

import PlaybookLayout from "@/components/playbook/PlaybookLayout";
import PlaybookArticle from "@/components/playbook/PlaybookArticle";
import SectionHeader from "@/components/playbook/SectionHeader";
import SectionContent from "@/components/playbook/SectionContent";
import CommonMistakes from "@/components/playbook/CommonMistakes";
import Fixes from "@/components/playbook/Fixes";
import PitVariations from "@/components/playbook/PitVariations";
import PreacherNote from "@/components/playbook/PreacherNote";
import RelatedLinks from "@/components/playbook/RelatedLinks";

export default function TroubleshootingPage() {
  return (
    <PlaybookLayout breadcrumb={[{ label: "Troubleshooting" }]}>
      <PlaybookArticle
        module="Module 05 — Backyard+"
        title="Troubleshooting"
        intro="Something always goes sideways on long cook. Difference between pitmaster and beginner is knowing what's wrong. Before too late to fix."
      >

        <SectionHeader>Temperature Spikes</SectionHeader>
        <SectionContent>
          <p>Temperature spike means fire got more oxygen than needed. Most common cause is opening lid or vents too aggressively. Charcoal or wood pit, fresh air hits established coal bed. Temperature jumps fast.</p>
          <p>Don't panic. Close everything down. Fully choked pit swings too hot to too cold. Close intake vent halfway. Leave exhaust open. Give five minutes before another adjustment. Pits take time to respond. Especially ceramic.</p>
          <p>If temp spiked because added too much fuel at once, wait it out with vents mostly closed. Next time, add smaller splits more frequently. Not load firebox all at once.</p>
        </SectionContent>

        <SectionHeader>Temperature Drops</SectionHeader>
        <SectionContent>
          <p>Temp drop means fire starving. For oxygen. For fuel. Both. Check intake vent first. If choked down, open it. If fire died to ash no active coals, rebuild.</p>
          <p>Pellet grill, temp drop usually empty hopper. Jammed auger. Dirty firepot. Check hopper first. Always hopper. If full, look firepot for ash buildup blocking pellets igniting.</p>
          <p>Don't crank target temp to compensate drop. Let fire recover at actual target. Overcorrecting creates spike other side. Spend next hour chasing temperature. Not cooking.</p>
        </SectionContent>

        <SectionHeader>Stall That Won't Break</SectionHeader>
        <SectionContent>
          <p>Stall is normal. Lasts five six hours still normal on large brisket. If running out of time meat hasn't moved three hours, options.</p>
          <p>Wrap it. Butcher paper slows evaporative cooling causes stall. Without trapping much steam as foil. Foil pushes through faster. Softens bark. Either works. Choose based on time. How much bark preserve.</p>
          <p>Bump pit temp by 25°F. Not 50. Not 75. Twenty-five gives heat enough edge to push through stall. Without drying exterior. Rushing collagen conversion.</p>
        </SectionContent>

        <SectionHeader>Bark Won't Set</SectionHeader>
        <SectionContent>
          <p>Bark needs dry surface heat to form. Cooking environment too humid. Temperature too low. Surface stays moist. Rub never crisps into proper crust.</p>
          <p>If wrapped in foil, unwrap last hour. Bump temp to 275°F. Dry heat sets bark. High-humidity environment like drum electric smoker, crack vent or door slightly. Let moisture escape.</p>
          <p>Sugar-heavy rubs burn before bark sets at high temps. Rub has lot brown sugar, keep temps under 275°F. Give more time at lower heat. Not force with high heat.</p>
        </SectionContent>

        <SectionHeader>Meat Is Tough After Hitting Temp</SectionHeader>
        <SectionContent>
          <p>This is almost always time problem. Not temperature problem. Meat hit target temperature. Didn't spend enough time in collagen conversion zone. Can't fix with more heat after fact.</p>
          <p>If meat still on pit, wrap it. Hold at 250°F another hour or two. Collagen conversion continues as long as in right temperature range. Probe again. Looking for butter-soft feel. Not number.</p>
          <p>If already off pit slicing, serve what you have. Next time, plan longer cook with two-hour buffer built in. Hold finished brisket in cooler four hours. Can't un-rush tough one.</p>
        </SectionContent>

        <SectionHeader>Bitter or Acrid Flavor</SectionHeader>
        <SectionContent>
          <p>Bitter flavor is smoke problem. Specifically dirty fire problem. Thick white black smoke deposits creosote on meat surface. Once there, there. Can't cook it off.</p>
          <p>If catch early within first hour, pull meat. Wipe surface down. Fix fire. Put back on once clean smoke. If been on several hours, flavor already in meat. Serve with sauce cuts through bitterness.</p>
          <p>Next time: let fire fully establish with clean blue smoke before meat on. Never put cold meat on smoky smoldering fire hasn't found rhythm.</p>
        </SectionContent>

        <CommonMistakes
          items={[
            "Over-adjusting vents. Make one small change, wait five minutes, then reassess.",
            "Wrapping in foil at the first sign of a stall instead of giving it time.",
            "Putting meat on before the fire has settled into clean smoke.",
            "Judging doneness by temperature alone on a tough cut.",
            "Cranking heat to compensate for lost time. It speeds things up but ruins texture.",
          ]}
        />

        <Fixes
          items={[
            "Make one vent adjustment at a time and give the pit five minutes to respond.",
            "Let the stall run at least two to three hours before intervening. It always breaks.",
            "Wait for thin blue-gray smoke before putting meat on the pit.",
            "Use probe tenderness — not temperature — as your doneness signal on brisket and pork shoulder.",
            "Build buffer time into every cook. A two-hour hold in a cooler is always available to you.",
          ]}
        />

        <PitVariations
          variations={[
            { pit: "Offset", note: "Most troubleshooting on an offset is fire management. Dirty smoke and temp swings are the top issues. Keep splits dry, fire active, and exhaust fully open." },
            { pit: "Pellet", note: "Temp drops trace back to hopper, auger, or firepot. Clean the firepot after every cook. Check the auger if pellets are in the hopper but temps keep dropping." },
            { pit: "Kamado", note: "Temp spikes are common when opening the lid — flashback is a real risk at high temps. Burp the lid (crack it slightly before fully opening) to prevent flare-ups." },
            { pit: "Kettle", note: "Short cook window means less margin for error. Get your two-zone setup right before the meat goes on. Temp drops happen fast when the coal bed is small." },
            { pit: "Drum", note: "Drums run hotter than expected. Temp spikes are common when intake is opened too far. Make small adjustments. A drum at 300°F is hard to bring back down quickly." },
            { pit: "Cabinet / Vertical", note: "Bottom rack runs hot — if bark is burning on the bottom, rotate or shield with a piece of foil under the meat. Water pan helps regulate temperature." },
            { pit: "Electric", note: "Temp issues are rare on electric. Flavor issues are more common. Bitter taste usually means too many chips smoldering at once. Add less, add earlier." },
          ]}
        />

        <PreacherNote>
          Every problem on the pit has a cause. Find the cause and you find the fix.
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
