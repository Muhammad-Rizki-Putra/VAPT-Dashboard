"""
VAPT Dummy Engine
=================
Mock API server — tidak butuh LLM, Docker, atau server VAPT.
Mengembalikan JSON schema yang sama persis dengan real engine.

Cara jalankan:
    pip install fastapi uvicorn
    python dummy_engine.py

Swagger docs otomatis tersedia di:
    http://localhost:8080/docs

Dashboard team bisa langsung develop dari sini.
"""

import uuid
import time
import random
import threading
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI(
    title="VAPT Otonom Engine API",
    description="API untuk Sistem VAPT Multi-Agentic AI",
    version="1.0.0"
)

# CORS — izinkan semua origin agar dashboard bisa akses
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# IN-MEMORY STATE (simulasi scan progress)
# ─────────────────────────────────────────
scan_store: dict = {}   # scan_id → scan state


# ─────────────────────────────────────────
# REQUEST / RESPONSE MODELS
# ─────────────────────────────────────────
class ScanRequest(BaseModel):
    target_url:  str
    mode:        str            = "Black Box"   # Black Box | Grey Box | White Box | VA Adaptive
    language:    str            = "id"          # id | en
    username:    Optional[str]  = None
    password:    Optional[str]  = None
    swagger_url: Optional[str]  = None


