interface ErrorListOptions {
  heading?: string;
  prefix?: string;
  separator?: string;
  footer?: string | readonly string[];
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

  const footer = options.footer;
  if (Array.isArray(footer)) {
    for (const line of footer) {
      console.error(line);
    }
  } else if (footer) {
    console.error(footer);
  }

  process.exit(1);
}
