// app/playbook/meat-science/page.tsx

import PlaybookLayout from "@/components/playbook/PlaybookLayout";
import PlaybookArticle from "@/components/playbook/PlaybookArticle";
import SectionHeader from "@/components/playbook/SectionHeader";
import SectionContent from "@/components/playbook/SectionContent";
import CommonMistakes from "@/components/playbook/CommonMistakes";
import Fixes from "@/components/playbook/Fixes";
import PitVariations from "@/components/playbook/PitVariations";
import PreacherNote from "@/components/playbook/PreacherNote";
import RelatedLinks from "@/components/playbook/RelatedLinks";

export default function MeatSciencePage() {
  return (
    <PlaybookLayout breadcrumb={[{ label: "Meat Science" }]}>
      <PlaybookArticle
        module="Module 01 — Free"
        title="Meat Science"
        intro="BBQ isn't magic. It's biology. Once you understand what's happening inside the cut, you stop guessing and start cooking with purpose."
      >

        <SectionHeader>Collagen and Why It Matters</SectionHeader>
        <SectionContent>
          <p>Tough cuts — brisket, pork shoulder, ribs — are loaded with collagen. Collagen is the connective tissue that holds muscle fibers together. At low temperatures it's what makes those cuts chewy and hard to eat.</p>
          <p>When you cook low and slow, collagen breaks down into gelatin. Gelatin is what gives great BBQ its pull, its moisture, and that sticky coating on your fingers. You can't rush it. It happens between 160°F and 180°F internal and it takes time — sometimes hours.</p>
          <p>This is why a brisket cooked to 165°F in two hours tastes nothing like one that spent 12 hours getting there. Temperature is part of the equation. Time is the other half.</p>
        </SectionContent>

        <SectionHeader>Fat Render</SectionHeader>
        <SectionContent>
          <p>Fat renders — melts — at a lower temperature than collagen breaks down. Intramuscular fat, the kind marbled through the meat, starts rendering around 130°F. That fat bastes the muscle fibers from the inside as it liquefies.</p>
          <p>External fat caps are different. A thick fat cap takes longer to render and acts as a heat shield. Some pitmasters trim it down to a quarter inch. Others leave it intact and flip the meat fat-side down toward the heat source. Both approaches work. What doesn't work is leaving a thick fat cap and expecting it to fully render in a short cook.</p>
          <p>Properly rendered fat is slick, almost transparent, and soaks into the bark. Unrendered fat is white, waxy, and coats your mouth in a way that kills the bite.</p>
        </SectionContent>

        <SectionHeader>The Stall</SectionHeader>
        <SectionContent>
          <p>The stall is when your meat stops climbing in temperature — sometimes for two to four hours. It usually hits somewhere between 150°F and 170°F. First time it happens, most people panic. Don't.</p>
          <p>The stall is evaporative cooling. As the surface of the meat sweats moisture, that evaporation cools the meat at the same rate your pit is heating it. It's the same physics as sweating. The meat is essentially air conditioning itself.</p>
          <p>You have two options. Wait it out — the stall always breaks on its own eventually. Or wrap the meat in butcher paper or foil, which stops the evaporation and pushes through it faster. Wrapping in foil is faster but softens the bark. Butcher paper is slower but preserves more crust. Both are legitimate. Naked is also legitimate if you have the time and patience.</p>
        </SectionContent>

        <SectionHeader>Time Beats Temperature</SectionHeader>
        <SectionContent>
          <p>Internal temperature tells you where the meat is. It doesn't tell you if it's done. A brisket at 203°F that got there in five hours is not the same as one that took fourteen. The collagen conversion and fat render are time-dependent processes, not just temperature-dependent ones.</p>
          <p>Probe tenderness is more reliable than any number on a thermometer. When a probe or skewer slides in with no resistance — like pushing into warm butter — the meat is done. That's the real signal. Temperature is a guideline. Feel is the answer.</p>
        </SectionContent>

        <CommonMistakes
          items={[
            "Pulling the meat when it hits a target temp without checking probe tenderness.",
            "Panicking during the stall and cranking the heat to push through it.",
            "Skipping the rest. Resting lets the gelatin resettle and the juices redistribute.",
            "Leaving too much fat cap and expecting it to render in a short cook.",
            "Judging doneness on cheap cuts the same way as well-marbled ones.",
          ]}
        />

        <Fixes
          items={[
            "Use probe tenderness as your primary doneness signal. Temperature is secondary.",
            "When the stall hits, hold your temperature and trust the process. Wrap if you're short on time.",
            "Rest large cuts for at least one hour. Two hours in a cooler wrapped in towels is better.",
            "Trim fat caps to a quarter inch before the cook. Let the marbling do the work.",
            "Buy quality meat. Science can't fix a poorly marbled cut.",
          ]}
        />

        <PitVariations
          variations={[
            { pit: "Offset", note: "Dry heat and airflow accelerate surface evaporation. Stalls hit hard and long. Plan for it." },
            { pit: "Pellet", note: "Consistent temps mean predictable stalls. The humid cooking environment can extend the stall slightly." },
            { pit: "Kamado", note: "Retained moisture means a milder stall. Fat render can take longer due to lower airflow." },
            { pit: "Kettle", note: "Runs hot and dry. Fat renders fast. Watch your temps — it's easy to push through the stall too aggressively." },
            { pit: "Drum", note: "High humidity inside the drum softens the stall. Great collagen conversion environment." },
            { pit: "Cabinet / Vertical", note: "Even heat from top to bottom. Stall is predictable. Fat cap placement matters more here." },
            { pit: "Electric", note: "Very humid environment. Collagen breaks down well but bark development suffers. Plan to unwrap for the last hour." },
          ]}
        />

        <PreacherNote>
          The meat tells you when it's done. Your job is to listen.
        </PreacherNote>

        <RelatedLinks
          links={[
            { label: "Fire Behavior", href: "/playbook/fire-behavior" },
            { label: "Timeline Philosophy", href: "/playbook/timeline-philosophy" },
            { label: "Troubleshooting", href: "/playbook/troubleshooting" },
          ]}
        />

      </PlaybookArticle>
    </PlaybookLayout>
  );
}
