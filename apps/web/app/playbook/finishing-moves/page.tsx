// app/playbook/finishing-moves/page.tsx

import PlaybookLayout from "@/components/playbook/PlaybookLayout";
import PlaybookArticle from "@/components/playbook/PlaybookArticle";
import SectionHeader from "@/components/playbook/SectionHeader";
import SectionContent from "@/components/playbook/SectionContent";
import CommonMistakes from "@/components/playbook/CommonMistakes";
import Fixes from "@/components/playbook/Fixes";
import PitVariations from "@/components/playbook/PitVariations";
import PreacherNote from "@/components/playbook/PreacherNote";
import RelatedLinks from "@/components/playbook/RelatedLinks";

export default function FinishingMovesPage() {
  return (
    <PlaybookLayout breadcrumb={[{ label: "Finishing Moves" }]}>
      <PlaybookArticle
        module="Module 06 — Backyard+"
        title="Finishing Moves"
        intro="Last hour of cook is where most lose what spent all day building. Meat is done. Now finish it right."
      >

        <SectionHeader>The Rest</SectionHeader>
        <SectionContent>
          <p>Resting is not optional. It is part of the cook. Meat comes off pit, muscle fibers contracted. Internal juices pushed toward center. Cutting immediately sends juices onto cutting board. Not staying in meat.</p>
          <p>During rest, fibers relax. Gelatin formed during collagen conversion redistributes. Internal temperature equalizes edge to center. Brisket rests properly slices cleaner. Holds juice better. Tastes more consistent flat to point.</p>
          <p>Minimum rest times: chicken ribs at least 15 minutes. Pork shoulder 45 minutes to hour. Brisket at least one hour. Two better. Wrap in butcher paper or foil. Then towel. Put in cooler. Holds safely four hours. This is buffer. Use it.</p>
        </SectionContent>

        <SectionHeader>Wrapping for the Rest</SectionHeader>
        <SectionContent>
          <p>How you wrap affects rest. Foil traps steam. Keeps bark softer. Acceptable for pulled pork where bark mixed in. Less ideal for brisket where crust part of experience. Butcher paper breathes slightly. Preserves more bark texture.</p>
          <p>Unwrapped resting option for shorter rests smaller cuts. Rack ribs resting uncovered 15 minutes cutting board loses minimal heat. Keeps bark intact. Large cuts resting over hour, wrap to retain heat.</p>
          <p>Don't rest on cold surface. Cold sheet pan pulls heat out bottom meat faster than rest cools. Rest on wooden cutting board or rack over sheet pan.</p>
        </SectionContent>

        <SectionHeader>Slicing</SectionHeader>
        <SectionContent>
          <p>Slicing against grain is not suggestion. Muscle fibers run in direction. Cutting with grain leaves long fibers chewy regardless how well meat cooked. Cutting against grain shortens fibers. Makes every bite tender.</p>
          <p>Brisket has two muscles. Flat and point. Run in different directions. Separate before slicing or adjust angle as cross from one to other. Slicing whole brisket one direction is common mistake at cutting board.</p>
          <p>Slice thickness matters. Brisket quarter inch standard. Too thin falls apart. Too thick texture suffers. Pork shoulder gets pulled or chopped. Not sliced. Ribs cut between every bone. Not every other.</p>
          <p>Use sharp knife. Dull blade drags tears instead cutting clean. Sharp slicing knife or carving knife makes difference on final presentation.</p>
        </SectionContent>

        <SectionHeader>Sauce</SectionHeader>
        <SectionContent>
          <p>Great BBQ doesn't need sauce. Sauce is finishing tool. Not cover-up. If reaching for sauce to save cook, problem was earlier in process.</p>
          <p>When sauce appropriate, apply at right time. Saucing during cook works on ribs. Brush on last 30 minutes. Let tack up into glaze. Saucing brisket during cook softens bark. Serve brisket sauce on side.</p>
          <p>Temperature matters for sauce. Cold sauce on hot meat cools surface fast. Doesn't adhere well. Warm sauce before serving or applying. Spreads better. Tastes better.</p>
        </SectionContent>

        <SectionHeader>Serving</SectionHeader>
        <SectionContent>
          <p>Serve on warm surface. Cold plate pulls heat from meat moment it lands. Warm plates or serving trays in oven at 170°F few minutes before service.</p>
          <p>Don't pile everything on top each other. Stacked meat steams itself. Softens bark. Lay out in single layer or serve directly from cutting board.</p>
          <p>Slice to order when possible. Sliced brisket dries out faster than whole. Feeding crowd over time, keep brisket whole wrapped until people ready eat. Then slice in batches.</p>
        </SectionContent>

        <CommonMistakes
          items={[
            "Cutting into the meat immediately off the pit. The rest is part of the cook.",
            "Slicing with the grain instead of against it.",
            "Forgetting that brisket flat and point run in different directions.",
            "Saucing brisket during the cook and killing the bark.",
            "Serving on cold plates and surfaces that pull heat from the meat.",
          ]}
        />

        <Fixes
          items={[
            "Rest every large cut — minimum one hour for brisket, wrapped in paper or foil and toweled in a cooler.",
            "Identify the grain direction before the first slice. Look at the muscle fiber lines on the surface.",
            "Separate the flat and point on a brisket before slicing. Each gets cut against its own grain.",
            "Serve sauce on the side for brisket. Apply sauce to ribs only in the last 30 minutes on the pit.",
            "Warm your serving surface before plating. A few minutes at 170°F makes a difference.",
          ]}
        />

        <PitVariations
          variations={[
            { pit: "Offset", note: "Bark on an offset is usually hard-set and holds through the rest well. Butcher paper wrap preserves it. Foil is overkill on a well-developed offset crust." },
            { pit: "Pellet", note: "Pellet bark is softer than offset bark. Foil wrap for the rest is fine. Consider a high-heat finish at 300°F for 20 minutes before pulling to firm up the crust." },
            { pit: "Kamado", note: "Kamado bark is solid due to radiant heat. Rest unwrapped for the first 15 minutes to let the crust breathe, then wrap for the remainder of the rest." },
            { pit: "Kettle", note: "Short cooks on the kettle mean shorter rests. Ribs off a kettle still need 15 minutes minimum. Don't skip it just because the cook was faster." },
            { pit: "Drum", note: "High humidity means softer bark coming off the drum. Unwrap and hit it at high heat for the last 20 minutes before pulling if bark texture is a priority." },
            { pit: "Cabinet / Vertical", note: "Even cook means even rest. Standard rest times apply. Slice from the center of the flat outward for the best presentation on brisket." },
            { pit: "Electric", note: "Bark is the hardest to develop on electric. Unwrap for the last hour of the cook and bump to max temp. Rest is still required — don't skip it." },
          ]}
        />

        <PreacherNote>
          The cook ends when it's on the table, not when it comes off the pit.
        </PreacherNote>

        <RelatedLinks
          links={[
            { label: "Meat Science", href: "/playbook/meat-science" },
            { label: "Troubleshooting", href: "/playbook/troubleshooting" },
            { label: "Timeline Philosophy", href: "/playbook/timeline-philosophy" },
          ]}
        />

      </PlaybookArticle>
    </PlaybookLayout>
  );
}
