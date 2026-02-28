export function normalizeAiInput(text: string, maxChars: number) {
  const compact = text.replace(/\s+/g, ' ').trim()
  if (compact.length <= maxChars) {
    return { text: compact, truncated: false }
  }
  return {
    text: compact.slice(0, maxChars),
    truncated: true,
  }
}
