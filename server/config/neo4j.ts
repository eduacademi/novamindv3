import neo4j, { Driver } from "neo4j-driver";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.NEO4J_URI || "bolt://localhost:7687";
const user = process.env.NEO4J_USER || process.env.NEO4J_USERNAME || "neo4j";
const password = process.env.NEO4J_PASSWORD || "password";

let driver: Driver | null = null;

export function getNeo4jDriver(): Driver | null {
  if (!process.env.NEO4J_URI && process.env.NODE_ENV === "production") {
    console.warn("⚠️ NEO4J_URI environment variable is not defined.");
  }

  if (!driver) {
    try {
      driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
        maxConnectionPoolSize: 50,
        connectionTimeout: 10000,
      });
      console.log("🔗 Neo4j Driver initialized.");
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
    console.log("🔌 Neo4j Driver closed.");
  }
}