# ─────────────────────────────────────────
# MOCK DATA — sama dengan output real engine
# ─────────────────────────────────────────
def build_mock_result(scan_id: str, req: ScanRequest) -> dict:
    """
    Bangun mock JSON yang strukturnya identik dengan real engine.
    Data diisi berdasarkan hasil scan Grey Box Juice Shop yang sudah diverifikasi.
    """
    now_dt   = datetime.now()
    now      = now_dt.isoformat()
    scan_date = now_dt.strftime('%d %B %Y %H:%M')

    # Sesuaikan temuan berdasarkan mode
    base_vulns = [
        {
            "id": 1,
            "name": "Content Security Policy (CSP) Header Not Set",
            "severity": "Medium",
            "cvss_score": 5.3,
            "endpoint": req.target_url,
            "description": "Header Content-Security-Policy tidak ditemukan pada response HTTP. CSP membantu mencegah serangan XSS dan data injection.",
            "recommendation": "Tambahkan header Content-Security-Policy dengan policy yang ketat.",
            "source": "ZAP",
            "is_exploitable": True,
            "business_impact": "Memungkinkan eksekusi script berbahaya di browser pengguna."
        },
        {
            "id": 2,
            "name": "Cross-Domain Misconfiguration",
            "severity": "Medium",
            "cvss_score": 5.3,
            "endpoint": req.target_url,
            "description": "Header Access-Control-Allow-Origin diset ke wildcard (*) yang memungkinkan request dari domain manapun.",
            "recommendation": "Batasi CORS hanya ke domain yang dipercaya.",
            "source": "ZAP",
            "is_exploitable": True,
            "business_impact": "Data API dapat diakses dari website pihak ketiga yang tidak terpercaya."
        },
        {
            "id": 3,
            "name": "Cross-Origin-Embedder-Policy Header Missing",
            "severity": "Low",
            "cvss_score": 3.1,
            "endpoint": req.target_url,
            "description": "Header COEP tidak ditemukan. Header ini melindungi dokumen dari loading resource cross-origin yang tidak aman.",
            "recommendation": "Tambahkan header Cross-Origin-Embedder-Policy: require-corp.",
            "source": "ZAP",
            "is_exploitable": False,
            "business_impact": "Potensi kebocoran data melalui side-channel attack."
        },
        {
            "id": 4,
            "name": "Cross-Origin-Opener-Policy Header Missing",
            "severity": "Low",
            "cvss_score": 3.1,
            "endpoint": req.target_url,
            "description": "Header COOP tidak ditemukan. Header ini mencegah window dari halaman lain mengakses referensi ke window saat ini.",
            "recommendation": "Tambahkan header Cross-Origin-Opener-Policy: same-origin.",
            "source": "ZAP",
            "is_exploitable": False,
            "business_impact": "Potensi eksploitasi melalui referensi window cross-origin."
        },
        {
            "id": 5,
            "name": "Dangerous JS Functions",
            "severity": "Low",
            "cvss_score": 2.6,
            "endpoint": f"{req.target_url}/main.js",
            "description": "Fungsi JavaScript berbahaya ditemukan: eval(), document.write(). Penggunaan fungsi ini dapat membuka celah XSS.",
            "recommendation": "Hindari penggunaan eval() dan document.write(). Gunakan alternatif yang lebih aman.",
            "source": "ZAP",
            "is_exploitable": False,
            "business_impact": "Potensi eksekusi kode arbitrary di browser jika input tidak di-sanitasi."
        },
        {
            "id": 6,
            "name": "Deprecated Feature Policy Header Set",
            "severity": "Low",
            "cvss_score": 2.1,
            "endpoint": req.target_url,
            "description": "Header Feature-Policy sudah deprecated. Seharusnya menggunakan Permissions-Policy.",
            "recommendation": "Ganti Feature-Policy dengan Permissions-Policy.",
            "source": "ZAP",
            "is_exploitable": False,
            "business_impact": "Minimal — header deprecated tidak aktif di browser modern."
        },
        {
            "id": 7,
            "name": "Timestamp Disclosure - Unix",
            "severity": "Low",
            "cvss_score": 2.4,
            "endpoint": req.target_url,
            "description": "Unix timestamp ditemukan pada response yang dapat digunakan untuk fingerprinting.",
            "recommendation": "Hapus atau samarkan informasi timestamp dari response publik.",
            "source": "ZAP",
            "is_exploitable": False,
            "business_impact": "Membantu attacker melakukan reconnaissance lebih akurat."
        },
        {
            "id": 8,
            "name": "Server: No banner retrieved",
            "severity": "Low",
            "cvss_score": 0.0,
            "endpoint": req.target_url,
            "description": "Server tidak mengembalikan banner HTTP Server yang informatif.",
            "recommendation": "Informasi minimal — pertahankan kondisi ini.",
            "source": "Nikto",
            "is_exploitable": False,
            "business_impact": "Tidak ada dampak bisnis langsung."
        },
        {
            "id": 9,
            "name": "robots.txt contains 1 entry which should be manually reviewed",
            "severity": "Low",
            "cvss_score": 1.5,
            "endpoint": f"{req.target_url}/robots.txt",
            "description": "File robots.txt mengandung path yang mungkin mengungkapkan struktur direktori internal.",
            "recommendation": "Review konten robots.txt dan hapus path sensitif.",
            "source": "Nikto",
            "is_exploitable": False,
            "business_impact": "Memungkinkan attacker mengetahui struktur aplikasi."
        },
    ]

    # Tambahkan temuan khusus Grey Box & White Box
    if "Black Box" not in req.mode:
        base_vulns.append({
            "id": 10,
            "name": "JWT Payload Exposes Sensitive User Data",
            "severity": "Medium",
            "cvss_score": 4.3,
            "endpoint": f"{req.target_url}/rest/user/login",
            "description": "JWT payload mengandung data sensitif termasuk email pengguna dan ID internal tanpa enkripsi tambahan.",
            "recommendation": "Minimalkan data dalam JWT payload. Gunakan referensi ID saja, bukan data lengkap.",
            "source": "JWT Analysis",
            "is_exploitable": True,
            "business_impact": "Data pengguna dapat dibaca oleh siapapun yang mendapat akses ke token."
        })
        base_vulns.append({
            "id": 11,
            "name": "Weak JWT Secret (HS256 Brute-forceable)",
            "severity": "High",
            "cvss_score": 7.5,
            "endpoint": f"{req.target_url}/rest/user/login",
            "description": "Algoritma HS256 digunakan dengan secret yang lemah. Token dapat dipalsukan.",
            "recommendation": "Gunakan secret minimal 256-bit yang acak, atau beralih ke RS256.",
            "source": "JWT Analysis",
            "is_exploitable": True,
            "business_impact": "Attacker dapat membuat token valid untuk user manapun termasuk admin."
        })

    if "White Box" in req.mode and req.swagger_url:
        base_vulns.append({
            "id": len(base_vulns) + 1,
            "name": "SQL Injection — /api/Users endpoint",
            "severity": "High",
            "cvss_score": 8.6,
            "endpoint": f"{req.target_url}/api/Users",
            "description": "Parameter email pada endpoint /api/Users rentan terhadap SQL Injection klasik.",
            "recommendation": "Gunakan prepared statements / parameterized queries.",
            "source": "SQLMap",
            "is_exploitable": True,
            "business_impact": "Attacker dapat membaca seluruh database termasuk data pengguna dan password."
        })

    # Hitung summary
    severity_count = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    for v in base_vulns:
        sev = v["severity"]
        if sev in severity_count:
            severity_count[sev] += 1

    # Tools yang digunakan
    tools_used = ["ZAP", "Nmap", "Nikto", "Katana", "ffuf", "Nuclei"]
    if "Black Box" not in req.mode:
        tools_used += ["JWT Analyzer", "SQLMap"]
    if req.swagger_url:
        tools_used.append("Swagger Parser")

    # Mock endpoints dari Katana
    mock_endpoints = [
        f"{req.target_url}/",
        f"{req.target_url}/login",
        f"{req.target_url}/register",
        f"{req.target_url}/search",
        f"{req.target_url}/basket",
        f"{req.target_url}/api/products",
        f"{req.target_url}/api/users",
        f"{req.target_url}/rest/user/login",
        f"{req.target_url}/rest/products/search",
        f"{req.target_url}/api-docs",
    ]

    return {
        "scan_id":          scan_id,
        "target_url":       req.target_url,
        "testing_mode":     req.mode,
        "language":         req.language,
        "timestamp":        now,
        "scan_date":        scan_date,
        "duration_seconds": random.randint(1800, 2700),
        "status":       "completed",

        "summary": {
            "total":    len(base_vulns),
            "critical": severity_count["Critical"],
            "high":     severity_count["High"],
            "medium":   severity_count["Medium"],
            "low":      severity_count["Low"],
        },

        "tech_stack": {
            "server":      "Unknown",
            "powered_by":  "Node.js",
            "status_code": 200,
            "framework":   "Angular (SPA)"
        },

        "tools_used": tools_used,

        "endpoints_discovered": mock_endpoints,
        "endpoint_count": len(mock_endpoints),

        "vulnerabilities": base_vulns,

        "exploit_summary": (
            f"Dari {len(base_vulns)} kerentanan yang ditemukan, "
            f"{severity_count['High']} berseverity High dan {severity_count['Medium']} Medium. "
            "Kerentanan paling kritis adalah konfigurasi CORS yang terlalu permisif dan "
            "ketiadaan header keamanan (CSP). Pada mode autentikasi, ditemukan kelemahan "
            "pada implementasi JWT yang berpotensi dieksploitasi untuk privilege escalation."
        ),

        "report": {
            "pdf_filename": f"VAPT_Report_{scan_id}_ID.pdf",
            "txt_filename": f"VAPT_Report_{scan_id}_ID.txt",
        }
    }


