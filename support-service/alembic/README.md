# Database Migrations (Alembic) - Support Service

This folder contains the database migration scripts managed by Alembic for the **NewsHub Support Microservice**.

---

## Prerequisite Setup

Before running migration commands, ensure you are in the `/support-service` directory of the repository and have the virtual environment activated with the dependencies installed.

```bash
cd support-service
# Activate your python virtual environment (example)
source .venv/bin/activate
pip install -r requirements.txt
```

### Environment Variables (.env)
Alembic is configured to read the `DATABASE_URL` dynamically from the `.env` file via our Pydantic Settings class. Make sure your `.env` contains the correct database connection string, for example:


---

## Standard Migration Workflow

### 1. View Current Database Status
To check which migrations are currently applied to your database:
```bash
alembic current
```

To see the complete migration history/timeline:
```bash
alembic history --verbose
```

### 2. Creating a New Migration (Autogenerate)
If you modify `app/models.py` (e.g., add new columns, tables, or indexes), you can automatically generate a new migration script compared against your live database database schema:

```bash
alembic revision --autogenerate -m "describe your changes here"
```
*Note: Always inspect the newly generated file inside the `alembic/versions/` directory to ensure it includes the correct and intended DDL operations before applying it.*

### 3. Applying Migrations (Upgrade)
To apply all pending migrations up to the latest revision (`head`):
```bash
alembic upgrade head
```

To upgrade to a specific revision version:
```bash
alembic upgrade <revision_id>
```

### 4. Rolling Back Migrations (Downgrade)
If something goes wrong or you need to revert changes:

Roll back the last single migration:
```bash
alembic downgrade -1
```

Roll back all migrations entirely:
```bash
alembic downgrade base
```

Or roll back to a specific target revision:
```bash
alembic downgrade <revision_id>
```

---

## Core Configuration Details

- **`support-service/alembic.ini`**: Contains the general configuration. To secure the app, the connection URL is read dynamically from the code wrapper instead of being hardcoded in plain text.
- **`support-service/alembic/env.py`**: Boots the SQLAlchemy engine using your configured environment-based connection URL and hooks up our declarative metadata class (`Base.metadata`) so that autogenerate accurately detects schema modifications in `app/models.py`.
