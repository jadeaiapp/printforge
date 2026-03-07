export function withBase(path: string, baseUrl: string = "/") {
  if (!path) return baseUrl;

  if (
    path.startsWith("http") ||
    path.startsWith("#") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:")
  ) return path;

  const base = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
  const clean = path.startsWith("/") ? path : "/" + path;

  if (base === "/") return clean;

  if (clean.startsWith(base)) return clean;

  return (base + clean.slice(1)).replace(/\/{2,}/g, "/");
}
