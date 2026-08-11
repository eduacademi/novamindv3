import { ScrapedMetadata, InferredCategory } from "../types/index";

// Helper for scraping OpenGraph meta tags from standard websites
export async function fetchOpenGraphMeta(url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const html = await response.text();

    const getMeta = (property: string) => {
      const match = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, "i"));
      return match ? match[1] : null;
    };

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = getMeta("og:title") || getMeta("twitter:title") || (titleMatch ? titleMatch[1] : null);
    const description = getMeta("og:description") || getMeta("twitter:description") || getMeta("description");
    const image = getMeta("og:image") || getMeta("twitter:image");
    const siteName = getMeta("og:site_name") || getMeta("author");

    return {
      title: title ? title.trim() : null,
      description: description ? description.trim() : null,
      thumbnail_url: image || null,
      author: siteName ? siteName.trim() : null
    };
  } catch (err) {
    return null;
  }
}

// Helper for fetching Threads post metadata
export async function fetchThreadsMeta(url: string): Promise<Omit<ScrapedMetadata, "url"> | null> {
  try {
    const cleanUrl = url.trim();
    const authorUrlMatch = cleanUrl.match(/threads\.(?:net|com)\/@([a-zA-Z0-9_.-]+)/i);
    let author = authorUrlMatch ? `@${authorUrlMatch[1]}` : null;

    const postIdMatch = cleanUrl.match(/\/post\/([A-Za-z0-9_-]+)/i) || cleanUrl.match(/\/t\/([A-Za-z0-9_-]+)/i);
    const postId = postIdMatch ? postIdMatch[1] : null;

    if (!postId) return null;

    let title: string | null = null;
    let description: string | null = null;
    let thumbnail_url: string | null = null;

    // Method 1: Fetch main post URL with Facebook Social Bot User-Agent to extract OpenGraph
    const targetUrl = author ? `https://www.threads.net/${author}/post/${postId}` : `https://www.threads.net/t/${postId}`;
    try {
      const ogRes = await fetch(targetUrl, {
        headers: {
          "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
        }
      });

      if (ogRes.ok) {
        const ogHtml = await ogRes.text();

        const ogImgMatch = ogHtml.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image)["']\s+content=["']([^"']+)["']/i) ||
                           ogHtml.match(/content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:image|twitter:image)["']/i);
        if (ogImgMatch && ogImgMatch[1]) {
          thumbnail_url = ogImgMatch[1]
            .replace(/&amp;/g, "&")
            .replace(/\\u0026/g, "&")
            .replace(/\\/g, "");
        }

        const ogDescMatch = ogHtml.match(/<meta\s+(?:property|name)=["'](?:og:description|twitter:description)["']\s+content=["']([^"']+)["']/i) ||
                            ogHtml.match(/content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:description|twitter:description)["']/i);
        if (ogDescMatch && ogDescMatch[1]) {
          description = ogDescMatch[1]
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .trim();
        }

        const ogTitleMatch = ogHtml.match(/<meta\s+(?:property|name)=["'](?:og:title|twitter:title)["']\s+content=["']([^"']+)["']/i);
        if (ogTitleMatch && ogTitleMatch[1]) {
          title = ogTitleMatch[1].replace(/&amp;/g, "&").trim();
        }
      }
    } catch (e) {
      console.warn("Threads OG fetch error, falling back to embed:", e);
    }

    // Method 2: Fallback to Embed HTML if description or thumbnail is missing
    if (!description || !thumbnail_url) {
      const embedUrl = `https://www.threads.net/embed/post/${postId}`;
      const res = await fetch(embedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
          "Sec-Fetch-Site": "same-origin"
        }
      });

      if (res.ok) {
        const html = await res.text();

        const userMatch = html.match(/"username"\s*:\s*"([^"]+)"/i) 
          || html.match(/@([a-zA-Z0-9_.-]+)/);
        if (userMatch && userMatch[1] && !author) {
          author = `@${userMatch[1]}`;
        }

        if (!description) {
          const textMatch = html.match(/"caption"\s*:\s*\{\s*"text"\s*:\s*"([^"]+)"/i)
            || html.match(/"text"\s*:\s*"([^"]{5,1000})"/i);

          if (textMatch && textMatch[1]) {
            description = textMatch[1]
              .replace(/\\n/g, "\n")
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\')
              .replace(/\\u([0-9a-fA-F]{4})/g, (_, cc) => String.fromCharCode(parseInt(cc, 16)));
          }
        }

        if (!thumbnail_url) {
          const mediaImages = [...html.matchAll(/https?:\\?\/\\?\/[^\s"'<>\\]+cdninstagram[^\s"'<>\\]*/gi)]
            .map(m => m[0].replace(/\\/g, "").replace(/&amp;/g, "&"))
            .filter(img => !img.includes("rsrc.php") && !img.includes("static") && !img.includes("profile_pic"));

          if (mediaImages.length > 0) {
            thumbnail_url = mediaImages[0];
          } else {
            const profImages = [...html.matchAll(/https?:\\?\/\\?\/[^\s"'<>\\]+cdninstagram[^\s"'<>\\]*/gi)]
              .map(m => m[0].replace(/\\/g, "").replace(/&amp;/g, "&"))
              .filter(img => img.includes("profile_pic"));
            if (profImages.length > 0) {
              thumbnail_url = profImages[0];
            }
          }
        }
      }
    }

    if (!title) {
      if (description) {
        const firstLine = description.split("\n")[0].trim();
        title = firstLine.length > 80 ? firstLine.substring(0, 80) + "..." : firstLine;
      } else if (author) {
        title = `${author} Threads Paylaşımı`;
      } else {
        title = "Threads Paylaşımı";
      }
    }

    return {
      title,
      description: description || "Threads paylaşım içeriği",
      thumbnail_url,
      author: author || "Threads Kullanıcısı",
      platform: "threads",
      metadata_source: (title || description) ? ("auto" as const) : ("manual" as const)
    };
  } catch (e) {
    return null;
  }
}

// Helper for fetching Instagram post metadata & thumbnail
export async function fetchInstagramMeta(url: string): Promise<Omit<ScrapedMetadata, "url"> | null> {
  try {
    const cleanUrl = url.trim();
    const shortcodeMatch = cleanUrl.match(/\/(?:p|reel|reels|tv|share\/p|share\/reel)\/([A-Za-z0-9_-]+)/i);
    const shortcode = shortcodeMatch ? shortcodeMatch[1] : null;

    let title: string | null = null;
    let description: string | null = null;
    let thumbnail_url: string | null = null;
    let author: string | null = null;

    const urlUserMatch = cleanUrl.match(/instagram\.com\/([a-zA-Z0-9_.-]+)\/(?:p|reel|reels|tv)\//i);
    if (urlUserMatch && urlUserMatch[1] && !["p", "reel", "reels", "tv", "share"].includes(urlUserMatch[1].toLowerCase())) {
      author = `@${urlUserMatch[1]}`;
    }

    try {
      const fbRes = await fetch(cleanUrl, {
        headers: {
          "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
        }
      });

      if (fbRes.ok) {
        const html = await fbRes.text();

        const ogImgMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image)["']\s+content=["']([^"']+)["']/i) ||
                           html.match(/content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:image|twitter:image)["']/i);
        if (ogImgMatch && ogImgMatch[1]) {
          thumbnail_url = ogImgMatch[1]
            .replace(/&amp;/g, "&")
            .replace(/\\u0026/g, "&")
            .replace(/\\/g, "");
        }

        const ogDescMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:description|twitter:description)["']\s+content=["']([^"']+)["']/i) ||
                            html.match(/content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:description|twitter:description)["']/i);
        if (ogDescMatch && ogDescMatch[1]) {
          let rawDesc = ogDescMatch[1]
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&#039;/g, "'")
            .trim();

          const parsed = rawDesc.match(/(?:[\d,.]+\s+(?:likes|Likes|beğeni),\s*[\d,.]+\s+(?:comments|Comments|yorum)\s*-\s*)?(?:(.*)\s+\(@?([a-zA-Z0-9_.-]+)\)|(.*))\s+on\s+Instagram:\s*["'“](.*)["'”]/s) ||
                         rawDesc.match(/(?:.*)\s+on\s+Instagram:\s*["'“](.*)["'”]/s);

          if (parsed) {
            if (parsed[2]) author = `@${parsed[2]}`;
            else if (parsed[1] && parsed[1].length < 30) author = parsed[1].trim();
            const extractedCaption = parsed[4] || parsed[1];
            if (extractedCaption && extractedCaption.length > 3) {
              description = extractedCaption;
            } else {
              description = rawDesc;
            }
          } else {
            description = rawDesc;
          }
        }

        const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:title|twitter:title)["']\s+content=["']([^"']+)["']/i) ||
                             html.match(/content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:title|twitter:title)["']/i);
        if (ogTitleMatch && ogTitleMatch[1]) {
          let rawTitle = ogTitleMatch[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim();
          const userFromTitle = rawTitle.match(/\(@?([a-zA-Z0-9_.-]+)\)/) || rawTitle.match(/^([a-zA-Z0-9_.-]+)\s+on\s+Instagram/i);
          if (userFromTitle && userFromTitle[1] && !author) {
            author = `@${userFromTitle[1]}`;
          }
          title = rawTitle;
        }
      }
    } catch (e) {
      console.warn("Instagram FB OG fetch error:", e);
    }

    if (shortcode && (!thumbnail_url || !description)) {
      const embedUrls = [
        `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
        `https://www.instagram.com/p/${shortcode}/embed/`
      ];

      for (const embedUrl of embedUrls) {
        if (thumbnail_url && description) break;
        try {
          const embedRes = await fetch(embedUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
              "Sec-Fetch-Site": "same-origin"
            }
          });

          if (embedRes.ok) {
            const html = await embedRes.text();

            if (!author) {
              const uMatch = html.match(/class=["']CaptionUsername["'][^>]*>([^<]+)</i) ||
                             html.match(/class=["']HeaderUsername["'][^>]*>([^<]+)</i) ||
                             html.match(/"username"\s*:\s*"([^"]+)"/i);
              if (uMatch && uMatch[1]) {
                author = `@${uMatch[1].replace(/^@/, "").trim()}`;
              }
            }

            if (!thumbnail_url) {
              const imgMatch = html.match(/<img[^>]+class=["']EmbeddedMediaImage["'][^>]+src=["']([^"']+)["']/i) ||
                               html.match(/<img[^>]+src=["']([^"']+)["'][^>]+class=["']EmbeddedMediaImage["']/i);
              if (imgMatch && imgMatch[1]) {
                thumbnail_url = imgMatch[1].replace(/&amp;/g, "&").replace(/\\u0026/g, "&").replace(/\\/g, "");
              } else {
                const allCdnImages = [...html.matchAll(/https?:\\?\/\\?\/[^\s"'<>\\]+(?:cdninstagram|fbcdn)[^\s"'<>\\]*/gi)]
                  .map(m => m[0].replace(/\\/g, "").replace(/&amp;/g, "&"))
                  .filter(img => !img.includes("rsrc.php") && !img.includes("static") && !img.includes("150x150") && !img.includes("profile_pic"));
                if (allCdnImages.length > 0) {
                  thumbnail_url = allCdnImages[0];
                }
              }
            }

            if (!description) {
              const captionMatch = html.match(/<div[^>]+class=["']Caption["'][^>]*>(.*?)<\/div>/s) ||
                                   html.match(/"caption"\s*:\s*\{\s*"text"\s*:\s*"([^"]+)"/i) ||
                                   html.match(/"caption"\s*:\s*"([^"]+)"/i);
              if (captionMatch && captionMatch[1]) {
                let cleanCaption = captionMatch[1]
                  .replace(/<[^>]+>/g, " ")
                  .replace(/\\n/g, "\n")
                  .replace(/\\"/g, '"')
                  .replace(/\\u([0-9a-fA-F]{4})/g, (_, cc) => String.fromCharCode(parseInt(cc, 16)))
                  .replace(/\s+/g, " ")
                  .trim();
                if (cleanCaption.length > 3) {
                  description = cleanCaption;
                }
              }
            }
          }
        } catch (e) {
          console.warn("Instagram Embed fetch error:", e);
        }
      }
    }

    if (!title || title.toLowerCase().includes("instagram") || title.length < 5) {
      if (description) {
        const firstLine = description.split("\n")[0].trim();
        title = firstLine.length > 80 ? firstLine.substring(0, 80) + "..." : firstLine;
      } else if (author) {
        title = `${author} Instagram Gönderisi`;
      } else {
        title = "Instagram Paylaşımı";
      }
    }

    return {
      title,
      description: description || (author ? `${author} Instagram gönderi açıklaması` : "Instagram görsel veya video içeriği"),
      thumbnail_url: thumbnail_url || null,
      author: author || "Instagram Kullanıcısı",
      platform: "instagram",
      metadata_source: (thumbnail_url || description) ? "auto" : ("manual" as const)
    };
  } catch (e) {
    console.error("fetchInstagramMeta error:", e);
    return null;
  }
}

// Helper function for fetching single URL metadata
export async function fetchSingleMetadata(url: string): Promise<ScrapedMetadata> {
  const cleanUrl = url.trim();
  const lower = cleanUrl.toLowerCase();

  // Instagram scraper
  if (lower.includes("instagram.com") || lower.includes("instagr.am")) {
    const instaData = await fetchInstagramMeta(cleanUrl);
    if (instaData) {
      return {
        url: cleanUrl,
        ...instaData
      };
    }
  }

  // YouTube oEmbed
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`;
      const resp = await fetch(oembedUrl);
      if (resp.ok) {
        const data = await resp.json();
        return {
          url: cleanUrl,
          title: data.title || "YouTube Videosu",
          description: `YouTube videosu - ${data.author_name || 'YouTube'}`,
          thumbnail_url: data.thumbnail_url || null,
          author: data.author_name || "YouTube",
          platform: "youtube",
          metadata_source: "auto"
        };
      }
    } catch (e) {}
  }

  // TikTok oEmbed
  if (lower.includes("tiktok.com")) {
    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
      const resp = await fetch(oembedUrl);
      if (resp.ok) {
        const data = await resp.json();
        return {
          url: cleanUrl,
          title: data.title || "TikTok İçeriği",
          description: data.author_name ? `@${data.author_name} paylaşımı` : "TikTok videosu",
          thumbnail_url: data.thumbnail_url || null,
          author: data.author_name ? `@${data.author_name}` : "TikTok",
          platform: "tiktok",
          metadata_source: "auto"
        };
      }
    } catch (e) {}
  }

  // Reddit oEmbed
  if (lower.includes("reddit.com") || lower.includes("redd.it")) {
    try {
      const oembedUrl = `https://www.reddit.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
      const resp = await fetch(oembedUrl);
      if (resp.ok) {
        const data = await resp.json();
        return {
          url: cleanUrl,
          title: data.title || "Reddit Gönderisi",
          description: data.author_name ? `Gönderen: u/${data.author_name}` : "Reddit tartışması",
          thumbnail_url: data.thumbnail_url || null,
          author: data.author_name ? `u/${data.author_name}` : "Reddit",
          platform: "reddit",
          metadata_source: "auto"
        };
      }
    } catch (e) {}
  }

  // Threads scraper
  if (lower.includes("threads.net") || lower.includes("threads.com")) {
    const threadsData = await fetchThreadsMeta(cleanUrl);
    if (threadsData) {
      return {
        url: cleanUrl,
        ...threadsData
      };
    }
  }

  // X / Twitter
  if (lower.includes("x.com") || lower.includes("twitter.com")) {
    const userMatch = cleanUrl.match(/(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)/i);
    const author = userMatch ? `@${userMatch[1]}` : null;
    return {
      url: cleanUrl,
      title: author ? `${author} X (Twitter) Paylaşımı` : "X (Twitter) Gönderisi",
      description: "X (Twitter) gönderisi ve bağlantısı",
      thumbnail_url: null,
      author,
      platform: "x",
      metadata_source: "auto"
    };
  }

  // General OpenGraph Scraper for Articles, Blogs, Pinterest, Instagram
  const ogData = await fetchOpenGraphMeta(cleanUrl);
  if (ogData && (ogData.title || ogData.description || ogData.thumbnail_url)) {
    let platform = "article";
    if (lower.includes("pinterest.com") || lower.includes("pin.it")) platform = "pinterest";
    if (lower.includes("instagram.com")) platform = "instagram";
    if (lower.includes("threads.net")) platform = "threads";

    return {
      url: cleanUrl,
      title: ogData.title || "Web Bağlantısı",
      description: ogData.description || null,
      thumbnail_url: ogData.thumbnail_url || null,
      author: ogData.author || null,
      platform,
      metadata_source: "auto"
    };
  }

  // Fallback domain-based format
  let domain = "";
  try {
    domain = new URL(cleanUrl).hostname.replace(/^www\./, "");
  } catch (e) {
    domain = cleanUrl;
  }

  let platform = "article";
  if (lower.includes("pinterest")) platform = "pinterest";
  if (lower.includes("instagram")) platform = "instagram";
  if (lower.includes("youtube")) platform = "youtube";

  return {
    url: cleanUrl,
    title: `${domain.toUpperCase()} Bağlantısı`,
    description: `${cleanUrl} adresinden kaydedilen içerik`,
    thumbnail_url: null,
    author: domain,
    platform,
    metadata_source: "manual"
  };
}

// Smart heuristic categorizer for fallback & immediate categorization
export function inferCategoryAndTags(url: string, title?: string | null, description?: string | null, platform?: string | null): InferredCategory {
  const text = `${url} ${title || ''} ${description || ''}`.toLowerCase();

  if (/react|vue|angular|javascript|typescript|python|coding|code|developer|github|yazılım|programlama|css|html|api|ai|gpt|gemini|llm|machine learning|yapay zeka|backend|frontend/i.test(text)) {
    return { category: "Yazılım & AI", tags: ["yazılım", "kodlama", "teknoloji"] };
  }
  if (/yemek|tarif|tatlı|pasta|mutfak|lezzet|pişir|fırın|restoran|kahve|gastronomi|tarif/i.test(text)) {
    return { category: "Yemek & Tarif", tags: ["yemek", "tarif", "mutfak"] };
  }
  if (/tasarım|design|figma|framer|ui|ux|art|çizim|illüstrasyon|grafik|mimari|dekorasyon|pinterest|poster/i.test(text)) {
    return { category: "Tasarım & Sanat", tags: ["tasarım", "ilham", "sanat"] };
  }
  if (/müzik|music|song|şarkı|albüm|playlist|spotify|sound|gitar|piyano|klip/i.test(text)) {
    return { category: "Müzik & Ses", tags: ["müzik", "şarkı", "ses"] };
  }
  if (/finans|borsa|dolar|euro|kripto|bitcoin|yatırım|hisse|para|ekonomi|bütçe/i.test(text)) {
    return { category: "Finans & Yatırım", tags: ["finans", "ekonomi", "yatırım"] };
  }
  if (/spor|fitness|diyet|egzersiz|sağlık|idman|futbol|basketbol|koşu|yoga/i.test(text)) {
    return { category: "Sağlık & Spor", tags: ["sağlık", "spor", "fitness"] };
  }
  if (/haber|news|siyaset|politika|gündem|gazete|dünya|ekonomi haber/i.test(text)) {
    return { category: "Haber & Gündem", tags: ["haber", "gündem"] };
  }
  if (/film|dizi|sinema|netflix|fragman|oyuncu|tiyatro|imdb/i.test(text)) {
    return { category: "Sinema & Dizi", tags: ["sinema", "film", "dizi"] };
  }
  if (/oyun|game|gaming|twitch|steam|playstation|xbox|espor/i.test(text)) {
    return { category: "Oyun & Eğlence", tags: ["oyun", "eğlence"] };
  }
  if (/kitap|makale|okuma|bilim|tarih|felsefe|eğitim|üniversite|ders|araştırma/i.test(text)) {
    return { category: "Eğitim & Bilim", tags: ["eğitim", "bilim", "okuma"] };
  }
  if (/üretkenlik|not|plan|organize|gelişim|motivasyon|alışkanlık/i.test(text)) {
    return { category: "Üretkenlik & Gelişim", tags: ["üretkenlik", "kişiselgelişim"] };
  }

  if (platform === "youtube") return { category: "Video & İçerik", tags: ["video", "youtube"] };
  if (platform === "tiktok") return { category: "Trend & Eğlence", tags: ["tiktok", "trend"] };
  if (platform === "instagram") return { category: "Sosyal Medya", tags: ["instagram", "görsel"] };
  if (platform === "pinterest") return { category: "Tasarım & Görsel", tags: ["pinterest", "ilham"] };
  if (platform === "reddit") return { category: "Tartışma & Topluluk", tags: ["reddit", "topluluk"] };
  if (platform === "x") return { category: "Gündem & Sosyal Medya", tags: ["x", "tweet"] };

  return { category: "Genel Kültür & Web", tags: ["web", "içerik"] };
}
