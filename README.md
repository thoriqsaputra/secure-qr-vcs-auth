# Secure QR Code Ticket Authentication

Implementation of Visual Cryptography Scheme (VCS) with ArUco-Based Rotation Correction for Anti-Counterfeit Event Ticket Authentication

## Overview

This project implements a rotation-robust two-factor authentication system for event tickets using Visual Cryptography Scheme (VCS) combined with ArUco marker alignment. The system prevents unauthorized ticket duplication while handling camera rotation (0°, 90°, 180°, 270°) with 100% decoding success.

## Key Features

- **Visual Cryptography (2-out-of-2 VCS)**: Splits ticket QR codes into two shares - Share A (user) and Share B (server)
- **Screenshot Protection**: Share A alone is useless without Share B, preventing unauthorized screenshot sharing
- **Rotation Robustness**: ArUco markers enable cardinal rotation detection (90° intervals) with pixel-perfect alignment
- **Information-Theoretic Security**: Perfect secrecy through random VCS pattern construction
- **Real-time Camera Verification**: Web-based interface with live webcam capture

## Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: FastAPI (Python) + OpenCV + NumPy
- **Database**: PostgreSQL
- **Deployment**: Docker Compose

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git**

### Optional (for local development without Docker):
- **Python 3.12+**
- **Bun** (JavaScript runtime)
- **PostgreSQL 15+**

## Quick Start with Docker

### 1. Clone the Repository

```bash
git clone https://github.com/thoriqsaputra/secure-qr-vcs-auth.git
cd secure-qr-vcs-auth
```

### 2. Start the Application

```bash
docker-compose up --build
```

This will:
- Build and start PostgreSQL database
- Build and start FastAPI backend on `http://localhost:8000`
- Build and start React frontend on `http://localhost:5173`
- Run database migrations automatically

### 3. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API Docs**: http://localhost:8000/docs

### 4. Stop the Application

```bash
docker-compose down
```

To remove all data (including database):
```bash
docker-compose down -v
```

## Manual Setup (Without Docker)

### Backend Setup

```bash
cd backend

# Install uv (fast Python package manager)
pip install uv

# Install dependencies
uv sync

# Set environment variables
export DATABASE_URL="postgresql+psycopg2://admin:password@localhost:5432/vcs_tickets"
export SIGNING_SECRET="changeme-super-secret"
export TICKET_TTL_SECONDS="86400"

# Run migrations
uv run python migrate.py

# Start the server
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Set API base URL
export VITE_API_BASE="http://localhost:8000"

# Start development server
bun run dev
```

## Usage

### 1. Purchase a Ticket

1. Navigate to http://localhost:5173
2. Click "Buy Ticket"
3. Enter your name and email
4. Click "Generate Ticket"
5. Download Share A (the QR code image displayed)

### 2. Verify a Ticket

1. Click "Verify Ticket" on the homepage
2. Allow webcam access when prompted
3. Point your webcam at Share A (printed or displayed on another screen)
4. The system automatically handles rotation (0°, 90°, 180°, 270°)
5. Click "Capture & Verify"
6. View verification results (ticket details or error message)

## Project Structure

```
secure-qr-vcs-auth/
├── backend/
│   ├── core_crypto.py          # VCS generation and rotation correction
│   ├── main.py                 # FastAPI application
│   ├── models.py               # Database models
│   ├── database.py             # Database connection
│   ├── migrate.py              # Database migrations
│   ├── pyproject.toml          # Python dependencies
│   ├── Dockerfile              # Backend Docker image
│   └── entrypoint.sh           # Container startup script
├── frontend/
│   ├── src/
│   │   ├── pages/              # React pages (Home, Buy, Verify)
│   │   ├── components/         # Reusable UI components
│   │   └── App.jsx             # Main React app
│   ├── package.json            # JavaScript dependencies
│   ├── Dockerfile              # Frontend Docker image
│   └── vite.config.js          # Vite configuration
├── Docs/                       # Research paper and documentation
├── docker-compose.yml          # Docker orchestration
└── README.md                   # This file
```

## API Endpoints

### POST `/api/buy`
Generate a new ticket and return Share A.

**Request Body:**
```json
{
  "name": "Alice",
  "email": "alice@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "ticket_code": "12345678",
  "share_a_base64": "data:image/png;base64,..."
}
```

