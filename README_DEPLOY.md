# 🚀 AI Apparel Studio: Deployment Guide

This guide explains how to take your project from your local machine to the real world (Live URLs) for your final presentation.

---

## 1. Prepare the Backend (Render.com)
The backend handles AI generation and the database. It needs a service that doesn't time out.

1.  **Create account:** Go to [Render.com](https://render.com).
2.  **New Web Service:** Select your GitHub repository.
3.  **Build Settings:**
    *   **Root Directory:** `server`
    *   **Build Command:** `npm install`
    *   **Start Command:** `node index.js`
4.  **Environment Variables:** Add these from your local `.env`:
    *   `MONGO_URI`
    *   `JWT_SECRET`
    *   `HF_TOKEN`
    *   `EMAIL_USER`
    *   `EMAIL_PASS`
    *   `EMAIL_FROM`
5.  **Get URL:** Once deployed, Render will give you a URL like `https://apparel-backend.onrender.com`.

---

## 2. Prepare the Frontend (Vercel)
Vercel is the best for React apps.

1.  **Create account:** Go to [Vercel.com](https://vercel.com).
2.  **Add New Project:** Select your GitHub repository.
3.  **Project Settings:**
    *   **Root Directory:** `client`
    *   **Framework Preset:** `Vite`
4.  **Environment Variables:**
    *   Add `VITE_API_URL` and paste your **Render URL** here (e.g., `https://apparel-backend.onrender.com/api`).
5.  **Deploy:** Click Deploy!

---

## 🚀 Final Presentation Checklist
*   [ ] MongoDB Network Access set to `0.0.0.0/0`.
*   [ ] `VITE_API_URL` set in Vercel to point to Render.
*   [ ] Gmail App Password working.
*   [ ] Test the `/studio` page on a mobile phone to show it's "Cloud-Powered"!

---
**Synthesized for Final Year Project 2026** 🤖👕
