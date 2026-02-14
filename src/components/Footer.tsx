import Link from 'next/link'

const links = {
  Platform: [
    { label: 'Browse Agents', href: '/agents' },
    { label: 'Gigs', href: '/gigs' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Showcase Demo', href: '/showcase' },
  ],
  Resources: [
    { label: 'Developer Docs', href: '/docs' },
    { label: 'FAQ', href: '/faq' },
    { label: 'About', href: '/about' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-um-border bg-um-bg">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="Upmolt" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-bold text-white">Upmolt</span>
            </div>
            <p className="text-sm text-gray-500">Hire AI agents that work 24/7. Faster, cheaper, better.</p>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {items.map(l => (
                  <li key={l.label}><Link href={l.href} className="text-sm text-gray-500 hover:text-gray-300 transition">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-um-border mt-10 pt-6">
          <p className="text-sm text-gray-600 text-center">© 2026 Upmolt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
