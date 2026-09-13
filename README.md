# 📚 DocuAssist AI Chatbot

A powerful full-stack AI-powered knowledge base chatbot with Retrieval-Augmented Generation (RAG), built with modern web technologies. Includes a customer support assistant, document management system, admin dashboard, and an embeddable website widget.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **🤖 AI-Powered Responses**: Real-time chat powered by Google Gemini AI with context-aware responses
- **📖 RAG System**: Advanced Retrieval-Augmented Generation for accurate knowledge-based answers
- **🔍 Full-Text Search**: Efficient document search and retrieval with PostgreSQL
- **📄 Document Management**: Ingest and manage knowledge documents
- **🎨 Embeddable Widget**: Easy-to-integrate chat widget for websites
- **📊 Admin Dashboard**: Manage documents, view analytics, and monitor conversations
- **⚡ High Performance**: Optimized chunking and embedding services
- **🔐 CORS Enabled**: Secure cross-origin requests
- **📱 Responsive UI**: Beautiful modern interface built with Next.js and Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **AI/LLM**: Google Gemini AI API
- **Server**: Uvicorn
- **Environment**: Python 3.9+

### Frontend
- **Framework**: Next.js 16+ with React 19
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Build Tool**: Webpack (via Next.js)

### Additional Services
- Vector embeddings for semantic search
- Document chunking service for optimal context retrieval
- Full-text search for keyword-based queries
- RAG pipeline for context-aware AI responses

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python**: 3.9 or higher
- **Node.js**: 18.17+ and npm/pnpm
- **PostgreSQL**: 12+ (local or remote instance)
- **Git**: For version control

