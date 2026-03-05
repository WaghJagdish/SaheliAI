'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/* ── SVG Icons ─────────────────────────────────────────── */
const Icons = {
    home: (filled: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    family: (filled: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
            {filled ? (
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2h16zm3-14a4 4 0 1 1-8 0 4 4 0 0 1 8 0zm-8 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
            ) : (
                <>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </>
            )}
        </svg>
    ),
    health: (filled: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
            {filled ? (
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.518 3.68 2 6.5 2c1.988 0 4.04 1.07 5.5 2.803C13.46 3.07 15.512 2 17.5 2 20.32 2 23 3.518 23 7.19c0 4.106-5.37 8.863-11 14.403z" />
            ) : (
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            )}
        </svg>
    ),
    school: (filled: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
            {filled ? (
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            ) : (
                <>
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </>
            )}
        </svg>
    ),
    chat: (filled: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
            {filled ? (
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l4.93-1.37A9.95 9.95 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            ) : (
                <>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </>
            )}
        </svg>
    ),
    logout: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    bell: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
}

const TAB_ITEMS = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/family', label: 'Family', icon: 'family' },
    { href: '/health', label: 'Health', icon: 'health' },
    { href: '/school', label: 'School', icon: 'school' },
    { href: '/chat', label: 'Chat', icon: 'chat' },
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

    // Don't show navigation on login page
    if (pathname === '/login') return null

    return (
        <>
            {/* ── Top App Bar ── */}
            <div className="top-bar">
                <div className="top-bar-wordmark" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Image
                        src="/saheli-logo.png"
                        alt="SaheliAI Logo"
                        width={48}
                        height={48}
                        style={{ objectFit: 'contain', flexShrink: 0 }}
                    />
                    <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #5b2d8e, #c8456c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        SaheliAI
                    </span>
                </div>
                <div className="top-bar-actions">
                    {/* Notification bell */}
                    <button style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--bg)', border: '1px solid var(--border-soft)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--text-3)', position: 'relative',
                    }}>
                        {Icons.bell()}
                        {/* Red dot */}
                        <span style={{
                            position: 'absolute', top: 7, right: 7,
                            width: 7, height: 7, borderRadius: '50%',
                            background: 'var(--rose)', border: '1.5px solid white',
                        }} />
                    </button>

                    {/* User avatar */}
                    {user ? (
                        <button onClick={handleLogout} className="avatar-chip" title="Tap to sign out">
                            {user.name.charAt(0)}
                        </button>
                    ) : (
                        <Link href="/login">
                            <div className="avatar-chip" style={{ fontSize: 12 }}>?</div>
                        </Link>
                    )}
                </div>
            </div>

            {/* ── Bottom Tab Bar ── */}
            <nav className="tab-bar">
                {TAB_ITEMS.map(item => {
                    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`tab-item${isActive ? ' active' : ''}`}
                        >
                            <div className="tab-icon-wrap">
                                {(Icons as any)[item.icon](isActive)}
                            </div>
                            <span className="tab-label">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </>
    )
}
