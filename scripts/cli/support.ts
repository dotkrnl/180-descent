interface ErrorListOptions {
  heading?: string;
  prefix?: string;
  separator?: string;
  footer?: readonly string[];
}

export function exitOnErrors<T>(
  errors: readonly T[],
  format: (error: T) => string,
  options: ErrorListOptions = {}
): void {
  if (!errors.length) {
    return;
  }

  if (options.heading) {
    console.error(options.heading);
  }

  const prefix = options.prefix ?? "";
  const separator = options.separator ?? "\n";
  console.error(errors.map((error) => `${prefix}${format(error)}`).join(separator));

  for (const line of options.footer ?? []) {
    console.error(line);
  }

  process.exit(1);
}
