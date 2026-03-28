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
- Stage 708 is the current implementation checkpoint and Stage 709 is the latest completed audit
- there is no automatic next slice; reopen a surface intentionally from the current baseline
- keep `Graph`, `Home`, embedded `Notebook`, `Reader`, and `Study` as regression surfaces unless the user explicitly reopens another product slice
- keep Reader generated outputs, transform logic, and generated-view routing frozen unless the user explicitly reprioritizes generated-content work
