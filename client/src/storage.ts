import {
  blankPortfolio,
  portfolioSchema,
  validateBackup,
  type PortfolioData,
} from "@folionest/shared";
export const DRAFT_KEY = "folionest-draft-v1";
export type StorageLike = Pick<Storage, "getItem" | "setItem">;
export function loadDraft(storage: StorageLike): {
  data: PortfolioData;
  message: string;
} {
  try {
    const raw = storage.getItem(DRAFT_KEY);
    if (!raw)
      return {
        data: blankPortfolio(),
        message: "Your draft stays on this device",
      };
    return {
      data: validateBackup(raw),
      message: "Draft restored from this device",
    };
  } catch {
    return {
      data: blankPortfolio(),
      message:
        "Your saved draft could not be read. The original remains in browser storage; restore a JSON backup or start a new draft.",
    };
  }
}
export function saveDraft(storage: StorageLike, data: PortfolioData): string {
  try {
    storage.setItem(DRAFT_KEY, JSON.stringify(portfolioSchema.parse(data)));
    return "Saved on this device";
  } catch {
    return "Unable to save on this device. Keep this tab open and download a JSON backup.";
  }
}
