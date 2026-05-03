// components/playbook/PitVariations.tsx

interface Variation {
  pit: string;
  note: string;
}

interface PitVariationsProps {
  variations: Variation[];
}

export default function PitVariations({ variations }: PitVariationsProps) {
  return (
    <div>
      <h2 className="text-xs font-mono tracking-widest uppercase text-[#7a6a55] mb-4">
        How This Plays Out on Different Pits
      </h2>
      <div className="space-y-4">
        {variations.map(({ pit, note }) => (
          <div key={pit} className="flex gap-4 text-sm">
            <span className="font-mono text-[#c9a96e] w-24 shrink-0">{pit}</span>
            <span className="text-[#9a8a75]">{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
