export interface ParsedPpm {
  width: number;
  height: number;
  max: number;
  dataOffset: number;
}

export function parsePpm(buffer: Buffer): ParsedPpm {
  let index = 0;
  const tokens: string[] = [];
  while (tokens.length < 4 && index < buffer.length) {
    while (index < buffer.length) {
      while (index < buffer.length && /\s/.test(String.fromCharCode(buffer[index]))) index++;
      if (buffer[index] !== 35) break;
      while (index < buffer.length && buffer[index] !== 10) index++;
    }
    const start = index;
    while (index < buffer.length && !/\s/.test(String.fromCharCode(buffer[index]))) index++;
    if (index > start) tokens.push(buffer.subarray(start, index).toString("ascii"));
  }
  while (index < buffer.length && /\s/.test(String.fromCharCode(buffer[index]))) index++;
  if (tokens[0] !== "P6") throw new Error(`Unsupported PPM header: ${tokens.join(" ")}`);
  return {
    width: Number(tokens[1]),
    height: Number(tokens[2]),
    max: Number(tokens[3]),
    dataOffset: index
  };
}
