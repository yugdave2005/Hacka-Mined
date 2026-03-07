<div align="center">
  <img src="Images/Home%20Page.jpeg" alt="BurnSight Home" width="100%" />

  # 🔥 BurnSight
  **The AI-Powered Financial Analyst & Runway Simulator for Modern Startups**

  [![Next.js](https://img.shields.io/badge/Next.js-Black?style=for-the-badge&logo=next.js&logoColor=white)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)

  <br />

  <p align="center">
    BurnSight is an automated, AI-driven financial dashboard designed exclusively for founders to effortlessly track burn rates, simulate runway scenarios, evaluate growth metrics, and instantly generate investor-ready PDF reports from raw data.
  </p>
</div>

---

## ✨ Features & Walkthrough

We've removed the spreadsheets out of startup finance. Here's a glimpse into the platform:

<br />

### 📊 Comprehensive Finance Overview
Get a bird's eye view of your cash flow, monthly burn, runway, and revenue trends with beautiful, dynamic charts powered by **Recharts**.
<div align="center">
  <img src="Images/Finance%20Overview.jpeg" alt="Finance Overview" width="90%" />
</div>

<br />

### 🧠 Advanced Founder Metrics & AI Insights
Dive deep into your operational efficiency. We automatically categorize your expenses, track top-spending categories, and run your data through **Groq AI** to deliver actionable, strategic insights and cost-saving opportunities.
<div align="center">
  <img src="Images/Founder%20Metrics.jpeg" alt="Founder Metrics" width="90%" />
</div>

<br />

### 🚀 Interactive Runway Simulator
Play out the "What-If" scenarios. Will hiring three new engineers shorten your runway to critical levels? Visualize your cash-zero dates based on real, interactive sliders.
<div align="center">
  <img src="Images/Runway%20Stimulator.jpeg" alt="Runway Simulator" width="90%" />
</div>

<br />

### 📈 Pristine Investor Reports (Native PDF Generation)
Generate perfect, corporate-style **A4 PDFs** using our native `jsPDF` integration. No clipped borders, no CSS glitches—just perfectly structured reports you can confidently email to VCs directly from your dashboard.
<div align="center">
  <img src="Images/Investor%20Report%20.jpeg" alt="Investor Report" width="90%" />
</div>

<br />

---

## 🛠️ How it Works

### 1. Simple Data Ingestion
Simply drop in your transaction CSVs. We parse, categorize, and crunch the numbers completely securely.
<div align="center">
  <img src="Images/Upload%20Data.jpeg" alt="Upload" width="48%" />
  <img src="Images/Steps.jpeg" alt="Steps" width="48%" />
</div>

### 2. Powerful Capabilities
Whether you're exploring deep UI features or adjusting settings synced securely via **Supabase Auth**, your data and sessions belong securely to you.
<div align="center">
  <img src="Images/Features.jpeg" alt="Features" width="48%" />
  <img src="Images/Settings.jpeg" alt="Settings" width="48%" />
</div>

---

## 💻 Tech Stack & Architecture

- **Frontend Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4, Framer Motion
- **Authentication**: Supabase Auth (SSR)
- **Data Visualization**: Recharts, Lucide Icons
- **AI Processing**: Groq LLM API (Llama 3 / Mixtral)
- **Document Generation**: jsPDF & jsPDF-AutoTable
- **Parsing**: PapaParse

---

## 🚀 Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yugdave2005/Hacka-Mined.git
   cd Hacka-Mined
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file mapped to:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

---
<div align="center">
  <i>Built with ❤️ for founders who want to focus on building, not bookkeeping.</i>
</div>
