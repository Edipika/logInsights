// Parses --key=value command-line arguments, e.g. npm run logs:bulk -- --count=500
export function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args[match[1]!] = match[2]!;
  }
  return args;
}
