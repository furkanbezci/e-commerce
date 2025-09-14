# Next.js E-Commerce Demo

A minimal e-commerce prototype built on **Next.js (App Router)** with a **JSON Server** mock backend.  
It showcases protected routes, **HttpOnly cookie–based** session checks, cart & wishlist via Context API, and centralized handling via Axios interceptors and Next.js middleware.

---

## ✨ Features

- **Next.js (App Router, latest)** – modern routing with server/client components.
- **REST API** – backed by **JSON Server** for quick local development.
- **Authentication**
  - Session detection via **HttpOnly cookies**.
  - `/auth/me` is used to verify authentication state.
    
    
- **State Management** – **React Context API** for **Wishlist** and **Cart**.
- **Global Handling**
  - **Axios Interceptors**: request/response logging and **global error handling** (designed to be extended with retries, backoff, refresh logic, or centralized notifications).
  - **Next.js `middleware.js`**: route protection & auth checks (can be expanded for role-based guards, maintenance mode, etc.).
- Note: Social Sign-Up (Google & Facebook): _UI-only dummy placeholders_ (These buttons are **non-functional** and make **no external requests**; they exist only to demonstrate the intended UX.)
---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15+/App Router, React 19  
- **State:** Context API (Cart, Wishlist)  
- **Backend (mock):** JSON Server (REST)  
- **HTTP:** Axios + Interceptors  
- **Auth:** HttpOnly cookies

---

## 🚀 Installation & Running Locally

Run the following commands in order:

```bash
git clone <repo-url>
cd <project-directory>
npm install
npm run json-server (necessary for services)
npm run dev
