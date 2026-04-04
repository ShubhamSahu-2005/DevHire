# DevHire 🚀 API Setup Guide
**DevHire** is a modern, production-grade Job Board Application API. This project connects Companies with Developers using an intelligent event-driven microservices architecture bundled with AI-powered resume screening, intelligent Match Scoring, and WebSocket notifications.

## 🛠️ Core Tech Stack 
* **Runtime**: Node.js & Express.js
* **Database**: PostgreSQL (Neon Database Serverless)
* **ORM**: Drizzle ORM
* **Event Broker**: Apache Kafka (KafkaJS)
* **Caching**: Redis
* **AI Provider**: Groq API (Meta Llama models)
* **Infrastructure**: Docker & Docker Compose
* **Auth**: JSON Web Tokens (JWT) & bcryptjs

---

## 🚀 Running the Project

### 1. Prerequisites 
- **Docker & Docker Compose** installed.
- Setup your `.env` file referencing `.env.example` (add your `GROQ_API_KEY`, `DATABASE_URL`, and `EMAIL` credentials).

### 2. Startup
The easiest way to start this stack is using Docker:
```bash
docker-compose up --build -d
```
*This robustly spins up: The Node App, ZooKeeper, Kafka Broker, and Redis Cache.*

Wait ~10 seconds for Kafka to initialize and elect the controller. Development server runs on `http://localhost:3000`.

---

## 📚 API Endpoints Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register`: Create a new user account (Requires body `name, email, password, role ('DEVELOPER' | 'COMPANY')`).
* `POST /api/auth/login`: Issue an access and refresh token.
* `POST /api/auth/refresh`: Refresh JWT token.
* `POST /api/auth/logout`: Log out and blacklist the token.

### Developer Profile (`/api/profile`)
*(Requires Developer Token)*
* `GET /api/profile`: Get your own profile metadata.
* `PUT /api/profile`: Update details like `bio` and `skills`.

### Jobs (`/api/jobs`)
* `GET /api/jobs`: Get all open jobs.
* `POST /api/jobs`: Post a new job *(Requires Company token)*.
* `GET /api/jobs/:id`: Fetch specific job details.
* `PUT /api/jobs/:id`: Update an existing job.

### Job Applications (`/api`)
* `POST /api/jobs/:id/apply`: Apply to a job posting *(Requires Developer Token)*. Emits a **Kafka Event** and instantly returns an AI **Match Score** comparing the Developer's skillset with the Job Post.
* `GET /api/my-applications`: Fetches all your applications.
* `GET /api/jobs/:id/applications`: View candidates attached to a Job *(Requires Company Token)*.
* `PUT /api/applications/:id/status`: Transition application state ('PENDING' -> 'ACCEPTED' | 'REJECTED') emitting an email via Kafka.

### AI Capabilities (`/api/ai`)
*(Requires Company Token)*
* `POST /api/ai/generate-jd`: Autogenerates a Job Description from a set of structured tags. Body: `{ title, skills, location, salary }`.
* `POST /api/ai/interview-questions`: Suggests categorized (conceptual, technical, behavioral) interview questions. Body `{ title, skills }`.
* `POST /api/ai/screen-resume`: Intelligent resume parser. Pass a `.pdf` file in a `multipart/form-data` request with key `resume` and string `jobDescription`. Extracts years of experience, missing skills, match score, and hiring recommendation.

---

## ✨ System Architecture Features
* **Kafka Event Driven Notifications:** Real-time email dispatch completely decoupled from HTTP API latency context.
* **WebSocket Heartbeats:** Realtime notifications delivered to connected browsers.
* **Zero-Downtime Container DNS:** Hardened glibc Linux docker builds providing smooth DNS resolutions between NodeJS, Zookeeper, and Kafka in internal bridge networks.
