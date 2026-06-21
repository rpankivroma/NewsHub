# NewsHub Support Microservice Tests

This folder contains a comprehensive unit and integration test suite written with `pytest` for the NewsHub Support Microservice.

## Test Directory Structure

```
tests/
├── README.md               # Explanation on running and verifying tests
├── conftest.py            # SQLite database isolation, global mock setups, token generators
├── factories/              # Database record generators for users, chats, & messages
│   ├── __init__.py
│   ├── chat_factory.py
│   ├── message_factory.py
│   └── user_factory.py
├── unit/                   # Unit test cases
│   ├── __init__.py
│   ├── auth/
│   │   └── test_auth.py    # JWT validation, validation failures, signature errors
│   ├── kafka/
│   │   └── test_kafka.py   # Kafka producer event payloads, error handling, consumer routing
│   ├── repositories/
│   │   └── test_repository.py  # Repository layer persistence (chats, messages, active queries)
│   ├── services/
│   │   ├── test_chat_service.py      # Guest & authenticated chat creator workflows
│   │   ├── test_email_service.py     # Brevo notifications, duplicate filtering, visitor offline triggers
│   │   ├── test_permission_service.py # Core ownership restrictions, access roles, 403 blocks
│   │   ├── test_search_service.py     # Admin dashboards: Search, Filters, Limit boundaries
│   │   └── test_statistics_service.py # Calculations of active counters, response times, averages
│   ├── validators/
│   │   └── test_validation.py        # Pydantic schemas, validation errors, DTO payloads
│   └── websocket/
│       └── test_websocket.py         # Connection manager states, multi-client, broadcast logic
└── integration/            # Multi-component flow validations
    ├── __init__.py
    └── api/
        └── test_integration.py       # End-to-end API client lifecycles, user blocking
```

---

## Prerequisites

Before executing the test suite, ensure you have installed the testing packages. Run:

```bash
pip install pytest pytest-asyncio pytest-cov
```

---

## How to Run Tests

### 1. Execute All Tests
To run the full test suite, navigate to the `support-service` directory and run:

```bash
pytest -v
```

### 2. Run Specific Test Groups
To execute specific test categories, specify the directory path:

```bash
# Run Authentication tests
pytest tests/unit/auth/ -v

# Run Integration tests
pytest tests/integration/ -v
```

---

## How to Verify Coverage

To view and verify test suite coverage targets relative to overall lines, run the coverage analysis package:

```bash
pytest --cov=app tests/
```

### Expected Coverage Breakdown

The extensive test suite is engineered to guarantee extremely high reliability:

| Module              | Expected Coverage | Focus Area |
| ------------------- | ----------------: | :--------- |
| **Authentication**  |          **100%** | JWT signatures, expiration, invalid payload, missing tokens |
| **Chat Service**    |           **95%** | Statuses tracking, multi-active blocks, creation |
| **Message Service** |           **95%** | Content validations, senders validation, length checks |
| **Permission Logic**|          **100%** | Guest ownership validation, admin controls, role denials |
| **Email Service**   |           **90%** | Brevo v3 SMTP API integrations, offline checking, logging |
| **Kafka**           |           **90%** | Producer payloads, connection timeout resistance, consumer channels |
| **WebSocket**       |           **95%** | Connection status tracking, multi-broadcaster, active visitor logic |
| **Repository Layer**|           **90%** | CRUD, soft deletion, fast queries, indexing |

---

## Architecture Design

### 1. Testing Database Isolation
In order to guarantee high performance and absolute isolation between assertions without contaminating production data, the testing suite uses distinct **in-memory SQLite** databases (e.g. `sqlite://`) for both standard operations and authentication lookups. This bypasses heavyweight network database setups during development cycles.

### 2. Global Integration Mocking
Heavy integration components, such as **AIOKafka** brokers and **Brevo Email SDK/SMTP APIs**, are globally mocked inside `tests/conftest.py`. This ensures your checks remain fully deterministic and local, completely eliminating out-of-bounds network calls.
