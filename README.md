# Raaya Global Solutions

Professional agricultural export website, informational + lead generation.

**Stack:** Node.js · TypeScript · Express · React · Vite · Tailwind CSS

---

## Project Structure

```
raaya-global/
├── server/   Express + TypeScript API
└── client/   React + Vite + Tailwind frontend
```

---

## Getting Started

### 1. Environment Variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

| Variable          | Required | Description                         |
|-------------------|----------|-------------------------------------|
| `PORT`            | No       | Server port (default: 5000)         |
| `CLIENT_ORIGIN`   | No       | Frontend URL for CORS               |
| `GMAIL_USER`      | No       | Gmail address for email alerts      |
| `GMAIL_PASS`      | No       | Gmail App Password                  |
| `RECIPIENT_EMAIL` | Yes      | Where enquiry emails are delivered  |

> If `GMAIL_USER` / `GMAIL_PASS` are not set, enquiries are stored in memory only (no email sent). `RECIPIENT_EMAIL` is the only required variable.

### 2. Install Dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Run in Development

Open two terminals:

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### 4. Production Build

```bash
cd server && npm run build    # outputs to server/dist
cd client && npm run build    # outputs to client/dist
```

---

## API

### `POST /api/enquiry`

Submit a product enquiry.

**Request body:**

```json
{
  "name": "John Smith",
  "phone": "+1 555 000 0000",
  "email": "john@example.com",
  "productInterest": "fruits",
  "message": "Interested in 10 MT of Alphonso Mango for UAE."
}
```

**`productInterest` values:** `fruits` | `vegetables` | `grains` | `spices` | `general`

**Responses:**

- `201` — `{ "success": true, "id": "<uuid>" }`
- `422` — `{ "success": false, "errors": [{ "field": "email", "message": "..." }] }`

---

## Pages

| Route       | Description                          |
|-------------|--------------------------------------|
| `/`         | Home — Hero, stats, product showcase |
| `/about`    | Company story, mission, pillars      |
| `/products` | Filterable product grid (31 items)   |
| `/enquiry`  | Lead generation form                 |
| `/contact`  | Contact details + social links       |
