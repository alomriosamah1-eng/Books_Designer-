export type PublicationType = 'editorial-magazine' | 'brand-profile' | 'book';

export type Project = {
  id: string;
  title: string;
  publicationType: PublicationType;
  updatedAt: string;
  accent: string;
};

export const publicationTypeLabel: Record<PublicationType, string> = {
  'editorial-magazine': 'مجلة تحريرية',
  'brand-profile': 'ملف تعريفي',
  book: 'كتاب',
};

export function createProjectDraft(title: string, publicationType: PublicationType = 'editorial-magazine'): Project {
  const now = new Date().toISOString();
  return {
    id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    publicationType,
    updatedAt: now,
    accent: publicationType === 'brand-profile' ? '#7D8F78' : publicationType === 'book' ? '#8B7BA7' : '#D77A61',
  };
}
