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

export function readCreditsData(root: string): Promise<CreditsData> {
  return readYamlFile<CreditsData>(creditsDataFile(root));
}
