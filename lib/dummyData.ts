// Sesuaikan import ini dengan lokasi aslinya
import { ScanListItem } from '@/lib/api';

export const MOCK_SCANS: ScanListItem[] = [
  {
    scan_id: "20231026_153000_abc123",
    target_url: "http://localhost:3002",
    testing_mode: "Grey Box",
    status: "completed",
    progress: 100,
    started_at: "2023-10-26T15:30:00Z",
    findings: { total: 11, critical: 0, high: 1, medium: 3, low: 7 }
  },
  {
    scan_id: "20231025_100000_xyz987",
    target_url: "http://localhost:3002",
    testing_mode: "Grey Box",
    status: "completed",
    progress: 100,
    started_at: "2023-10-25T10:00:00Z",
    findings: { total: 9, critical: 0, high: 0, medium: 2, low: 7 }
  },
  {
    scan_id: "20231026_160000_def456",
    target_url: "https://example.com/api",
    testing_mode: "Black Box",
    status: "running",
    progress: 55,
    started_at: "2023-10-26T16:00:00Z",
    findings: { total: 7, critical: 1, high: 0, medium: 2, low: 4 }
  },
  {
    scan_id: "20231020_080000_lmn123",
    target_url: "https://example.com/api",
    testing_mode: "Black Box",
    status: "completed",
    progress: 100,
    started_at: "2023-10-20T08:00:00Z",
    findings: { total: 4, critical: 0, high: 0, medium: 1, low: 3 }
  },
  {
    scan_id: "20231026_170000_pqr789",
    target_url: "http://localhost:3002",
    testing_mode: "White Box",
    status: "error",
    progress: 0,
    started_at: "2023-10-26T17:00:00Z",
    findings: { total: 8, critical: 0, high: 1, medium: 1, low: 6 }
  }
];