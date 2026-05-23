import { Pool, type QueryResultRow } from "pg"

let poolSingleton: Pool | null = null
let initPromise: Promise<void> | null = null

function getPool() {
  if (poolSingleton) {
    return poolSingleton
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is required")
  }

  poolSingleton = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  })

  return poolSingleton
}

async function ensureDbInitialized() {
  if (initPromise) {
    return initPromise
  }

  initPromise = (async () => {
    const pool = getPool()
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS preset_votes (
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        preset_code TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        PRIMARY KEY (user_id, preset_code)
      );

      CREATE TABLE IF NOT EXISTS assistant_chats (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS assistant_chat_messages (
        id BIGSERIAL PRIMARY KEY,
        chat_id TEXT NOT NULL REFERENCES assistant_chats(id) ON DELETE CASCADE,
        position INT NOT NULL,
        role TEXT NOT NULL,
        kind TEXT NOT NULL,
        content TEXT NOT NULL,
        presets_json TEXT,
        created_at BIGINT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_preset_votes_code ON preset_votes(preset_code);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_assistant_chats_user_updated
        ON assistant_chats(user_id, updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_assistant_chat_messages_chat_position
        ON assistant_chat_messages(chat_id, position);
    `)
  })()

  return initPromise
}

export const pool = getPool()

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
) {
  // Keep auto-schema bootstrap for local/dev convenience (fresh DBs can run
  // without a separate migration step), but disable it in production to avoid
  // repeated CREATE TABLE/INDEX checks on request paths burning compute.
  if (process.env.NODE_ENV !== "production") {
    await ensureDbInitialized()
  }
  const pool = getPool()
  return pool.query<T>(text, params)
}
