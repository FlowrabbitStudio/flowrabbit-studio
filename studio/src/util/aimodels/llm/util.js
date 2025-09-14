export function cleanPromptString(prompt) {
  if (!prompt) return "";
  return prompt.replaceAll(/"/g, "'");
}