# ─────────────────────────────────────────
# SIMULASI PROGRESS SCAN
# ─────────────────────────────────────────
SCAN_STEPS = [
    (5,  "Orchestrator menyusun strategi..."),
    (15, "Reconnaissance — identifikasi endpoint dan tech stack..."),
    (30, "Tool Executor — Nmap, Nikto, Katana, ffuf, Nuclei..."),
    (55, "Scanner — OWASP ZAP sedang berjalan..."),
    (80, "Exploit Analyst — memvalidasi kerentanan..."),
    (95, "Reporter — membuat laporan PDF..."),
    (100, "Selesai"),
]

# (elapsed_seconds, level, message)
# level: agent | llm | tool | success | warning | info
SCAN_LOG_SEQUENCE = [
    # ── Orchestrator ──────────────────────────────────────────────────────
    (0.0,  "agent",   "🤖 [Orchestrator] Memulai analisis target..."),
    (0.4,  "info",    "   Mengambil konteks OWASP dari knowledge base (ChromaDB)..."),
    (0.9,  "llm",     "   <thinking>\n   Target teridentifikasi sebagai web application.\n   Strategy: fingerprint server → discover endpoints → run tools → validate findings.\n   Prioritas: injection endpoints, auth flows, security headers.\n   </thinking>"),
    (1.4,  "success", "   ✓ Strategi pengujian berhasil disusun"),

    # ── Reconnaissance ────────────────────────────────────────────────────
    (1.6,  "agent",   "🔍 [Reconnaissance] Mengidentifikasi endpoint dan tech stack..."),
    (1.9,  "info",    "   → GET {target} ... 200 OK"),
    (2.2,  "info",    "   Server: Unknown | X-Powered-By: Node.js | Status: 200"),
    (2.6,  "info",    "   Crawling HTML — mengekstrak href, action, src..."),
    (3.0,  "info",    "   Ditemukan: /login, /register, /search, /basket, /api/products"),
    (3.4,  "llm",     "   <thinking>\n   Tech stack: Node.js + Angular SPA (frontend-rendered).\n   /rest/user/login → kandidat utama untuk JWT & SQLi testing.\n   /api/products → endpoint REST, kemungkinan IDOR & injection.\n   Tidak ada WAF terdeteksi dari response headers.\n   </thinking>"),
    (4.2,  "success", "   ✓ 10 endpoint ditemukan — analisis selesai"),

    # ── Tool Executor ─────────────────────────────────────────────────────
    (4.6,  "agent",   "🛠️  [Tool Executor] Menjalankan security tools..."),

    (4.9,  "tool",    "   [Nmap] Inisiasi port scan (SYN scan)..."),
    (5.6,  "tool",    "   [Nmap] PORT      STATE   SERVICE\n            3000/tcp  open    http (Node.js)\n            3001/tcp  closed  unknown"),
    (6.1,  "success", "   [Nmap] ✓ Selesai — 1 open port ditemukan"),

    (6.3,  "tool",    "   [Nikto] Scanning web server vulnerabilities..."),
    (7.2,  "tool",    "   [Nikto] + robots.txt: 1 entry — perlu review manual"),
    (7.6,  "tool",    "   [Nikto] + Server: No banner retrieved"),
    (8.1,  "success", "   [Nikto] ✓ Selesai — 2 findings"),

    (8.3,  "tool",    "   [Katana] Crawling aktif (depth:5, headless, kf:all)..."),
    (9.0,  "tool",    "   [Katana] [INF] http://localhost:3002/rest/user/login"),
    (9.3,  "tool",    "   [Katana] [INF] http://localhost:3002/api/products/search"),
    (9.6,  "tool",    "   [Katana] [INF] http://localhost:3002/api/users"),
    (9.9,  "tool",    "   [Katana] [INF] http://localhost:3002/rest/basket"),
    (10.3, "tool",    "   [Katana] [INF] http://localhost:3002/api-docs"),
    (10.8, "success", "   [Katana] ✓ Selesai — 247 endpoint ditemukan"),

    (11.0, "tool",    "   [ffuf] Directory fuzzing dengan wordlist common.txt..."),
    (11.8, "tool",    "   [ffuf] [Status:200] /api-docs"),
    (12.1, "tool",    "   [ffuf] [Status:200] /metrics"),
    (12.5, "success", "   [ffuf] ✓ Selesai — 2 hidden paths ditemukan"),

    (12.7, "tool",    "   [Nuclei] Menjalankan 8.000+ security templates..."),
    (13.5, "tool",    "   [Nuclei] [medium] missing-csp         → http://localhost:3002"),
    (13.9, "tool",    "   [Nuclei] [medium] cors-wildcard       → http://localhost:3002"),
    (14.2, "tool",    "   [Nuclei] [info]   tech-detect:nodejs  → http://localhost:3002"),
    (14.6, "tool",    "   [Nuclei] [info]   tech-detect:angular → http://localhost:3002"),
    (15.0, "success", "   [Nuclei] ✓ Selesai — 4 findings"),

    # ── ZAP Scanner ───────────────────────────────────────────────────────
    (16.5, "agent",   "🔬 [Scanner] OWASP ZAP passive scan dimulai..."),
    (16.8, "info",    "   Target: http://localhost:3002 (localhost via --network host)"),
    (17.2, "info",    "   Mode: zap-baseline.py | Timeout: 300s"),
    (18.0, "tool",    "   [ZAP] Spidering target — mengikuti semua link..."),
    (18.5, "tool",    "   [ZAP] Passive scanning 247 request/response pairs..."),
    (19.5, "warning", "   [ZAP] ⚠ ALERT [Medium] Content Security Policy (CSP) Header Not Set"),
    (20.0, "warning", "   [ZAP] ⚠ ALERT [Medium] Cross-Domain Misconfiguration (CORS: *)"),
    (20.4, "warning", "   [ZAP] ⚠ ALERT [Low]    Cross-Origin-Embedder-Policy Header Missing"),
    (20.8, "warning", "   [ZAP] ⚠ ALERT [Low]    Cross-Origin-Opener-Policy Header Missing"),
    (21.2, "warning", "   [ZAP] ⚠ ALERT [Low]    Dangerous JS Functions (eval, document.write)"),
    (21.6, "warning", "   [ZAP] ⚠ ALERT [Low]    Deprecated Feature Policy Header"),
    (22.0, "warning", "   [ZAP] ⚠ ALERT [Low]    Timestamp Disclosure - Unix"),
    (22.4, "warning", "   [ZAP] ⚠ ALERT [Low]    Server: No banner retrieved"),
    (22.7, "warning", "   [ZAP] ⚠ ALERT [Low]    robots.txt — 1 entry untuk manual review"),
    (23.0, "success", "   [ZAP] ✓ Scan selesai — 9 alerts"),

    # ── Exploit Analyst ───────────────────────────────────────────────────
    (24.0, "agent",   "⚡ [Exploit Analyst] Memvalidasi kerentanan dengan deepseek-r1:70b..."),
    (24.4, "llm",     "   <thinking>\n   Kerentanan #1: CSP Header Missing\n   → is_exploitable: TRUE\n   → Tanpa CSP, attacker dapat inject arbitrary script via XSS jika ada reflected input\n   → CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N = 6.1 (Medium)\n   → Business impact: eksekusi script di browser semua pengguna\n   </thinking>"),
    (25.1, "success", "   ✓ CSP Header Missing       — exploitable: true  | CVSS: 5.3 [Medium]"),
    (25.3, "llm",     "   <thinking>\n   Kerentanan #2: CORS Wildcard (*)\n   → is_exploitable: TRUE\n   → Any origin dapat melakukan cross-site request ke API\n   → Jika dikombinasikan dengan XSS → data exfiltration sempurna\n   → CVSS: 5.3 (Medium)\n   </thinking>"),
    (26.0, "success", "   ✓ CORS Misconfiguration    — exploitable: true  | CVSS: 5.3 [Medium]"),
    (26.4, "llm",     "   <thinking>\n   Kerentanan #11: JWT Weak Secret (HS256)\n   → is_exploitable: TRUE — KRITIS\n   → Secret brute-forceable dengan hashcat/jwt_tool\n   → Attacker dapat forge token untuk ANY user termasuk admin\n   → CVSS: 7.5 (High) — privilege escalation penuh\n   </thinking>"),
    (27.2, "success", "   ✓ JWT Weak Secret (HS256)  — exploitable: true  | CVSS: 7.5 [High] ⚠️"),
    (27.6, "info",    "   Menyusun exploit summary..."),
    (28.2, "success", "   ✓ Validasi selesai — 11 kerentanan tervalidasi"),

    # ── Reporter ──────────────────────────────────────────────────────────
    (28.5, "agent",   "📄 [Reporter] Menyusun laporan VAPT formal..."),
    (28.8, "llm",     "   Generating executive summary (llama3.1:70b, Bahasa Indonesia)..."),
    (29.3, "info",    "   Membuat PDF — layout A4, section: Ringkasan, Temuan, Rekomendasi, Kesimpulan"),
    (29.7, "success", "   ✅ Laporan selesai! Scan completed."),
]


