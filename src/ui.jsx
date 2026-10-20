// Small shared helpers.

// css("display: flex; gap: 8px") -> { display: 'flex', gap: '8px' }
// Lets the layout keep plain CSS declarations while rendering through React.
export function css(text) {
  const out = {};
  text.split(';').forEach((decl) => {
    const i = decl.indexOf(':');
    if (i < 0) return;
    const prop = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    if (!prop) return;
    const key = prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    out[key] = value;
  });
  return out;
}

// Stroke icons on a 24px grid, one path each.
export const ICONS = {
  ocr: 'M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3M8 9h8M8 12h8M8 15h5',
  img: 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM21 16l-5-5-9 9M9 8a2 2 0 1 0 0 4a2 2 0 1 0 0-4',
  det: 'M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5M8 8h8v8H8z',
  txt: 'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 6a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3',
  sum: 'M4 6h16M4 10h16M4 14h9M4 18h6M15 17l2 2 4-5',
  ner: 'M4 6h16M4 18h10M4 10h9v4H4zM16 12h4',
  ts: 'M3 3v18h18M6 15l4-5 3 3 6-7',
  anom: 'M3 14l4-1 3 2 3-10 3 9 5-1M13 3a2 2 0 1 0 0 4a2 2 0 1 0 0-4',
  tab: 'M3 4h18v16H3zM3 10h18M3 15h18M9 4v16',
  note: 'M4 4h16v11l-5 5H4zM15 20v-5h5',
  label: 'M5 6V4h14v2M12 4v16M9 20h6',
  prep: 'M4 20L14 10M12 8l4 4M15 2v3M15 9v2M11 5.5h2M17.5 5.5H20M19.5 13v2.5M18.2 14.2h2.6',
  board: 'M3 4h7v6H3zM14 14h7v6h-7zM10 7h3a2 2 0 0 1 2 2v5',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
};

export function Icon({ d, name, size = 18, color = 'currentColor', width = 2, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>
      <path d={d || ICONS[name]} />
    </svg>
  );
}

export const CloseIcon = ({ size = 15, width = 2 }) => <Icon d="M6 6l12 12M18 6L6 18" size={size} width={width} />;
export const UploadIcon = ({ size = 26, color = '#0B6E5F' }) => <Icon d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" size={size} color={color} />;
export const FileIcon = ({ size = 18, color = '#0B6E5F' }) => <Icon d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5" size={size} color={color} />;

export function fileSize(bytes) {
  const kb = bytes / 1024;
  return kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round(kb)) + ' KB';
}
