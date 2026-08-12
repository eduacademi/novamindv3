import { Type } from "@google/genai";
import { Request } from "express";
import { inferCategoryAndTags } from "./scraperService";
import { apiKeyRouter } from "./apiKeyRouter";

// Batch Gemini Categorizer helper function to analyze EACH link independently
export async function batchCategorizeWithGemini(req: Request, rawItems: any[]) {
  if (!rawItems || rawItems.length === 0) return rawItems;

  const items = rawItems.map((item) => {
    const heur = inferCategoryAndTags(item.url, item.title, item.description, item.platform);
    return {
      ...item,
      category: item.category || heur.category,
      tags: (item.tags && item.tags.length > 0) ? item.tags : heur.tags
    };
  });

  try {
    const payload = items.map((item, idx) => ({
      id: idx,
      url: item.url,
      platform: item.platform || "unknown",
      title: item.title || "",
      description: item.description || "",
      note: item.note || ""
    }));

    const prompt = `Sana aşağıda ${payload.length} adet farklı web bağlantısı/bookmark verisi veriyorum.
Lütfen HER BİR LİNKİ DİĞERLERİNDEN TAMAMEN BAĞIMSIZ OLARAK TEKER TEKER ANALİZ ET.
Her bir linkin konusuna en uygun spesifik Türkçe "category" (örneğin: Yazılım & AI, Tasarım & İllüstrasyon, Yemek & Tarif, Finans & Ekonomi, Müzik & Sanat, Spor & Sağlık, Haber & Siyaset, Üretkenlik, Oyun, Sinema & Dizi, Eğitim) ve 3-5 adet özgün Türkçe "tags" belirle.
ÇOK ÖNEMLİ: Her link kendi içeriğine özel kategorisini almalıdır; tüm linklere aynı kategoriyi verme!

Bağlantı Öğeleri:
${JSON.stringify(payload, null, 2)}

Çıktıyı 'categorized_items' dizisi olarak JSON yapısında döndür.`;

    return await apiKeyRouter.executeWithSmartRotation(req, async (aiClient) => {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              categorized_items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    category: { type: Type.STRING },
                    tags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["id", "category", "tags"]
                }
              }
            },
            required: ["categorized_items"]
          }
        }
      });

      const jsonText = response.text || "{}";
      const result = JSON.parse(jsonText);

      if (result.categorized_items && Array.isArray(result.categorized_items)) {
        result.categorized_items.forEach((catItem: any) => {
          const target = items[catItem.id];
          if (target) {
            if (catItem.category) target.category = catItem.category;
            if (Array.isArray(catItem.tags) && catItem.tags.length > 0) {
              target.tags = catItem.tags;
            }
          }
        });
      }

      return items;
    });

  } catch (err) {
    console.warn("Gemini batch categorize warning (fallback heuristics used):", err);
    return items;
  }
}

export async function categorizeSingleItemWithGemini(req: Request, itemData: any) {
  const { title, description, note, url, platform } = itemData;
  const prompt = `Lütfen aşağıdaki bookmark ve kişisel not verisini analiz et.
Türkçe dilde uygun tek bir ana Kategori ve 3-5 adet alakalı Türkçe etiket (tag) öner.

İçerik Detayları:
- Platform: ${platform || "Bilinmiyor"}
- Başlık: ${title || "Belirtilmemiş"}
- Açıklama: ${description || "Belirtilmemiş"}
- Kullanıcı Notu (En Önemli): ${note || "Henüz not eklenmedi"}
- URL: ${url || ""}

Yanıtını kesinlikle aşağıdaki JSON yapısında döndür:
{
  "category": "Kategori Adı (ör: Yazılım & AI, Tasarım & Stil, Üretkenlik, Finans, Sağlık & Yaşam, Yemek & Tarif)",
  "tags": ["etiket1", "etiket2", "etiket3"]
}`;

  return await apiKeyRouter.executeWithSmartRotation(req, async (aiClient) => {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["category", "tags"]
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  });
}

export async function generateMindmapWithGemini(req: Request, cards: any[]) {
  const cardsSummary = cards.map((c: any) => ({
    id: c.id,
    title: c.title || "İsimsiz Kart",
    note: c.note || "",
    category: c.category || "Genel",
    tags: c.tags || [],
    platform: c.platform
  }));

  const prompt = `Sen kişisel bir bilgi kütüphanesinden tema ve zihin haritası (Mind Map / Knowledge Graph) çıkaran uzman bir AI analistisin.

Sana kullanıcının kaydettiği kartların (başlıklar, kişisel notlar, kategoriler, etiketler) listesini veriyorum.
Bu verileri derinlemesine analiz et. Ortak temaları, ilişki ağlarını ve ana fikir kümelenmelerini çıkararak hiyerarşik bir Zihin Haritası JSON yapısı oluştur.

Girdi Kartları:
${JSON.stringify(cardsSummary, null, 2)}

Kurallar:
1. Kök düğümün (root node) label'ı "Kişisel Fikir Kütüphanem" veya kapsayıcı bir ana başlık olsun.
2. Root'un altındaki 1. seviye çocuklar ana temalar/alanlar olsun (ör: "Teknoloji & AI Yüzü", "Tasarım & Yaşam Biçimi", "Girişimcilik & Üretkenlik").
3. Her temanın altında 2. seviye alt başlıklar (sub-topics) ve kart kümelenmeleri oluştur.
4. Her düğümde (node) o konuyu temsil eden cardIds dizisini doğru doldur (Girdi kartlarındaki id'lerle tam eşleşmeli).
5. Kategori rengi için pastel renk kodları öner ("color" alanı, ör: "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B").
6. Tüm başlık ve açıklamalar duru ve ilham verici Türkçe ile yazılsın.

Çıktı JSON Şeması:
Düğüm yapısı: { "id": "string", "label": "string", "summary": "string", "color": "string", "cardIds": ["string"], "children": [ DüğümYapısı ] }`;

  return await apiKeyRouter.executeWithSmartRotation(req, async (aiClient) => {
    const response = await aiClient.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  });
}