### API Keys Required
- **Google Gemini API Key**: Get it from [Google AI Studio](https://aistudio.google.com/apikey)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/docuassist-ai-chatbot.git
cd docuassist-ai-chatbot
```

### 2. Setup Environment Variables

Copy the example environment files and configure them:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

See [Environment Variables](#environment-variables) section for details.

### 3. Backend Setup

#### Install Python Dependencies

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

#### Database Setup

Create PostgreSQL database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE docuassist;
```

Run migrations:

```bash
# From backend directory
python scripts/check_database.py  # Verify connection
python scripts/seed_knowledge.py  # Optional: seed initial knowledge base
```

Apply SQL migrations:

```sql
-- Connect to your database
\c docuassist;

-- Run migration files
\i migrations/001_create_rag_schema.sql;
\i migrations/002_add_full_text_search.sql;
```

### 4. Frontend Setup

```bash
cd frontend
npm install
# or
pnpm install
```

## ⚙️ Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/docuassist
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=docuassist

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash

# Application
DEBUG=false
LOG_LEVEL=INFO

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Server
HOST=0.0.0.0
PORT=8000
```

### Frontend (.env.local)

Create a `.env.local` file in the `frontend` directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Feature Flags
NEXT_PUBLIC_ENABLE_WIDGET=true
NEXT_PUBLIC_ENABLE_DASHBOARD=true
```

See `.env.example` files in each directory for comprehensive variable options.

## 📖 Running the Application

### Development Mode

#### Terminal 1: Start Backend

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs` (Swagger UI)

#### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
# or
pnpm dev
```

The frontend will be available at: `http://localhost:3000`

### Production Mode

#### Backend
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm run build
npm run start
```

## 🔧 Development & Scripts

### Backend Scripts

Located in `backend/scripts/`:

- **check_database.py**: Verify database connection
- **seed_knowledge.py**: Seed initial knowledge base
- **ingest_knowledge.py**: Ingest documents into the knowledge base
- **evaluate_retrieval.py**: Evaluate RAG retrieval quality
- **evaluate_answers.py**: Evaluate answer quality
- **test_retrieval.py**: Test retrieval functionality

### Running Backend Scripts

```bash
cd backend
source venv/bin/activate

# Check database connection
python scripts/check_database.py

# Ingest knowledge
python scripts/ingest_knowledge.py --file documents.json

# Evaluate retrieval
python scripts/evaluate_retrieval.py
```

## 🔌 API Documentation

### Health Check
```bash
GET /health
Response: { "status": "healthy", "service": "WildHive API" }
```

### Chat Endpoint
```bash
POST /api/chat
Content-Type: application/json

{
  "message": "Your question here",
  "conversation_id": "optional-uuid",
  "context_limit": 5
}

Response:
{
  "response": "AI generated answer",
  "sources": [
    {
      "document": "doc_name",
      "chunk": "relevant_chunk",
      "score": 0.95
    }
  ],
  "conversation_id": "uuid"
}
```

## 📚 Project Structure

```
docuassist-ai-chatbot/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── database.py          # Database configuration
│   │   ├── routers/
│   │   │   └── chat.py          # Chat endpoints
│   │   ├── schemas/
│   │   │   └── chat.py          # Pydantic models
│   │   └── services/
│   │       ├── chunking_service.py
│   │       ├── embedding_service.py
│   │       ├── gemini_service.py
│   │       └── retrieval_service.py
│   ├── scripts/
│   │   ├── check_database.py
│   │   ├── seed_knowledge.py
│   │   ├── ingest_knowledge.py
│   │   └── evaluate_retrieval.py
│   ├── migrations/
│   │   ├── 001_create_rag_schema.sql
│   │   └── 002_add_full_text_search.sql
│   ├── requirements.txt
│   ├── Dockerfile
│   └── apprunner.yaml
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── components/
│   │       ├── ChatWidget.tsx
│   │       ├── Header.tsx
│   │       ├── Hero.tsx
│   │       ├── Benefits.tsx
│   │       ├── Products.tsx
│   │       └── Story.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
├── README.md
└── LICENSE
```

## 🐳 Docker Deployment

### Build Backend Image
```bash
cd backend
docker build -t docuassist-backend:latest .
docker run -p 8000:8000 --env-file .env docuassist-backend:latest
```

### Docker Compose
```bash
docker-compose up -d
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
# Run evaluation tests
python scripts/evaluate_retrieval.py
python scripts/evaluate_answers.py

# Test retrieval
python scripts/test_retrieval.py
```

### Frontend Testing
```bash
cd frontend
npm run lint
```

## 🚀 Deployment

### Backend Deployment (AWS App Runner)
The backend includes `apprunner.yaml` for AWS App Runner deployment:

```bash
# Ensure .env variables are set in App Runner configuration
# Deploy using AWS CLI or Console
```

### Frontend Deployment
The frontend is optimized for Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📊 Monitoring & Logging

- **Backend Logs**: Configure `LOG_LEVEL` in `.env`
- **API Documentation**: Available at `/docs` (Swagger UI) and `/redoc` (ReDoc)
- **Health Check**: Monitor with `/health` endpoint

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists: `createdb docuassist`

#### 2. Gemini API Key Invalid
- Verify key from [Google AI Studio](https://aistudio.google.com/apikey)
- Check `GEMINI_API_KEY` in `.env`
- Ensure API is enabled in Google Cloud Console

#### 3. CORS Errors
- Add frontend URL to `ALLOWED_ORIGINS` in `.env`
- Check that frontend and backend are on correct ports

#### 4. Port Already in Use
- Backend: `lsof -ti:8000 | xargs kill -9` (Linux/Mac)
- Frontend: `lsof -ti:3000 | xargs kill -9` (Linux/Mac)

## 📞 Support

For issues, questions, or suggestions:
- Open an [Issue](https://github.com/yourusername/docuassist-ai-chatbot/issues)
- Check existing [Discussions](https://github.com/yourusername/docuassist-ai-chatbot/discussions)
- Email: support@example.com

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/)
- [Google Gemini AI](https://deepmind.google/technologies/gemini/)
- [PostgreSQL](https://www.postgresql.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Made with ❤️ by the DocuAssist Team
