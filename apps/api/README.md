# aideas API

> Backend REST API for aideas platform

## Tech Stack

- Python 3.12
- FastAPI
- SQLAlchemy 2.x
- PostgreSQL 16
- Redis

## Getting Started

### Prerequisites

- Python 3.12+
- Docker (for PostgreSQL and Redis)

### Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Unix/macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements/dev.txt

# Copy environment file
cp .env.example .env

# Start database (via Docker)
docker-compose up -d db redis

# Run migrations
alembic upgrade head

# Seed database (optional)
python scripts/seed_db.py

# Start development server
uvicorn src.main:app --reload --port 8000
```

### Development Commands

```bash
# Run server
uvicorn src.main:app --reload

# Run tests
pytest

# Run tests with coverage
pytest --cov=src

# Lint
ruff check src/

# Format
black src/

# Type check
mypy src/
```

## Project Structure

```
apps/api/
├── src/
│   ├── main.py              # FastAPI app
│   ├── config/              # Configuration
│   ├── modules/             # Feature modules
│   ├── core/                # Shared core
│   └── database/            # Database setup
├── tests/                   # Tests
├── scripts/                 # Utility scripts
└── requirements/            # Dependencies
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json
