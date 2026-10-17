# Secret Santa Frontend

This is a [Next.js](https://nextjs.org) frontend for the Secret Santa application, built with ShadCN/UI components.

The frontend uses Next.js 16, React 19, and Vitest 5. Dependencies are pinned by `package-lock.json`.

The dependency update leaves one known unpatched development-tool issue: `braces` (GHSA-vfj7-8cjw-p6xm), pulled in by the Next.js ESLint plugin through `fast-glob` and `micromatch`. npm reports this as five high-severity entries along the dependency chain. ESLint remains on 9 because the current Next.js plugins do not support ESLint 10.

## Getting Started

Use Node.js 24 (see `.nvmrc`), install the locked dependencies, then run the development server:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

This project uses Vitest with React Testing Library for testing:

```bash
# Run tests once
npm test -- --run

# Run tests in watch mode
npm run test:watch

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Building

```bash
# Build for production
npm run build

# Run linting
npm run lint

# Check TypeScript
npm run typecheck
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
