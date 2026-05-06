// apps/web/app/account/page.tsx

import { redirect } from 'next/navigation'

export default function AccountIndexPage() {
  // Redirect users to the default first tab
  redirect('/account/profile')
}
