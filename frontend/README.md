# DOJO Funding Offers SPA

This is a Single Page Application (SPA) built with React, TypeScript, and Vite, replicating the DOJO funding offers design.

## Features
- **Modular Component Architecture:** Clean separation of UI elements into reusable React components.
- **Dynamic State Management:** Interactive payment plan selection and funding amount input.
- **TypeScript Integration:** Type safety for components and data models.
- **Modern Styling:** Dark-themed UI matching the original design specifications.

## Project Structure
- `src/components`: UI components (Sidebar, Cards, Inputs, etc.)
- `src/styles`: Global CSS and variable definitions.
- `docs/adr`: Architectural Decision Records documenting key technology choices.

## Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

## How to Run the Project

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

3. **Build for Production:**
   ```bash
   npm run build
   ```

4. **Preview Production Build:**
   ```bash
   npm run preview
   ```

## Coding Standards
- **Components:** Functional components using React hooks.
- **Styling:** Styled using a combination of global CSS and scoped `<style>` tags within components for better encapsulation.
- **Types:** Interfaces for component props and data structures are explicitly defined.
- **Comments:** TSDoc/JSDoc style comments for components and complex logic.
