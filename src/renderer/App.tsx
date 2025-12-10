import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from './components/CameraControls';
import { Room } from './components/Room';
import { Desk } from './components/Desk';
import { Shelf } from './components/Shelf';
import { Book } from './components/Book';
import { Notepad } from './components/Notepad';
import { Folder } from './components/Folder';
import { GenericFile } from './components/GenericFile';
import { Picture } from './components/Picture';
import { WallArt } from './components/WallArt';
import { Label3D } from './components/Label3D';
import { FileEntry, getFileColor, getObjectTypeFromFile } from './types';
import { actyraLogoSvg } from './assets/actyraLogo';

// Generate deterministic rotation based on file path hash
function getRotationFromPath(path: string, range: number): number {
  let hash = 0;
  for (let i = 0; i < path.length; i++) {
    hash = ((hash << 5) - hash) + path.charCodeAt(i);
    hash |= 0;
  }
  return ((hash % 1000) / 1000) * range - (range / 2);
}

interface FileViewerProps {
  file: { path: string; name: string; content: string; isImage?: boolean } | null;
  onClose: () => void;
  onSave: (path: string, content: string) => void;
}

function FileViewer({ file, onClose, onSave }: FileViewerProps) {
  const [content, setContent] = useState(file?.content ?? '');

  // Update content when file changes
  const fileContent = file?.content ?? '';
  useEffect(() => {
    setContent(fileContent);
  }, [fileContent]);

  if (!file) return null;

  // Image viewer
  if (file.isImage) {
    return (
      <>
        <div className="modal-backdrop" onClick={onClose} />
        <div className="file-viewer-modal image-viewer">
          <h2>
            {file.name}
            <button className="close-btn" onClick={onClose}>&times;</button>
          </h2>
          <div className="content image-content">
            <img src={file.content} alt={file.name} />
          </div>
          <div className="actions">
            <button className="cancel-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </>
    );
  }

  // Text file viewer
  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="file-viewer-modal">
        <h2>
          {file.name}
          <button className="close-btn" onClick={onClose}>&times;</button>
        </h2>
        <div className="content">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={() => onSave(file.path, content)}>Save</button>
        </div>
      </div>
    </>
  );
}

function Scene({
  files,
  onFileClick,
  onFolderClick,
  onHover,
  showNames,
}: {
  files: FileEntry[];
  onFileClick: (path: string) => void;
  onFolderClick: (path: string) => void;
  onHover: (name: string | null) => void;
  showNames: boolean;
}) {
  // Position files on desk and shelf
  const deskY = 0.85; // Desk surface height
  const shelfBaseY = 0.6; // First shelf height
  const shelfSpacing = 0.625; // Space between shelves

  // Separate files and folders
  const folders = files.filter(f => f.isDirectory);
  const regularFiles = files.filter(f => f.isFile);

  // Place folders on shelf
  const folderObjects = folders.slice(0, 8).map((folder, index) => {
    const shelfLevel = Math.floor(index / 4);
    const posOnShelf = index % 4;
    const x = -4.5 + posOnShelf * 0.35;
    const y = shelfBaseY + shelfLevel * shelfSpacing;
    const z = -3;

    return (
      <React.Fragment key={folder.path}>
        <Folder
          position={[x, y, z]}
          name={folder.name}
          filePath={folder.path}
          onClick={onFolderClick}
          onHover={onHover}
        />
        {showNames && (
          <Label3D
            text={folder.name}
            position={[x, y + 0.12, z + 0.05]}
          />
        )}
      </React.Fragment>
    );
  });

  // Place files on desk
  const fileObjects = regularFiles.slice(0, 10).map((file, index) => {
    const row = Math.floor(index / 5);
    const col = index % 5;
    const x = -0.8 + col * 0.35;
    const z = -2.6 - row * 0.25;

    const type = getObjectTypeFromFile(file);
    const color = getFileColor(file.extension, file.isDirectory);

    // Use deterministic rotation based on file path
    const rotation = getRotationFromPath(file.path, 0.2);

    // Label position above the object
    const labelY = deskY + 0.25;

    if (type === 'picture' && file.thumbnail) {
      return (
        <React.Fragment key={file.path}>
          <Picture
            position={[x, deskY + 0.08, z]}
            rotation={[-Math.PI / 6, rotation, 0]}
            name={file.name}
            filePath={file.path}
            imageSrc={file.thumbnail}
            onClick={onFileClick}
            onHover={onHover}
          />
          {showNames && <Label3D text={file.name} position={[x, labelY, z]} />}
        </React.Fragment>
      );
    } else if (type === 'book') {
      return (
        <React.Fragment key={file.path}>
          <Book
            position={[x, deskY + 0.11, z]}
            rotation={[0, rotation, 0]}
            title={file.name}
            filePath={file.path}
            color={color}
            onClick={onFileClick}
            onHover={onHover}
          />
          {showNames && <Label3D text={file.name} position={[x, labelY, z]} />}
        </React.Fragment>
      );
    } else if (type === 'notepad') {
      return (
        <React.Fragment key={file.path}>
          <Notepad
            position={[x, deskY + 0.01, z]}
            rotation={[-Math.PI / 2, 0, rotation * 1.5]}
            title={file.name}
            filePath={file.path}
            color={color}
            preview={file.preview}
            onClick={onFileClick}
            onHover={onHover}
          />
          {showNames && <Label3D text={file.name} position={[x, labelY, z]} />}
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment key={file.path}>
          <GenericFile
            position={[x, deskY + 0.01, z]}
            rotation={[-Math.PI / 2, 0, rotation]}
            name={file.name}
            filePath={file.path}
            color={color}
            onClick={onFileClick}
            onHover={onHover}
          />
          {showNames && <Label3D text={file.name} position={[x, labelY, z]} />}
        </React.Fragment>
      );
    }
  });

  return (
    <>
      {/* Controls - unlimited zoom */}
      <CameraControls
        target={[0, 1, -2]}
        minDistance={0.1}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1}
        castShadow
      />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#fff5e0" />
      <hemisphereLight intensity={0.3} groundColor="#3d3d5c" />

      {/* Room elements */}
      <Room size={10} />
      <Desk position={[0, 0, -3]} />
      <Shelf position={[-4, 0, -4]} shelves={4} />

      {/* Actyra logo on wall behind desk */}
      <WallArt
        position={[0, 2.2, -4.9]}
        width={1.8}
        height={0.7}
        imageSrc={actyraLogoSvg}
        frameColor="#1a1a2e"
        frameWidth={0.05}
      />

      {/* File objects */}
      {folderObjects}
      {fileObjects}
    </>
  );
}

