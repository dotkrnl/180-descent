import { z } from "zod";
import { creditsDataFile } from "@lib/data/paths";
import { readYamlFile } from "@lib/data/yaml";

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

const creditFontSchema = z.object({
  name: z.string().min(1),
  source: z.string().min(1),
  license: z.string().min(1)
}).strict();

const creditImageSchema = z.object({
  title: z.string().min(1),
  creator: z.string().min(1),
  source: z.string().min(1),
  license: z.string().min(1),
  asset: z.string().regex(/^\/assets\/images\/.+/),
  notes: z.string().min(1)
}).strict();

const creditsDataSchema = z.object({
  fonts: z.array(creditFontSchema),
  images: z.array(creditImageSchema)
}).strict();

export async function readCreditsData(root: string): Promise<CreditsData> {
  return creditsDataSchema.parse(await readYamlFile(creditsDataFile(root)));
}
