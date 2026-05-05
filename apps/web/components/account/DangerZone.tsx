'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { signOutAction } from '@/app/account/actions'
import { FormCard } from './FormCard'

interface Props {
  userEmail: string
}

export function DangerZone({ userEmail }: Props) {
  const router = useRouter()
  const [isSigningOut, startSignOut] = useTransition()
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm' | 'typing' | 'deleting'>('idle')
  const [confirmText, setConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const CONFIRM_PHRASE = 'delete my account'
  const canDelete = confirmText.toLowerCase() === CONFIRM_PHRASE

  async function handleDelete() {
    if (!canDelete) return
    setDeleteStep('deleting')
    setDeleteError(null)
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      const body = await res.json()
      if (!res.ok) {
        setDeleteError(body.error ?? 'Deletion failed. Please try again.')
        setDeleteStep('typing')
        return
      }
      router.push('/?deleted=true')
    } catch {
      setDeleteError('Network error. Please try again.')
      setDeleteStep('typing')
    }
  }

  return (
    <div className="space-y-6">
      <FormCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-[#e8d5a3]">Sign Out</p>
            <p className="text-xs text-[#7a6a55] mt-0.5">{userEmail}</p>
          </div>
          <button
            onClick={() => startSignOut(() => { signOutAction() })}
            disabled={isSigningOut}
            className="px-4 py-2 border border-[#2e2820] rounded text-sm text-[#c4a97d] hover:border-[#c4a97d] hover:text-[#e8d5a3] disabled:opacity-50 transition-colors"
          >
            {isSigningOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </FormCard>

      <div className="border border-red-900/50 rounded-lg p-6 bg-red-950/10">
        <h3 className="font-semibold text-red-400 mb-1">Delete Account</h3>
        <p className="text-sm text-[#7a6a55] mb-4">
          Permanently deletes your profile, pits, cooks, and all data. There is no recovery.
        </p>

        {deleteStep === 'idle' && (
          <button
            onClick={() => setDeleteStep('confirm')}
            className="px-4 py-2 border border-red-800 rounded text-sm text-red-400 hover:bg-red-950/30 transition-colors"
          >
            Delete My Account
          </button>
        )}

        {deleteStep === 'confirm' && (
          <div className="space-y-3">
            <p className="text-sm text-red-300 font-medium">Are you absolutely sure? This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteStep('typing')}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-sm text-white transition-colors"
              >
                Yes, continue
              </button>
              <button
                onClick={() => setDeleteStep('idle')}
                className="px-4 py-2 text-sm text-[#7a6a55] hover:text-[#c4a97d] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {(deleteStep === 'typing' || deleteStep === 'deleting') && (
          <div className="space-y-3">
            <p className="text-sm text-[#c4a97d]">
              Type <strong className="text-white">delete my account</strong> to confirm:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete my account"
              disabled={deleteStep === 'deleting'}
              className="w-full bg-[#0f0d0a] border border-red-900 rounded px-3 py-2 text-sm text-[#e8d5a3] placeholder-[#4a3f30] focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50"
            />
            {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={!canDelete || deleteStep === 'deleting'}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {deleteStep === 'deleting' ? 'Deleting…' : 'Permanently Delete'}
              </button>
              <button
                onClick={() => { setDeleteStep('idle'); setConfirmText(''); setDeleteError(null) }}
                disabled={deleteStep === 'deleting'}
                className="text-sm text-[#7a6a55] hover:text-[#c4a97d] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}