# 🤖 CodeForge AI — Collaborative Coding Environment

> A real-time AI-powered collaborative coding platform where developers can chat, write code, collaborate on projects, and run supported code directly in the browser.

CodeForge AI combines **AI-assisted development, real-time collaboration, project management, authentication, and browser-based code execution** into one development environment.

---

## 🚀 Features

### 🤖 AI-Powered Development

- **AI-Powered Chat** — Tag `@ai` in chat to request code, files, and project structures using Google Gemini
- **AI Project Generation** — Generate project structures and source files from natural-language prompts
- **AI Development Assistance** — Get coding assistance directly inside the project environment

### 👥 Real-Time Collaboration

- Multiple users can work on the same project
- Real-time communication using Socket.IO
- Project-based collaboration
- Invite users to projects
- Manage project members

### 💻 In-Browser Code Execution

- Run supported Node.js projects directly in the browser
- WebContainer-powered execution environment
- Install project dependencies
- View terminal output
- Start and stop projects from the coding environment

### 📝 Live File Editor

- File tree navigation
- Create and edit project files
- Syntax-highlighted code editing
- Automatic file-tree saving
- Project file management

### 💬 Persistent Chat

- Project-based chat
- Chat messages stored in MongoDB
- Collaborators can access project conversation history
- AI interaction through `@ai`

### 📁 Project Management

- Create projects
- View projects
- Manage project files
- Invite collaborators
- Add project members
- Project access control
- Demo project for public showcasing

### 🔐 Authentication

- User registration
- Email OTP verification
- JWT authentication
- Google OAuth
- Password hashing with bcrypt
- Password reset
- Logout token invalidation using Redis

### 🎮 Demo Mode

- Public demo login
- No registration required
- Restricted demo permissions
- Demo project for recruiters and visitors

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────────┐
                         │          USER            │
                         │     Web Browser          │
                         └────────────┬─────────────┘
                                      │
                                      │ HTTP / WebSocket
                                      ▼
                    ┌──────────────────────────────────┐
                    │            FRONTEND              │
                    │                                  │
                    │        React + Vite              │
                    │                                  │
                    │  ┌──────────┐  ┌─────────────┐  │
                    │  │   Chat   │  │ File Editor │  │
                    │  └──────────┘  └─────────────┘  │
                    │                                  │
                    │  ┌──────────┐  ┌─────────────┐  │
                    │  │ Projects │  │ WebContainer │  │
                    │  └──────────┘  └─────────────┘  │
                    └───────────────┬──────────────────┘
                                    │
                         REST API / Socket.IO
                                    │
                                    ▼
                    ┌──────────────────────────────────┐
                    │             BACKEND              │
                    │                                  │
                    │        Node.js + Express         │
                    │                                  │
                    │ ┌────────────┐ ┌──────────────┐ │
                    │ │   Routes   │ │ Controllers  │ │
                    │ └────────────┘ └──────────────┘ │
                    │                                  │
                    │ ┌────────────┐ ┌──────────────┐ │
                    │ │ Middleware │ │   Services   │ │
                    │ └────────────┘ └──────────────┘ │
                    └───────────────┬──────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
     ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
     │    MongoDB     │    │     Redis      │    │  Google Gemini │
     │                │    │                │    │       AI       │
     │ Users          │    │ OTP Storage    │    │                │
     │ Projects       │    │ Token          │    │ AI Responses   │
     │ Messages       │    │ Blacklisting    │    │ Code Generation│
     └────────────────┘    └────────────────┘    └────────────────┘
                                    │
                                    ▼
                           ┌────────────────┐
                           │     Resend     │
                           │                │
                           │ OTP / Email    │
                           └────────────────┘
# 🔄 Application Flow

