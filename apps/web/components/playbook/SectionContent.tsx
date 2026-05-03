// components/playbook/SectionContent.tsx

interface SectionContentProps {
  children: React.ReactNode;
}

export default function SectionContent({ children }: SectionContentProps) {
  return (
    <div className="text-[#9a8a75] leading-relaxed space-y-3 text-sm">
      {children}
    </div>
  );
}
