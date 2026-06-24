const BASE_URL = process.env.NEXT_PUBLIC_ENGINE_URL ?? 'http://localhost:8080';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScanRequest {
  target_url: string;
  mode: string;
  language: string;
  username?: string;
  password?: string;
  swagger_url?: string;
}

export interface ScanStartResponse {
  scan_id: string;
  status: string;
  estimated_duration: number;
  message: string;
}

export interface ScanStatus {
  scan_id: string;
  status: 'started' | 'running' | 'completed' | 'error';
  progress: number;
  current_step: string;
  started_at: string;
}

export interface Vulnerability {
  id: number;
  name: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  cvss_score: number;
  endpoint: string;
  description: string;
  recommendation: string;
  source: string;
  is_exploitable: boolean;
  business_impact: string;
}

export interface ScanResult {
  scan_id: string;
  target_url: string;
  testing_mode: string;
  language: string;
  timestamp: string;
  scan_date: string;
  duration_seconds: number;
  status: string;
  summary: { total: number; critical: number; high: number; medium: number; low: number };
  tech_stack: { server: string; powered_by: string; status_code: number; framework?: string };
  tools_used: string[];
  endpoints_discovered: string[];
  endpoint_count: number;
  vulnerabilities: Vulnerability[];
  exploit_summary: string;
  report: { pdf_filename: string; txt_filename: string };
}

export interface LogEntry {
  index: number;
  time: string;
  level: 'info' | 'agent' | 'tool' | 'llm' | 'success' | 'warning';
  message: string;
}

export interface ScanListItem {
  scan_id: string;
  target_url: string;
  testing_mode: string;
  status: string;
  progress: number;
  started_at: string;
  findings: { total: number; critical: number; high: number; medium: number; low: number } | null;
}

// ─── API Client ───────────────────────────────────────────────────────────────

export const api = {
  startScan: async (req: ScanRequest): Promise<ScanStartResponse> => {
    const res = await fetch(`${BASE_URL}/api/scan/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Gagal memulai scan: ${res.statusText}`);
    return res.json();
  },

  getStatus: async (scanId: string): Promise<ScanStatus> => {
    const res = await fetch(`${BASE_URL}/api/scan/status/${scanId}`);
    if (res.status === 404) throw new Error('SCAN_NOT_FOUND');
    if (!res.ok) throw new Error(`Gagal mengambil status: ${res.statusText}`);
    return res.json();
  },

  getResult: async (scanId: string): Promise<ScanResult> => {
    const res = await fetch(`${BASE_URL}/api/scan/result/${scanId}`);
    if (!res.ok) throw new Error('Hasil belum tersedia atau scan belum selesai');
    return res.json();
  },

  listScans: async (): Promise<{ total: number; scans: ScanListItem[] }> => {
    const res = await fetch(`${BASE_URL}/api/scan/list`);
    if (!res.ok) throw new Error(`Gagal mengambil daftar scan: ${res.statusText}`);
    return res.json();
  },

  getLogs: async (scanId: string, offset: number = 0): Promise<{ total: number; logs: LogEntry[] }> => {
    const res = await fetch(`${BASE_URL}/api/scan/logs/${scanId}?offset=${offset}`);
    if (!res.ok) throw new Error('Gagal mengambil logs');
    return res.json();
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function cvssToRange(score: number): string {
  if (score === 0) return '0.0';
  if (score < 4) return '0.1–3.9';
  if (score < 7) return '4.0–6.9';
  if (score < 9) return '7.0–8.9';
  return '9.0–10.0';
}

export function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  } catch {
    return isoString;
  }
}
