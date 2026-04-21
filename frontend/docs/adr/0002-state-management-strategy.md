# ADR 0002: State Management Strategy

## Status
Accepted

## Context
The application requires tracking user inputs (funding amount) and user selections (payment plans).

## Decision
We will use React's built-in `useState` hook for state management.

## Rationale
Given the current scope is a single page with a shallow component tree, adding a complex state management library like Redux or even the Context API would introduce unnecessary boilerplate. `useState` in the root `App` component is sufficient to manage the shared state between input, selection, and summary components.

## Consequences
- State is passed via props (prop drilling), which is manageable for this small application.
- If the application grows significantly, we may need to refactor to use the Context API or an external state manager.