```mermaid
flowchart TD
    A[User Opens CodeForge AI] --> B{Authentication}

    B -->|Register| C[Create Account]
    C --> D[Email OTP Verification]
    D --> E[JWT Authentication]

    B -->|Login| F[Email & Password]
    F --> G[Login OTP Verification]
    G --> E

    B -->|Google Login| H[Google OAuth]
    H --> E

    B -->|Try Demo| I[Demo Login]
    I --> J[Restricted Demo Access]

    E --> K[Project Dashboard]
    J --> K

    K --> L{Project Action}

    L -->|Create| M[Create Project]
    L -->|Open| N[Open Project]
    L -->|Join| O[Join Project]

    M --> P[Coding Environment]
    N --> P
    O --> P

    P --> Q[File Explorer]
    P --> R[Code Editor]
    P --> S[Project Chat]
    P --> T[Terminal]

    S --> U{@ai Prompt}
    U --> V[Backend AI Service]
    V --> W[Google Gemini]
    W --> X[Generated Code / Files]
    X --> P

    Q --> Y[Update File Tree]
    R --> Y
    Y --> Z[MongoDB]

    S --> AA[Socket.IO]
    AA --> AB[Real-Time Collaboration]
    AB --> AC[Other Collaborators]

    T --> AD[WebContainer]
    AD --> AE[Install Dependencies]
    AE --> AF[Run Supported Project]
    AF --> AG[Terminal Output]

    P --> AH[Project Data]
    AH --> Z

    # 🛠️ Tech Stack

## 🎨 Frontend

| Technology | Purpose |
|---|---|
| React.js | User interface |
| Vite | Frontend build tool and development server |
| Tailwind CSS | UI styling and responsive design |
| React Router | Client-side routing |
| Axios | HTTP/API requests |
| Socket.IO Client | Real-time communication |
| WebContainers API | In-browser Node.js execution |
| highlight.js | Code syntax highlighting |
| markdown-to-jsx | Rendering AI-generated Markdown |

## ⚙️ Backend

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| Express.js | REST API and server |
| MongoDB | Application database |
| Mongoose | MongoDB object modeling |
| Socket.IO | Real-time collaboration |
| JWT | Authentication and authorization |
| Redis | OTP storage and token invalidation |
| bcrypt | Password hashing |
| express-validator | Request validation |
| Passport.js | Google OAuth authentication |

## 🤖 AI & External Services

| Technology / Service | Purpose |
|---|---|
| Google Gemini API | AI-powered coding assistance and code generation |
| Resend | OTP and email delivery |
| Cloudinary | Image and avatar storage |
| MongoDB Atlas | Cloud database |
| Redis Cloud | Cloud Redis |

## 🧰 Development Tools

| Tool | Purpose |
|---|---|
| Git | Version control |
| GitHub | Source code hosting |
| VS Code | Development environment |
| npm | Package management |

# 🔐 Environment Variables

## Backend

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string

REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

RESEND_API_KEY=your_resend_api_key

GOOGLE_AI_KEY=your_gemini_api_key

FRONTEND_URL=http://localhost:5173

PORT=3000

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# 📁 Project Structure

```text
CodeForge-AI/
│
├── 📁 backend/
│   ├── 📁 controllers/
│   │   ├── project.controller.js
│   │   └── user.controller.js
│   │
│   ├── 📁 middleware/
│   │   └── auth.middleware.js
│   │
│   ├── 📁 models/
│   │   ├── project.model.js
│   │   └── user.model.js
│   │
│   ├── 📁 routes/
│   │   ├── project.routes.js
│   │   └── user.routes.js
│   │
│   ├── 📁 services/
│   │   ├── ai.service.js
│   │   ├── email.service.js
│   │   ├── otp.service.js
│   │   ├── project.service.js
│   │   └── redis.service.js
│   │
│   ├── 📄 .env
│   ├── 📄 package.json
│   └── 📄 server.js
│
├── 📁 frontend/
│   ├── 📁 public/
│   │
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   ├── 📁 screens/
│   │   │   ├── Login.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Project.jsx
│   │   │   └── ...
│   │   │
│   │   ├── 📁 services/
│   │   ├── 📁 utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── 📄 .env
│   ├── 📄 index.html
│   ├── 📄 package.json
│   └── 📄 vite.config.js
│
├── 📄 .gitignore
├── 📄 README.md
└── 📄 LICENSE

# 🚀 Setup & Run

## 1. Clone the Repository

git clone https://github.com/NeerajGaikwad/CodeForge-AI.git
cd CodeForge-AI

## 2. Backend Setup

cd backend
npm install

Create backend/.env and add the required environment variables.

Start the backend:

node server.js

Backend:
http://localhost:3000

## 3. Frontend Setup

Open a new terminal:

cd CodeForge-AI/frontend
npm install

Create frontend/.env:

VITE_API_URL=http://localhost:3000

Start the frontend:

npm run dev

Frontend:
http://localhost:5173

## 4. Run the Complete Application

### Terminal 1 — Backend

cd CodeForge-AI/backend
npm install
node server.js

### Terminal 2 — Frontend

cd CodeForge-AI/frontend
npm install
npm run dev

Open the application:

http://localhost:5173

## 🔗 Services

Frontend: http://localhost:5173
Backend API: http://localhost:3000
MongoDB: MongoDB Atlas
Redis: Redis Cloud
AI: Google Gemini API
Email: Resend
Image Storage: Cloudinary
