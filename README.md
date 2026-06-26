# DataGouv Prototype Lab

This repository is used to create experimental design prototypes for data.gouv.fr.

The goal is to quickly test product ideas, interface patterns, and interaction flows with realistic prototypes before committing to production implementation.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the prototype index.

## Project Structure

- `app/prototypes/[slug]`: isolated prototypes
- `components`: reusable UI components
- `lib`: shared prototype data and business logic

Each prototype should include a local `README.md` describing its goal, tested hypothesis, status, inspirations, and Figma source.
