// Types for the VR Desktop application

export interface VirtualObject {
  id: string;
  type: 'book' | 'notepad' | 'folder' | 'file' | 'picture';
  name: string;
  filePath: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
}

export interface WorldState {
  currentDirectory: string;
  objects: VirtualObject[];
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  extension: string | null;
  isImage?: boolean;
  thumbnail?: string | null;
}

export type ObjectType = VirtualObject['type'];

export const FILE_TYPE_COLORS: Record<string, string> = {
  '.txt': '#f5f5dc',      // Beige - text files
  '.md': '#e8e8e8',       // Light gray - markdown
  '.json': '#ffd700',     // Gold - JSON
  '.js': '#f7df1e',       // Yellow - JavaScript
  '.ts': '#3178c6',       // Blue - TypeScript
  '.tsx': '#61dafb',      // Cyan - TSX
  '.jsx': '#61dafb',      // Cyan - JSX
  '.css': '#264de4',      // Blue - CSS
  '.html': '#e34c26',     // Orange - HTML
  '.pdf': '#ff0000',      // Red - PDF
  '.doc': '#2b579a',      // Blue - Word
  '.docx': '#2b579a',
  '.xls': '#217346',      // Green - Excel
  '.xlsx': '#217346',
  '.png': '#ff69b4',      // Pink - Images
  '.jpg': '#ff69b4',
  '.jpeg': '#ff69b4',
  '.gif': '#ff69b4',
  '.svg': '#ffb13b',      // Orange - SVG
  'folder': '#ffc107',    // Amber - Folders
  'default': '#cccccc',   // Gray - default
};

export function getFileColor(extension: string | null, isDirectory: boolean): string {
  if (isDirectory) return FILE_TYPE_COLORS['folder'];
  if (!extension) return FILE_TYPE_COLORS['default'];
  return FILE_TYPE_COLORS[extension.toLowerCase()] || FILE_TYPE_COLORS['default'];
}

export function getObjectTypeFromFile(entry: FileEntry): ObjectType {
  if (entry.isDirectory) return 'folder';

  // Check if it's an image
  if (entry.isImage) return 'picture';

  const ext = entry.extension?.toLowerCase();
  if (ext === '.txt' || ext === '.md' || ext === '.json') return 'notepad';
  if (ext === '.pdf' || ext === '.doc' || ext === '.docx') return 'book';

  return 'file';
}
