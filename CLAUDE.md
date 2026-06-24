# VAPT Otonom — Project Context

Sistem VAPT Multi-Agentic AI, on-premise, ARM64 (ASUS Ascent GX10, NVIDIA GB10, 128GB).
Owner: Muhammad Rizki Putra | PT Lumicore Sinergi Awan (TMMIN)

## Status sprint

Sprint 3 sedang berjalan. Sprint 2 selesai.

## Cara jalankan

```bash
# Server (GX10)
docker start chromadb
docker start juiceshop          # port 3002:3000
source ~/vapt-env/bin/activate
cd ~/vapt-system
python main.py                  # input URL: http://localhost:3002

# API mode (untuk dashboard)
python vapt_api.py              # port 8080

# Dummy engine (local, tanpa server)
python dummy_engine.py          # port 8080
```

## Struktur file

```
~/vapt-system/
├── main.py                  # pipeline utama (sudah diupdate Sprint 3)
├── vapt_api.py              # FastAPI wrapper → real engine
├── dummy_engine.py          # FastAPI mock → untuk dashboard dev
├── agents/
│   ├── tool_executor.py     # dispatcher semua tool (sudah diupdate)
│   └── pdf_reporter.py      # generate PDF laporan
├── reports/                 # output scan (PDF + TXT + zap_report.json)
└── wordlists/               # wordlist ffuf
    └── Discovery/Web-Content/common.txt
```

## Docker containers

| Container | Image | Port | Status |
|-----------|-------|------|--------|
| juiceshop | bkimminich/juice-shop | 3002:3000 | ✅ |
| chromadb | chromadb/chroma | 8000 | ✅ harus jalan sebelum main.py |
| dvwa | — | 8080 | ✅ |
| metasploitable2 | tleemcjr/metasploitable2 | — | ❌ skip (ARM64 vs AMD64) |

**PENTING:** IP Juice Shop bisa berubah tiap recreate. Selalu pakai `http://localhost:3002` sebagai input, bukan Docker IP.
Cek IP: `docker inspect juiceshop | grep IPAddress`

## LLM yang digunakan

| Agent | Model |
|-------|-------|
| Orchestrator | llama3.1:70b |
| Scanner | qwen2.5-coder:32b |
| Exploit Analyst | deepseek-r1:70b |
| Reporter | llama3.1:70b |
| Embeddings/RAG | llama3.1:70b → ChromaDB |

## Mode pengujian

| Mode | Credential | Swagger | Tools tambahan |
|------|-----------|---------|----------------|
| Black Box | ❌ | ❌ | ZAP baseline, Nmap, Nikto, Katana, ffuf, Nuclei |
| Grey Box | ✅ | ❌ | + ZAP full scan (auth), JWT, SQLMap |
| White Box | ✅ | ✅ | + SQLMap per Swagger endpoint, ffuf Swagger wordlist |
| VA Adaptive | opsional | opsional | auto-detect → salah satu dari atas |

Kredensial Juice Shop: `admin@juice-sh.op / admin123`
Swagger Juice Shop: `http://localhost:3002/api-docs`

## Akurasi sistem (Sprint 3, setelah fix)

| Metrik | Sprint 2 | Sprint 3 |
|--------|----------|----------|
| Precision | ~70% | ~89% |
| Recall | ~10-15% | ~23% |
| F1 | ~20-25% | ~36% |
| False Positive | ~20% | ~10% |

Ground truth Juice Shop: ~35 distinct auto-detectable issues.

## Arsitektur API (dashboard ↔ engine)

```
POST /api/scan/start           → { scan_id, status, estimated_duration }
GET  /api/scan/status/{id}     → { status, progress 0-100, current_step }
GET  /api/scan/result/{id}     → JSON lengkap (lihat schema di bawah)
GET  /api/scan/list            → semua scan dalam session
DELETE /api/scan/{id}          → hapus dari memory
```

