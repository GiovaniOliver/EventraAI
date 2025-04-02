# EventraAI Development Guide

## Commands
- `npm run dev` - Start development server with turbopack
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx jest src/__tests__/path/to/test.ts` - Run specific test file
- `npx jest --watch` - Run tests in watch mode

## Code Style Guidelines
- **TypeScript**: Use strict type checking. Define interfaces/types for all props, state, and functions
- **Imports**: Group imports by external libraries, internal components, types, and utilities
- **Components**: Use React functional components with hooks
- **Naming**: PascalCase for components/interfaces, camelCase for variables/functions, prefix handlers with "handle"
- **Error Handling**: Use early returns and proper TypeScript error handling patterns
- **Accessibility**: Include ARIA attributes, keyboard navigation, and focus management
- **Formatting**: Use consistent indentation, trailing commas, and semicolons
- **Mobile-First**: Implement responsive design patterns
- **Patterns**: Follow the context/state management patterns established in the codebase

## Pre-Implementation Checklist
Before writing any code:
1. Search for existing functionality with grep/file search
2. Document findings (existing files, functionality, gaps)
3. Get approval before proceeding with new files if similar functionality exists

Always test thoroughly and run linting before submitting changes.