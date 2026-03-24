# Session Resume

Use this workflow when the user says `resume master plan`, `where did we leave off`, or asks for the next roadmap step.

## Resume Order

1. `BUILD_BRIEF.md`
2. `docs/ROADMAP.md`
3. `docs/ROADMAP_ANCHOR.md`
4. the active ExecPlan named there
5. `agent.md`
6. `docs/assistant/INDEX.md` if harness routing help is still needed

## Rules

- `docs/ROADMAP_ANCHOR.md` is the live continuity file
- do not assume the highest stage number is the current plan
- keep `Graph`, `Home`, and original-only `Reader` as regression surfaces unless the user explicitly reopens another product slice
