# Hackathon Judge AI

An AI-powered admin panel to evaluate hackathon PPT submissions using Gemini Pro.

## Features
- **Upload PPTX**: Automatically extracts text from slides.
- **AI Scoring**: Evaluates against a configurable blueprint (Innovation, Technical Feasibility, etc.).
- **Auto-Shortlisting**: Recommends "Shortlist" or "Reject" based on score.
- **Premium UI**: Dark mode, glassmorphism, and smooth animations.

## Getting Started

### 1. Install Node.js
Ensure you have Node.js 18 or later installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Set API Key
Create a `.env.local` file:
```env
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## key Technologies
- **Next.js 14**: App Router & API Routes.
- **SQLite**: Local database for storing results.
- **Google Gemini**: LLM for text analysis and scoring.
- **Tailwind CSS**: For basic utilities combined with custom CSS variables.
