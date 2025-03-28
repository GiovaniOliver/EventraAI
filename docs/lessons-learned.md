# @lessons-learned.md - Development Insights

This file captures valuable insights, solutions, and best practices learned throughout the development process of EventraAI.

- [2024-03-26 12:54] Framework Integration: Issue: Integration between Vite and Express causing frontend rendering issues with conflicting WebSocket implementation → Solution: Migrate to Next.js which provides unified solution with built-in API routes and server-side rendering → Why: Critical for resolving architectural conflicts, improving developer experience, and enabling better performance through SSR while consolidating the codebase into a single framework.

- [2024-03-26 13:00] WebSocket Design: Issue: Multiple WebSocket implementations (websocket.tsx, websocket-rest.tsx, websocket-fixed.tsx, websocket-silent.tsx) causing confusion and potential conflicts → Solution: Consolidate into a single WebSocket implementation or consider alternatives like Supabase Realtime → Why: Simplified architecture reduces bugs, improves maintainability, and provides a clearer mental model for real-time communication patterns. 