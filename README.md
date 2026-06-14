# BetterMe - Wellness Todo App

A full-featured todo and wellness tracking application built with Next.js, React, and Supabase.

## Features

- ✅ **Todo Management**: Create, organize, and track recurring tasks
- 📊 **Analytics**: Weight tracking and progress visualization
- 👤 **Authentication**: Email/password and OAuth sign-in
- 🎯 **Categories**: Organize todos with custom categories
- 🌙 **Dark Mode**: Built-in dark/light theme support
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 💾 **Guest Mode**: Try the app without signing up
- 🔔 **Notifications**: Toast notifications and reminders
- 🧪 **Comprehensive Testing**: Vitest unit tests + Playwright E2E tests

## Testing

See [TESTING.md](./TESTING.md) for complete testing documentation.

```bash
# Run unit tests
npm run test

# Run with coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:ui
npm run test:e2e:ui
```

Run `npm run test:coverage` for the current coverage report (`coverage/index.html`).

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from the example and fill in your Supabase + VAPID keys:

   ```bash
   cp .env.local.example .env.local
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the app. Edit pages under `src/app/` — they auto-update as you save.

For architecture and conventions, see [AGENTS.md](./AGENTS.md). For deployment, see [DEPLOYMENT_SETUP.md](./DEPLOYMENT_SETUP.md).