export async function chatWithBookmarks(req: Request, options: { query: string; cards: any[] }) {
  const { query, cards } = options;

  const cardsData = cards.map((c: any) => ({
    title: c.title || "İsimsiz",
    note: c.note || "",
    description: c.description || "",
    category: c.category || "",
    url: c.url || ""
  }));

  const prompt = `Sen NovaMind uygulamasının yapay zeka asistanısın. Kullanıcı sana kendi kişisel kütüphanesindeki (kaydettiği bağlantılar, notlar ve yer imleri) verilerle ilgili bir soru soruyor.
Görevin, aşağıdaki kullanıcının verilerini inceleyerek onun sorusuna doğrudan, net ve arkadaşça bir dilde (Türkçe) yanıt vermek. Gerekirse ilgili içeriklerin bağlantılarını (URL) veya başlıklarını referans göster.

Kullanıcının Sorusu: "${query}"

Kullanıcının Verileri:
${JSON.stringify(cardsData, null, 2)}

Eğer kullanıcının sorusu mevcut verilerle tam olarak cevaplanamıyorsa, "Kütüphanenizde bu konuya dair doğrudan bir kayıt bulamadım ancak..." diyerek genel bilginle yardımcı olmaya çalış.`;

  return await apiKeyRouter.executeWithSmartRotation(req, async (aiClient) => {
    const response = await aiClient.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt
    });

    return response.text || "Üzgünüm, şu an cevap veremiyorum.";
  });
}

export async function generateIdeasWithGemini(req: Request, options: { mode: string; cards: any[]; selectedCardIds?: string[]; customPrompt?: string }) {
  const { mode, cards, selectedCardIds, customPrompt } = options;

  let modeInstruction = "";
  if (mode === "combine") {
    modeInstruction = `ÖZELLİK: "Bu İkisini Birleştir"
Seçilen veya öne çıkan kartlar arasındaki beklenmedik kesişim noktalarından özgün, yenilikçi proje, içerik, ürün veya girişim fikirleri sentezle.`;
  } else if (mode === "random") {
    modeInstruction = `ÖZELLİK: "Bugün Ne Üretsem?"
Kullanıcının kütüphanesindeki farklı alanlardan rastgele ve sıra dışı kombinasyonlar yaparak bugün hemen başlanabilecek ilham verici aksiyonel fikirler üret.`;
  } else {
    modeInstruction = `ÖZELLİK: Özel Fikir Beyin Fırtınası
Kullanıcının şu isteğine göre kütüphanesindeki notları harmanla: "${customPrompt || "Genel fikir üretimi"}"`;
  }

  const cardsData = cards.map((c: any) => ({
    id: c.id,
    title: c.title || "İsimsiz",
    note: c.note || "",
    category: c.category || "",
    tags: c.tags || [],
    platform: c.platform
  }));

  const prompt = `Sen dünyaca ünlü yaratıcı düşünce koçu ve inovasyon stratejistisin.
Kullanıcının kişisel kütüphanesinde biriktirdiği içerik notlarından güç alarak yepyeni, sürprizli ve yüksek katma değerli fikirler üreteceksin.

Mod: ${modeInstruction}

Kullanıcının Not Kütüphanesi:
${JSON.stringify(cardsData, null, 2)}

Seçili Kart ID'leri: ${JSON.stringify(selectedCardIds || [])}

Sana 3 adet yüksek kaliteli, heyecan verici fikir üretmeni öneriyorum.
Yanıtını aşağıdaki JSON şemasında dizi olarak ver:
[
  {
    "id": "idea-1",
    "title": "Çarpıcı Fikir Başlığı",
    "concept": "Fikrin ana konsepti ve arkasındaki yaratıcı mantık (2-3 cümle)",
    "targetAudience": "Kimler için veya hangi platformda uygulanabilir",
    "sourceCardIds": ["card_id1", "card_id2"],
    "sourceCardTitles": ["Kaynak Kart 1 Başlığı", "Kaynak Kart 2 Başlığı"],
    "actionSteps": ["Aksiyon adımı 1", "Aksiyon adımı 2", "Aksiyon adımı 3"],
    "potentialTags": ["tag1", "tag2"],
    "scoreReasoning": "Bu fikrin neden güçlü ve uygulamaya değer olduğuna dair kısa açıklama"
  }
]`;

  return await apiKeyRouter.executeWithSmartRotation(req, async (aiClient) => {
    const response = await aiClient.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText);
  });
}
