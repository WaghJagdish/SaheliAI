-- ============================================================
-- SAHELI-AI DEMO SEED DATA
-- Realistic Indian household data for investor demo
-- ============================================================

-- Demo user
INSERT INTO users (id, name, family_name, phone, cognitive_minutes_saved, demo_mode)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Priya Sharma',
    'Sharma',
    '+919876500001',
    247,
    true
) ON CONFLICT (id) DO NOTHING;

-- ── FAMILY MEMBERS ────────────────────────────────────────────

INSERT INTO persons (id, user_id, name, relation, birthday, gift_budget, phone) VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Lakshmi Devi',  'Mother',  '1960-03-18', 5000, '+919876500002'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Rajesh Kumar',  'Father',  '1958-08-12', 4000, '+919876500003'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Vikram Sharma', 'Husband', '1985-04-05', 8000, '+919876500004'),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Meera Sharma',  'Sister',  '1990-11-20', 3000, '+919876500005'),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Rohan Verma',   'Friend',  '1987-03-04', 2000, '+919876500006')
ON CONFLICT (id) DO NOTHING;

-- ── PRESCRIPTIONS ─────────────────────────────────────────────

INSERT INTO prescriptions (id, user_id, doctor_name, prescribed_for, prescription_date, processed, raw_ocr_text) VALUES
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
     'Dr. Ramesh Sharma', 'Lakshmi Devi (Mother)', '2026-02-01', true,
     'Metformin 500mg BD after meals | Atorvastatin 10mg OD night'),
    ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
     'Dr. Anita Kaur', 'Priya Sharma (Self)', '2026-01-05', true,
     'Vitamin D3 60000 IU once weekly')
ON CONFLICT (id) DO NOTHING;

-- ── MEDICINES ─────────────────────────────────────────────────

INSERT INTO medicines (id, prescription_id, user_id, name, dosage, frequency, times_per_day, schedule_times, duration_days, start_date, end_date, total_pills, pills_remaining, is_active) VALUES
    ('30000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000001',
     'Metformin', '500mg', 'Twice daily after meals', 2,
     '["08:00","21:00"]', 30, '2026-02-01', '2026-03-03', 60, 24, true),

    ('30000000-0000-0000-0000-000000000002',
     '20000000-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000001',
     'Vitamin D3', '60000 IU', 'Once weekly', 1,
     '["08:00"]', 90, '2026-01-05', '2026-04-05', 13, 8, true),

    ('30000000-0000-0000-0000-000000000003',
     '20000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000001',
     'Atorvastatin', '10mg', 'Once daily at night', 1,
     '["21:00"]', 30, '2026-02-01', '2026-03-03', 30, 5, true)
ON CONFLICT (id) DO NOTHING;

-- ── CHILDREN ─────────────────────────────────────────────────

INSERT INTO children (id, user_id, name, class_name, school_name, section) VALUES
    ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
     'Arjun Sharma', 'Class 5', 'St. Mary''s International School', 'B')
ON CONFLICT (id) DO NOTHING;

-- ── SCHOOL EVENTS ─────────────────────────────────────────────

INSERT INTO school_events (id, child_id, user_id, event_name, event_date, deadline_date, fee_amount, special_instructions, action_required) VALUES
    ('50000000-0000-0000-0000-000000000001',
     '40000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000001',
     'Annual Sports Day', '2026-03-15', '2026-03-10', 250,
     'Send P.E. kit and sports shoes on the day', true),

    ('50000000-0000-0000-0000-000000000002',
     '40000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000001',
     'Parent-Teacher Meeting', '2026-03-20', '2026-03-18', NULL,
     'Bring previous term report card', true)
ON CONFLICT (id) DO NOTHING;

-- Fix: remove action_required column if it doesn't exist in schema
-- (it's stored in special_instructions or as a note)

-- ── COGNITIVE EVENTS ─────────────────────────────────────────

INSERT INTO cognitive_events (user_id, event_type, minutes_saved, description, created_at) VALUES
    ('00000000-0000-0000-0000-000000000001', 'prescription_ocr_processed', 15, 'Metformin + Atorvastatin extracted', '2026-02-01 10:00:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'prescription_ocr_processed', 15, 'Vitamin D3 extracted', '2026-01-05 11:00:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'birthday_reminder_created', 8, 'Rohan Verma birthday scheduled', '2026-02-20 09:00:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'gift_suggestion_generated', 12, 'Gifts for Meera Sharma (Sister)', '2026-02-20 09:01:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'gift_suggestion_generated', 12, 'Gifts for Lakshmi Devi (Mother)', '2026-02-20 09:02:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'whatsapp_draft_generated', 5, 'Birthday message for Meera', '2026-02-27 08:00:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'circular_parsed', 10, 'Sports Day circular parsed', '2026-02-25 14:30:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'school_event_calendared', 7, 'Sports Day added to calendar', '2026-02-25 14:31:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'refill_alert_sent', 6, 'Atorvastatin refill alert', '2026-02-26 08:00:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'birthday_reminder_created', 8, 'Lakshmi Devi birthday scheduled', '2026-02-20 09:03:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'whatsapp_draft_generated', 5, 'Teacher reply drafted for Sports Day', '2026-02-25 14:32:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'school_event_calendared', 7, 'PTM added to calendar', '2026-02-28 10:00:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'gift_suggestion_generated', 12, 'Gifts for Vikram (Husband)', '2026-02-15 10:00:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'whatsapp_draft_generated', 5, 'Birthday message for Vikram', '2026-02-15 10:01:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'refill_alert_sent', 6, 'Metformin running low alert', '2026-02-24 08:00:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'prescription_ocr_processed', 15, 'Third prescription processed', '2026-01-20 09:00:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'birthday_reminder_created', 8, 'Rajesh Kumar birthday scheduled', '2026-02-20 09:04:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'birthday_reminder_created', 8, 'Vikram Sharma birthday scheduled', '2026-02-15 09:00:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'gift_suggestion_generated', 12, 'Gifts for Rohan Verma (Friend)', '2026-02-27 09:00:00+05:30'),
    ('00000000-0000-0000-0000-000000000001', 'circular_parsed', 10, 'PTM circular parsed', '2026-02-28 09:00:00+05:30')
ON CONFLICT DO NOTHING;
