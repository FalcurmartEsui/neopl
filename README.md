#

Apex Pips - Crypto Trading Platform

A modern cryptocurrency trading platform with real-time price feeds, admin controls, and user management.

## Local Development Setup

### Prerequisites

- Node.js 18+ installed
- npm or bun package manager

### Installation

1. **Clone/Download the project**

2. **Create the `.env` file**

   Create a file named `.env` in the root folder (same level as `package.json`) with the following content:

   ```env
   VITE_SUPABASE_PROJECT_ID="sbwwpjpnsqtedpirehwc"
   VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNid3dwanBuc3F0ZWRwaXJlaHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNzgzMjcsImV4cCI6MjA4MDY1NDMyN30.yTSp3CwojRe-Dd52vsKdp3yCpxMjxbHDJWVkFP-KJq8"
   VITE_SUPABASE_URL="https://sbwwpjpnsqtedpirehwc.supabase.co"
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**

   Navigate to `http://localhost:5173` (or the port shown in terminal)

## Admin Access

- **Admin Login Page:** `/admin-login`
- **Username:** `Isaac`
- **Password:** `Amabelonakorame`

## Features

- Real-time cryptocurrency prices (BTC, ETH, SOL, XRP)
- TradingView charts integration
- User deposit/withdrawal management
- Admin panel with full user control
- Live chat support system
- KYC verification flow
- Demo trading mode

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase (Backend)
- TanStack Query
- Shadcn/UI Components

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