JSON result schema (identik antara dummy_engine.py dan vapt_api.py):
```json
{
  "scan_id": "...",
  "target_url": "...",
  "testing_mode": "Grey Box",
  "status": "completed",
  "summary": { "total": 11, "critical": 0, "high": 0, "medium": 2, "low": 9 },
  "tech_stack": { "server": "...", "powered_by": "...", "status_code": 200 },
  "tools_used": ["ZAP", "Nikto", "Katana", ...],
  "endpoints_discovered": [...],
  "endpoint_count": 10,
  "vulnerabilities": [
    {
      "id": 1,
      "name": "...",
      "severity": "Medium",
      "cvss_score": 5.3,
      "endpoint": "...",
      "description": "...",
      "recommendation": "...",
      "source": "ZAP",
      "is_exploitable": true,
      "business_impact": "..."
    }
  ],
  "exploit_summary": "...",
  "report": { "pdf_filename": "...", "txt_filename": "..." }
}
```

Koneksi dashboard ke engine: via ngrok (server tidak punya IP publik, akses via Rustdesk).
```bash
# Di server, jalankan bersamaan dengan vapt_api.py:
ngrok http 8080
# → dashboard set BASE_URL ke https://xxx.ngrok.io
```

## Bug yang sudah di-fix (Sprint 2–3)

- ✅ `reporter_node()` TypeError — parameter `testing_mode` ditambahkan
- ✅ `generate_pdf_report()` TypeError — parameter `testing_mode` ditambahkan
- ✅ Nuclei findings AttributeError — isinstance check (dict vs str)
- ✅ ZAP "Connection Refused" — `--network host` + konversi target ke localhost
- ✅ LLM hallucination di scanner — hapus LLM parsing, ganti direct JSON parse
- ✅ `execute_tool()` TypeError `auth_result` — tambah parameter `auth_result={}` dan `**kwargs`
- ✅ Hardcoded vuln ETags + CORS — diganti `parse_nikto_output()` (parse dari output nyata)
- ✅ Exploit summary bahasa Inggris — tambah instruksi bahasa Indonesia eksplisit di prompt
- ✅ Grey Box tidak berfungsi — tambah `get_auth_token()`, ZAP full scan + Replacer plugin
- ✅ White Box tidak berfungsi — Swagger endpoints dipakai untuk SQLMap + ffuf targeted

## Backlog Sprint 3 (belum selesai)

### Prioritas tinggi
- [ ] Fix Katana — sudah fix di tool_executor.py (depth 5, kf all, aff, auth header)
      **Perlu verifikasi**: setelah server nyala, test apakah Katana dapat 247 endpoint
- [ ] Dashboard UI — tim lain sedang mengerjakan, koneksi via ngrok
- [ ] Verifikasi Grey Box & White Box berjalan di server setelah restart

### Prioritas sedang
- [ ] ZAP Active Scan (sekarang masih full scan tapi bukan active)
- [ ] Grey Box dengan credential → test lebih dalam ke API
- [ ] Parse Nuclei output lebih akurat (struktur output perlu dicek)
- [ ] Parse Nikto → sudah ada `parse_nikto_output()` tapi belum ditest menyeluruh

### Prioritas rendah
- [ ] Parallel tool execution (target: kurangi dari ~40 menit)
- [ ] NVD API untuk CVSS score spesifik (sekarang masih range)
- [ ] Metasploitable2 — skip, pakai DVWA saja

## Hal penting yang jangan diubah

- `scanner_node()` TIDAK menggunakan LLM untuk parse — ini disengaja (cegah hallucination)
- ZAP selalu pakai `--network host` + target dikonversi ke `localhost`
- `execute_tool()` harus selalu menerima `auth_result={}` dan `**kwargs`
- JSON schema API (dummy vs real) harus tetap identik — dashboard bergantung pada ini
- Target URL input ke `main.py` SELALU `http://localhost:3002`, bukan Docker IP