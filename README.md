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
- 🧪 **Comprehensive Testing**: 188+ unit tests + E2E tests

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

**Current Test Coverage**:
- 529 unit tests across 33 test files
- 67.84% statement coverage
- 61.16% branch coverage
- 58.94% function coverage
- 69.52% line coverage
- Multiple E2E test suites

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
