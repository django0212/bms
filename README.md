# BookMyCampus — AI-Powered University Facility Management

A full-stack, multi-tenant facility booking platform built for university campuses. Features role-based access for administrators and students, a context-aware AI assistant, real-time database mutations.

---

## Demo

https://github.com/user-attachments/assets/589358112-674ab177-a090-44e8-9947-4575d2df48d0

> The demo shows a full end-to-end flow: student login → AI contextual awareness → admin facility creation with custom amenities → real-time AI knowledge update → transport routing query.

---

## Features

### For Students
- Browse and search facilities across their university campus
- Book facilities with time-slot selection and instant confirmation
- Join waitlists when facilities are at capacity
- Ask the AI assistant questions about facilities, hours, and transport — it knows your campus

### For Administrators
- Multi-tenant dashboard supporting multiple universities
- Create and manage facilities with a flexible amenity builder (boolean, numeric, text fields)
- Manage student/admin accounts and role assignments
- Define transport routes with multi-stop sequences (automatically fed into AI context)
- Full booking oversight and event management

### AI Chatbot
- Powered by **Llama 3.3 70B** via Groq for ultra-low latency responses
- Dynamically injected system context: user identity, role, university, all facilities, amenities, and transport stops
- Real-time — adding a new facility immediately makes the AI aware of it
- Responds in formatted Markdown with typing animations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | Custom session-based auth with bcrypt |
| AI | Groq API — `llama-3.3-70b-versatile` via Vercel AI SDK |
| UI | shadcn/ui + Tailwind CSS + Lucide Icons |
| Testing/Demo | Playwright (headless automation + video recording) |

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL running locally
- A [Groq API key](https://console.groq.com)

### Installation

```bash
git clone https://github.com/django0212/bms.git
cd bms
npm install --legacy-peer-deps
```

### Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bookmycampus"
SESSION_SECRET="your-secret-key"
GROK_KEY="your-groq-api-key"
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"
RECAPTCHA_SECRET_KEY="your-recaptcha-secret"
```

### Database Setup

```bash
npx prisma migrate dev
npx prisma db seed
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Seeded Accounts

After running `db seed`, the following accounts are available:

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@bmc.com` | `password123` |
| MIT Admin | `admin@mit.edu` | `password123` |
| MIT Student | `amiller@mit.edu` | `password123` |
| Stanford Admin | `admin@stanford.edu` | `password123` |

---

## Project Structure

```
src/
├── app/
│   ├── api/chat/         # AI streaming endpoint (Groq)
│   ├── dashboard/        # Protected admin/student routes
│   └── login/            # Auth pages
├── components/
│   ├── chat-bot.tsx      # Floating AI assistant
│   └── sidebar.tsx       # Role-aware navigation
├── lib/
│   ├── auth.ts           # Session management
│   └── db.ts             # Prisma client
prisma/
├── schema.prisma         # DB schema
└── seed.ts               # Realistic multi-university seed data
scripts/
└── record-demo.ts        # Playwright demo automation script
```

---

## License

MIT
