import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { createPageDraft, type Document, type Page } from '../domain/documents';

const DATABASE_NAME = 'books-designer.db';
let databasePromise: Promise<SQLiteDatabase> | null = null;

type DocumentRow = {
  id: string;
  project_id: string;
  title: string;
  page_width: number;
  page_height: number;
  revision: number;
};

type PageRow = {
  id: string;
  document_id: string;
  ordinal: number;
  title: string;
  layout: Page['layout'];
  background: string;
};

async function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync(DATABASE_NAME).then(async (database) => {
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL UNIQUE,
          title TEXT NOT NULL,
          page_width REAL NOT NULL,
          page_height REAL NOT NULL,
          revision INTEGER NOT NULL DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS pages (
          id TEXT PRIMARY KEY NOT NULL,
          document_id TEXT NOT NULL,
          ordinal INTEGER NOT NULL,
          title TEXT NOT NULL,
          layout TEXT NOT NULL,
          background TEXT NOT NULL,
          FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE,
          UNIQUE(document_id, ordinal)
        );
        CREATE INDEX IF NOT EXISTS idx_pages_document_ordinal ON pages(document_id, ordinal);
      `);
      return database;
    });
  }

  return databasePromise;
}

function mapDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    pageWidth: row.page_width,
    pageHeight: row.page_height,
    revision: row.revision,
  };
}

function mapPage(row: PageRow): Page {
  return {
    id: row.id,
    documentId: row.document_id,
    ordinal: row.ordinal,
    title: row.title,
    layout: row.layout,
    background: row.background,
  };
}

export async function getOrCreateDocument(projectId: string, title: string): Promise<Document> {
  const database = await getDatabase();
  const existing = await database.getFirstAsync<DocumentRow>(
    'SELECT id, project_id, title, page_width, page_height, revision FROM documents WHERE project_id = ?',
    projectId
  );
  if (existing) return mapDocument(existing);

  const document: Document = {
    id: `document-${projectId}`,
    projectId,
    title,
    pageWidth: 210,
    pageHeight: 297,
    revision: 1,
  };
  await database.runAsync(
    `INSERT INTO documents (id, project_id, title, page_width, page_height, revision)
     VALUES (?, ?, ?, ?, ?, ?)`,
    document.id,
    document.projectId,
    document.title,
    document.pageWidth,
    document.pageHeight,
    document.revision
  );
  await database.runAsync(
    `INSERT INTO pages (id, document_id, ordinal, title, layout, background)
     VALUES (?, ?, ?, ?, ?, ?)`,
    `page-${document.id}-1`,
    document.id,
    1,
    'الغلاف',
    'cover',
    '#E6DED0'
  );
  return document;
}

export async function listPages(documentId: string): Promise<Page[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<PageRow>(
    'SELECT id, document_id, ordinal, title, layout, background FROM pages WHERE document_id = ? ORDER BY ordinal ASC',
    documentId
  );
  return rows.map(mapPage);
}

export async function addPage(documentId: string, layout: Page['layout'] = 'blank'): Promise<Page> {
  const database = await getDatabase();
  const lastPage = await database.getFirstAsync<{ ordinal: number }>(
    'SELECT ordinal FROM pages WHERE document_id = ? ORDER BY ordinal DESC LIMIT 1',
    documentId
  );
  const page = createPageDraft(documentId, (lastPage?.ordinal ?? 0) + 1, layout);
  await database.runAsync(
    `INSERT INTO pages (id, document_id, ordinal, title, layout, background)
     VALUES (?, ?, ?, ?, ?, ?)`,
    page.id,
    page.documentId,
    page.ordinal,
    page.title,
    page.layout,
    page.background
  );
  return page;
}

export async function deletePage(pageId: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM pages WHERE id = ?', pageId);
}
