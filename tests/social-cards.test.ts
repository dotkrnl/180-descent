import { describe, expect, it } from "vitest";
import { wrapSocialTextForCard } from "@lib/assets/social-cards";

describe("social card helpers", () => {
  it("wraps English text at word boundaries", () => {
    expect(wrapSocialTextForCard("Alpha beta gamma", { maxLines: 2, maxChars: 10 })).toEqual([
      "Alpha beta",
      "gamma"
    ]);
  });

  it("truncates overflowing lines", () => {
    expect(wrapSocialTextForCard("Alpha beta gamma delta", { maxLines: 2, maxChars: 10 })).toEqual([
      "Alpha beta",
      "gamma..."
    ]);
  });

  it("splits long English tokens so generated cards do not overflow", () => {
    expect(wrapSocialTextForCard("Supercalifragilisticexpialidocious", { maxLines: 2, maxChars: 12 })).toEqual([
      "Supercalifra",
      "gilistice..."
    ]);
  });
});
