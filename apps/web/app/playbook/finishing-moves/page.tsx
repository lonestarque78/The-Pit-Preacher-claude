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
        intro="The last hour of a cook is where most people lose what they spent all day building. The meat is done. Now you have to finish it right."
      >

        <SectionHeader>The Rest</SectionHeader>
        <SectionContent>
          <p>Resting is not optional. It is part of the cook. When meat comes off the pit, the muscle fibers are contracted and the internal juices are pushed toward the center. Cutting into it immediately sends those juices onto the cutting board instead of staying in the meat.</p>
          <p>During the rest, the fibers relax, the gelatin that formed during collagen conversion redistributes, and the internal temperature equalizes from edge to center. A brisket that rests properly slices cleaner, holds its juice better, and tastes more consistent from flat to point.</p>
          <p>Minimum rest times: chicken and ribs get at least 15 minutes. Pork shoulder gets 45 minutes to an hour. Brisket gets at least one hour — two is better. Wrap in butcher paper or foil, then in a towel, and put it in a cooler. It will hold safely for four hours. This is your buffer. Use it.</p>
        </SectionContent>

        <SectionHeader>Wrapping for the Rest</SectionHeader>
        <SectionContent>
          <p>How you wrap affects the rest. Foil traps steam and keeps the bark softer — acceptable for pulled pork where bark gets mixed in anyway, less ideal for brisket where the crust is part of the experience. Butcher paper breathes slightly and preserves more bark texture.</p>
          <p>Unwrapped resting is an option for shorter rests on smaller cuts. A rack of ribs resting uncovered for 15 minutes on a cutting board loses minimal heat and keeps the bark intact. For large cuts resting over an hour, wrap to retain heat.</p>
          <p>Don't rest on a cold surface. A cold sheet pan pulls heat out of the bottom of the meat faster than the rest of it cools. Rest on a wooden cutting board or a rack over a sheet pan.</p>
        </SectionContent>

        <SectionHeader>Slicing</SectionHeader>
        <SectionContent>
          <p>Slicing against the grain is not a suggestion. Muscle fibers run in a direction. Cutting with the grain leaves long fibers that are chewy regardless of how well the meat cooked. Cutting against the grain shortens those fibers and makes every bite tender.</p>
          <p>Brisket has two muscles — the flat and the point — and they run in different directions. Separate them before slicing or adjust your angle as you cross from one to the other. Slicing the whole brisket in one direction is one of the most common mistakes at the cutting board.</p>
          <p>Slice thickness matters. Brisket at a quarter inch is the standard. Too thin and it falls apart. Too thick and the texture suffers. Pork shoulder gets pulled or chopped — not sliced. Ribs get cut between every bone, not every other one.</p>
          <p>Use a sharp knife. A dull blade drags and tears instead of cutting clean. A sharp slicing knife or carving knife makes a real difference on the final presentation.</p>
        </SectionContent>

        <SectionHeader>Sauce</SectionHeader>
        <SectionContent>
          <p>Great BBQ doesn't need sauce. Sauce is a finishing tool, not a cover-up. If you're reaching for sauce to save a cook, the problem was earlier in the process.</p>
          <p>When sauce is appropriate, apply it at the right time. Saucing during the cook works on ribs — brush on in the last 30 minutes and let it tack up into a glaze. Saucing brisket during the cook softens bark. Serve brisket sauce on the side.</p>
          <p>Temperature matters for sauce. Cold sauce on hot meat cools the surface fast and doesn't adhere well. Warm your sauce before serving or applying. It spreads better and tastes better.</p>
        </SectionContent>

        <SectionHeader>Serving</SectionHeader>
        <SectionContent>
          <p>Serve on a warm surface. A cold plate pulls heat from the meat the moment it lands. Warm your plates or serving trays in the oven at 170°F for a few minutes before service.</p>
          <p>Don't pile everything on top of each other. Stacked meat steams itself and softens bark. Lay it out in a single layer or serve directly from the cutting board.</p>
          <p>Slice to order when possible. Sliced brisket dries out faster than whole. If you're feeding a crowd over time, keep the brisket whole and wrapped until people are ready to eat, then slice in batches.</p>
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
