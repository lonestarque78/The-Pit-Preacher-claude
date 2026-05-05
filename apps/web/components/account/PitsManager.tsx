'use client'

import { useState, useActionState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPitAction, updatePitAction, deletePitAction } from '@/app/account/actions'
import type { Pit, PitType } from '@/types/account'
import { FormCard, FormField, inputClass, selectClass, StatusMessage } from './FormCard'

const PIT_TYPES: { value: PitType; label: string }[] = [
  { value: 'offset',      label: 'Offset Smoker'   },
  { value: 'kamado',      label: 'Kamado / Egg'    },
  { value: 'pellet',      label: 'Pellet Grill'    },
  { value: 'stickburner', label: 'Stick Burner'    },
  { value: 'electric',    label: 'Electric Smoker' },
  { value: 'kettle',      label: 'Kettle Grill'    },
  { value: 'drum',        label: 'Ugly Drum'       },
  { value: 'other',       label: 'Other'           },
]

interface Props {
  initialPits: Pit[]
}

export function PitsManager({ initialPits }: Props) {
  const router = useRouter()
  const [pits, setPits] = useState<Pit[]>(initialPits)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
  const [editingPit, setEditingPit] = useState<Pit | null>(null)
  const [isPending, startTransition] = useTransition()

  const atLimit = pits.length >= 3

  function openEdit(pit: Pit) {
    setEditingPit(pit)
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
    setEditingPit(null)
    router.refresh()
  }

  function handleDelete(pitId: string) {
    if (!confirm('Remove this pit? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deletePitAction(pitId)
      if (result.success) {
        setPits((prev) => prev.filter((p) => p.id !== pitId))
      }
    })
  }

  return (
    <div className="space-y-4">
      {pits.length === 0 && (
        <p className="text-sm text-[#7a6a55]">
          No pits saved yet. Add your first rig below.
        </p>
      )}

      {pits.map((pit) => (
        <FormCard key={pit.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-[#e8d5a3]">{pit.name}</p>
              <p className="text-sm text-[#c4a97d] capitalize">
                {pit.brand ? `${pit.brand} · ` : ''}
                {PIT_TYPES.find((t) => t.value === pit.type)?.label ?? pit.type}
              </p>
              {pit.model && (
                <p className="text-xs text-[#7a6a55] mt-0.5">{pit.model}</p>
              )}
              {pit.notes && (
                <p className="text-xs text-[#7a6a55] mt-1">{pit.notes}</p>
              )}
              {pit.is_default && (
                <span className="inline-block mt-1 text-xs bg-[#2e2820] text-[#c4a97d] px-2 py-0.5 rounded">
                  Default
                </span>
              )}
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => openEdit(pit)}
                className="text-xs text-[#c4a97d] hover:text-[#e8d5a3] transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(pit.id)}
                disabled={isPending}
                className="text-xs text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </FormCard>
      ))}

      {atLimit ? (
        <p className="text-xs text-[#7a6a55]">
          You&apos;ve reached the 3-pit limit. Remove one to add another.
        </p>
      ) : (
        <button
          onClick={() => { setEditingPit(null); setModalMode('add') }}
          className="
            w-full py-3 border border-dashed border-[#2e2820] rounded-lg
            text-sm text-[#7a6a55] hover:text-[#c4a97d] hover:border-[#c4a97d]
            transition-colors
          "
        >
          + Add a Pit
        </button>
      )}

      {modalMode && (
        <PitModal
          mode={modalMode}
          pit={editingPit}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

function PitModal({
  mode,
  pit,
  onClose,
}: {
  mode: 'add' | 'edit'
  pit: Pit | null
  onClose: () => void
}) {
  const action = mode === 'add' ? createPitAction : updatePitAction
  const [result, formAction, pending] = useActionState(action, null)

  if (result?.success) {
    onClose()
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#1c1812] border border-[#2e2820] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[#e8d5a3]">
            {mode === 'add' ? 'Add a Pit' : 'Edit Pit'}
          </h3>
          <button
            onClick={onClose}
            className="text-[#7a6a55] hover:text-[#c4a97d] text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form action={formAction} className="space-y-3">
          {mode === 'edit' && pit && (
            <input type="hidden" name="pit_id" value={pit.id} />
          )}

          <FormField label="Name *">
            <input
              name="name"
              required
              className={inputClass}
              defaultValue={pit?.name ?? ''}
              placeholder="The Beast, Smoke Machine…"
            />
          </FormField>

          <FormField label="Type *">
            <select name="type" required className={selectClass} defaultValue={pit?.type ?? 'pellet'}>
              {PIT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Brand">
              <input name="brand" className={inputClass} defaultValue={pit?.brand ?? ''} placeholder="Weber, Yoder…" />
            </FormField>
            <FormField label="Model">
              <input name="model" className={inputClass} defaultValue={pit?.model ?? ''} placeholder="SmokeFire EX6…" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Fuel Type">
              <input name="fuel_type" className={inputClass} defaultValue={pit?.fuel_type ?? ''} placeholder="Pellet, Charcoal…" />
            </FormField>
            <FormField label="Default Wood">
              <input name="default_wood" className={inputClass} defaultValue={pit?.default_wood ?? ''} placeholder="Post Oak…" />
            </FormField>
          </div>

          <FormField label="Default Temp (°F)">
            <input
              type="number"
              name="default_temp"
              className={inputClass}
              defaultValue={pit?.default_temp ?? ''}
              placeholder="225"
              min={100}
              max={700}
            />
          </FormField>

          <FormField label="Notes">
            <textarea
              name="notes"
              className={`${inputClass} resize-none`}
              rows={2}
              defaultValue={pit?.notes ?? ''}
              placeholder="Hot spots, quirks, mods…"
            />
          </FormField>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_default"
              defaultChecked={pit?.is_default ?? false}
              className="rounded border-[#2e2820] bg-[#0f0d0a]"
            />
            <span className="text-sm text-[#c4a97d]">Set as default pit</span>
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="
                px-5 py-2 bg-[#c4a97d] text-[#0f0d0a] rounded font-semibold text-sm
                hover:bg-[#e8d5a3] disabled:opacity-50 transition-colors
              "
            >
              {pending ? 'Saving…' : mode === 'add' ? 'Add Pit' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} className="text-sm text-[#7a6a55] hover:text-[#c4a97d]">
              Cancel
            </button>
            <StatusMessage result={result} />
          </div>
        </form>
      </div>
    </div>
  )
}