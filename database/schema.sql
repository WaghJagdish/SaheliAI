-- ============================================================
-- SAHELI-AI DATABASE SCHEMA
-- PostgreSQL 15
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── USERS ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    family_name VARCHAR(255),
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    cognitive_minutes_saved INTEGER DEFAULT 0,
    demo_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── RELATIONSHIP LOOP ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relation VARCHAR(100) NOT NULL,
    birthday DATE NOT NULL,
    gift_budget INTEGER,
    phone VARCHAR(20),
    notes TEXT,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS birthday_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    reminder_sent_3days BOOLEAN DEFAULT false,
    reminder_sent_day_of BOOLEAN DEFAULT false,
    gift_suggestions JSONB,
    whatsapp_draft TEXT,
    message_sent BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    cognitive_minutes_saved INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gift_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    birthday_event_id UUID REFERENCES birthday_events(id),
    suggestion_text TEXT NOT NULL,
    estimated_price INTEGER,
    purchase_url TEXT,
    selected BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── HEALTH LOOP ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT,
    raw_ocr_text TEXT,
    doctor_name VARCHAR(255),
    prescribed_for VARCHAR(255),
    prescription_date DATE,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES prescriptions(id),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    times_per_day INTEGER,
    schedule_times JSONB,
    duration_days INTEGER,
    start_date DATE,
    end_date DATE,
    total_pills INTEGER,
    pills_remaining INTEGER,
    refill_alert_sent BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicine_intake_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id UUID REFERENCES medicines(id),
    scheduled_time TIMESTAMPTZ,
    taken_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT
);

-- ── SCHOOL LOOP ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    class_name VARCHAR(50),
    school_name VARCHAR(255),
    section VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS circulars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id),
    user_id UUID REFERENCES users(id),
    image_url TEXT,
    raw_ocr_text TEXT,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    processed BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS school_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circular_id UUID REFERENCES circulars(id),
    child_id UUID REFERENCES children(id),
    user_id UUID REFERENCES users(id),
    event_name VARCHAR(255) NOT NULL,
    event_date DATE,
    deadline_date DATE,
    fee_amount INTEGER,
    fee_paid BOOLEAN DEFAULT false,
    special_instructions TEXT,
    whatsapp_reply_draft TEXT,
    calendar_added BOOLEAN DEFAULT false,
    reminder_sent BOOLEAN DEFAULT false,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── REMINDERS (UNIFIED) ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    entity_type VARCHAR(50),
    trigger_at TIMESTAMPTZ NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    channel VARCHAR(20) DEFAULT 'in_app',
    retry_count INTEGER DEFAULT 0,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_trigger ON reminders(trigger_at) WHERE status = 'pending';

-- ── KNOWLEDGE GRAPH ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS kg_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    node_type VARCHAR(50),
    entity_id UUID,
    properties JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kg_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    from_node UUID REFERENCES kg_nodes(id),
    to_node UUID REFERENCES kg_nodes(id),
    relation_type VARCHAR(100),
    weight FLOAT DEFAULT 1.0,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── AUDIT LOG ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    agent VARCHAR(50),
    action VARCHAR(100),
    input_summary TEXT,
    output_summary TEXT,
    llm_tokens_used INTEGER,
    cognitive_minutes_saved INTEGER DEFAULT 0,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── COGNITIVE METRICS ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cognitive_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(100),
    minutes_saved INTEGER,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cognitive_minutes_config (
    event_type VARCHAR(100) PRIMARY KEY,
    minutes_saved INTEGER NOT NULL,
    description TEXT
);

INSERT INTO cognitive_minutes_config (event_type, minutes_saved, description) VALUES
    ('prescription_ocr_processed', 15, 'Manually reading and scheduling medicines'),
    ('birthday_reminder_created', 8, 'Setting up birthday reminder manually'),
    ('gift_suggestion_generated', 12, 'Researching gift ideas online'),
    ('whatsapp_draft_generated', 5, 'Writing personalized WhatsApp message'),
    ('circular_parsed', 10, 'Reading and extracting info from school circular'),
    ('school_event_calendared', 7, 'Manually adding event to calendar'),
    ('refill_alert_sent', 6, 'Tracking and calculating medicine refill date')
ON CONFLICT (event_type) DO NOTHING;
