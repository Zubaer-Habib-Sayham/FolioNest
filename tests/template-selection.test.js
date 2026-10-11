import { test, expect } from "vitest";
import {
  validSelection,
  loadSelection,
  saveSelection,
  selectionKey,
} from "../client/src/template-selection.js";
test("shortlists retain only unique known IDs within the four-design limit", () => {
  expect(
    validSelection([
      "studio",
      "invalid",
      "studio",
      "halo",
      "cinema",
      "atelier",
      "bento",
    ]),
  ).toEqual(["studio", "halo", "cinema", "atelier"]);
  expect(validSelection({ theme: "studio" })).toEqual([]);
  expect(loadSelection({ getItem: () => "[" })).toEqual([]);
  expect(loadSelection({ getItem: () => "x".repeat(513) })).toEqual([]);
  expect(
    loadSelection({
      getItem: () => JSON.stringify(["studio", "../private", "halo"]),
    }),
  ).toEqual(["studio", "halo"]);
});
test("blocked storage is handled and persistence stores design IDs only", () => {
  expect(
    loadSelection({
      getItem: () => {
        throw new Error("Blocked");
      },
    }),
  ).toEqual([]);
  expect(
    saveSelection(
      {
        setItem: () => {
          throw new Error("Blocked");
        },
      },
      ["halo"],
    ),
  ).toBe(false);
  const stored = new Map();
  expect(
    saveSelection({ setItem: (key, value) => stored.set(key, value) }, [
      "studio",
      "halo",
    ]),
  ).toBe(true);
  expect([...stored]).toEqual([[selectionKey, '["studio","halo"]']]);
});
