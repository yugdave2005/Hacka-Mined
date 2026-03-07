# 🔥 BurnSight: The AI-Powered Financial Analyst

<div align="center">
  <h3><strong>Hackathon Submission Report</strong></h3>
  <br/>
  <img src="Images/Home%20Page.jpeg" alt="BurnSight Cover" width="100%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />
</div>

---

## 🌟 Executive Summary

In today's fast-paced startup ecosystem, founders spend an exorbitant amount of time wrestling with fragmented financial data, complex Excel spreadsheets, and expensive accounting software just to understand their runway. 

**BurnSight** was built to destroy that friction. 

We have engineered an automated, AI-driven financial dashboard designed exclusively for founders. By effortlessly ingesting raw transaction data, BurnSight instantly categorizes expenses, tracks burn rates, simulates runway scenarios, and generates investor-ready A4 PDF reports. **We let founders focus on building, not bookkeeping.**

---

## 🎯 The Problem We Solve

1. **Blind Spots in Cash Flow:** Startups often die not because of a bad product, but because they simply run out of money unexpectedly.
2. **Manual Overhead:** Categorizing hundreds of bank transactions manually every month is tedious and prone to human error.
3. **Disconnected Analytics:** Current tools lack the predictive intelligence to answer *"What happens if I hire three engineers next month?"*
4. **Investor Reporting:** Compiling professional, corporate-grade performance reports for VCs takes hours of formatting.

---

## ✨ Key Features & Technical Highlights

BurnSight is packed with powerful, deeply integrated features that blend real-time analytics with generative AI.

### 📊 1. Comprehensive Financial Dashboards
- **Dynamic KPI Tracking:** Instant visibility into Cash Balance, Monthly Burn, Runway, and Month-over-Month Revenue Growth.
- **Interactive Visualizations:** Built entirely with `Recharts` for stunning, responsive, and fluid interactive data exploration.

### 🧠 2. Deep AI Insights (Powered by Groq & LLaMA)
- We utilize the ultra-fast **Groq API** to analyze raw banking and transaction data.
- **Cost Optimization engine:** The AI proactively scans for "Zombie Spend" (duplicate subscriptions, unused SaaS tools) and recommends immediate cost-cutting opportunities complete with Runway Impact projections.

### 🚀 3. Interactive Runway Simulator
- A real-time, slider-based financial sandbox.
- Founders can simulate adjusting their monthly revenue growth or cutting OPEX by an exact percentage to instantly see their new "Cash-Zero" date mathematically recalculated on the timeline.

### 📈 4. Native Vector PDF Generation
- We completely bypassed clunky HTML-to-Image scraping. 
- Using `jsPDF`, we built a sophisticated, proprietary PDF rendering engine that generates pristine, 1-page A4 corporate reports. 
- These reports adhere to strict financial formatting standards, ready to be emailed straight to a Board of Directors.

### 🔐 5. Secure Auth & State Management
- Fully integrated with **Supabase Authentication**.
- Protected API routes, secure data encapsulation, and real-time user session management sync perfectly across the application.

---

## 🛠️ Architecture & Tech Stack

Our stack was chosen for maximum performance, aesthetic elegance, and rapid scalability.

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | `Next.js 16 (App Router)` | Blazing fast SSR and heavily optimized routing. |
| **Styling** | `Tailwind CSS v4` + `Framer Motion` | Glassmorphic, modern UI with 60fps micro-animations. |
| **Backend/Auth**| `Supabase` | Extremely secure, Postgres-backed user authentication. |
| **Intelligence**| `Groq` LLM API | Lightning-fast AI inference for transaction categorization. |
| **Graphics** | `Recharts` | High-performance SVG data visualizations. |

---

## 🏆 User Experience & Design Philosophy

BurnSight was designed to look less like a boring accounting tool and more like a modern, premium SaaS platform. 
We utilized a carefully curated palette of **Emeralds, Teals, and Ambers** to evoke a sense of financial growth, stability, and trust. 
- **Glassmorphism:** Used in our onboarding and authentication layers.
- **Micro-interactions:** Every button hover, chart tooltip, and page transition is smoothed out with `Framer Motion` to create a deeply satisfying user experience.

---

## 🚀 Impact & Future Roadmap

**BurnSight** demonstrates what is possible when you combine raw LLM intelligence with beautiful, deterministic software engineering. 

**Future Roadmap:**
1. **Direct Bank Integrations (Plaid/Teller):** Moving beyond CSV uploads to real-time, zero-click data sync.
2. **Predictive Churn Analysis:** Using AI to flag revenue that might be dropping off before it happens.
3. **Multi-Currency Support:** For globally distributed startups handling FOREX burn.

---

<div align="center">
  <br/>
  <h2>Ready for Deployment</h2>
  <i>BurnSight isn't just a prototype; it's a completely functional financial copilot.</i>
  <br/><br/>
  <b>Thank you for reviewing our submission!</b>
</div>
