// Version service - localStorage persistence for versions
import type { Song, Version } from '../types';

const AUTOSAVE_KEY = 'lyriclab_autosave';
const VERSION_PREFIX = 'lyriclab_version_';
const VERSION_INDEX_KEY = 'lyriclab_version_index';
const TEMP_BACKUP_KEY = 'lyriclab_temp_backup';

interface VersionIndex {
  versions: VersionMeta[];
}

interface VersionMeta {
  id: string;
  label: string;
  timestamp: number;
  isAutoSave: boolean;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function saveAutoSave(song: Song): void {
  const version: Version = {
    id: 'autosave',
    label: '自动保存',
    timestamp: Date.now(),
    content: song,
    isAutoSave: true,
  };
  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(version));
}

export function loadAutoSave(): Version | null {
  const data = localStorage.getItem(AUTOSAVE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearAutoSave(): void {
  localStorage.removeItem(AUTOSAVE_KEY);
}

export function saveVersion(song: Song, label: string): Version {
  const version: Version = {
    id: generateId(),
    label,
    timestamp: Date.now(),
    content: song,
  };

  // Save version data
  localStorage.setItem(
    `${VERSION_PREFIX}${version.id}`,
    JSON.stringify(version)
  );

  // Update index
  const index = getVersionIndex();
  index.versions.unshift({
    id: version.id,
    label: version.label,
    timestamp: version.timestamp,
    isAutoSave: false,
  });
  localStorage.setItem(VERSION_INDEX_KEY, JSON.stringify(index));

  return version;
}

export function getVersion(id: string): Version | null {
  const data = localStorage.getItem(`${VERSION_PREFIX}${id}`);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function getAllVersions(): Version[] {
  const index = getVersionIndex();
  return index.versions
    .filter(v => !v.isAutoSave)
    .map(meta => {
      const version = getVersion(meta.id);
      return version || null;
    })
    .filter((v): v is Version => v !== null);
}

export function deleteVersion(id: string): void {
  localStorage.removeItem(`${VERSION_PREFIX}${id}`);

  const index = getVersionIndex();
  index.versions = index.versions.filter(v => v.id !== id);
  localStorage.setItem(VERSION_INDEX_KEY, JSON.stringify(index));
}

function getVersionIndex(): VersionIndex {
  const data = localStorage.getItem(VERSION_INDEX_KEY);
  if (!data) return { versions: [] };
  try {
    return JSON.parse(data);
  } catch {
    return { versions: [] };
  }
}

export function saveTempBackup(song: Song): void {
  localStorage.setItem(TEMP_BACKUP_KEY, JSON.stringify({
    timestamp: Date.now(),
    content: song,
  }));
}

export function loadTempBackup(): Song | null {
  const data = localStorage.getItem(TEMP_BACKUP_KEY);
  if (!data) return null;
  try {
    const backup = JSON.parse(data);
    return backup.content;
  } catch {
    return null;
  }
}

export function clearTempBackup(): void {
  localStorage.removeItem(TEMP_BACKUP_KEY);
}

export function getVersionMetaList(): VersionMeta[] {
  return getVersionIndex().versions;
}