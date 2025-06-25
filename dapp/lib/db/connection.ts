import { Client } from "pg";

// Database connection singleton
let client: Client | null = null;

export function getDatabaseClient(): Client {
  if (!client) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is required");
    }

    client = new Client({
      connectionString,
    });

    // Connect to database
    client
      .connect()
      .then(() => {
        console.log("Connected to Nile database");
      })
      .catch((err) => {
        console.error("Failed to connect to database:", err);
      });
  }

  return client;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.end();
    client = null;
  }
}