def simulate_scan(scan_id: str, req: ScanRequest, duration_seconds: int = 30):
    """Simulasi progress scan + streaming logs ke scan_store."""
    start_time = time.time()
    log_idx    = 0

    while True:
        elapsed  = time.time() - start_time
        progress = min(int((elapsed / duration_seconds) * 100), 99)

        # Update step
        current_step = SCAN_STEPS[0][1]
        for threshold, label in SCAN_STEPS:
            if progress >= threshold:
                current_step = label

        scan_store[scan_id]["progress"]     = progress
        scan_store[scan_id]["current_step"] = current_step
        scan_store[scan_id]["status"]       = "running"

        # Tambah log berdasarkan elapsed time
        while log_idx < len(SCAN_LOG_SEQUENCE):
            log_time, level, message = SCAN_LOG_SEQUENCE[log_idx]
            if elapsed >= log_time:
                # Ganti {target} placeholder
                message = message.replace("{target}", req.target_url)
                scan_store[scan_id]["logs"].append({
                    "index":   len(scan_store[scan_id]["logs"]),
                    "time":    datetime.now().strftime('%H:%M:%S'),
                    "level":   level,
                    "message": message,
                })
                log_idx += 1
            else:
                break

        if elapsed >= duration_seconds:
            break
        time.sleep(0.5)

    # Scan selesai
    scan_store[scan_id]["status"]       = "completed"
    scan_store[scan_id]["progress"]     = 100
    scan_store[scan_id]["current_step"] = "Selesai"
    scan_store[scan_id]["result"]       = build_mock_result(scan_id, req)


