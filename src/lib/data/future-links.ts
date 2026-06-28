import { z } from "zod";
import { futureLinksDataFile } from "@lib/data/paths";
import { readYamlFile } from "@lib/data/yaml";

interface FutureLinkEntry {
  id: string;
  from_day: number;
  target_day: number;
  text: string;
  status: "pending" | "resolved";
  context: string;
}

const futureLinkIdPattern = /^day-(\d{3})(?:-[a-z0-9]+)*-to-day-(\d{3})(?:-[a-z0-9]+)*$/;

const futureLinkEntrySchema = z.object({
  id: z.string().min(1),
  from_day: z.number().int().positive(),
  target_day: z.number().int().positive(),
  text: z.string().min(1),
  status: z.enum(["pending", "resolved"]),
  context: z.string().min(1)
}).strict();

const futureLinksDataSchema = z.array(futureLinkEntrySchema).superRefine((links, context) => {
  const seen = new Set<string>();
  for (const [index, link] of links.entries()) {
    const idMatch = futureLinkIdPattern.exec(link.id);
    if (!idMatch) {
      context.addIssue({
        code: "custom",
        path: [index, "id"],
        message: `future link ${link.id} must use day-NNN-to-day-NNN id format`
      });
    } else {
      const [, fromDay, targetDay] = idMatch;
      if (Number(fromDay) !== link.from_day || Number(targetDay) !== link.target_day) {
        context.addIssue({
          code: "custom",
          path: [index, "id"],
          message: `future link ${link.id} id days must match from_day and target_day`
        });
      }
    }

    if (link.target_day <= link.from_day) {
      context.addIssue({
        code: "custom",
        path: [index, "target_day"],
        message: `future link ${link.id} target_day must be greater than from_day`
      });
    }

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
