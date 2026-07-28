export function decodeHTMLEntities(text: string | null | undefined): string {
  if (!text) return "";

  // Step 1: Handle Hex entities like &#xe7;, &#x131;, &#x11f;, &#xf6;, &#x15f;, &#xe2;
  let decoded = text.replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch {
      return _;
    }
  });

  // Step 2: Handle Decimal entities like &#231;
  decoded = decoded.replace(/&#([0-9]+);/g, (_, dec) => {
    try {
      return String.fromCharCode(parseInt(dec, 10));
    } catch {
      return _;
    }
  });

  // Step 3: Use DOM parser or textarea element in browser environment if entities remain
  if (typeof document !== "undefined" && decoded.includes("&")) {
    try {
      const txt = document.createElement("textarea");
      txt.innerHTML = decoded;
      if (txt.value) {
        decoded = txt.value;
      }
    } catch {
      // ignore
    }
  }

  // Named entities fallback
  const namedEntities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#039;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
    "&ccedil;": "ç",
    "&Ccedil;": "Ç",
    "&ouml;": "ö",
    "&Ouml;": "Ö",
    "&uuml;": "ü",
    "&Uuml;": "Ü",
    "&gbreve;": "ğ",
    "&Gbreve;": "Ğ",
    "&scedil;": "ş",
    "&Scedil;": "Ş",
    "&Icirc;": "Î",
    "&icirc;": "î",
  };

  decoded = decoded.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
    if (namedEntities[match]) return namedEntities[match];
    return match;
  });

  return decoded;
}
