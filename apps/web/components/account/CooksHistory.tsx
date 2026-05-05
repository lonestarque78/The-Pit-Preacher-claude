'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CookHistoryRow, Pit } from '@/types/account'
import { FormCard } from './FormCard'

interface Props {
  initialCooks: CookHistoryRow[]
  pits: Pit[]
}

export function CooksHistory({ initialCooks, pits }: Props) {
  const [pitFilter, setPitFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')

  const filtered = initialCooks.filter((c) => {
    if (pitFilter && c.pit_id !== pitFilter) return false
    if (tagFilter && !c.tags?.includes(tagFilter)) return false
    return true
  })

  const allTags = Array.from(
    new Set(initialCooks.flatMap((c) => c.tags?.filter(Boolean) ?? []))
  ).sort()

  if (initialCooks.length === 0) {
    return (
      <p className="text-sm text-[#7a6a55]">
        No cooks logged yet. Fire up the planner and get cooking.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <select
          value={pitFilter}
          onChange={(e) => setPitFilter(e.target.value)}
          className="bg-[#1c1812] border border-[#2e2820] rounded px-3 py-1.5 text-sm text-[#c4a97d] focus:outline-none focus:border-[#c4a97d]"
        >
          <option value="">All Pits</option>
          {pits.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {allTags.length > 0 && (
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="bg-[#1c1812] border border-[#2e2820] rounded px-3 py-1.5 text-sm text-[#c4a97d] focus:outline-none focus:border-[#c4a97d]"
          >
            <option value="">All Tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}

        {(pitFilter || tagFilter) && (
          <button
            onClick={() => { setPitFilter(''); setTagFilter('') }}
            className="text-xs text-[#7a6a55] hover:text-[#c4a97d] transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-[#7a6a55]">No cooks match these filters.</p>
      )}

      {filtered.map((cook) => (
        <FormCard key={cook.cook_id}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#e8d5a3]">
                {new Date(cook.started_at).toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                })}
              </p>
              {cook.pit_name && (
                <p className="text-xs text-[#c4a97d] mt-0.5 capitalize">
                  {cook.pit_name}{cook.pit_type ? ` · ${cook.pit_type}` : ''}
                </p>
              )}
              {cook.summary_notes && (
                <p className="text-xs text-[#7a6a55] mt-1 line-clamp-2">{cook.summary_notes}</p>
              )}
              {cook.tags && cook.tags.filter(Boolean).length > 0 && (
                <div className="flex gap-1 flex-wrap mt-2">
                  {cook.tags.filter(Boolean).map((tag) => (
                    <span key={tag} className="text-xs bg-[#2e2820] text-[#c4a97d] px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-2">
              {cook.rating != null && (
                <span className="text-sm font-bold text-[#c4a97d]">{cook.rating}/10</span>
              )}
              <Link
                href={`/cook/${cook.cook_id}`}
                className="text-xs text-[#c4a97d] hover:text-[#e8d5a3] transition-colors"
              >
                View →
              </Link>
            </div>
          </div>
        </FormCard>
      ))}
    </div>
  )
}