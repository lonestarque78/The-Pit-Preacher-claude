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
        intro="Something is always going sideways on a long cook. The difference between a pitmaster and a beginner is knowing what's wrong before it's too late to fix it."
      >

        <SectionHeader>Temperature Spikes</SectionHeader>
        <SectionContent>
          <p>A temperature spike means your fire got more oxygen than it needed. The most common cause is opening the lid or vents too aggressively. On a charcoal or wood pit, fresh air hits an established coal bed and the temperature jumps fast.</p>
          <p>Don't panic and close everything down. A fully choked pit swings from too hot to too cold. Instead, close the intake vent halfway and leave the exhaust open. Give it five minutes before making another adjustment. Pits take time to respond — especially ceramic ones.</p>
          <p>If your temp spiked because you added too much fuel at once, there's not much to do but wait it out with vents mostly closed. Next time, add smaller splits more frequently instead of loading the firebox all at once.</p>
        </SectionContent>

        <SectionHeader>Temperature Drops</SectionHeader>
        <SectionContent>
          <p>A temp drop means your fire is starving — for oxygen, for fuel, or both. Check your intake vent first. If it's choked down, open it. If the fire has died down to ash with no active coals, you need to rebuild.</p>
          <p>On a pellet grill, a temp drop usually means an empty hopper, a jammed auger, or a dirty firepot. Check the hopper first — it's always the hopper. If the hopper is full, look at the firepot for ash buildup blocking the pellets from igniting.</p>
          <p>Don't crank the target temp to compensate for a drop. Let the fire recover at the actual target temp. Overcorrecting creates a spike on the other side and you spend the next hour chasing temperature instead of cooking.</p>
        </SectionContent>

        <SectionHeader>Stall That Won't Break</SectionHeader>
        <SectionContent>
          <p>The stall is normal. A stall that lasts five or six hours is still normal on a large brisket in dry heat. But if you're running out of time and the meat hasn't moved in three hours, you have options.</p>
          <p>Wrap it. Butcher paper slows the evaporative cooling that causes the stall without trapping as much steam as foil. Foil pushes through the stall faster but softens the bark. Either works — choose based on how much time you have and how much bark you want to preserve.</p>
          <p>Bump your pit temp by 25°F. Not 50, not 75. Twenty-five degrees gives the heat enough edge to push through the stall without drying out the exterior or rushing the collagen conversion.</p>
        </SectionContent>

        <SectionHeader>Bark Won't Set</SectionHeader>
        <SectionContent>
          <p>Bark needs dry surface heat to form. If your cooking environment is too humid or your temperature is too low, the surface stays moist and the rub never crisps up into a proper crust.</p>
          <p>If you wrapped in foil, unwrap for the last hour and bump the temp to 275°F. The dry heat will set the bark. If you're cooking in a high-humidity environment like a drum or electric smoker, crack the vent or door slightly to let moisture escape.</p>
          <p>Sugar-heavy rubs burn before bark sets at high temps. If your rub has a lot of brown sugar, keep temps under 275°F and give it more time at lower heat rather than trying to force it with high heat.</p>
        </SectionContent>

        <SectionHeader>Meat Is Tough After Hitting Temp</SectionHeader>
        <SectionContent>
          <p>This is almost always a time problem, not a temperature problem. The meat hit the target temperature but didn't spend enough time in the collagen conversion zone. You can't fix this with more heat after the fact.</p>
          <p>If the meat is still on the pit, wrap it and hold it at 250°F for another hour or two. Collagen conversion continues as long as the meat is in the right temperature range. Probe it again — you're looking for that butter-soft feel, not a number.</p>
          <p>If it's already off the pit and you're slicing, serve what you have. For next time, plan a longer cook with a two-hour buffer built in. You can always hold a finished brisket in a cooler for four hours. You can't un-rush a tough one.</p>
        </SectionContent>

        <SectionHeader>Bitter or Acrid Flavor</SectionHeader>
        <SectionContent>
          <p>Bitter flavor is a smoke problem. Specifically, it's a dirty fire problem. Thick white or black smoke deposits creosote on the meat surface. Once it's there, it's there. You can't cook it off.</p>
          <p>If you catch it early — within the first hour — pull the meat, wipe the surface down, fix your fire, and put it back on once you have clean smoke. If it's been on for several hours, the flavor is already in the meat. Serve it with a sauce that can cut through the bitterness.</p>
          <p>For next time: let your fire fully establish with clean blue smoke before putting meat on. Never put cold meat on a smoky, smoldering fire that hasn't found its rhythm yet.</p>
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
