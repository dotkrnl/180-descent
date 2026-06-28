import { z } from "zod";
import { creditsDataFile } from "@lib/data/paths";
import { readYamlFile } from "@lib/data/yaml";
import { nonBlankString } from "@lib/schemas/text";

export interface CreditsData {
  fonts: CreditFont[];
  images: CreditImage[];
}

interface CreditFont {
  name: string;
  source: string;
  license: string;
}

interface CreditImage {
  title: string;
  creator: string;
  source: string;
  license: string;
  asset: string;
  notes: string;
}

const imageAssetSchema = z.string()
  .regex(/^\/assets\/images\/.+\.(?:jpe?g|png|svg|webp)$/)
  .refine((asset) => {
    const [, ...segments] = asset.split("/");
    return segments.every((segment) => segment && segment !== "." && segment !== "..");
  }, {
    message: "image asset must be a normalized absolute path under /assets/images"
  });

const creditFontSchema = z.object({
  name: nonBlankString,
  source: nonBlankString,
  license: nonBlankString
}).strict();

const creditImageSchema = z.object({
  title: nonBlankString,
  creator: nonBlankString,
  source: nonBlankString,
  license: nonBlankString,
  asset: imageAssetSchema,
  notes: nonBlankString
}).strict();

const creditsDataSchema = z.object({
  fonts: z.array(creditFontSchema),
  images: z.array(creditImageSchema)
}).strict().superRefine((credits, context) => {
  const fontNames = new Set<string>();
  for (const [index, font] of credits.fonts.entries()) {
    if (fontNames.has(font.name)) {
      context.addIssue({
        code: "custom",
        path: ["fonts", index, "name"],
        message: `duplicate credit font name: ${font.name}`
      });
    }
    fontNames.add(font.name);
  }

  const imageAssets = new Set<string>();
  for (const [index, image] of credits.images.entries()) {
    if (imageAssets.has(image.asset)) {
      context.addIssue({
        code: "custom",
        path: ["images", index, "asset"],
        message: `duplicate credit image asset: ${image.asset}`
      });
    }
    imageAssets.add(image.asset);
  }
});

export async function readCreditsData(root: string): Promise<CreditsData> {
  return creditsDataSchema.parse(await readYamlFile(creditsDataFile(root)));
}
