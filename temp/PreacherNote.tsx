// components/playbook/PreacherNote.tsx

interface PreacherNoteProps {
  children: React.ReactNode;
}

export default function PreacherNote({ children }: PreacherNoteProps) {
  return (
    <div className="border-l-2 border-[#c9a96e] pl-5 py-1">
      <p className="text-sm text-[#e8dcc8] italic">{children}</p>
    </div>
  );
}
