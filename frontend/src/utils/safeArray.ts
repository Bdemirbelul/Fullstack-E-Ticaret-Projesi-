/** API veya proxy HTML/hata döndürdüğünde .map patlamasını önler. */
export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : []
}
