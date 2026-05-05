# NewsHub: Independent Journalism Platform

![NewsHub](https://img.shields.io/badge/Status-Production--Ready-brightgreen)
![React](https://img.shields.io/badge/Frontend-React%2018-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-05998b)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS-38b2ac)

NewsHub is a comprehensive, production-grade digital news platform designed for modern independent journalism. It empowers investigative journalists and community contributors while providing a seamless, engaging experience for readers.

---

## ✨ Key Features

### 📰 Editorial Experience
- **Discovery Engine**: Intelligent categorization and powerful search for localized and global news.
- **Dynamic Content**: Rich article rendering with support for multimedia and deep-dive investigative pieces.
- **Real-time Updates**: Live news feed updates for breaking stories.

### 👥 User Engagement
- **Secure Authentication**: Robust JWT-based authentication system for readers and contributors.
- **Contributor Portal**: Dedicated interface for community members to submit investigative leads and articles.
- **Personalized Profiles**: User dashboard to manage saved articles, contribution history, and preferences.

### 💰 Sustainability & Support
- **Multi-channel Donations**: Integrated support for Credit/Debit Cards, Patreon, PayPal, and Cryptocurrency.
- **Transparency Dashboard**: Real-time fundraising progress tracking towards community-driven goals.
- **Campaign Management**: Backend tools to manage fundraising goals and transparency reports.

### 🛠 Administrative Control
- **Content Management**: Full CRUD capabilities for articles, categories, and submissions.
- **Submission Review**: Streamlined workflow for editors to verify and publish community contributions.
- **Site Settings**: Centralized management for the platform's vision, donation settings, and "About" content.

---

## 🚀 Technical Architecture

NewsHub follows a modern full-stack architecture designed for scalability and maintainability.

### Frontend
- **Framework**: [React 18](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first, responsive design.
- **Icons**: [Lucide React](https://lucide.dev/) for consistent, beautiful iconography.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid UI transitions.

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [SQLAlchemy](https://www.sqlalchemy.org/) ORM with SQLite (standard) or MySQL (XAMPP).
- **Validation**: [Pydantic](https://docs.pydantic.dev/) for strict data typing and serialization.
- **Authentication**: JWT (JSON Web Tokens) with Secure Hashing.

---

## 📂 Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/            # API Route handlers (Auth, Articles, Donations, etc.)
│   │   ├── core/           # Security, Auth logic, and Configuration
│   │   ├── db/             # Database connection and session management
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── repositories/   # Data access layer for business logic abstraction
│   │   ├── schemas/        # Pydantic schemas for request/response validation
│   │   ├── services/       # Core business logic processing
│   │   └── main.py         # FastAPI application entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components (Shared, Layout, Modals)
│   │   ├── lib/            # Utility functions and library wrappers
│   │   ├── pages/          # Full page views and route components
│   │   ├── services/       # Frontend API clients (Axios/Fetch)
│   │   ├── types.ts        # Global TypeScript interfaces
│   │   └── App.tsx         # Root component and router configuration
├── requirements.txt        # Python backend dependencies
├── package.json            # Frontend Node.js dependencies
└── metadata.json           # Application metadata and permissions
```

---

## 🚥 API Overview

| Method | Endpoint | Description |
|:---:|---|---|
| `POST` | `/api/auth/login` | Authenticate user and return JWT |
| `POST` | `/api/auth/register` | Create a new user account |
| `GET` | `/api/articles/` | List all published articles |
| `GET` | `/api/articles/{id}` | Get detailed content for a specific story |
| `POST` | `/api/submissions/` | Submit a news story for editorial review |
| `GET` | `/api/donations/settings`| Fetch current fundraising goal & settings |
| `POST` | `/api/donations/` | Process a new donation contribution |

---

## 🛠 Setup & Installation

### Backend Prerequisites
1. Navigate to `/backend`.
2. Create a virtual environment: `python -m venv venv`.
3. Activate the environment and install dependencies: `pip install -r requirements.txt`.
4. Run the API: `uvicorn app.main:app --reload`.

### Frontend Prerequisites
1. Navigate to the root directory.
2. Install dependencies: `npm install`.
3. Start the development server: `npm run dev`.

---

## 🏛 Mission
NewsHub is built with the belief that information should be independent, accessible, and community-powered. By combining professional journalism with community insight, we aim to uncover truths that matter.
