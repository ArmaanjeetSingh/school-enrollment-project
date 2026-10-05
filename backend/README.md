# School Enrollment API

This repository contains the backend service for a full-stack school enrollment management application. The API is built with FastAPI and provides authentication, school management, enrollment tracking, and monthly reporting functionality. The frontend application lives in the sibling `frontend/` folder and communicates with this service through REST endpoints.

## Project overview

The backend is responsible for:

- User registration and JWT-based authentication
- CRUD operations for schools
- Enrollment data entry by school, class, category, and age group
- Validation of enrollment totals
- Monthly report generation and finalization
- PostgreSQL persistence via SQLAlchemy async ORM and Alembic migrations

## Tech stack

- Python 3.11+
- FastAPI
- SQLAlchemy 2.x with async PostgreSQL support
- Alembic for database migrations
- Pydantic v2 for schema validation
- JWT auth with `python-jose`
- Passlib + bcrypt for password hashing
- Uvicorn ASGI server
- CORS configured for the local frontend (`http://localhost:3000`)

## Repository structure

```text
school_enrollment/
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── api/
│   │   ├── dependencies/
│   │   ├── models/
│   │   ├── repository/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── security.py
│   │   └── .env
│   ├── requirements.txt
│   ├── alembic.ini
│   └── README.md
├── frontend/
│   └── ... Next.js app
└── .gitignore
```

## Domain model

The core domain revolves around these entities:

- `User`: authenticated account with email and password hash
- `School`: school created by a user
- `EnrollmentData`: class-level enrollment record for a school
- `Report`: monthly snapshot of all enrollment data for a user
- `ReportData`: row-level data captured in a report

Key business rules:

- Each school belongs to a single user
- Enrollment records are unique per `school_id + class_ + category`
- The total number of boys and girls must match the sum of all age-group totals
- Reports are generated per user and month and can later be finalized

## API architecture

The service follows a layered architecture:

- `app/api`: FastAPI routers that expose REST endpoints
- `app/services`: business logic and validation
- `app/repository`: SQLAlchemy repository classes for data access
- `app/models`: ORM entities and database table mappings
- `app/schemas`: request/response models
- `app/dependencies`: auth and JWT helpers

## Configuration

The application uses environment variables for database and JWT configuration. Set the following values before running the service:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
SECRET_KEY=<strong-random-secret>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

The project currently loads settings from `app/config.py` using `pydantic-settings`, which reads a `.env` file in the runtime environment.

## Local setup

From the `backend/` directory:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Then configure your database and JWT environment variables.

## Database setup

This project uses Alembic migrations for schema management.

```bash
cd backend
alembic upgrade head
```

If the database is empty or you want to create the schema from scratch, run the migration command after pointing `DATABASE_URL` to your PostgreSQL instance.

## Running the backend

Start the API in development mode:

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Swagger UI becomes available at:

```text
http://localhost:8000/docs
```

## Authentication

The API uses JWT tokens for access control.

### Endpoints

- `POST /auth/register` - create a user account
- `POST /auth/login` - obtain access and refresh tokens
- `POST /auth/refresh` - mint a new access token from a refresh token
- `GET /auth/me` - return the currently authenticated user

The `get_current_user` dependency validates the bearer token and loads the user from the database.

## School and enrollment API

### Schools

- `POST /schools` - create a school for the authenticated user
- `GET /schools` - list all schools for the current user
- `GET /schools/{school_id}` - fetch one school
- `PUT /schools/{school_id}` - update a school
- `DELETE /schools/{school_id}` - delete a school

### Enrollment data

- `POST /school/{school_id}/enrollments` - add enrollment data to a school
- `GET /school/{school_id}/enrollments` - list enrollments for a school
- `GET /school/enrollments` - list all enrollments for the current user
- `GET /school/enrollments/{enrollment_id}` - fetch a single enrollment record
- `PUT /school/enrollments/{enrollment_id}` - update an enrollment record
- `DELETE /school/enrollments/{enrollment_id}` - delete an enrollment record

Enrollment records include:

- `class_` (class number)
- `category` (`SC`, `OBC`, `GENERAL`, `BC`)
- `boys`, `girls`
- `below_6`, `between_6_and_11`, `above_11`

The system validates that:

```text
boys + girls == below_6 + between_6_and_11 + above_11
```

## Reporting API

The reporting flow generates monthly snapshots of school enrollment data.

- `POST /reports/generate?report_month=YYYY-MM-DD` - create a report for a month
- `GET /reports` - list all reports for the current user
- `GET /reports/{report_id}` - fetch a report with its detail rows
- `PUT /reports/{report_id}/refresh` - regenerate report data from the latest enrollment data
- `POST /reports/{report_id}/finalize` - mark a report as final

Reports store a persisted copy of enrollment rows and track status via `DRAFT` or `FINAL`.

## Notes and conventions

- The backend is organized around repository/service patterns instead of a single monolithic router.
- Async database sessions are used throughout the app.
- CORS is intentionally restricted to `http://localhost:3000` for local development.
- The project currently includes migration files under `backend/alembic/versions` and is ready to support PostgreSQL-backed deployment.

## Typical development workflow

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# configure DATABASE_URL and SECRET_KEY
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend integration

This backend is designed to serve the Next.js frontend in the sibling `frontend/` folder. The frontend typically runs on port `3000`, while the API runs on `8000`.

## License

This project does not currently declare a license in the repository metadata.
