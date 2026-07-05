## Problem

Selecting a Main Genre in the prompt builder does not update the dropdown. The value snaps back to "Hip-Hop".

## Root cause

In `src/components/PromptBuilder.tsx`, the Main Genre field calls the local `set` helper twice:

```tsx
onChange={(v) => { set("mainGenre", v); set("subgenre", ""); }}
```

`set` is defined as `(k, v) => onChange({ ...value, [k]: v })`. Both calls close over the same `value` snapshot, so the second call (`subgenre: ""`) rebuilds the object from the pre-change `value` and overwrites the `mainGenre` update. Net result: only `subgenre` is cleared, `mainGenre` never changes.

## Fix

Merge both updates into a single `onChange` call so the two fields are updated atomically:

```tsx
onChange={(v) => onChange({ ...value, mainGenre: v, subgenre: "" })}
```

Single-file change, no other callers affected. All other `set` usages in the file only update one key at a time and are safe.

## Verify

Open `/app`, expand "Genre", pick a different Main Genre — the trigger label should now update and the Subgenre dropdown should reset to empty.
