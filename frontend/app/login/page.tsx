'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const DEMO_USERS = [
    { name: 'Priya Sharma', role: 'Mother · Delhi', email: 'priya@demo.com', password: 'demo123', initial: 'P', hue: '280' },
    { name: 'Anita Verma', role: 'Professional · Mumbai', email: 'anita@demo.com', password: 'demo123', initial: 'A', hue: '340' },
]

export default function LoginPage() {
    const router = useRouter()
    const [tab, setTab] = useState<'login' | 'signup'>('login')

    // Login state
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Sign-up state
    const [signupName, setSignupName] = useState('')
    const [signupEmail, setSignupEmail] = useState('')
    const [signupPassword, setSignupPassword] = useState('')
    const [signupConfirm, setSignupConfirm] = useState('')
    const [signupError, setSignupError] = useState('')
    const [signupLoading, setSignupLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        await new Promise(r => setTimeout(r, 800))
        // Check demo users first
        let user: any = DEMO_USERS.find(u => u.email === email && u.password === password)
        // Check sign-up users stored in localStorage
        if (!user) {
            try {
                const signupUsers = JSON.parse(localStorage.getItem('saheli_signup_users') || '[]')
                user = signupUsers.find((u: any) => u.email === email && u.password === password)
            } catch { /* ignore */ }
        }
        if (user) {
            sessionStorage.setItem('saheli_user', JSON.stringify(user))
            router.push('/')
        } else {
            setError('Incorrect credentials. Use your sign-up email/password or try priya@demo.com / demo123')
        }
        setLoading(false)
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setSignupError('')
        if (signupPassword !== signupConfirm) {
            setSignupError('Passwords do not match.')
            return
        }
        if (signupPassword.length < 6) {
            setSignupError('Password must be at least 6 characters.')
            return
        }
        setSignupLoading(true)
        await new Promise(r => setTimeout(r, 900))
        const newUser = {
            name: signupName.trim(),
            role: 'Member · India',
            email: signupEmail.trim().toLowerCase(),
            password: signupPassword,
            initial: signupName.trim().charAt(0).toUpperCase(),
            hue: '300',
        }
        // Persist credentials so user can log in
        try {
            const existing = JSON.parse(localStorage.getItem('saheli_signup_users') || '[]')
            existing.push(newUser)
            localStorage.setItem('saheli_signup_users', JSON.stringify(existing))
        } catch { /* ignore */ }
        setSignupLoading(false)
        // Switch to Sign In tab — pre-fill email, user must enter password
        setTab('login')
        setEmail(newUser.email)
        setPassword('')
        setSignupName(''); setSignupEmail(''); setSignupPassword(''); setSignupConfirm('')
        setError('✅ Account created! Please sign in with your new credentials.')
    }

    const loginAs = (u: typeof DEMO_USERS[0]) => {
        setTab('login')
        setEmail(u.email)
        setPassword(u.password)
    }

    return (
        <div style={{
            minHeight: '100dvh',
            maxWidth: '430px',
            margin: '0 auto',
            background: 'linear-gradient(160deg, #f0eaf8 0%, #fceef3 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 20px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Decorative blobs */}
            <div style={{ position: 'absolute', top: -80, left: -60, width: 280, height: 280, background: 'radial-gradient(circle, rgba(91,45,142,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, right: -40, width: 240, height: 240, background: 'radial-gradient(circle, rgba(200,69,108,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>
                {/* Logo area */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{
                        width: 80, height: 80,
                        background: 'white',
                        borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 14px',
                        boxShadow: '0 16px 40px rgba(91,45,142,0.25)',
                        padding: 8,
                    }}>
                        <Image
                            src="/saheli-logo.png"
                            alt="SaheliAI Logo"
                            width={64}
                            height={64}
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1118', marginBottom: 4, letterSpacing: '-0.5px' }}>
                        Welcome to{' '}
                        <span style={{ background: 'linear-gradient(135deg, #5b2d8e, #c8456c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            SaheliAI
                        </span>
                    </h1>
                    <p style={{ color: '#8b7d97', fontSize: 14, lineHeight: 1.5 }}>
                        Your intelligent companion for family life
                    </p>
                </div>

                {/* Quick demo select — only on login tab */}
                {tab === 'login' && (
                    <div style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#b8aac4', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10, textAlign: 'center' }}>
                            Quick demo access
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {DEMO_USERS.map(u => (
                                <button key={u.email} onClick={() => loginAs(u)} style={{
                                    flex: 1, background: 'white', border: '1.5px solid var(--border)',
                                    borderRadius: 16, padding: '14px 12px',
                                    cursor: 'pointer', textAlign: 'center',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#5b2d8e' }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
                                    onTouchStart={e => { (e.currentTarget as HTMLElement).style.borderColor = '#5b2d8e' }}
                                    onTouchEnd={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
                                >
                                    <div style={{
                                        width: 44, height: 44, margin: '0 auto 8px',
                                        background: `hsl(${u.hue}, 60%, 45%)`,
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 18, fontWeight: 800, color: 'white',
                                    }}>{u.initial}</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1118' }}>{u.name.split(' ')[0]}</div>
                                    <div style={{ fontSize: 11, color: '#8b7d97', marginTop: 2 }}>{u.role.split(' · ')[1]}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tab switcher */}
                <div style={{
                    display: 'flex', background: 'rgba(255,255,255,0.7)', borderRadius: 14,
                    padding: 4, marginBottom: 14, border: '1px solid rgba(91,45,142,0.12)',
                }}>
                    {(['login', 'signup'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setError(''); setSignupError('') }}
                            style={{
                                flex: 1, padding: '9px 0', borderRadius: 11, border: 'none', cursor: 'pointer',
                                fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                                background: tab === t ? 'linear-gradient(135deg, #5b2d8e, #c8456c)' : 'transparent',
                                color: tab === t ? 'white' : '#8b7d97',
                                boxShadow: tab === t ? '0 4px 12px rgba(91,45,142,0.3)' : 'none',
                            }}
                        >
                            {t === 'login' ? 'Sign In' : 'Sign Up'}
                        </button>
                    ))}
                </div>

                {/* Form card */}
                <div style={{
                    background: 'white', borderRadius: 22, padding: '24px 20px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.09)', border: '1px solid rgba(0,0,0,0.07)',
                }}>
                    {tab === 'login' ? (
                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label className="input-label">Email address</label>
                                <input
                                    className="input-field"
                                    type="email"
                                    placeholder="priya@demo.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <div>
                                <label className="input-label">Password</label>
                                <input
                                    className="input-field"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            {error && (
                                <div style={{
                                    background: error.startsWith('✅') ? '#e8f6f4' : '#fff1f4',
                                    border: `1px solid ${error.startsWith('✅') ? 'rgba(13,124,110,0.25)' : '#f9c5d4'}`,
                                    borderRadius: 12, padding: '10px 14px',
                                    fontSize: 13, color: error.startsWith('✅') ? '#0d7c6e' : '#9f1239',
                                }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary btn-full"
                                disabled={loading}
                                style={{ marginTop: 4 }}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                        <LoadingSpinner /> Signing in...
                                    </span>
                                ) : 'Sign in to SaheliAI'}
                            </button>

                            <div style={{ marginTop: 4, padding: 12, background: '#faf7f5', borderRadius: 10, border: '1px solid rgba(0,0,0,0.06)' }}>
                                <p style={{ fontSize: 12, color: '#8b7d97', textAlign: 'center' }}>
                                    <strong>Demo:</strong> priya@demo.com · demo123
                                </p>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label className="input-label">Full name</label>
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="Sunita Patel"
                                    value={signupName}
                                    onChange={e => setSignupName(e.target.value)}
                                    required
                                    autoComplete="name"
                                />
                            </div>
                            <div>
                                <label className="input-label">Email address</label>
                                <input
                                    className="input-field"
                                    type="email"
                                    placeholder="sunita@example.com"
                                    value={signupEmail}
                                    onChange={e => setSignupEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <div>
                                <label className="input-label">Password</label>
                                <input
                                    className="input-field"
                                    type="password"
                                    placeholder="Min. 6 characters"
                                    value={signupPassword}
                                    onChange={e => setSignupPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                            <div>
                                <label className="input-label">Confirm password</label>
                                <input
                                    className="input-field"
                                    type="password"
                                    placeholder="Re-enter password"
                                    value={signupConfirm}
                                    onChange={e => setSignupConfirm(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>

                            {signupError && (
                                <div style={{
                                    background: '#fff1f4', border: '1px solid #f9c5d4',
                                    borderRadius: 12, padding: '10px 14px',
                                    fontSize: 13, color: '#9f1239',
                                }}>
                                    {signupError}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary btn-full"
                                disabled={signupLoading}
                                style={{ marginTop: 4 }}
                            >
                                {signupLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                        <LoadingSpinner /> Creating account...
                                    </span>
                                ) : 'Create my SaheliAI account'}
                            </button>

                            <p style={{ fontSize: 12, color: '#8b7d97', textAlign: 'center', marginTop: 2 }}>
                                Getting started is free — no credit card needed
                            </p>
                        </form>
                    )}
                </div>

                <p style={{ textAlign: 'center', fontSize: 12, color: '#b8aac4', marginTop: 20 }}>
                    🔒 Demo app — session only, no real data stored
                </p>
            </div>
        </div>
    )
}

function LoadingSpinner() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.9s linear infinite' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.2" />
            <path d="M21 12c0-4.97-4.03-9-9-9" />
        </svg>
    )
}
