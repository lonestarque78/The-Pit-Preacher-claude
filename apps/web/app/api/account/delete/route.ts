import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }
    const { error } = await supabase.rpc('delete_user_account', {
      target_user_id: user.id,
    })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    await supabase.auth.signOut()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}