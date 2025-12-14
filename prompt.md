Act as an expert Full Stack Developer and Cryptography Researcher. I need to build a comprehensive Final Project (Makalah) implementation titled: **"Secure QR Code: Implementasi Visual Cryptography Scheme (VCS) untuk Otentikasi Tiket Event Anti-Palsu"**.

**Core Concept:**
A Secure Ticketing System where a QR Code is split into two shares using a 2-out-of-2 Visual Cryptography Scheme.
1.  **Share A (Public):** Held by the user (digital ticket).
2.  **Share B (Private):** Stored securely in a database.
3.  **Verification:** The system stacks Share A + Share B to reveal the original QR.
4.  **Key Feature:** The system must use **OpenCV Homography** to automatically align/fix the perspective of the User's uploaded share before stacking, ensuring robustness against rotation/skew.

**Tech Stack:**
- **Frontend:** React (Vite) + TailwindCSS + Axios.
- **Backend:** Python (FastAPI) + Uvicorn + SQLAlchemy.
- **Libraries:** OpenCV (`opencv-python-headless`), NumPy, Pillow, Qrcode, Pyzbar (for decoding).
- **Database:** PostgreSQL (Dockerized).
- **DevOps:** Docker Compose (for DB + Backend).

---

### 1. Infrastructure (`docker-compose.yml`)
Provide a `docker-compose.yml` file that:
- Runs **PostgreSQL 15** (User: `admin`, Pass: `password`, DB: `vcs_tickets`).
- Runs the **FastAPI Backend** (Build from `./backend`).
- Maps ports correctly (5432 for DB, 8000 for API).

---

### 2. Backend Implementation (`./backend/`)
Provide the following files:

**A. `database.py` & `models.py`**
- Setup SQLAlchemy connection to Postgres.
- Define a `Ticket` model: `id` (PK), `user_uuid` (String, Unique), `share_b_blob` (LargeBinary), `created_at`.

**B. `core_crypto.py` (The Algorithm)**
- `generate_vcs(data: str)`: 
  - Create QR from data -> Resize to 300x300 -> Convert to 1-bit.
  - Apply 2-out-of-2 VCS (Expand 1 pixel -> 2x2 subpixels).
  - Return `img_share_a`, `img_share_b`.
- `robust_stack(img_share_a_bytes, img_share_b_bytes)`:
  - Load images using OpenCV.
  - Detect **ORB Keypoints** in both images.
  - Compute **Homography Matrix** and warp Share A to align with Share B.
  - Perform bitwise **AND/XOR** stacking.
  - Apply thresholding/denoising to clean the result.
  - Return the final stacked image (PIL object).

**C. `main.py` (API Endpoints)**
- `POST /api/tickets/create`: Accepts `{name, email}`. Generates shares. Saves Share B to DB. Returns Share A (Base64) to user.
- `POST /api/tickets/verify`: Accepts `{user_uuid, file_upload}`. Fetches Share B. Runs `robust_stack`. Decodes the QR from the stacked image. Returns `{valid: bool, original_data: str, debug_image: base64}`.

---

### 3. Frontend Implementation (`./frontend/src/App.jsx`)
Provide a modern, single-file React component using TailwindCSS:
- **Tab 1: Buy Ticket:** Form to input details -> Call Create API -> Show generated Ticket (Share A).
- **Tab 2: Verify Ticket:** Form to input UUID & Upload Image -> Call Verify API.
- **Showcase UI:** In the Verify result, display 3 images side-by-side: 
  1. "Uploaded Share A" 
  2. "Aligned Share A (OpenCV Output)" 
  3. "Final Decrypted QR".
- This visual pipeline is crucial for the technical report.

---

### 4. Instructions
- Include a `requirements.txt` file.
- Explain briefly how the Homography alignment works so I can quote it in my paper.