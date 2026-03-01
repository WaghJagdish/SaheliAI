'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/* ── Inline SVG icons — no emojis ──────────────────────── */
const Icons = {
    dashboard: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    family: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    health: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    ),
    school: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    ),
    timeline: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="15" y2="6" /><line x1="3" y1="18" x2="9" y2="18" />
        </svg>
    ),
    data: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    ),
    logout: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    ai: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L9.5 8.5H3L8 13l-2 7 6-4 6 4-2-7 5-4.5h-6.5L12 2z" />
        </svg>
    ),
}

const NAV_ITEMS = [
    { href: '/', label: 'Dashboard', icon: 'dashboard' },
    { href: '/family', label: 'Family', icon: 'family' },
    { href: '/health', label: 'Health', icon: 'health' },
    { href: '/school', label: 'School', icon: 'school' },
    { href: '/timeline', label: 'Timeline', icon: 'timeline' },
    { href: '/demo-data', label: 'Data', icon: 'data' },
] as const

export default function Navigation() {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState<{ name: string; role: string } | null>(null)

    useEffect(() => {
        const stored = sessionStorage.getItem('saheli_user')
        if (stored) { try { setUser(JSON.parse(stored)) } catch { } }
    }, [])

    const handleLogout = () => {
        sessionStorage.removeItem('saheli_user')
        router.push('/login')
    }

    return (
        <nav style={{
            width: '220px',
            height: '100vh',
            position: 'fixed',
            left: 0, top: 0,
            background: 'white',
            borderRight: '1px solid #e8e0eb',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 12px',
            zIndex: 50,
        }}>
            {/* Wordmark */}
            <div style={{ padding: '8px 10px', marginBottom: '24px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', color: '#1a1118' }}>
                    saheli
                </div>
                <div style={{ fontSize: '11px', fontWeight: 500, color: '#b8aac4', letterSpacing: '0.3px', marginTop: '1px' }}>
                    AI home assistant
                </div>
            </div>

            {/* Nav links */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <p className="text-label" style={{ padding: '0 10px', marginBottom: '6px' }}>Modules</p>
                {NAV_ITEMS.map(item => {
                    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
                    return (
                        <Link key={item.href} href={item.href} className={`nav-link${isActive ? ' active' : ''}`}>
                            <span style={{ color: isActive ? '#5b2d8e' : '#8b7d97', flexShrink: 0 }}>
                                {Icons[item.icon]}
                            </span>
                            {item.label}
                        </Link>
                    )
                })}
            </div>

            {/* Bottom — AI mode indicator + user */}
            <div style={{ borderTop: '1px solid #f0eaf3', paddingTop: '16px' }}>
                {/* AI status chip */}
                <div style={{
                    background: 'linear-gradient(135deg, #f0eaf8, #fceef3)',
                    border: '1px solid rgba(91,45,142,0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    marginBottom: '12px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span style={{ color: '#5b2d8e' }}>{Icons.ai}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#5b2d8e' }}>AI Active</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#8b7d97' }}>Demo mode · All agents ready</div>
                </div>

                {user ? (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '10px', background: '#f5f0ed', marginBottom: '8px' }}>
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '8px',
                                background: 'linear-gradient(135deg, #5b2d8e, #c8456c)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '13px', fontWeight: 700, flexShrink: 0,
                            }}>
                                {user.name.charAt(0)}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1118', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name.split(' ')[0]}</div>
                                <div style={{ fontSize: '11px', color: '#b8aac4' }}>Signed in</div>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', gap: '6px', color: '#8b7d97' }}>
                            {Icons.logout} Sign out
                        </button>
                    </div>
                ) : (
                    <Link href="/login">
                        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Sign in
                        </button>
                    </Link>
                )}
            </div>
        </nav>
    )
}
