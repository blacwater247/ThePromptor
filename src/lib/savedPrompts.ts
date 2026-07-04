export type SavedPrompt = {
  id: string;
  prompt: string;
  title?: string;
  created_at: string;
};

const STORAGE_KEY = "promptor:saved-prompts";

function readAll(): SavedPrompt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedPrompt[]) : [];
  } catch {
    return [];
  }
}

function writeAll(prompts: SavedPrompt[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

/**
 * Saves a prompt to this browser's local storage. No network call,
 * no backend — replaces the old POST /save-prompt Railway route.
 */
export function savePromptLocal(prompt: string, title?: string): SavedPrompt {
  const entry: SavedPrompt = {
    id: crypto.randomUUID(),
    prompt,
    title,
    created_at: new Date().toISOString(),
  };
  const all = readAll();
  all.unshift(entry);
  writeAll(all);
  return entry;
}

/**
 * Returns every prompt saved on this browser/device.
 * Replaces the old GET /prompts/{user_id} Railway route.
 */
export function listSavedPromptsLocal(): SavedPrompt[] {
  return readAll();
}

/**
 * Deletes a single saved prompt by id.
 */
export function deleteSavedPromptLocal(id: string): void {
  writeAll(readAll().filter((p) => p.id !== id));
}
