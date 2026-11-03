export type ElementKind = 'text' | 'image' | 'shape';

export type DesignElement = {
  id: string;
  pageId: string;
  kind: ElementKind;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
};

export const elementKindLabel: Record<ElementKind, string> = {
  text: 'نص',
  image: 'صورة',
  shape: 'شكل',
};

export const elementKindIcon: Record<ElementKind, string> = {
  text: 'T',
  image: '▧',
  shape: '◇',
};

export function createElementDraft(pageId: string, kind: ElementKind, index: number): DesignElement {
  const config: Record<ElementKind, Pick<DesignElement, 'name' | 'width' | 'height' | 'content' | 'color'>> = {
    text: { name: 'عنوان نصي', width: 150, height: 48, content: 'عنوان جديد', color: '#24231F' },
    image: { name: 'إطار صورة', width: 180, height: 120, content: 'ضع الصورة هنا', color: '#D8C8B8' },
    shape: { name: 'شكل هندسي', width: 120, height: 80, content: 'مستطيل', color: '#D77A61' },
  };
  const selected = config[kind];
  return {
    id: `element-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    pageId,
    kind,
    x: 24 + ((index - 1) % 3) * 18,
    y: 32 + ((index - 1) % 4) * 22,
    ...selected,
    name: `${selected.name} ${index}`,
  };
}

export type ElementCommand = {
  id: string;
  label: string;
  element: DesignElement;
  direction: 'add' | 'delete';
};

export type CommandHistory = {
  past: ElementCommand[];
  future: ElementCommand[];
};

export const emptyCommandHistory: CommandHistory = { past: [], future: [] };

export function executeCommand(elements: DesignElement[], command: ElementCommand): DesignElement[] {
  if (command.direction === 'add') return [...elements, command.element];
  return elements.filter((element) => element.id !== command.element.id);
}

export function invertCommand(command: ElementCommand): ElementCommand {
  return { ...command, direction: command.direction === 'add' ? 'delete' : 'add' };
}
