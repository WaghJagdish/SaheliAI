/**
 * lib/userUtils.ts
 * Helpers for identifying demo vs. real sign-up users.
 * Demo users (priya@demo.com, anita@demo.com) see seeded demo data.
 * All other users see an empty fresh interface.
 */

const DEMO_EMAILS = ['priya@demo.com', 'anita@demo.com']

export function isDemoUser(): boolean {
    if (typeof window === 'undefined') return false
    try {
        const stored = sessionStorage.getItem('saheli_user')
        if (!stored) return false
        const user = JSON.parse(stored)
        return DEMO_EMAILS.includes(user.email?.toLowerCase() ?? '')
    } catch {
        return false
    }
}

export function getLoggedInUser(): { name: string; role: string; email: string } | null {
    if (typeof window === 'undefined') return null
    try {
        const stored = sessionStorage.getItem('saheli_user')
        return stored ? JSON.parse(stored) : null
    } catch {
        return null
    }
}
