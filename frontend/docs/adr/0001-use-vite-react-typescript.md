# ADR 0001: Use Vite, React, and TypeScript

## Status
Accepted

## Context
The project needs to be converted from a monolithic `index.html` file into a Single Page Application (SPA) to improve maintainability, scalability, and developer experience.

## Decision
We will use:
- **Vite** as the build tool for its superior development speed and optimized production builds.
- **React** as the UI library to enable component-based architecture.
- **TypeScript** for static type safety, reducing runtime errors and improving self-documentation.

## Consequences
- Developers will need a Node.js environment to run the project.
- Components are modular and easier to test.
- Type definitions provide better IDE support and catch potential bugs during development.
