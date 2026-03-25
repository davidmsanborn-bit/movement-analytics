# Agent & contributor guide — Movement Analytics

## Next.js

This project uses a current Next.js release with breaking changes versus older docs. Before changing routing, `app/` conventions, or server/client boundaries, read the relevant guide under `node_modules/next/dist/docs/`. Heed deprecation notices.

## Product direction

Build a **premium sports-tech** experience: dark, confident typography, analytical clarity, **credible** feedback. Avoid toy-demo vibes, cluttered fitness UI, or pseudo-medical claims.

## MVP scope (strict)

Ship and maintain only what the MVP needs unless the product owner explicitly expands scope:

- **One movement:** bodyweight squat  
- **One angle:** side view  
- **One flow:** upload → analyze → results  
- **Web app only** for this phase  
- **Mock or stub** backends until real pipelines are ready  

Do **not** add multi-sport features, in-game analytics, drill libraries, or S&C programming in this codebase until the MVP is proven.

## Measured vs inferred

User-facing copy and data models should **distinguish**:

- **Measured / observed:** what comes from the video signal (e.g. joint angles, timestamps) when we have real processing.  
- **Inferred / assessed:** coaching interpretation, scores, and cues derived from models—always framed as movement quality assessment, not diagnosis.

When in doubt, prefer honest uncertainty and confidence indicators over false precision.

## Engineering principles

1. **Plan** before non-trivial work (small written plan in PR or `tasks/todo.md` is enough).  
2. **Verify** before calling work done: `npm run build`, `npm run lint`, and manual check of the affected user flow.  
3. Prefer **elegant, simple** solutions over frameworks and indirection.  
4. **Do not overengineer:** no generic “movement platform” abstractions until we have a second movement with real requirements.  
5. Keep **strict MVP scope**; park future ideas in `tasks/todo.md` under a “Later / out of scope” section.

## Code organization

- **Squat-specific** types and analysis shapes live under `lib/analysis/` until a second movement exists.  
- **API routes** should return stable JSON shapes that the results UI can consume; version carefully when changing fields.  
- **Mock data** stays replaceable: one function or module boundary between “fake pipeline” and UI.

## Definition of done

- Matches MVP scope and design direction.  
- Build and lint pass.  
- Critical path tested manually (upload → processing → results, or equivalent).  
- Copy respects measured vs inference and avoids medical claims.
