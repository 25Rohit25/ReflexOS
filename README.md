# ReflexOS

ReflexOS is a modern, AI-powered project management and collaboration platform designed for seamless teamwork. It integrates traditional agile project management tools with cutting-edge artificial intelligence, providing intelligent task generation, meeting summaries, and an embedded knowledge base. 

## 🚀 The Problem It Solves

Modern teams rely on multiple fragmented tools to track tasks, communicate, and maintain a knowledge base, leading to scattered information and lost productivity. ReflexOS bridges this gap by offering a unified ecosystem where AI natively assists with:
- Automatically generating Sprint Plans based on project requirements.
- Semantically searching through project documents and knowledge.
- Real-time team collaboration and messaging.

By running the AI models locally (via Ollama), ReflexOS ensures complete **data privacy**—your proprietary project data and documents never leave your secure infrastructure.

## 💻 Tech Stack

ReflexOS is built using a robust, highly scalable, full-stack microservices-inspired architecture:

### Frontend
- **React 18** with **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **Zustand** (State Management)
- **React Router** (Navigation)

### Backend
- **Java 17** & **Spring Boot 3**
- **Spring Security** & JWT Authentication
- **Spring Data JPA** & Hibernate
- **LangChain4j** (LLM Orchestration framework)
- **Apache Kafka** (Event-driven messaging and task events)

### Infrastructure & Databases
- **PostgreSQL**: Primary relational database for users, projects, and tasks.
- **Redis**: Caching layer for performance optimization.
- **Qdrant**: Vector Database for fast, semantic search of AI embeddings.
- **Ollama**: Local AI Model Runner (Running `llama3` for chat/generation and `nomic-embed-text` for vector embeddings).
- **Docker & Docker Compose**: Containerization and local orchestration.

## 📐 Architecture & Flow Diagram

The following architecture diagram illustrates how the components of ReflexOS interact with each other:

```mermaid
flowchart TB
    %% Users and Frontend
    User([User / Browser])
    Frontend[React Frontend\n(Vite, Tailwind, Zustand)]

    %% Backend Service
    Backend[Spring Boot Backend API\n(Java 17, Spring Security)]

    %% Databases and Queues
    PostgreSQL[(PostgreSQL\nRelational Data)]
    Redis[(Redis\nCaching)]
    Kafka[[Apache Kafka\nEvent Streaming]]
    Qdrant[(Qdrant\nVector Database)]

    %% AI Services
    Ollama((Ollama\nLocal LLM Runner))
    Llama3[Llama 3 Model]
    Nomic[Nomic Embed Text]

    %% Connections
    User -- "HTTP/REST & WebSockets" --> Frontend
    Frontend -- "API Requests (JWT Auth)" --> Backend

    Backend -- "CRUD Operations" --> PostgreSQL
    Backend -- "Cache Read/Write" --> Redis
    Backend -- "Publish/Consume Task Events" --> Kafka

    %% AI Connections
    Backend -- "Store/Search Embeddings" --> Qdrant
    Backend -- "Generate Chat/Tasks" --> Ollama
    Backend -- "Generate Embeddings" --> Ollama

    Ollama --- Llama3
    Ollama --- Nomic

    classDef db fill:#f9f0ff,stroke:#d3b8e5,stroke-width:2px,color:#000
    classDef backend fill:#e1f5fe,stroke:#81d4fa,stroke-width:2px,color:#000
    classDef frontend fill:#fff3e0,stroke:#ffcc80,stroke-width:2px,color:#000
    classDef ai fill:#e8f5e9,stroke:#a5d6a7,stroke-width:2px,color:#000

    class PostgreSQL,Redis,Kafka,Qdrant db
    class Backend backend
    class Frontend frontend
    class Ollama,Llama3,Nomic ai
```

### Flow Highlights:
1. **User Interaction**: The user accesses the React frontend, which talks securely via REST APIs using JWT authentication to the Spring Boot backend.
2. **Standard Data**: Standard entities (Projects, Users, Tasks, Sprints) are persisted in PostgreSQL, while frequently accessed data (like sessions or repeated queries) is cached in Redis.
3. **Event Streaming**: Asynchronous events, such as task status updates or notifications, are pushed to an Apache Kafka topic and consumed by listener services.
4. **AI & RAG (Retrieval-Augmented Generation)**: 
   - When a document is uploaded, it is embedded using the `nomic-embed-text` model via Ollama, and the vector coordinates are stored in **Qdrant**.
   - When a user asks a question, the backend queries Qdrant for semantic similarity, retrieves the relevant context, and sends a prompt to the `llama3` model via Ollama to generate an intelligent response.

## 🛠️ Local Development Setup

Ensure you have **Docker Desktop**, **Java 17**, and **Node.js** installed.

1. **Start all backing services**:
   ```bash
   docker-compose up -d postgres redis zookeeper kafka qdrant ollama
   ```
2. **Pull the AI Models inside Ollama**:
   ```bash
   docker exec -it reflexos-final-ollama-1 ollama pull llama3
   docker exec -it reflexos-final-ollama-1 ollama pull nomic-embed-text
   ```
3. **Run the Backend**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   *Alternatively, run the entire stack via Docker Compose:* `docker-compose up -d`
4. **Run the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
