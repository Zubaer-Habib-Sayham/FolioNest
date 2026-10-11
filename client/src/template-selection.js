import { templateIds } from "../../shared/src/templates.js";

export const selectionKey = "folionest-template-selection-v1";
export function readSelection() {
  try {
    return typeof window === "undefined"
      ? []
      : loadSelection(window.localStorage);
  } catch {
    return [];
  }
}
export function validSelection(value) {
  return Array.isArray(value)
    ? [...new Set(value.filter((id) => templateIds.includes(id)))].slice(0, 4)
    : [];
}
export function loadSelection(storage) {
  try {
    const raw = storage.getItem(selectionKey);
    return raw && raw.length <= 512 ? validSelection(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}
export function saveSelection(storage, ids) {
  try {
    storage.setItem(selectionKey, JSON.stringify(validSelection(ids)));
    return true;
  } catch {
    return false;
  }
}
