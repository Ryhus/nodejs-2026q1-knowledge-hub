# Knowledge Hub

An AI-powered article management platform that allows users to store, organize, retrieve, and discuss articles. The application leverages AI to analyze content, generate insights, perform semantic searches, and deliver context-aware results, making information discovery faster and more efficient.

## Features

### Content Managment

- Create, update, delete, and retrieve articles.
- Categorize articles for easier organization.
- Add, edit, and manage article comments.
- Browse and filter articles.

### User Managment

- User registration and authentication.
- JWT-based authorization.
- Protected routes and role-based access control.

### AI features

- RAG (Retrieval-Augmented Generation) for intelligent article retrieval.
- Semantic search across stored articles.
- Context-aware question answering based on article content.
- AI-powered content analysis, summarization, translation.

## Tech Stack

- Node.js, TypeScript, NestJS
- PostgreSQL, Prisma
- Vector DB, Qudrant, RAG
- JWT authentication
- Docker
- Jest testing
- Google Gemini API

## Installation

### Option 1: With Docker (recommended)

1. Clone repository:

   `git clone https://github.com/Ryhus/nodejs-2026q1-knowledge-hub.git`

   `cd nodejs-2026q1-knowledge-hub`

2. Create `.env` file according to `.env.example`. Detailed about environment variables [here](#environment-variables)
3. Run with docker:

   `docker-compose up --build`

Now the application is running with all [services](#docker-services)

### Option 2: Without Docker (local deployment)

1. Clone repository:

   `git clone https://github.com/Ryhus/nodejs-2026q1-knowledge-hub.git`

   `cd nodejs-2026q1-knowledge-hub`

2. Create `.env` file according to `.env.example`. **PostgressSQL** and **qdrant** origins must be **localhost**
3. You need running **ProstgreSql** and **Qdrant** services:

- PostgreSQL (localhost:5432)
- Qdrant (localhost:6333)

4. Start the app server: `npm run start:dev`

## Docker Services

Run full stack:

`docker-compose up`

Services:

- API: http://localhost:4000
- PostgreSQL: exposed on localhost:5432
- Qdrant vector DB: exposed on localhost:6333

## Environment Variables

Create a `.env` file in the root directory and configure the following variables:

### Application Server

- PORT — port where the backend server runs (default: 4000)

### Database

- DATABASE_URL — PostgreSQL connection string
- POSTGRES_USER — database username
- POSTGRES_PASSWORD — database password
- POSTGRES_DB — database name
- POSTGRES_HOST — PostgreSQL host
- POSTGRES_PORT — PostgreSQL server port

### JWT Authentication

- JWT_SECRET — secret key for access token signing
- JWT_REFRESH_SECRET — secret key for refresh token signing
- JWT_ACCESS_TTL — access token time-to-live (e.g. 15m, 1h)
- JWT_REFRESH_TTL — refresh token time-to-live (e.g. 7d)

### Logging

- LOG_LEVEL — logging level (e.g. info, debug, error)
- LOG_MAX_FILE_SIZE — maximum size of a log file before rotation

### AI Models

- GEMINI_API_KEY — Google Gemini API key
- GEMINI_API_BASE_URL — base URL for Gemini API
- GEMINI_MODEL — Gemini generation model name
- AI_RATE_LIMIT_RPM — maximum requests per minute for AI generation
- AI_CACHE_TTL_SEC — cache time-to-live for AI responses (in seconds)

### RAG and Vector DB

- GEMINI_EMBEDDING_MODEL — embedding model used for indexing and retrieval
- RAG_VECTOR_DB_PROVIDER — vector database provider (e.g. qdrant, pinecone)
- RAG_VECTOR_DB_URL — vector database connection URL
- RAG_VECTOR_COLLECTION — name of the vector DB collection
- RAG_CHUNK_SIZE — text chunk size (in characters)
- RAG_CHUNK_OVERLAP — overlap size between chunks (in characters)
- RAG_CONVERSATION_MAX_MESSAGES — maximum number of messages stored in conversation history

## Testing

Run tests:

- Run tests: `npm run test`
- Run E2E auth test: `npm run test:auth`
- Run E2E rbac test: `npm run test:rbac`
- Run E2E refresh token test: `npm run test:refresh`
- Run unit tests for services: `npm run test:unit`
- Run unit tests for services with coverage: `npm run test:coverage`

## API documentation

Interactive API documentation is available via Swagger:

http://localhost:4000/doc
