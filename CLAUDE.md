## Prompt Discipline

- All instructions must describe HOW to build, not WHAT the feature does.
- Business logic descriptions are not implementation instructions. Never infer architecture from feature descriptions.
- If a prompt sounds like a product requirement, stop and ask for the engineering spec.
- Do not make architectural decisions that were not explicitly requested.
- Do not add, remove, or restructure files outside the scope of the current instruction.
- Do not refactor working code unless explicitly told to.
- Do not rename variables, functions, or files unless explicitly told to.
- One instruction = one task. Do not chain assumptions.

## Code Generation

- Match the exact patterns found in existing files — naming, structure, import style, query style, tagged template literals.
- Never introduce a new pattern without being asked.
- Never switch from one valid approach to another (e.g., raw pg vs ORM) based on preference.
- Write queries in the established domain query file. Do not inline queries in controllers or services.

## Scope

- Only touch the file(s) explicitly mentioned in the instruction.
- If a change requires touching an unmentioned file, stop and ask.
- Never assume a related file needs updating unless told.