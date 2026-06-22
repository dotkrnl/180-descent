import { describe, expect, it } from "vitest";
import { parsePpm } from "@lib/pdf";
import { escapeRegExp } from "@lib/text";
import { isFullPageBox, isWhitePixel } from "@lib/checks";

describe("pdf check helpers", () => {
  it("classifies full-page bounding boxes and white pixels", () => {
    expect(isFullPageBox([0, 0, 432, 648])).toBe(true);
    expect(isFullPageBox([2, 0, 432, 648])).toBe(false);
    expect(isWhitePixel([251, 252, 253])).toBe(true);
    expect(isWhitePixel([249, 252, 253])).toBe(false);
  });

  it("parses binary PPM headers", () => {
    const buffer = Buffer.concat([Buffer.from("P6\n# comment\n2 1\n255\n", "ascii"), Buffer.from([0, 1, 2, 3, 4, 5])]);
    expect(parsePpm(buffer)).toEqual({
      width: 2,
      height: 1,
      max: 255,
      dataOffset: buffer.length - 6
    });
  });

  it("escapes regular expression text", () => {
    expect(escapeRegExp("A+B?")).toBe("A\\+B\\?");
  });
});
