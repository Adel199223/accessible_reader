# Session Resume

Use this workflow when the user says `resume master plan`, `where did we leave off`, or asks for the next roadmap step.

## Resume Order

1. `BUILD_BRIEF.md`
2. `docs/ROADMAP.md`
3. `docs/ROADMAP_ANCHOR.md`
4. the active ExecPlan named there, if a new slice has been opened
5. `agent.md`
6. `docs/assistant/INDEX.md` if harness routing help is still needed

## Rules

- `docs/ROADMAP_ANCHOR.md` is the live continuity file
- do not assume the highest stage number is the current plan
- Stage 945 is the latest completed audit named by `docs/ROADMAP_ANCHOR.md`; no Stage 946 product slice is open
- Stage 944/945 completed Study matching/ordering question types above completed Stage 942/943 fill-in-the-blank answer attempts, Stage 940/941 choice question types, Stage 938/939 manual question creation, Stage 936/937 question edit/delete management, Stage 934/935 Study question scheduling controls, Stage 932/933 memory progress timeline, Stage 930/931 collection subsets, Stage 928/929 review-history filters and filtered Review queue, Stage 926/927 habit calendar and activity range, Stage 924/925 knowledge-stage memory stats, Stage 922/923 review progress, Stage 920/921 Home review schedule lens, Stage 918/919 Study schedule drilldowns and question triage, Stage 916/917 review-ready sources and Study schedule dashboard, Stage 914/915 source-scoped review and Questions, Stage 912/913 source memory search, Stage 910/911 Home memory filters, Stage 908/909 memory signals, Stage 906/907 source-memory stack, Stage 904/905 cleanup, Stage 900/901 source overview memory continuity, Stage 898/899 Home personal-notes board, Stage 896/897 Graph/Study promotion, Stage 894/895 Home personal-note, and Stage 892/893 Notebook source-context baselines
- Stage 902/903 was not a product redesign: it keeps future evidence-created source notes self-cleaning and introduced the dry-run-first historical cleanup matcher
- Stage 904/905 was not a product redesign: it applied the guarded cleanup only to historical source-attached Stage-marker audit notes, then audited the real-note baseline
- keep `Graph`, `Home`, embedded `Notebook`, `Reader`, and `Study` as regression surfaces unless the user explicitly reopens another product slice
- keep Reader generated outputs, transform logic, and generated-view routing frozen unless the user explicitly reprioritizes generated-content work
