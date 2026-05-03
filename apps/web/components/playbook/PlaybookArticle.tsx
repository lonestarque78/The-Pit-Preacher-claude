
// components/playbook/PlaybookArticle.tsx

interface PlaybookArticleProps {
  module: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}

export default function PlaybookArticle({ module, title, intro, children }: PlaybookArticleProps) {
  return (
    <>
      <div className="mb-10 pb-8 border-b border-[#2a2218]">
        <p className="text-xs font-mono tracking-widest uppercase text-[#7a6a55] mb-3">
          {module}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#e8dcc8] mb-4 leading-tight">
          {title}
        </h1>
        <p className="text-[#9a8a75] text-base max-w-2xl leading-relaxed">
          {intro}
        </p>
      </div>
      <div className="max-w-2xl space-y-10">
        {children}
      </div>
    </>
  );
}
