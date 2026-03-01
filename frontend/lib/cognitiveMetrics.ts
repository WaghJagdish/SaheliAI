// lib/cognitiveMetrics.ts — Cognitive load reduction calculator

export const COGNITIVE_MINUTES_MAP: Record<string, number> = {
    prescription_ocr_processed: 15,
    birthday_reminder_created: 8,
    gift_suggestion_generated: 12,
    whatsapp_draft_generated: 5,
    circular_parsed: 10,
    school_event_calendared: 7,
    refill_alert_sent: 6,
};

export function minutesToHoursString(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getCognitiveLabel(eventType: string): string {
    const labels: Record<string, string> = {
        prescription_ocr_processed: 'Prescription extracted',
        birthday_reminder_created: 'Birthday scheduled',
        gift_suggestion_generated: 'Gift ideas generated',
        whatsapp_draft_generated: 'Message drafted',
        circular_parsed: 'Circular parsed',
        school_event_calendared: 'Event calendared',
        refill_alert_sent: 'Refill alerted',
    };
    return labels[eventType] || eventType;
}

export function formatMinutesSaved(minutes: number): string {
    if (minutes >= 60) {
        const hours = (minutes / 60).toFixed(1);
        return `${hours} hours`;
    }
    return `${minutes} minutes`;
}
