# AGENTS.md

## Build/Lint/Test Commands
- `npm run dev` - Start dev server with Turbopack
- `npm run build` - Production build
- `npm run lint` - Run ESLint; `npm run lint:fix` to auto-fix
- `npm run type-check` - TypeScript type checking
- `npm run test` - Run all tests with Vitest
- `npm run test -- src/lib/time.test.ts` - Run a single test file
- `npm run db:push` - Push Prisma schema to database

## Code Style Guidelines
- **Imports**: Use `@/*` path alias for `src/*`. Group: external deps, then `@/` imports, then relative.
- **Formatting**: Use TypeScript strict mode. Avoid `any` (warns). Unused vars warn (except args/rest siblings).
- **Types**: Validate API input with Zod schemas. Use Prisma-generated types for DB models.
- **Naming**: PascalCase for components/types, camelCase for functions/variables, UPPER_SNAKE for constants.
- **Components**: Use `'use client'` directive for client components. Prefer shadcn/ui components from `@/components/ui`.
- **Error Handling**: Use try/catch in API routes; return proper status codes (400 validation, 429 rate limit, 500 server error). Use `logger` from `@/lib/logger` for server-side logging.
- **Styling**: Use Tailwind CSS with `cn()` utility from `@/lib/utils` for class merging.
- **Testing**: Use Vitest with `describe`/`it`/`expect`. Test files use `.test.ts` suffix alongside source files.
