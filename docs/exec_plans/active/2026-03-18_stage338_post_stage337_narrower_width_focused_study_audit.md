# ExecPlan: Stage 338 Post-Stage-337 Narrower-Width Focused Study Audit

## Summary
- Run the narrower-width benchmark audit after Stage 337 to verify whether the focused `Study` right-lane hierarchy reset materially improves the full support flow at `820x980`.
- Reuse the March 18, 2026 benchmark set so the comparison stays anchored to the same narrow-width focused surfaces that have been guiding the recent dominant-surface tail.
- Confirm that the Stage 337 pass preserves the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, the Stage 249 focused `Notes` gains, the Stage 251 focused overview gains, the Stage 253 focused `Study` gains, the Stage 263 focused `Notes` gains, the Stage 281 focused `Graph` gains, the Stage 283 focused `Study` gains, the Stage 285 focused `Graph` gains, the Stage 287 focused `Study` gains, the Stage 289 focused `Graph` gains, the Stage 291 focused `Study` gains, the Stage 293 focused `Graph` gains, the Stage 295 focused `Graph` gains, the Stage 297 focused `Graph` gains, the Stage 299 focused `Graph` gains, the Stage 301 focused `Graph` gains, the Stage 303 focused `Graph` gains, the Stage 305 focused `Graph` gains, the Stage 307 focused `Graph` gains, the Stage 309 focused `Graph` gains, the Stage 311 focused `Graph` gains, the Stage 313 focused `Graph` gains, the Stage 315 focused `Graph` gains, the Stage 317 focused `Graph` gains, the Stage 319 focused `Graph` gains, the Stage 321 focused `Study` gains, the Stage 323 focused `Study` gains, the Stage 325 focused `Study` gains, the Stage 327 focused `Graph` gains, the Stage 329 focused `Graph` gains, the Stage 331 focused `Graph` gains, the Stage 333 focused `Graph` gains, and the Stage 335 focused `Graph` gains.

## Audit Focus
- Focused `Study` at `820x980`, especially the boxed right `Active card` lane beside live reading in both pre-answer and answer-shown states
- Focused overview, focused `Graph`, focused `Notes` drawer-open empty state, and Reader stability after the Stage 337 pass
- Whether the focused `Study` right lane now reads like one calmer secondary continuation beside Reader instead of a separate destination block

## Captures
- Focused overview narrow top
- Focused `Study` narrow top
- Focused `Study` answer-shown narrow top
- Focused `Study` right-lane crop if needed
- Focused `Graph` narrow top
- Focused `Notes` drawer-open empty narrow top
- Reader narrow top

## Validation
- Run the Stage 337 Windows Edge harness first and confirm it succeeds
- Run the Stage 338 Windows Edge audit harness against the live localhost app
- Review the capture set against `docs/ux/recall_benchmark_matrix.md`
- Record whether focused `Study` still leads, whether the blocker has shifted, or whether another surface now becomes the clearer next priority

## Exit Criteria
- The audit clearly states whether Stage 337 succeeded overall
- The audit identifies the next highest-leverage surface or confirms that focused `Study` still leads
- Any newly observed regression against the retained narrow-width gains is called out explicitly before the next implementation slice is opened