export default function App() {
  const [version, setVersion] = useState('0.1.0');
  const [currentDirectory, setCurrentDirectory] = useState<string>('');
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [openFile, setOpenFile] = useState<{ path: string; name: string; content: string; isImage?: boolean } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showNames, setShowNames] = useState(false);

  // Show toast message
  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Load initial data
  useEffect(() => {
    const init = async () => {
      try {
        const ver = await window.electronAPI.getAppVersion();
        setVersion(ver);

        const workspace = await window.electronAPI.getWorkspaceDirectory();
        setCurrentDirectory(workspace);

        const entries = await window.electronAPI.listDirectory(workspace);
        setFiles(entries);
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };

    init();
  }, []);

  // Load directory contents
  const loadDirectory = useCallback(async (path: string) => {
    try {
      const entries = await window.electronAPI.listDirectory(path);
      setFiles(entries);
      setCurrentDirectory(path);
    } catch (error) {
      console.error('Failed to load directory:', error);
      showToast('Failed to load directory');
    }
  }, [showToast]);

  // Handle file click - open in viewer
  const handleFileClick = useCallback(async (filePath: string) => {
    try {
      const result = await window.electronAPI.readFile(filePath);
      if (result.success && result.content !== undefined) {
        setOpenFile({
          path: filePath,
          name: result.name || 'Unknown',
          content: result.content,
          isImage: result.isImage,
        });
      } else {
        // If we can't read it as text, open externally
        await window.electronAPI.openFileExternal(filePath);
      }
    } catch (error) {
      console.error('Failed to open file:', error);
      showToast('Failed to open file');
    }
  }, [showToast]);

  // Handle folder click - navigate into it
  const handleFolderClick = useCallback((folderPath: string) => {
    loadDirectory(folderPath);
  }, [loadDirectory]);

  // Handle file save
  const handleSaveFile = useCallback(async (path: string, content: string) => {
    try {
      const result = await window.electronAPI.writeFile(path, content);
      if (result.success) {
        showToast('File saved!');
        setOpenFile(null);
      } else {
        showToast('Failed to save file');
      }
    } catch (error) {
      console.error('Failed to save file:', error);
      showToast('Failed to save file');
    }
  }, [showToast]);

  // Handle select directory
  const handleSelectDirectory = useCallback(async () => {
    try {
      const path = await window.electronAPI.selectDirectory();
      if (path) {
        loadDirectory(path);
        showToast('Directory loaded!');
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
    }
  }, [loadDirectory, showToast]);

  // Go up one directory level
  const handleGoUp = useCallback(() => {
    const parentPath = currentDirectory.split(/[/\\]/).slice(0, -1).join('/');
    if (parentPath) {
      loadDirectory(parentPath);
    }
  }, [currentDirectory, loadDirectory]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 2, 3], fov: 60 }}
        style={{ background: '#1a1a2e' }}
      >
        <color attach="background" args={['#1a1a2e']} />
        <Scene
          files={files}
          onFileClick={handleFileClick}
          onFolderClick={handleFolderClick}
          onHover={setHoveredItem}
          showNames={showNames}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="ui-overlay">
        {/* Top Bar */}
        <div className="top-bar">
          <h1>VR Desktop</h1>
          <span className="version">v{version}</span>
        </div>

        {/* Controls Panel */}
        <div className="controls-panel">
          <h3>Controls</h3>
          <button className="control-btn" onClick={handleSelectDirectory}>
            Open Folder...
          </button>
          <button className="control-btn" onClick={handleGoUp}>
            Go Up (Parent)
          </button>
          <button className="control-btn" onClick={() => loadDirectory(currentDirectory)}>
            Refresh
          </button>
          <button
            className={`control-btn ${showNames ? 'active' : ''}`}
            onClick={() => setShowNames(!showNames)}
          >
            {showNames ? 'Hide Names' : 'Show Names'}
          </button>
        </div>

        {/* Info Panel */}
        <div className="info-panel">
          <div>
            <kbd>Click</kbd> object to open &bull;
            <kbd>Drag</kbd> to rotate view &bull;
            <kbd>Scroll</kbd> to zoom
          </div>
          <div style={{ marginTop: 8, color: '#666', fontSize: 11 }}>
            {currentDirectory}
          </div>
        </div>
      </div>

      {/* File Viewer Modal */}
      <FileViewer
        file={openFile}
        onClose={() => setOpenFile(null)}
        onSave={handleSaveFile}
      />

      {/* Hover Tooltip */}
      {hoveredItem && (
        <div className="hover-tooltip">{hoveredItem}</div>
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
