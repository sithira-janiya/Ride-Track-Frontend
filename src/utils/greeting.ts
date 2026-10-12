/** First word of a person's name, for a friendly greeting. Empty when there is no name. */
export function firstName(name?: string | null): string {
  return name?.trim().split(/\s+/)[0] ?? '';
}

/**
 * "Good morning, {name}" before noon, "Good afternoon" until 6 pm, then "Good evening", on the phone's clock.
 * `{name}` is left in for `t()` to fill, so each greeting is translated once; without a name it is left off.
 */
export function greetingTemplate(name?: string | null, now = new Date()): string {
  const hour = now.getHours();
  const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return firstName(name) ? `${part}, {name}` : part;
}
