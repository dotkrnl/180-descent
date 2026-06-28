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

const futureLinksDataSchema = z.array(futureLinkEntrySchema).superRefine((links, context) => {
  const seen = new Set<string>();
  for (const [index, link] of links.entries()) {
    if (seen.has(link.id)) {
      context.addIssue({
        code: "custom",
        path: [index, "id"],
        message: `duplicate future link id: ${link.id}`
      });
    }
    seen.add(link.id);
  }
});

export async function readFutureLinksData(root: string): Promise<FutureLinkEntry[]> {
  return futureLinksDataSchema.parse(await readYamlFile(futureLinksDataFile(root)));
}
