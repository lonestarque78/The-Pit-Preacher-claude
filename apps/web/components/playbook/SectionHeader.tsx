// components/playbook/SectionHeader.tsx

interface SectionHeaderProps {
  children: React.ReactNode;
}

export default function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <h2 className="text-xs font-mono tracking-widest uppercase text-[#c9a96e] mb-3">
      {children}
    </h2>
  );
}
