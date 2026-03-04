// lib/api.ts — API client for Saheli-AI backend
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
});

// ── Fetcher for SWR ──────────────────────────────────────────

export const fetcher = (url: string) =>
    api.get(url).then((r) => r.data);

// ── Family API ───────────────────────────────────────────────

export const familyApi = {
    listPersons: () => api.get('/api/family/persons').then((r) => r.data),
    addPerson: (data: object) => api.post('/api/family/persons', data).then((r) => r.data),
    upcomingBirthdays: () => api.get('/api/family/birthdays/upcoming').then((r) => r.data),
    generateGiftSuggestions: (personId: string) =>
        api.post(`/api/family/birthdays/${personId}/generate-suggestions`).then((r) => r.data),
    generateBirthdayMessage: (personId: string) =>
        api.post(`/api/family/birthdays/${personId}/generate-message`).then((r) => r.data),
};

// ── Health API ───────────────────────────────────────────────

export const healthApi = {
    listMedicines: () => api.get('/api/health/medicines').then((r) => r.data),
    listPrescriptions: () => api.get('/api/health/prescriptions').then((r) => r.data),
    uploadPrescription: (file: File, prescribedFor: string) => {
        const form = new FormData();
        form.append('file', file);
        form.append('prescribed_for', prescribedFor);
        return api.post('/api/health/prescriptions/upload', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then((r) => r.data);
    },
    markTaken: (medicineId: string) =>
        api.put(`/api/health/medicines/${medicineId}/taken`).then((r) => r.data),
    markSkipped: (medicineId: string) =>
        api.put(`/api/health/medicines/${medicineId}/skip`).then((r) => r.data),
    upcomingRefills: () => api.get('/api/health/refills/upcoming').then((r) => r.data),
};

// ── School API ───────────────────────────────────────────────

export const schoolApi = {
    listChildren: () => api.get('/api/school/children').then((r) => r.data),
    addChild: (data: object) => api.post('/api/school/children', data).then((r) => r.data),
    listEvents: () => api.get('/api/school/events').then((r) => r.data),
    uploadCircular: (file: File, childId: string) => {
        const form = new FormData();
        form.append('file', file);
        form.append('child_id', childId);
        return api.post('/api/school/circulars/upload', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then((r) => r.data);
    },
    markFeePaid: (eventId: string) =>
        api.put(`/api/school/events/${eventId}/fee-paid`).then((r) => r.data),
    generateTeacherReply: (eventId: string) =>
        api.post(`/api/school/events/${eventId}/generate-reply`).then((r) => r.data),
    markComplete: (eventId: string) =>
        api.put(`/api/school/events/${eventId}/complete`).then((r) => r.data),
};

// ── Reminders API ────────────────────────────────────────────

export const remindersApi = {
    listReminders: () => api.get('/api/reminders').then((r) => r.data),
    todayReminders: () => api.get('/api/reminders/today').then((r) => r.data),
    dismiss: (reminderId: string) =>
        api.put(`/api/reminders/${reminderId}/dismiss`).then((r) => r.data),
};

// ── Metrics API ──────────────────────────────────────────────

export const metricsApi = {
    cognitive: () => api.get('/api/metrics/cognitive').then((r) => r.data),
    activity: () => api.get('/api/metrics/activity').then((r) => r.data),
    dashboard: () => api.get('/api/metrics/dashboard').then((r) => r.data),
};

// ── Chat API ─────────────────────────────────────────────────

export const chatApi = {
    sendMessage: (message: string, history: { role: string; text: string }[]) =>
        api.post('/api/chat', { message, history }).then((r) => r.data as { reply: string; minutes_saved: number }),
};
