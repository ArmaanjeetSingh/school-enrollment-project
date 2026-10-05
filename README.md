# 🎓 School Enrollment Management System

A full-stack, asynchronous school and student enrollment tracking platform built with **FastAPI**, **Next.js (App Router)**, **PostgreSQL / SQLAlchemy**, and **Tailwind CSS**. 

The system provides complete administration of school datasets, multi-category enrollment records, dynamic report generation workflows, role-authenticated access, and built-in internationalization (English & Punjabi/Hindi interface toggling).

---

## 📑 Table of Contents

- [🎓 School Enrollment Management System](#-school-enrollment-management-system)
  - [📑 Table of Contents](#-table-of-contents)
  - [✨ Key Features](#-key-features)
  - [🛠 System Architecture \& Stack](#-system-architecture--stack)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [📂 Directory Structure](#-directory-structure)
  - [Prerequisites](#prerequisites)
    - [Getting Started](#getting-started)
    - [1. Repository Initialization](#1-repository-initialization)
- [macOS / Linux](#macos--linux)
- [Windows (Command Prompt)](#windows-command-prompt)
- [Windows (PowerShell)](#windows-powershell)
- [backend/app/.env](#backendappenv)
- [frontend/.env.local](#frontendenvlocal)

---

## ✨ Key Features

- **Authentication & Security:** Secure user registration, password hashing (bcrypt), and stateless JWT access token verification.
- **School Catalog:** Full CRUD operations for school profiles and administrative metadata.
- **Student Enrollment Records:** Track enrollment figures filtered and partitioned by grade level, academic stream, and student demographics.
- **Asynchronous Report Statuses:** Initiate, compute, and monitor data export and analytics reporting jobs.
- **Multilingual Support:** Dynamic client-side language switching supported across standard navigation, modal dialogs, and tables.
- **Clean Architecture:** Strict separation of concerns (Routers $\rightarrow$ Services $\rightarrow$ Repositories $\rightarrow$ ORM Models).

---

## 🛠 System Architecture & Stack

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Database ORM:** [SQLAlchemy](https://www.sqlalchemy.org/) / SQLModel
- **Database Migrations:** [Alembic](https://alembic.sqlalchemy.org/)
- **Data Validation:** [Pydantic v2](https://docs.pydantic.dev/)
- **Auth & Cryptography:** Passlib (bcrypt), PyJWT

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (React 19 / App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, PostCSS
- **Package Manager:** pnpm
- **State Management:** React Context API (`AuthContext`, `LanguageContext`)

---

## 📂 Directory Structure

```text
school-enrollment-fullstack/
├── backend/
│   ├── alembic/                      # Database migration revisions & environment
│   │   ├── versions/                 # Revision step scripts
│   │   └── env.py
│   ├── app/
│   │   ├── api/                      # API routing endpoints
│   │   │   ├── enrollments.py
│   │   │   ├── reports.py
│   │   │   ├── schools.py
│   │   │   └── user.py
│   │   ├── dependencies/             # FastApi dependency injectors (Auth / JWT)
│   │   ├── models/                   # SQLAlchemy relational database entities
│   │   ├── repository/               # SQL query execution & data access layer
│   │   ├── schemas/                  # Pydantic validation & transfer schemas
│   │   ├── services/                 # Core domain and business logic
│   │   ├── config.py                 # Pydantic BaseSettings environment parsing
│   │   ├── database.py               # Engine configuration & session generators
│   │   ├── main.py                   # FastAPI instantiation & CORS setup
│   │   └── security.py               # Password hashing & JWT signature logic
│   ├── alembic.ini                   # Alembic runtime configuration
│   └── requirements.txt              # Backend Python dependencies
├── frontend/
│   ├── app/                          # Next.js App Router pages
│   │   ├── dashboard/                # Analytics and metric summary views
│   │   ├── login/                    # User authentication screen
│   │   ├── register/                 # Account onboarding screen
│   │   ├── reports/                  # Reporting overview and dynamic [id] inspectors
│   │   ├── schools/                  # School directory & [id]/enrollments breakdown
│   │   ├── globals.css               # Global Tailwind CSS definitions
│   │   └── layout.tsx                # App root layout with providers
│   ├── components/                   # UI atoms and composite components
│   │   ├── CategorySchoolTable.tsx
│   │   ├── ClassTabs.tsx
│   │   ├── EnrollmentModal.tsx
│   │   ├── EnrollmentTable.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   ├── ReportHeader.tsx
│   │   ├── SchoolHeader.tsx
│   │   └── Sidebar.tsx
│   ├── context/                      # React state contexts
│   │   ├── AuthContext.tsx           # Authentication state & token persistence
│   │   └── LanguageContext.tsx       # Active locale switching & store
│   ├── lib/                          # Translation dictionaries & shared helpers
│   ├── services/                     # Axios/Fetch API integration abstractions
│   ├── types/                        # Global TypeScript declarations
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── tsconfig.json
└── README.md


## Prerequisites

Ensure the following tools and runtimes are installed locally:

- **Python:** `3.10+` (verify via `python3 --version` or `python --version`)
- **Node.js:** `18.17+` (verify via `node -v`)
- **Package Manager:** `pnpm` (install globally via `npm install -g pnpm`)
- **Database Engine:** PostgreSQL running locally or accessible via a remote connection URI (or SQLite for lightweight local testing)
- **Git:** Version control client for repository management

---

### Getting Started

### 1. Repository Initialization

Clone the project repository and move into the workspace directory:

```bash
git clone https://github.com/armaanjeetsingh/school-enrollment-fullstack.git
cd school-enrollment-fullstack


2. Backend Setup (FastAPI)
A. Virtual Environment Setup
Open a dedicated terminal session and change to the backend/ directory:

Bash
cd backend
Create an isolated Python virtual environment:

Bash
# macOS / Linux
python3 -m venv venv
source venv/bin/activate

# Windows (Command Prompt)
python -m venv venv
venv\Scripts\activate.bat

# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1
B. Install Python Dependencies
Bash
pip install --upgrade pip
pip install -r requirements.txt
C. Configure Environment Variables
Inside backend/app/, create a new .env configuration file:

Bash
# backend/app/.env
DATABASE_URL=postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5432/<DB_NAME>
SECRET_KEY=generate_a_random_32_byte_hex_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
Security Reminder: Never commit backend/app/.env to source control. Retain a sanitized template as backend/app/.env.example.

D. Run Alembic Database Migrations
Initialize and sync your database schema to the latest version:

Bash
alembic upgrade head
E. Launch the Backend Server
Start the Uvicorn ASGI server with live reloading enabled:

Bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
API Base URL: http://localhost:8000

Interactive OpenAPI Docs (Swagger): http://localhost:8000/docs

ReDoc Explorer: http://localhost:8000/redoc

3. Frontend Setup (Next.js)
A. Install Client Packages
Open a second terminal window and navigate to the frontend/ folder:

Bash
cd frontend
pnpm install
B. Configure Frontend Environment Variables
Create a .env.local file in frontend/ to point the client to the FastAPI server:

Bash
# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
C. Run the Development Server
Bash
pnpm run dev