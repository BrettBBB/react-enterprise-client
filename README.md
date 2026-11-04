# Enterprise React Client (`react-enterprise-client`)

A high-performance, enterprise-grade client interface built with **React**, **TypeScript**, and **Vite**, designed as part of a distributed multi-root workspace architecture paired with a backend NestJS API.

---

## 🚀 Architectural Overview

This project serves as the front-end presentation and interaction layer for a full-stack portfolio application, emphasizing clean architecture, strict type safety, and modern tooling performance.

- **Framework:** React 19+ / Vite (ESM-native fast bundling)
- **Language:** TypeScript (Strict mode enabled)
- **Package Management:** `pnpm` (Unified workspace tooling)
- **UI Component Library:** Material-UI (MUI) featuring custom theme architecture and **MUI Data Grid** for high-density tabular data management.
- **State & Data Flow:** Custom React hooks, type-safe API client wrappers, and native JWT session handling.
- **Linting & Code Quality:** Rust-powered **Oxlint** integration for instant, high-performance static analysis.

---

## ✨ Key Features & Capabilities

- **Secure Authentication:** Native JWT-based login workflow with token injection interceptors and protected route handling.
- **Data Grid Integration:** Utilizes MUI Data Grid for optimized rendering, sorting, and filtering of complex datasets.
- **Modular Custom Hooks:** Encapsulated business logic and asynchronous state management.
- **Strict Type Safety:** Comprehensive DTO mapping and interface contracts synchronized with backend API schemas.

---

## 🛠️ Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

### Installation & Local Development

1. Clone the repository and navigate into the project directory:
   cd react-enterprise-client

2. Install dependencies using `pnpm`:
   pnpm install

3. Configure your environment variables (copy `.env.example` to `.env` and set your backend API URL):
   VITE_API_URL=http://localhost:3000

4. Start the Vite development server:
   pnpm dev

---

## 🧪 Code Quality & Linting

This project utilizes **Oxlint** for blazing-fast static analysis and error prevention. To run checks:

pnpm lint

---

## 🔗 Workspace Context

This repository operates within a multi-root workspace (`enterprise.code-workspace`) alongside its companion backend repository (`nest-enterprise-api`), demonstrating decoupled enterprise service design and scalable code organization.
