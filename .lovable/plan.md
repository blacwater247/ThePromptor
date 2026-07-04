## Problem

The `/app` page crashes with:

> A `<Select.Item />` must have a value prop that is not an empty string.

`src/components/PromptBuilder.tsx` prepends `""` to several dropdown option lists (subgenre, mood color, arrangement, rhythm pattern, sonic finish, vocal format) so users can "clear" the selection. Radix Select forbids empty-string values, so the whole route errors out and the fallback error page shows.

## Fix

Replace the empty-string sentinel with a real non-empty value (`"__none__"`) rendered as `"None"` in the dropdown, and translate it to/from `""` at the Dropdown boundary so the rest of the app state and prompt generation logic stays unchanged.

### Changes in `src/components/PromptBuilder.tsx`

1. In the shared `Dropdown` component:
   - When mapping `options`, replace any `""` entry with `{ value: "__none__", label: "None" }`; keep other entries as `{ value: o, label: o }`.
   - Convert value: pass `value === "" ? "__none__" : value` to `<Select value=...>`.
   - Convert onChange: `onValueChange={(v) => onChange(v === "__none__" ? "" : v)}`.
2. Remove the need for callers to prepend `""` — instead accept an optional `allowNone?: boolean` prop and let the component prepend a single `{ value: "__none__", label: "None" }` item when true.
3. Update every call site currently doing `standard={["", ...LIST]}` (subgenre, mood color, arrangement, rhythm pattern, sonic finish, vocal format) to pass the raw list plus `allowNone`.

No other files change. Existing state values (`""`), server sanitization, and prompt generation continue to work unchanged.

## Verification

- Reload `/app`; no error boundary.
- Open the Subgenre / Emotional color / Arrangement / Rhythm pattern / Sonic finish / Vocal format dropdowns → each shows a "None" option plus real entries; selecting "None" clears the field.
