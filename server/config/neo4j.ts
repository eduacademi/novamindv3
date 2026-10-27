import neo4j, { Driver } from "neo4j-driver";

let driver: Driver | null = null;

/** Neo4j is optional: without NEO4J_URI every graph call is a fast no-op. */
export function getNeo4jDriver(): Driver | null {
  const uri = process.env.NEO4J_URI;
  if (!uri) return null;

  if (!driver) {
    try {
      const user = process.env.NEO4J_USER || process.env.NEO4J_USERNAME || "neo4j";
      const password = process.env.NEO4J_PASSWORD || "";
      driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
        maxConnectionPoolSize: 20,
        connectionTimeout: 8000,
      });
    } catch (error) {
      console.error("❌ Failed to initialize Neo4j Driver:", error);
      driver = null;
    }
  }
  return driver;
}

export async function closeNeo4jDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
