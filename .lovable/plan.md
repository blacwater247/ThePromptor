## Fix: Copy button fails in preview iframe

**Cause:** `navigator.clipboard.writeText` throws in sandboxed/cross-origin iframes (like the Lovable preview) and in non-secure contexts, so clicking Copy just shows "Copy failed".

**Fix (frontend only, `src/components/PromptPreview.tsx`):**

Update `CopyButton.onClick` to try `navigator.clipboard.writeText` first, and on failure fall back to a hidden `<textarea>` + `document.execCommand('copy')`. Only show the error toast if both paths fail.

```ts
async function copyText(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
```

No other files change.