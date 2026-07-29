/**
 * Vercel Serverless Function Entry Point
 *
 * Imports the pre-built Express app bundle and exports it as the default
 * handler. Vercel wraps it as a serverless function that handles all /api/*
 * routes (see vercel.json rewrites).
 *
 * The bundle is produced by `pnpm --filter @workspace/api-server run build`
 * which runs artifacts/api-server/build.mjs with src/app.ts as an entry point.
 */
export { default } from '../artifacts/api-server/dist/app.mjs';
