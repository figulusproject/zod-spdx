export function encodeLicenseId(input: string) {
  const lowercase = input.toLowerCase();
  const snake_case = lowercase.replaceAll(/[-.+]/gm, "_");
  // pictured: a kebab that's about to break
  const kebab_case = snake_case.replaceAll("_", "-");

  const tsSafe = snake_case.slice(0, 1).match(/^[0-9]$/gm)
    ? `_${snake_case}`
    : snake_case;

  return {
    constName: tsSafe,
    fileName: kebab_case,
  };
}
