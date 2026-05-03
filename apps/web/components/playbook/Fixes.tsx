// components/playbook/Fixes.tsx

interface FixesProps {
  items: string[];
}

export default function Fixes({ items }: FixesProps) {
  return (
    <div className="border border-[#2a2218] rounded-sm bg-[#141210] p-6">
      <h2 className="text-xs font-mono tracking-widest uppercase text-[#7a6a55] mb-4">
        Fixes
      </h2>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-[#9a8a75]">
            <span className="text-[#4CAF50] mt-0.5 shrink-0">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
