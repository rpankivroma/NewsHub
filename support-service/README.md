# NewsHub Support Microservice

The **NewsHub Support Microservice** is a high-performance, real-time message and communication gateway for users and guest visitors. It manages real-time help requests via WebSocket channels, handles asynchronous notification flows via Apache Kafka, sends outbound notifications/alerts through the Brevo SMTP API, and provides a rich set of administrative dashboards and statistics.

---

## 🛠️ Tech Stack & Key Technologies

- **Core Engine**: FastAPI (Uvicorn / Python 3)
- **Database Layer**: SQLAlchemy, SQLite (Development & Testing), PostgreSQL compatible
- **Real-Time Communication**: Native WebSockets with multi-client room connection tracking
- **Event Bus / Message Queue**: Apache Kafka (AIOKafka wrapper)
- **Notification Routing**: Brevo v3 Transactional Email APIs & SMTP integration
- **Validation**: Pydantic v2 (Strict Data Transfer Objects & Schemas)
- **Security**: PyJWT authorization + role verification checks

---

## 🚀 Key Functional Features

### 1. Unified Senders Support Chat
Supports both:
- **Authenticated Registered Users**: Securely identified and verified through NewsHub Core Auth JWT signatures (checking for account status and preventing banned or blocked users from utilizing live-support).
- **Guest Visitors**: An elegant, immediate submission form validated with unique email parameters and status tracking.

### 2. Multi-socket Live Communication
Built upon a robust `ConnectionManager` with support for:
- Simultaneously connected browser tabs / multi-client room sync.
- Real-time broadcasts for admin agents watching the support panel.
- On-the-fly unread/read state synchronization.

### 3. Asynchronous Integration Pipelines
Decoupled event emission via Kafka:
- `support.chat.created` - Triggers customer onboarding/routing actions.
- `support.chat.status_changed` - Alerts agents when chats are finalized, soft-deleted, or reactivated.
- `support.message.sent` - Feeds downstream indexing, moderation, or NLP analytics pipelines.

### 4. Smart Offline Notifications
- When a user/guest visitor receives a support message from an agent but is **offline** (WebSocket not connected), the system identifies their status.
- Triggers a smart, elegant daily notification email via **Brevo API** once duplicate thresholds have been safely filtered.

### 5. Administrative Controls & Panels
- **Support Search Engine**: Case-insensitive filters matching partial names or emails, with full support for registered VS guest flags, online status, and cursor pagination.
- **Support Statistics**: Evaluates live operational telemetry such as active rooms, daily room creation counters, visitor unread message counts, and precise average agent response speeds.

---

## 📁 System Architecture Directory Tree

```text
support-service/
├── app/
│   ├── config.py           # Pydantic Settings management (env loader)
│   ├── database.py         # SQLAlchemy Engine & session pool initializers
│   ├── dependencies.py     # FastAPI Security dependency injectors
│   ├── models.py           # Core DB Table Mapping: SupportChat, SupportMessage, User...
│   ├── schemas.py          # Strict Pydantic validators & DTO serializers
│   ├── controllers.py      # Core transactional and business service operations
│   ├── kafka/              # Kafka producer pipeline & decoupled consumer loops
│   ├── routers/            # Support, Chat, Messages, Admin operations
│   ├── services/           # Brevo integrations and background cron operators
│   └── websocket/          # WebSocket connection tracker & multiplexer
├── tests/
│   ├── conftest.py         # Isolated in-memory SQLite isolation, Mocks, setup fixtures
│   ├── factories/          # Record generators for User, SupportChat, and Messages
│   ├── unit/               # Testing suite covering Services, DB repos, Kafka, WS, Auth
│   └── integration/        # End-to-end API client lifecycles
└── requirements.txt        # Package definitions & project dependencies
```

---

## 🔧 Installation & Running Locally

### 1. Set Up Your Environment
Ensure you have Python 3.10+ installed. Create your virtual environment and activate it:

```bash
# Create environment
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on MacOS/Linux
source venv/bin/activate
```

### 2. Install Project Dependencies
Use the requirements file to install all core dependencies, database connectors, and testing frameworks:

```bash
pip install -r requirements.txt
```

### 3. Manage Environment Variables
Create a local `.env` file containing:
```env
JWT_SECRET=test-secret-key-123456
BREVO_API_KEY=your-brevo-api-key
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

### 4. Run the API Gateway Server
Boot up the development environment:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
```

---

## 🧪 Running the Test Suite

The microservice includes a fully isolated unit and integration testing suite configured with `pytest` and `pytest-asyncio`. DB operations utilize in-memory SQLite, while out-of-bounds Kafka/Brevo adapters are automatically mocked out.

Run the test suite using standard execution tools:

```bash
# Execute the full suite
pytest -v

# Run with test coverage reports
pytest --cov=app tests/
```
python3 -m pip install kafka-python