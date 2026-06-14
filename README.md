# ReflexOS

ReflexOS is a modern, AI-powered project management and team collaboration system. It features real-time task boards, team chat, an AI-driven sprint planner, and intelligent meeting transcription analysis. 

The entire stack is containerized using Docker and is orchestrated via Docker Compose.

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Vite, Nginx
- **Backend:** Java 17, Spring Boot 3, LangChain4j
- **Infrastructure:** PostgreSQL, Redis, Apache Kafka, Zookeeper, Qdrant (Vector DB), Ollama (Local LLM)

---

## 🚀 How to Run the Application

### 1. Prerequisites
You must have the following installed on your machine:
- **Docker** and **Docker Compose** (Usually included with [Docker Desktop](https://www.docker.com/products/docker-desktop/))

### 2. Start the Services
Open a terminal in this `ReflexOS-Final` folder (where the `docker-compose.yml` file is located) and run the following command to build and start all containers in the background:

```bash
docker-compose up -d --build
```

*Note: The first time you run this, it may take a few minutes as Docker downloads the necessary images (PostgreSQL, Redis, Kafka, Ollama, etc.) and compiles the backend and frontend.*

### 3. Access the Application
Once the containers are successfully running, open your web browser and go to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🤖 Configuring the AI Models (Required for AI Features)
ReflexOS uses [Ollama](https://ollama.com/) running locally inside Docker to power its AI Sprint Planner and Knowledge Base. Because the Ollama container starts empty, you must download the models into the container.

With the containers running, open your terminal and execute these two commands:

1. **Pull the LLM model (llama3):**
   ```bash
   docker exec -it reflexos-final-ollama-1 ollama pull llama3
   ```
   *(Note: Depending on your docker-compose version, the container name might be slightly different. You can run `docker ps` to find the exact name of the Ollama container if the above command fails).*

2. **Pull the Embedding model (nomic-embed-text):**
   ```bash
   docker exec -it reflexos-final-ollama-1 ollama pull nomic-embed-text
   ```

Once the models finish downloading, the AI capabilities in the app will instantly come to life!

---

## 🛑 Stopping the Application
To stop all running containers, open a terminal in this folder and run:
```bash
docker-compose down
```
If you want to stop the containers AND wipe all local data (including database and cached models), run:
```bash
docker-compose down -v
```

Enjoy using ReflexOS! 🎉
