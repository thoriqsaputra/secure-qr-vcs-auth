## Backend

### Setup
1. Copy `.env.example` to `.env` and set `SIGNING_SECRET` (strong random value) and `DATABASE_URL`.
2. Install deps locally: `python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`.
3. Run API: `uvicorn main:app --host 0.0.0.0 --port 8000`.

### Migrations
If you created tickets before the new fields (`expires_at`, `status`, `redeemed_at`), run:
- Docker: `docker compose exec db psql -U admin -d vcs_tickets -f /app/migrations/001_add_ticket_fields.sql`
- Local psql: `psql "$DATABASE_URL" -f migrations/001_add_ticket_fields.sql`

The Docker backend now auto-runs all SQL files in `migrations/` on start via `entrypoint.sh` (`uv run python migrate.py`), so in Compose it will apply idempotent migrations each container start.

### Env vars
- `SIGNING_SECRET`: HMAC key for ticket payloads (required).
- `TICKET_TTL_SECONDS`: Ticket expiry seconds (default 86400).
- `RATE_LIMIT_WINDOW`: Minimum seconds between verify attempts per UUID (default 3).

### Native dependencies
- `libzbar` is needed for pyzbar QR decoding (Debian/Ubuntu: `sudo apt-get install -y libzbar0`). OpenCV fallback decoding is also implemented, but installing libzbar is recommended.

### VCS flow
- Create: generate `user_uuid` + 8-digit `check_in_code`; build payload `name|email|uuid|code|exp`, HMAC-SHA256 sign it, encode in QR, split into 2×2 VCS shares. Store Share B/metadata; return Share A (base64) with a small overlaid code QR + code/UUID text for lookup.
- Verify: rate-limit by check-in code, check status/expiry, align Share A to Share B with ORB + homography, XOR shares, downsample to original QR grid, decode QR, validate signature/expiry and code match, mark redeemed. If no code provided, backend tries to read the overlaid code QR from the Share A image.

### Tests
- `uv run test_vcs.py` — generates shares, stacks them, decodes with pyzbar/OpenCV, and saves `share_a.png`, `share_b.png`, `aligned.png`, `stacked.png` for inspection.
