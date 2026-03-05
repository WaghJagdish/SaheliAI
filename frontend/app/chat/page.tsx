'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { chatApi } from '@/lib/api'
import { getLoggedInUser } from '@/lib/userUtils'

type Message = {
    id: string
    role: 'user' | 'ai'
    text: string
    loading?: boolean
}

const STARTER_PROMPTS = [
    "What refills are due?",
    "Draft a birthday message for Maa",
    "Any urgent school events?",
    "How much cognitive time did Saheli save me?",
]

const TYPING_INDICATOR: Message = { id: 'typing', role: 'ai', text: '', loading: true }

function TypingDots() {
    return (
        <div className="typing-dots">
            <span /><span /><span />
        </div>
    )
}

function MsgBubble({ msg }: { msg: Message }) {
    const isUser = msg.role === 'user'
    return (
        <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
            {!isUser && (
                <div style={{
                    width: 28, height: 28, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(135deg, #5b2d8e, #c8456c)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: 'white', fontWeight: 700, marginRight: 8, marginTop: 2,
                }}>S</div>
            )}
            <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                {msg.loading ? <TypingDots /> : msg.text}
            </div>
        </div>
    )
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'ai',
            text: "Namaste! 🌸 I'm Saheli, your AI family assistant.\n\nI can help you with medicine refills, birthday preparations, school events, and much more. What would you like to know?",
        }
    ])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const router = useRouter()

    // Auth guard
    useEffect(() => {
        if (!getLoggedInUser()) { router.replace('/login') }
    }, [])

    // Scroll to bottom whenever messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (text: string) => {
        if (!text.trim() || sending) return
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim() }
        const history = messages.filter(m => !m.loading).map(m => ({ role: m.role, text: m.text }))

        setMessages(prev => [...prev, userMsg, TYPING_INDICATOR])
        setInput('')
        setSending(true)

        try {
            const res = await chatApi.sendMessage(text.trim(), history)
            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: res.reply }
            setMessages(prev => [...prev.filter(m => m.id !== 'typing'), aiMsg])
        } catch {
            const errMsg: Message = { id: 'err', role: 'ai', text: "Sorry, I couldn't reach the server. Please try again." }
            setMessages(prev => [...prev.filter(m => m.id !== 'typing'), errMsg])
        } finally {
            setSending(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage(input)
        }
    }

    return (
        <div className="chat-screen">
            {/* Chat messages */}
            <div className="chat-messages">
                {/* AI Status indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                    <span className="ai-badge" style={{ fontSize: 11 }}>Saheli AI · Demo Mode</span>
                </div>

                {messages.map(msg => (
                    <MsgBubble key={msg.id} msg={msg} />
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Starter prompt chips — only shown when conversation is at welcome state */}
            {messages.length <= 1 && (
                <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {STARTER_PROMPTS.map(p => (
                        <button
                            key={p}
                            onClick={() => sendMessage(p)}
                            style={{
                                background: 'white',
                                border: '1.5px solid #e8e0eb',
                                borderRadius: 20,
                                padding: '8px 14px',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#5b2d8e',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                fontFamily: 'inherit',
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}

            {/* Input bar */}
            <div className="chat-input-bar">
                <textarea
                    ref={inputRef}
                    className="chat-input"
                    placeholder="Ask Saheli anything..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    style={{ height: 'auto' }}
                    onInput={e => {
                        const el = e.currentTarget
                        el.style.height = 'auto'
                        el.style.height = Math.min(el.scrollHeight, 120) + 'px'
                    }}
                />
                <button
                    className="chat-send-btn"
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || sending}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
