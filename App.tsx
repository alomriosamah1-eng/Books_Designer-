import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type ThemeMode = 'light' | 'dark';

type ProjectCard = {
  title: string;
  type: string;
  updated: string;
  accent: string;
};

const projects: ProjectCard[] = [
  { title: 'مجلة الفنون المعاصرة', type: 'مجلة تحريرية', updated: 'محدث منذ ساعتين', accent: '#D77A61' },
  { title: 'دليل العلامة التجارية', type: 'ملف تعريفي', updated: 'محدث أمس', accent: '#7D8F78' },
];

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const palette = useMemo(() => (theme === 'dark' ? darkPalette : lightPalette), [theme]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.canvas }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.muted }]}>BOOKS DESIGNER / 01</Text>
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
          <Text style={[styles.heroTitle, { color: palette.ink }]}>حوّل الفكرة إلى صفحة{`\n`}تُرى وتُحفظ.</Text>
          <Pressable style={[styles.primaryButton, { backgroundColor: palette.accent }]}>
            <Text style={styles.primaryButtonText}>إنشاء مشروع جديد</Text>
            <Text style={styles.primaryButtonArrow}>↗</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.ink }]}>مشاريعك الأخيرة</Text>
          <Text style={[styles.sectionMeta, { color: palette.muted }]}>02 مشاريع</Text>
        </View>

        <View style={styles.projectList}>
          {projects.map((project) => (
            <Pressable key={project.title} style={[styles.projectCard, { backgroundColor: palette.surface, borderColor: palette.line }]}>
              <View style={[styles.projectSwatch, { backgroundColor: project.accent }]}>
                <Text style={styles.swatchGlyph}>Aa</Text>
              </View>
              <View style={styles.projectInfo}>
                <Text style={[styles.projectType, { color: palette.muted }]}>{project.type}</Text>
                <Text style={[styles.projectTitle, { color: palette.ink }]}>{project.title}</Text>
                <Text style={[styles.projectUpdated, { color: palette.muted }]}>{project.updated}</Text>
              </View>
              <Text style={[styles.cardArrow, { color: palette.muted }]}>↗</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: palette.muted }]}>محلي أولاً · عربي / English</Text>
          <Text style={[styles.footerText, { color: palette.muted }]}>v0.1</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const darkPalette = { canvas: '#11110F', surface: '#1A1A17', hero: '#E6DED0', ink: '#F1ECE3', muted: '#9A968B', line: '#34342E', accent: '#D77A61' };
const lightPalette = { canvas: '#F4F1EB', surface: '#FFFFFF', hero: '#E6DED0', ink: '#24231F', muted: '#77736A', line: '#D9D4CA', accent: '#B85C46' };

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 24, paddingBottom: 42 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  eyebrow: { fontSize: 11, letterSpacing: 1.6, marginBottom: 14, fontWeight: '700' },
  title: { fontSize: 33, lineHeight: 39, fontWeight: '800', letterSpacing: -0.7 },
  themeButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  hero: { minHeight: 270, borderRadius: 28, borderWidth: 1, padding: 24, justifyContent: 'space-between', marginBottom: 38 },
  heroMark: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 28 },
  markBar: { width: 8, height: 28, borderRadius: 4 },
  markBarShort: { height: 17 },
  heroLabel: { fontSize: 10, letterSpacing: 1.4, fontWeight: '800', marginTop: 12 },
  heroTitle: { fontSize: 26, lineHeight: 31, fontWeight: '800', marginTop: 8 },
  primaryButton: { minHeight: 50, paddingHorizontal: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 },
  primaryButtonText: { color: '#211B17', fontSize: 15, fontWeight: '800' },
  primaryButtonArrow: { color: '#211B17', fontSize: 20 },
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
  projectUpdated: { fontSize: 11 },
  cardArrow: { fontSize: 18, paddingHorizontal: 4 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 34 },
  footerText: { fontSize: 11 },
});
