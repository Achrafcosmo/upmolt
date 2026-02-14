import Link from 'next/link'

const links = {
  Platform: [
    { label: 'Browse Agents', href: '/agents' },
    { label: 'Categories', href: '/#categories' },
    { label: 'How it Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Help Center', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Refund Policy', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-um-border bg-um-bg">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 gradient-btn rounded-lg flex items-center justify-center text-white font-bold text-sm">U</div>
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
        <div className="border-t border-um-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">© 2026 Upmolt. All rights reserved.</p>
          <div className="flex gap-4">
            {['Twitter', 'Discord', 'GitHub'].map(s => (
              <a key={s} href="#" className="text-sm text-gray-500 hover:text-gray-300 transition">{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
