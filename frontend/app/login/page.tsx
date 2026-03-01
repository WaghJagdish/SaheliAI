'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_USERS = [
    { name: 'Priya Sharma', role: 'Mother of 1 · Delhi', email: 'priya@demo.com', password: 'demo123', avatar: '🌸' },
    { name: 'Anita Verma', role: 'Working professional · Mumbai', email: 'anita@demo.com', password: 'demo123', avatar: '🌺' },
]

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        await new Promise(r => setTimeout(r, 800)) // simulate network

        const user = DEMO_USERS.find(u => u.email === email && u.password === password)
        if (user) {
            // Store in sessionStorage for demo
            sessionStorage.setItem('saheli_user', JSON.stringify(user))
            router.push('/')
        } else {
            setError('Incorrect email or password. Try priya@demo.com / demo123')
        }
        setLoading(false)
    }

    const loginAs = (user: typeof DEMO_USERS[0]) => {
        setEmail(user.email)
        setPassword(user.password)
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 55%, #dbeafe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Decorative blobs */}
            <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(244,63,134,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '40%', right: '10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #e11d74, #7c3aed)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px', boxShadow: '0 12px 32px rgba(225,29,116,0.3)' }}>
                        🌸
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1c1917', fontFamily: 'Plus Jakarta Sans', marginBottom: '6px' }}>
                        Welcome to Saheli
                    </h1>
                    <p style={{ color: '#78716c', fontSize: '15px', lineHeight: 1.5 }}>
                        Your intelligent companion for family life
                    </p>
                </div>

                {/* Demo user quick-select */}
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px', textAlign: 'center' }}>
                        Quick demo access
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {DEMO_USERS.map(u => (
                            <button key={u.email} onClick={() => loginAs(u)} style={{
                                flex: 1, background: '#fff', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '12px',
                                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = '#e11d74')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)')}>
                                <div style={{ fontSize: '22px', marginBottom: '4px' }}>{u.avatar}</div>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1c1917' }}>{u.name.split(' ')[0]}</div>
                                <div style={{ fontSize: '10px', color: '#78716c' }}>{u.role.split(' · ')[1]}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Card */}
                <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 64px rgba(0,0,0,0.09)', border: '1px solid rgba(0,0,0,0.07)' }}>
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                            <div className="alert-banner alert-urgent" style={{ fontSize: '13px' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '15px', marginTop: '4px' }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <LoadingSpinner /> Signing in...
                                </span>
                            ) : '🌸 Sign In to Saheli'}
                        </button>
                    </form>

                    <div style={{ marginTop: '20px', padding: '14px', background: '#fdf8f5', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.07)' }}>
                        <p style={{ fontSize: '12px', color: '#78716c', textAlign: 'center' }}>
                            <strong>Demo credentials:</strong> priya@demo.com · demo123
                        </p>
                    </div>
                </div>

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#a8a29e', marginTop: '24px' }}>
                    🔒 This is a demo app. No real data is stored.
                </p>
            </div>
        </div>
    )
}

function LoadingSpinner() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25" />
            <path d="M21 12c0-4.97-4.03-9-9-9" />
        </svg>
    )
}