### POST `/api/verify`
Verify a ticket by uploading Share A image.

**Request:**
- Content-Type: multipart/form-data
- Field: `file` (image file)

**Response:**
```json
{
  "success": true,
  "message": "Ticket verified successfully!",
  "ticket_data": {
    "name": "Alice",
    "email": "alice@example.com",
    "ticket_code": "12345678",
    "uuid": "7f3a9c2e-...",
    "expiration": "2025-12-26T12:00:00"
  }
}
```

### GET `/api/ticket/{ticket_code}`
Retrieve ticket metadata (for debugging).

## Configuration

Environment variables (set in `docker-compose.yml` or `.env`):

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg2://admin:password@db:5432/vcs_tickets` |
| `SIGNING_SECRET` | HMAC secret for ticket signatures | `changeme-super-secret` |
| `TICKET_TTL_SECONDS` | Ticket expiration time in seconds | `86400` (24 hours) |
| `VITE_API_BASE` | Backend API URL (frontend) | `http://localhost:8000` |

## Security Features

1. **Information-Theoretic Security**: Share A provides perfect secrecy due to random VCS patterns
2. **Screenshot Protection**: Copying Share A is useless without Share B (stored securely on server)
3. **Tamper Resistance**: HMAC-SHA256 signatures prevent payload modification
4. **Replay Prevention**: Timestamps enforce expiration; single-use flags prevent reuse
5. **Communication Security**: TLS encryption for all API calls (in production)

## Performance

- **Average Verification Time**: 350ms
  - VCS Generation: 245ms
  - ArUco Detection: 18ms
  - Cardinal Rotation: 2ms
  - XOR Stacking: 12ms
  - QR Decoding: 85ms

- **Decoding Success Rate**: 100% at all cardinal rotation angles (0°, 90°, 180°, 270°)
- **Pixel Mismatch**: 0% (perfect alignment with np.rot90)

## Limitations

1. **Cardinal Angles Only**: System limited to 0°, 90°, 180°, 270° rotations
2. **Perspective Distortion**: Assumes planar camera capture; severe angles may fail
3. **Print Quality**: Low-quality prints may introduce noise
4. **Server Dependency**: Requires online access for Share B retrieval

## Troubleshooting

### Docker Issues

**Problem**: Port already in use
```bash
# Check what's using the port
lsof -i :8000  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # Database

# Change ports in docker-compose.yml if needed
```

**Problem**: Container fails to start
```bash
# View logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Rebuild containers
docker-compose down
docker-compose up --build
```

### Camera Access Issues

**Problem**: Webcam not detected in browser
- Ensure you're using HTTPS or localhost (required for camera access)
- Check browser permissions (allow camera access)
- Try different browser (Chrome/Firefox recommended)

### Verification Failures

**Problem**: QR code not decoding
- Ensure good lighting conditions
- Hold camera steady and at appropriate distance
- Verify Share A image quality (not blurry or pixelated)
- Check that Share A was generated successfully

## Development

### Running Tests

```bash
cd backend
uv run pytest
```

### Generating Paper Figures

```bash
cd backend
uv run python generate_paper_figures_final.py
```

This generates all figures used in the research paper under `Docs/figures/`.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of academic research at Institut Teknologi Bandung (ITB).

## Citation

If you use this work in your research, please cite:

```bibtex
@inproceedings{saputra2025vcs,
  title={Secure QR Code Ticket Authentication: Implementation of Visual Cryptography Scheme with ArUco-Based Rotation Correction},
  author={Saputra, Ahmad Thoriq},
  booktitle={IF4020 Cryptography Course},
  year={2025},
  organization={Institut Teknologi Bandung}
}
```

## Author

**Ahmad Thoriq Saputra**
NIM: 13522141
School of Electrical Engineering and Informatics
Bandung Institute of Technology

- Email: 13522141@std.stei.itb.ac.id
- Email: saputrathoriq@gmail.com
- GitHub: https://github.com/thoriqsaputra

## Acknowledgments

- IF4020 Cryptography Course, ITB
- Dr. Rinaldi Munir (Course Instructor)
- Naor and Shamir for Visual Cryptography concepts
- OpenCV community for ArUco marker implementation
