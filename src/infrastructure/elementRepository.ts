import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import type { DesignElement, ElementKind } from '../domain/elements';

const DATABASE_NAME = 'books-designer.db';
let databasePromise: Promise<SQLiteDatabase> | null = null;

type ElementRow = {
  id: string;
  page_id: string;
  kind: ElementKind;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
};

async function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync(DATABASE_NAME).then(async (database) => {
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS elements (
          id TEXT PRIMARY KEY NOT NULL,
          page_id TEXT NOT NULL,
          kind TEXT NOT NULL,
          name TEXT NOT NULL,
          x REAL NOT NULL,
          y REAL NOT NULL,
          width REAL NOT NULL,
          height REAL NOT NULL,
          content TEXT NOT NULL,
          color TEXT NOT NULL,
          FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_elements_page ON elements(page_id);
      `);
      return database;
    });
  }
  return databasePromise;
}

function mapRow(row: ElementRow): DesignElement {
  return {
    id: row.id,
    pageId: row.page_id,
    kind: row.kind,
    name: row.name,
    x: row.x,
    y: row.y,
    width: row.width,
    height: row.height,
    content: row.content,
    color: row.color,
  };
}

export async function listElements(pageId: string): Promise<DesignElement[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<ElementRow>(
    'SELECT id, page_id, kind, name, x, y, width, height, content, color FROM elements WHERE page_id = ? ORDER BY rowid ASC',
    pageId
  );
  return rows.map(mapRow);
}

export async function saveElement(element: DesignElement): Promise<DesignElement> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO elements (id, page_id, kind, name, x, y, width, height, content, color)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       page_id = excluded.page_id,
       kind = excluded.kind,
       name = excluded.name,
       x = excluded.x,
       y = excluded.y,
       width = excluded.width,
       height = excluded.height,
       content = excluded.content,
       color = excluded.color`,
    element.id,
    element.pageId,
    element.kind,
    element.name,
    element.x,
    element.y,
    element.width,
    element.height,
    element.content,
    element.color
  );
  return element;
}

export async function deleteElement(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM elements WHERE id = ?', id);
}
