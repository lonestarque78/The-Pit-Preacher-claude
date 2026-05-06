import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'

const NAV_ITEMS = [
  { href: '/account/profile',  label: 'Profile'     },
  { href: '/account/settings', label: 'Settings'    },
  { href: '/account/pits',     label: 'My Pits'     },
  { href: '/account/cooks',    label: 'My Cooks'    },
  { href: '/account/danger',   label: 'Danger Zone' },
]

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#0f0d0a]">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#e8d5a3] mb-8 tracking-wide uppercase">
          Account
        </h1>
        <div className="flex flex-col md:flex-row gap-8">
          <nav className="md:w-48 flex-shrink-0">
            <ul className="flex flex-row md:flex-col gap-1 flex-wrap">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      block px-4 py-2 rounded text-sm font-medium transition-colors
                      text-[#c4a97d] hover:text-[#e8d5a3] hover:bg-[#1c1812]
                      ${item.href === '/account/danger'
                        ? 'text-red-500 hover:text-red-400 hover:bg-red-950/20 mt-4'
                        : ''}
                    `}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}