# ─────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────

@app.get("/")
def root():
    return {
        "service": "VAPT Otonom Engine",
        "version": "1.0.0",
        "status":  "running",
        "mode":    "DUMMY (no LLM)",
        "docs":    "/docs"
    }


@app.post("/api/scan/start")
def start_scan(req: ScanRequest):
    """
    Mulai scan baru.
    Mengembalikan scan_id yang digunakan untuk polling status dan mengambil hasil.
    """
    scan_id   = datetime.now().strftime('%Y%m%d_%H%M%S') + "_" + str(uuid.uuid4())[:8]
    sim_duration = 30  # detik simulasi (30 detik = cukup untuk demo)

    scan_store[scan_id] = {
        "scan_id":      scan_id,
        "target_url":   req.target_url,
        "testing_mode": req.mode,
        "status":       "started",
        "progress":     0,
        "current_step": "Memulai scan...",
        "started_at":   datetime.now().isoformat(),
        "result":       None,
        "logs":         [],
    }

    # Jalankan simulasi di background thread
    t = threading.Thread(
        target=simulate_scan,
        args=(scan_id, req, sim_duration),
        daemon=True
    )
    t.start()

    return {
        "scan_id":            scan_id,
        "status":             "started",
        "estimated_duration": sim_duration,
        "message":            f"Scan dimulai untuk target {req.target_url} — mode {req.mode}"
    }


