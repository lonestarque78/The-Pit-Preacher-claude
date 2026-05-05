export function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#1c1812] border border-[#2e2820] rounded-lg p-6">
      {children}
    </div>
  )
}

export function FormField({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#c4a97d]">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#7a6a55]">{hint}</p>}
    </div>
  )
}

export const inputClass =
  'w-full bg-[#0f0d0a] border border-[#2e2820] rounded px-3 py-2 text-[#e8d5a3] ' +
  'text-sm placeholder-[#4a3f30] focus:outline-none focus:border-[#c4a97d] transition-colors'

export const selectClass =
  'w-full bg-[#0f0d0a] border border-[#2e2820] rounded px-3 py-2 text-[#e8d5a3] ' +
  'text-sm focus:outline-none focus:border-[#c4a97d] transition-colors appearance-none'

export function SaveButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="
        px-6 py-2 bg-[#c4a97d] text-[#0f0d0a] rounded font-semibold text-sm
        hover:bg-[#e8d5a3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors
      "
    >
      {pending ? 'Saving…' : 'Save Changes'}
    </button>
  )
}

export function StatusMessage({
  result,
}: {
  result: { success: boolean; error?: string } | null
}) {
  if (!result) return null
  if (result.success) return <p className="text-sm text-green-400">Saved.</p>
  return <p className="text-sm text-red-400">{result.error}</p>
}