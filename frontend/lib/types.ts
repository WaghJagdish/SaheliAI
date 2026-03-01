// lib/types.ts — Shared TypeScript types for Saheli-AI

export interface Person {
  id: string;
  name: string;
  relation: string;
  birthday: string;
  gift_budget: number;
  phone?: string;
  notes?: string;
  days_until_birthday?: number;
}

export interface BirthdayEvent {
  id: string;
  person_name: string;
  relation: string;
  days_until: number;
  birthday: string;
  gift_budget: number;
  has_suggestions: boolean;
}

export interface GiftSuggestion {
  name: string;
  description: string;
  price: number;
  where_to_buy: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  schedule_times: string[];
  pills_remaining: number;
  total_pills: number;
  prescribed_for: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  refill_needed?: boolean;
  today_status?: Array<{ time: string; status: 'taken' | 'pending' | 'skipped' | 'missed' }>;
}

export interface Prescription {
  id: string;
  doctor_name: string;
  prescribed_for: string;
  prescription_date: string;
  medicine_count: number;
  processed: boolean;
}

export interface Child {
  id: string;
  name: string;
  class_name: string;
  school_name: string;
  section?: string;
}

export interface SchoolEvent {
  id: string;
  event_name: string;
  event_date: string;
  deadline_date?: string;
  fee_amount?: number;
  fee_paid: boolean;
  special_instructions?: string;
  child_name: string;
  whatsapp_reply_draft?: string;
  days_until: number;
  days_until_deadline?: number;
  action_required: boolean;
  completed?: boolean;
}

export interface Reminder {
  id: string;
  type: 'birthday' | 'medicine' | 'school_event' | 'refill';
  title: string;
  body: string;
  status: 'pending' | 'sent' | 'dismissed';
  trigger_at: string;
  entity_type: string;
  priority: 'high' | 'medium' | 'low';
}

export interface CognitiveMetrics {
  total_minutes: number;
  reminders_count?: number;
  tasks_handled?: number;
  messages_drafted?: number;
  breakdown: Array<{
    event_type: string;
    total: number;
    count: number;
  }>;
}

export interface DashboardMetrics {
  cognitive: CognitiveMetrics;
  family: {
    total_persons: number;
    upcoming_birthdays_30days: number;
    next_birthday_days: number;
  };
  health: {
    active_medicines: number;
    refills_needed: number;
    prescriptions_processed: number;
  };
  school: {
    active_events: number;
    fees_pending: number;
    circulars_processed: number;
  };
  reminders: {
    total_pending: number;
    high_priority: number;
  };
}

export interface ActivityLog {
  agent: string;
  action: string;
  summary: string;
  minutes_saved: number;
  timestamp: string;
}

export type ReminderType = 'birthday' | 'medicine' | 'school_event' | 'refill';

export const COGNITIVE_EVENT_LABELS: Record<string, string> = {
  prescription_ocr_processed: 'Prescription OCR',
  birthday_reminder_created: 'Birthday Reminder',
  gift_suggestion_generated: 'Gift Suggestions',
  whatsapp_draft_generated: 'WhatsApp Draft',
  circular_parsed: 'Circular Parsed',
  school_event_calendared: 'Event Calendared',
  refill_alert_sent: 'Refill Alert',
};
