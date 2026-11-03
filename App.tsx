import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { createProject, deleteProject, listProjects } from './src/infrastructure/projectRepository';
import { publicationTypeLabel, type Project, type PublicationType } from './src/domain/projects';
import { addPage, deletePage, getOrCreateDocument, listPages } from './src/infrastructure/documentRepository';
import { pageLayoutLabel, type Document, type Page } from './src/domain/documents';

type ThemeMode = 'light' | 'dark';

const initialProjectTypes: Array<{ value: PublicationType; label: string }> = [
  { value: 'editorial-magazine', label: 'مجلة' },
  { value: 'brand-profile', label: 'ملف تعريفي' },
  { value: 'book', label: 'كتاب' },
];

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [publicationType, setPublicationType] = useState<PublicationType>('editorial-magazine');
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const palette = useMemo(() => (theme === 'dark' ? darkPalette : lightPalette), [theme]);

  const refreshProjects = useCallback(async () => {
    try {
      setError(null);
      setProjects(await listProjects());
    } catch {
      setError('تعذر قراءة مكتبة المشاريع المحلية. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProjects();
  }, [refreshProjects]);

  async function handleCreateProject() {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setError('اكتب اسماً للمشروع أولاً.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const project = await createProject(normalizedTitle, publicationType);
      setProjects((current) => [project, ...current]);
      setTitle('');
      setShowCreateForm(false);
    } catch {
      setError('تعذر حفظ المشروع. تحقق من مساحة التخزين وحاول مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  }

  function confirmDelete(project: Project) {
    Alert.alert('حذف المشروع؟', `سيتم حذف «${project.title}» من الجهاز.`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteProject(project.id);
              setProjects((current) => current.filter((item) => item.id !== project.id));
            } catch {
              setError('تعذر حذف المشروع.');
            }
          })();
        },
      },
    ]);
  }

  if (selectedProject) {
    return <Workspace project={selectedProject} palette={palette} onBack={() => setSelectedProject(null)} />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.canvas }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.muted }]}>BOOKS DESIGNER / 02</Text>
            <Text style={[styles.title, { color: palette.ink }]}>مساحتك لصناعة{`\n`}المطبوعات.</Text>
          </View>
          <Pressable
            accessibilityLabel="تبديل المظهر"
            onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={[styles.themeButton, { borderColor: palette.line, backgroundColor: palette.surface }]}
          >
            <Text style={{ color: palette.ink, fontSize: 18 }}>{theme === 'dark' ? '☼' : '◐'}</Text>
          </Pressable>
        </View>

        <View style={[styles.hero, { backgroundColor: palette.hero, borderColor: palette.line }]}>
          <View style={styles.heroMark}>
            <View style={[styles.markBar, { backgroundColor: palette.accent }]} />
            <View style={[styles.markBar, styles.markBarShort, { backgroundColor: palette.ink }]} />
          </View>
          <Text style={[styles.heroLabel, { color: palette.muted }]}>EDITORIAL WORKSPACE</Text>
          <Text style={[styles.heroTitle, { color: palette.heroInk }]}>حوّل الفكرة إلى صفحة{`\n`}تُرى وتُحفظ.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowCreateForm((value) => !value)}
            style={[styles.primaryButton, { backgroundColor: palette.accent }]}
          >
            <Text style={styles.primaryButtonText}>{showCreateForm ? 'إغلاق النموذج' : 'إنشاء مشروع جديد'}</Text>
            <Text style={styles.primaryButtonArrow}>{showCreateForm ? '−' : '↗'}</Text>
          </Pressable>
        </View>

        {showCreateForm && (
          <View style={[styles.createForm, { backgroundColor: palette.surface, borderColor: palette.line }]}>
            <Text style={[styles.formLabel, { color: palette.muted }]}>اسم المشروع</Text>
            <TextInput
              autoFocus
              value={title}
              onChangeText={setTitle}
              placeholder="مثال: مجلة الفنون المعاصرة"
              placeholderTextColor={palette.muted}
              style={[styles.input, { color: palette.ink, borderColor: palette.line }]}
              returnKeyType="done"
              onSubmitEditing={() => void handleCreateProject()}
            />
            <Text style={[styles.formLabel, { color: palette.muted }]}>نوع المنشور</Text>
            <View style={styles.typeRow}>
              {initialProjectTypes.map((type) => {
                const selected = publicationType === type.value;
                return (
                  <Pressable
                    key={type.value}
                    onPress={() => setPublicationType(type.value)}
                    style={[styles.typeChip, { borderColor: selected ? palette.accent : palette.line, backgroundColor: selected ? palette.accent : 'transparent' }]}
                  >
                    <Text style={{ color: selected ? '#211B17' : palette.ink, fontSize: 12, fontWeight: '700' }}>{type.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable disabled={isSaving} onPress={() => void handleCreateProject()} style={[styles.saveButton, { backgroundColor: palette.ink }]}>
              {isSaving ? <ActivityIndicator color={palette.canvas} /> : <Text style={{ color: palette.canvas, fontWeight: '800' }}>حفظ في مكتبة المشاريع</Text>}
            </Pressable>
          </View>
        )}

        {error && (
          <Pressable onPress={() => setError(null)} style={[styles.errorBox, { backgroundColor: '#5B2925' }]}>
            <Text style={styles.errorText}>{error}</Text>
          </Pressable>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.ink }]}>مشاريعك الأخيرة</Text>
          <Text style={[styles.sectionMeta, { color: palette.muted }]}>{projects.length.toString().padStart(2, '0')} مشاريع</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingState}><ActivityIndicator color={palette.accent} /><Text style={[styles.stateText, { color: palette.muted }]}>نقرأ مكتبتك المحلية…</Text></View>
        ) : projects.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: palette.line }]}>
            <Text style={[styles.emptyTitle, { color: palette.ink }]}>ابدأ بمشروعك الأول</Text>
            <Text style={[styles.stateText, { color: palette.muted }]}>ستظهر المشاريع المحفوظة على هذا الجهاز هنا.</Text>
          </View>
        ) : (
          <View style={styles.projectList}>
            {projects.map((project) => (
              <Pressable key={project.id} onPress={() => setSelectedProject(project)} onLongPress={() => confirmDelete(project)} style={[styles.projectCard, { backgroundColor: palette.surface, borderColor: palette.line }]}>
                <View style={[styles.projectSwatch, { backgroundColor: project.accent }]}>
                  <Text style={styles.swatchGlyph}>Aa</Text>
                </View>
                <View style={styles.projectInfo}>
                  <Text style={[styles.projectType, { color: palette.muted }]}>{publicationTypeLabel[project.publicationType]}</Text>
                  <Text style={[styles.projectTitle, { color: palette.ink }]}>{project.title}</Text>
                  <Text style={[styles.projectUpdated, { color: palette.muted }]}>محفوظ محلياً · اضغط مطولاً للحذف</Text>
                </View>
                <Text style={[styles.cardArrow, { color: palette.muted }]}>↗</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: palette.muted }]}>محلي أولاً · عربي / English</Text>
          <Text style={[styles.footerText, { color: palette.muted }]}>v0.2</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type WorkspaceProps = {
  project: Project;
  palette: typeof darkPalette;
  onBack: () => void;
};

function Workspace({ project, palette, onBack }: WorkspaceProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspace = useCallback(async () => {
    try {
      setError(null);
      const currentDocument = await getOrCreateDocument(project.id, project.title);
      setDocument(currentDocument);
      setPages(await listPages(currentDocument.id));
    } catch {
      setError('تعذر فتح مساحة العمل المحلية.');
    } finally {
      setIsLoading(false);
    }
  }, [project.id, project.title]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  async function handleAddPage() {
    if (!document) return;
    try {
      const page = await addPage(document.id, 'editorial');
      setPages((current) => [...current, page]);
    } catch {
      setError('تعذر إضافة الصفحة.');
    }
  }

  function handleDeletePage(page: Page) {
    if (pages.length <= 1) {
      setError('يجب أن يحتوي المستند على صفحة واحدة على الأقل.');
      return;
    }
    Alert.alert('حذف الصفحة؟', `سيتم حذف «${page.title}» من المستند.`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deletePage(page.id);
              setPages((current) => current.filter((item) => item.id !== page.id));
            } catch {
              setError('تعذر حذف الصفحة.');
            }
          })();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.canvas }]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.workspaceTopbar}>
          <Pressable onPress={onBack} style={[styles.backButton, { borderColor: palette.line, backgroundColor: palette.surface }]}>
            <Text style={{ color: palette.ink, fontSize: 18 }}>‹</Text>
            <Text style={{ color: palette.ink, fontSize: 12, fontWeight: '700' }}>المشاريع</Text>
          </Pressable>
          <Text style={[styles.eyebrow, { color: palette.muted }]}>WORKSPACE / 01</Text>
        </View>

        <View style={[styles.workspaceHero, { backgroundColor: palette.surface, borderColor: palette.line }]}>
          <Text style={[styles.projectType, { color: palette.muted }]}>{publicationTypeLabel[project.publicationType]}</Text>
          <Text style={[styles.workspaceTitle, { color: palette.ink }]}>{project.title}</Text>
          <Text style={[styles.stateText, { color: palette.muted }]}>مساحة العمل المحلية · A4 · {pages.length} صفحات</Text>
        </View>

        {error && <Pressable onPress={() => setError(null)} style={[styles.errorBox, { backgroundColor: '#5B2925' }]}><Text style={styles.errorText}>{error}</Text></Pressable>}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.ink }]}>صفحات المستند</Text>
          <Text style={[styles.sectionMeta, { color: palette.muted }]}>إصدار {document?.revision ?? 1}</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingState}><ActivityIndicator color={palette.accent} /><Text style={[styles.stateText, { color: palette.muted }]}>نجهز مساحة العمل…</Text></View>
        ) : (
          <View style={styles.pageList}>
            {pages.map((page) => (
              <Pressable key={page.id} onLongPress={() => handleDeletePage(page)} style={[styles.pageCard, { backgroundColor: palette.surface, borderColor: palette.line }]}>
                <View style={[styles.pagePreview, { backgroundColor: page.background }]}>
                  <View style={[styles.pagePreviewLine, { backgroundColor: page.layout === 'cover' ? '#D77A61' : '#24231F' }]} />
                  <View style={styles.pagePreviewLineShort} />
                  <Text style={styles.pagePreviewNumber}>{page.ordinal.toString().padStart(2, '0')}</Text>
                </View>
                <View style={styles.pageInfo}>
                  <Text style={[styles.projectType, { color: palette.muted }]}>{pageLayoutLabel[page.layout]}</Text>
                  <Text style={[styles.projectTitle, { color: palette.ink }]}>{page.title}</Text>
                  <Text style={[styles.projectUpdated, { color: palette.muted }]}>اضغط مطولاً للحذف</Text>
                </View>
                <Text style={[styles.cardArrow, { color: palette.muted }]}>↗</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => void handleAddPage()} style={[styles.addPageButton, { borderColor: palette.accent }]}>
              <Text style={{ color: palette.accent, fontSize: 22 }}>＋</Text>
              <Text style={{ color: palette.accent, fontWeight: '800' }}>إضافة صفحة تحريرية</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const darkPalette = { canvas: '#11110F', surface: '#1A1A17', hero: '#E6DED0', heroInk: '#24231F', ink: '#F1ECE3', muted: '#9A968B', line: '#34342E', accent: '#D77A61' };
const lightPalette = { canvas: '#F4F1EB', surface: '#FFFFFF', hero: '#E6DED0', heroInk: '#24231F', ink: '#24231F', muted: '#77736A', line: '#D9D4CA', accent: '#B85C46' };

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 24, paddingBottom: 42 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  eyebrow: { fontSize: 11, letterSpacing: 1.6, marginBottom: 14, fontWeight: '700' },
  title: { fontSize: 33, lineHeight: 39, fontWeight: '800', letterSpacing: -0.7 },
  themeButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  hero: { minHeight: 270, borderRadius: 28, borderWidth: 1, padding: 24, justifyContent: 'space-between', marginBottom: 24 },
  heroMark: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 28 },
  markBar: { width: 8, height: 28, borderRadius: 4 },
  markBarShort: { height: 17 },
  heroLabel: { fontSize: 10, letterSpacing: 1.4, fontWeight: '800', marginTop: 12 },
  heroTitle: { fontSize: 26, lineHeight: 31, fontWeight: '800', marginTop: 8 },
  primaryButton: { minHeight: 50, paddingHorizontal: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 },
  primaryButtonText: { color: '#211B17', fontSize: 15, fontWeight: '800' },
  primaryButtonArrow: { color: '#211B17', fontSize: 20 },
  createForm: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 28 },
  formLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 12, minHeight: 48, paddingHorizontal: 14, fontSize: 14, textAlign: 'right', marginBottom: 14 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  saveButton: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  errorBox: { borderRadius: 14, padding: 13, marginBottom: 20 },
  errorText: { color: '#FFE7DF', fontSize: 12, lineHeight: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  sectionMeta: { fontSize: 12 },
  projectList: { gap: 12 },
  projectCard: { minHeight: 96, borderRadius: 20, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center' },
  projectSwatch: { width: 70, height: 70, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  swatchGlyph: { color: '#F4EEE5', fontSize: 25, fontWeight: '800', fontStyle: 'italic' },
  projectInfo: { flex: 1, paddingHorizontal: 14 },
  projectType: { fontSize: 11, marginBottom: 5 },
  projectTitle: { fontSize: 16, fontWeight: '800', marginBottom: 5 },
  projectUpdated: { fontSize: 10 },
  cardArrow: { fontSize: 18, paddingHorizontal: 4 },
  loadingState: { minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyState: { minHeight: 140, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { fontSize: 17, fontWeight: '800', marginBottom: 8 },
  stateText: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 34 },
  footerText: { fontSize: 11 },
  workspaceTopbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 },
  backButton: { minHeight: 40, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  workspaceHero: { borderRadius: 24, borderWidth: 1, padding: 22, marginBottom: 30 },
  workspaceTitle: { fontSize: 28, lineHeight: 34, fontWeight: '800', marginVertical: 8 },
  pageList: { gap: 12 },
  pageCard: { minHeight: 104, borderRadius: 20, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center' },
  pagePreview: { width: 70, height: 78, borderRadius: 10, padding: 10, justifyContent: 'flex-start' },
  pagePreviewLine: { height: 5, width: 34, borderRadius: 3, marginBottom: 7 },
  pagePreviewLineShort: { height: 3, width: 25, borderRadius: 2, backgroundColor: '#9A968B', marginBottom: 'auto' },
  pagePreviewNumber: { color: '#24231F', fontSize: 10, fontWeight: '800', alignSelf: 'flex-end' },
  pageInfo: { flex: 1, paddingHorizontal: 14 },
  addPageButton: { minHeight: 62, borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
});
