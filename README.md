# Dojo Business Funding Hackathon 🚀

## Problem
Currently, merchants see every eligible MCA offer sorted by max funding amount, with no personalization or explanation of why it suits them. 

## Solution
An AI-powered offer recommender that takes merchant context and available offers to return the top 3 best-fit offers with reasons, plus a follow-up prompt to refine based on stated needs.

## Structure
- `/frontend`: Simple HTML page for the MVP UI to recreate the Sidekick offers screen.
- `/backend`: .NET Console App for the AI recommender service.
- `/data`: (To be added) Mocked JSON fixtures for merchant personas and offers.

## How to Run
To run both the frontend and backend simultaneously, use the provided `start.sh` script from the root of the project:

```bash
./start.sh
```

This script will automatically install any missing frontend dependencies, start the backend in the background, start the frontend server, and gracefully shut both down when you press `Ctrl+C`.

## Scope
MCA offers only. No backend wiring to live Dojo services.
