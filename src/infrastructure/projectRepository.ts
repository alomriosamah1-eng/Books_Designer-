import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { createProjectDraft, type Project, type PublicationType } from '../domain/projects';

type ProjectRow = {
  id: string;
  title: string;
  publication_type: PublicationType;
  updated_at: string;
  accent: string;
};

const DATABASE_NAME = 'books-designer.db';
let databasePromise: Promise<SQLiteDatabase> | null = null;

async function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync(DATABASE_NAME).then(async (database) => {
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          publication_type TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          accent TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
      `);
      return database;
    });
  }

  return databasePromise;
}

function mapRow(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    publicationType: row.publication_type,
    updatedAt: row.updated_at,
    accent: row.accent,
  };
}

export async function listProjects(): Promise<Project[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<ProjectRow>(
    'SELECT id, title, publication_type, updated_at, accent FROM projects ORDER BY updated_at DESC'
  );
  return rows.map(mapRow);
}

export async function saveProject(project: Project): Promise<Project> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO projects (id, title, publication_type, updated_at, accent)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       publication_type = excluded.publication_type,
       updated_at = excluded.updated_at,
       accent = excluded.accent`,
    project.id,
    project.title,
    project.publicationType,
    project.updatedAt,
    project.accent
  );
  return project;
}

export async function createProject(title: string, publicationType: PublicationType): Promise<Project> {
  const project = createProjectDraft(title, publicationType);
  return saveProject(project);
}

export async function deleteProject(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM projects WHERE id = ?', id);
}
