# NewsHub

A production-ready digital news platform built with Fastly (Backend) and React/Vite (Frontend).

## Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── api/            # API Route handlers
│   │   │   ├── articles.py
│   │   │   ├── auth.py
│   │   │   ├── categories.py
│   │   │   └── users.py
│   │   ├── core/           # Security and config
│   │   │   └── security.py
│   │   ├── db/             # Database connection
│   │   │   └── database.py
│   │   ├── models/         # SQLAlchemy models
│   │   │   └── article.py
│   │   ├── repositories/   # Data access layer (ready for logic)
│   │   ├── schemas/        # Pydantic schemas
│   │   │   └── article.py
│   │   ├── services/       # Business logic (ready for logic)
│   │   └── main.py         # App entry point
│   ├── migrations/         # Alembic database migrations
│   ├── static/             # Static assets
│   ├── tests/              # Backend tests
│   └── alembic.ini         # Alembic configuration
├── frontend/
│   └── src/
│       ├── components/     # UI Components (Navbar, Cards, Modals)
│       ├── lib/            # Utilities (shadcn-like tailwind helper)
│       ├── pages/          # Page views (Home, Profile, Admin, etc.)
│       ├── App.tsx         # Main component & Routing
│       ├── constants.ts    # Mock data & global constants
│       ├── index.css       # Global styles (Tailwind)
│       ├── main.tsx        # React entry point
│       └── types.ts        # TypeScript interfaces
├── .env.example            # Environment variables template
├── package.json            # Frontend dependencies
├── requirements.txt        # Backend dependencies
└── tsconfig.json           # TypeScript configuration
```

## API Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/token` | User login & JWT issuance | No |
| GET | `/articles/` | Retrieve articles list | No |
| GET | `/articles/{id}`| Get specific article detail | No |
| POST | `/articles/` | Create new article | Yes |
| GET | `/categories/` | List all news categories | No |
| GET | `/users/me` | Get current user profile | Yes |
| GET | `/health` | API health check | No |

## Getting Started (VS Code)

### Backend
1. **Initialize Environment**:
   - Create a virtual environment: `python -m venv venv`
   - Activate it: `source venv/bin/activate` (Mac/Linux) or `.\venv\Scripts\activate` (Windows)
   - Install dependencies: `pip install -r requirements.txt`
2. **Configuration**:
   - Copy `.env.example` to `.env` and fill in your XAMPP MySQL credentials.
3. **Run via VS Code**:
   - Open the "Run and Debug" side bar (Ctrl+Shift+D).
   - Select "Python: FastAPI" (or create a launch configuration for `backend/app/main.py`).
   - Click the Play button.

### Frontend
1. **Install Dependencies**:
   - `npm install`
2. **Run Dev Server**:
   - Run `npm run dev` in the terminal.
   - Or use the "NPM Scripts" explorer in VS Code to run the `dev` script.

## Note on package-lock.json
`package-lock.json` is a machine-generated file and should not be modified or split manually. For a high-level view of dependencies, please refer to `package.json` and `requirements.txt`.