@app.get("/api/scan/status/{scan_id}")
def get_status(scan_id: str):
    """
    Polling status scan.
    Dashboard bisa poll endpoint ini setiap 2 detik untuk update progress.
    """
    if scan_id not in scan_store:
        raise HTTPException(status_code=404, detail="Scan ID tidak ditemukan")

    s = scan_store[scan_id]
    return {
        "scan_id":      scan_id,
        "status":       s["status"],        # started | running | completed | error
        "progress":     s["progress"],      # 0-100
        "current_step": s["current_step"],
        "started_at":   s["started_at"],
    }


@app.get("/api/scan/result/{scan_id}")
def get_result(scan_id: str):
    """
    Ambil hasil scan lengkap dalam format JSON.
    Hanya tersedia setelah status = completed.
    """
    if scan_id not in scan_store:
        raise HTTPException(status_code=404, detail="Scan ID tidak ditemukan")

    s = scan_store[scan_id]
    if s["status"] != "completed":
        raise HTTPException(
            status_code=202,
            detail=f"Scan belum selesai — status: {s['status']}, progress: {s['progress']}%"
        )

    return s["result"]


@app.get("/api/scan/list")
def list_scans():
    """List semua scan yang pernah dijalankan dalam session ini."""
    def _findings(s: dict):
        if s["status"] != "completed" or not s.get("result"):
            return None
        sm = s["result"].get("summary", {})
        return {
            "total":    sm.get("total",    0),
            "critical": sm.get("critical", 0),
            "high":     sm.get("high",     0),
            "medium":   sm.get("medium",   0),
            "low":      sm.get("low",      0),
        }

    return {
        "total": len(scan_store),
        "scans": [
            {
                "scan_id":      sid,
                "target_url":   s["target_url"],
                "testing_mode": s["testing_mode"],
                "status":       s["status"],
                "progress":     s["progress"],
                "started_at":   s["started_at"],
                "findings":     _findings(s),
            }
            for sid, s in scan_store.items()
        ]
    }


@app.get("/api/scan/logs/{scan_id}")
def get_logs(scan_id: str, offset: int = 0):
    """
    Ambil streaming logs sejak offset tertentu.
    Frontend poll endpoint ini setiap 1 detik untuk tampilkan live output.
    """
    if scan_id not in scan_store:
        raise HTTPException(status_code=404, detail="Scan ID tidak ditemukan")
    logs = scan_store[scan_id].get("logs", [])
    return {
        "scan_id": scan_id,
        "total":   len(logs),
        "logs":    logs[offset:],
    }


@app.delete("/api/scan/{scan_id}")
def delete_scan(scan_id: str):
    """Hapus scan dari memory."""
    if scan_id not in scan_store:
        raise HTTPException(status_code=404, detail="Scan ID tidak ditemukan")
    del scan_store[scan_id]
    return {"message": f"Scan {scan_id} dihapus"}


# ─────────────────────────────────────────
# RUN
# ─────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 55)
    print("  VAPT Dummy Engine — No LLM Mode")
    print("=" * 55)
    print("  API docs : http://localhost:8080/docs")
    print("  Base URL : http://localhost:8080")
    print("=" * 55)
    uvicorn.run(app, host="0.0.0.0", port=8080)