import { z } from "zod";
import { futureLinksDataFile } from "@lib/data/paths";
import { readYamlFile } from "@lib/data/yaml";

export interface FutureLinkEntry {
  id: string;
  from_day: number;
  target_day: number;
  target_anchor: string | null;
  text: string;
  status: "pending" | "resolved";
  context: string;
}

const futureLinkEntrySchema = z.object({
  id: z.string().min(1),
  from_day: z.number().int().positive(),
  target_day: z.number().int().positive(),
  target_anchor: z.string().min(1).nullable(),
  text: z.string().min(1),
  status: z.enum(["pending", "resolved"]),
  context: z.string().min(1)
}).strict();

const futureLinksDataSchema = z.array(futureLinkEntrySchema);

export async function readFutureLinksData(root: string): Promise<FutureLinkEntry[]> {
  return futureLinksDataSchema.parse(await readYamlFile<unknown>(futureLinksDataFile(root)));
}
