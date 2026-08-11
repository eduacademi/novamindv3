import { getNeo4jDriver } from "../config/neo4j";

export interface GraphNodeResult {
  id: string;
  label: string;
  type: "root" | "category" | "card" | "tag";
  category?: string;
  platform?: string;
  note?: string;
  url?: string;
  tags?: string[];
  connections: string[];
}

export interface GraphLinkResult {
  source: string;
  target: string;
  type: string;
}

export interface UserGraphData {
  nodes: GraphNodeResult[];
  links: GraphLinkResult[];
}

export function getSession() {
  const driver = getNeo4jDriver();
  if (!driver) return null;
  const db = process.env.NEO4J_DATABASE;
  return db ? driver.session({ database: db }) : driver.session();
}

/**
 * Syncs a single Card and its relationships into Neo4j
 */
export async function syncCardToGraph(userId: string, card: any): Promise<boolean> {
  const session = getSession();
  if (!session) return false;
  try {
    const categoryName = card.category || (card.platform === "poem" ? "Şiir & Edebiyat" : "Genel Fikirler");
    const tags = Array.isArray(card.tags) ? card.tags : [];

    await session.executeWrite(async (tx) => {
      await tx.run(
        `
        MERGE (u:User {id: $userId})
        MERGE (c:Card {id: $cardId})
        SET c.title = $title,
            c.url = $url,
            c.platform = $platform,
            c.note = $note,
            c.category = $categoryName,
            c.updatedAt = timestamp()

        MERGE (u)-[:SAVED]->(c)

        FOREACH (_ IN CASE WHEN $categoryName IS NOT NULL AND $categoryName <> '' THEN [1] ELSE [] END |
          MERGE (cat:Category {name: $categoryName, userId: $userId})
          MERGE (c)-[:BELONGS_TO]->(cat)
        )

        WITH c
        UNWIND $tags AS tagName
        WITH c, tagName WHERE tagName IS NOT NULL AND tagName <> ''
        MERGE (t:Tag {name: tagName, userId: $userId})
        MERGE (c)-[:HAS_TAG]->(t)
        `,
        {
          userId,
          cardId: card.id,
          title: card.title || "İsimsiz Kart",
          url: card.url || "",
          platform: card.platform || "unknown",
          note: card.note || "",
          categoryName,
          tags,
        }
      );
    });

    return true;
  } catch (error) {
    console.error("Error syncing card to Neo4j:", error);
    return false;
  } finally {
    await session.close();
  }
}

/**
 * Syncs multiple cards into Neo4j in batch
 */
export async function syncAllCardsToGraph(userId: string, cards: any[]): Promise<boolean> {
  if (!cards || cards.length === 0) return true;
  const session = getSession();
  if (!session) return false;

  try {
    await session.executeWrite(async (tx) => {
      for (const card of cards) {
        const categoryName = card.category || (card.platform === "poem" ? "Şiir & Edebiyat" : "Genel Fikirler");
        const tags = Array.isArray(card.tags) ? card.tags : [];

        await tx.run(
          `
          MERGE (u:User {id: $userId})
          MERGE (c:Card {id: $cardId})
          SET c.title = $title,
              c.url = $url,
              c.platform = $platform,
              c.note = $note,
              c.category = $categoryName,
              c.updatedAt = timestamp()

          MERGE (u)-[:SAVED]->(c)

          FOREACH (_ IN CASE WHEN $categoryName IS NOT NULL AND $categoryName <> '' THEN [1] ELSE [] END |
            MERGE (cat:Category {name: $categoryName, userId: $userId})
            MERGE (c)-[:BELONGS_TO]->(cat)
          )

          WITH c
          UNWIND $tags AS tagName
          WITH c, tagName WHERE tagName IS NOT NULL AND tagName <> ''
          MERGE (t:Tag {name: tagName, userId: $userId})
          MERGE (c)-[:HAS_TAG]->(t)
          `,
          {
            userId,
            cardId: card.id,
            title: card.title || "İsimsiz Kart",
            url: card.url || "",
            platform: card.platform || "unknown",
            note: card.note || "",
            categoryName,
            tags,
          }
        );
      }
    });

    return true;
  } catch (error) {
    console.error("Error batch syncing cards to Neo4j:", error);
    return false;
  } finally {
    await session.close();
  }
}

/**
 * Deletes a card node from Neo4j
 */
export async function deleteCardFromGraph(userId: string, cardId: string): Promise<boolean> {
  const session = getSession();
  if (!session) return false;

  try {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `
        MATCH (u:User {id: $userId})-[:SAVED]->(c:Card {id: $cardId})
        DETACH DELETE c
        `,
        { userId, cardId }
      );
    });

    return true;
  } catch (error) {
    console.error("Error deleting card from Neo4j:", error);
    return false;
  } finally {
    await session.close();
  }
}

/**
 * Fetches the Knowledge Graph structure for a user from Neo4j
 */
export async function getUserGraph(userId: string): Promise<UserGraphData | null> {
  const session = getSession();
  if (!session) return null;

  try {
    const result = await session.executeRead(async (tx) => {
      return await tx.run(
        `
        MATCH (u:User {id: $userId})-[:SAVED]->(c:Card)
        OPTIONAL MATCH (c)-[:BELONGS_TO]->(cat:Category {userId: $userId})
        OPTIONAL MATCH (c)-[:HAS_TAG]->(t:Tag {userId: $userId})
        RETURN c, cat.name AS categoryName, collect(DISTINCT t.name) AS tags
        `,
        { userId }
      );
    });

    const nodesMap = new Map<string, GraphNodeResult>();
    const links: GraphLinkResult[] = [];
    const categoriesSet = new Set<string>();

    // Root node
    const rootId = "root-brain";
    nodesMap.set(rootId, {
      id: rootId,
      label: "NovaMind Zihin Merkezi (Neo4j Graph)",
      type: "root",
      connections: [],
    });

    result.records.forEach((record) => {
      const cardNode = record.get("c").properties;
      const categoryName = record.get("categoryName") || "Genel Fikirler";
      const tags = record.get("tags") || [];

      categoriesSet.add(categoryName);
      const catId = `cat-${categoryName}`;

      // Card Node
      nodesMap.set(cardNode.id, {
        id: cardNode.id,
        label: cardNode.title || "İsimsiz",
        type: "card",
        category: categoryName,
        platform: cardNode.platform,
        note: cardNode.note,
        url: cardNode.url,
        tags,
        connections: [catId],
      });

      // Link Card -> Category
      links.push({
        source: catId,
        target: cardNode.id,
        type: "BELONGS_TO",
      });
    });

    // Create Category nodes and links to Root
    categoriesSet.forEach((catName) => {
      const catId = `cat-${catName}`;
      nodesMap.set(catId, {
        id: catId,
        label: catName,
        type: "category",
        category: catName,
        connections: [rootId],
      });

      links.push({
        source: rootId,
        target: catId,
        type: "HAS_CATEGORY",
      });

      nodesMap.get(rootId)?.connections.push(catId);
    });

    return {
      nodes: Array.from(nodesMap.values()),
      links,
    };
  } catch (error) {
    console.error("Error reading user graph from Neo4j:", error);
    return null;
  } finally {
    await session.close();
  }
}
