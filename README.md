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
