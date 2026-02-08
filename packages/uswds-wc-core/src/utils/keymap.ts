/**
 * Keyboard event mapping utility
 *
 * Creates a keyboard event handler from a mapping of key names to handler functions.
 * Supports Shift modifier (e.g., "Shift+Tab").
 *
 * Extracted from USWDS source pattern used across multiple behavior files.
 *
 * @param mappings - Object mapping key names to handler functions
 * @returns Keyboard event handler function
 */
export function keymap(
  mappings: Record<string, (this: HTMLElement, event: KeyboardEvent) => void>
) {
  return function (this: HTMLElement, event: KeyboardEvent) {
    const key = event.shiftKey ? `Shift+${event.key}` : event.key;
    const handler = mappings[key];
    if (handler) {
      handler.call(this, event);
    }
  };
}
