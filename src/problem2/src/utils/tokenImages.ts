import { TOKEN_ICON_BASE_URL } from "../config/constants";

export function getIconUrl(currency: string) {
  return TOKEN_ICON_BASE_URL + "/" + encodeURIComponent(currency) + ".svg";
}

export function getFallbackIcon(currency: string) {
  const badgeText = currency.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase() || "?";

  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="24" fill="#e0f4ec"/><text x="24" y="30" text-anchor="middle" font-family="Arial" font-size="14" font-weight="700" fill="#126c53">' +
        badgeText +
        "</text></svg>",
    )
  );
}
