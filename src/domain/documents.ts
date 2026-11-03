export type Document = {
  id: string;
  projectId: string;
  title: string;
  pageWidth: number;
  pageHeight: number;
  revision: number;
};

export type Page = {
  id: string;
  documentId: string;
  ordinal: number;
  title: string;
  layout: 'blank' | 'cover' | 'editorial';
  background: string;
};

export const pageLayoutLabel: Record<Page['layout'], string> = {
  blank: 'صفحة فارغة',
  cover: 'غلاف',
  editorial: 'تحريرية',
};

export function createPageDraft(documentId: string, ordinal: number, layout: Page['layout'] = 'blank'): Page {
  return {
    id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    documentId,
    ordinal,
    title: ordinal === 1 ? 'الغلاف' : `صفحة ${ordinal}`,
    layout,
    background: layout === 'cover' ? '#E6DED0' : '#F7F3EC',
  };
}
