// themes.ts — drop-in replacement / extension for github_strike
// Adds aurora-specific color fields to the existing Theme interface.
//
// New fields used by Aurora (and optionally other cards):
//   bgFrom      — top background color
//   bgTo        — bottom background color
//   accent      — primary highlight color
//   border      — card border color
//   text        — primary text
//   textMuted   — secondary text
//
// (These same fields are already used by the existing heatmap card,
//  so this file is fully backward-compatible.)

export interface Theme {
  bgFrom:    string;
  bgTo:      string;
  accent:    string;
  border:    string;
  text:      string;
  textMuted: string;
  // Heatmap fields (kept for backward compat)
  cellEmpty: string;
  cellLow:   string;
  cellHigh:  string;
}

export const themes: Record<string, Theme> = {
  electric: {
    bgFrom: '#020410', bgTo: '#060c28',
    accent: '#4af0ff', border: '#1d2a4a',
    text: '#e6edf3',   textMuted: '#4a5a70',
    cellEmpty: '#161b22', cellLow: '#0e4429', cellHigh: '#39d353',
  },
  midnight: {
    bgFrom: '#03010f', bgTo: '#0a0620',
    accent: '#cba6f7', border: '#2a1a4a',
    text: '#cdd6f4',   textMuted: '#5a4a7a',
    cellEmpty: '#1e1e3e', cellLow: '#2d1b69', cellHigh: '#cba6f7',
  },
  aurora: {
    bgFrom: '#020810', bgTo: '#041228',
    accent: '#64ffda', border: '#0e2a3a',
    text: '#ccd6f6',   textMuted: '#4a6a8a',
    cellEmpty: '#112240', cellLow: '#0d3d33', cellHigh: '#64ffda',
  },
  ember: {
    bgFrom: '#0e0400', bgTo: '#1a0800',
    accent: '#ff6b35', border: '#3a1a0a',
    text: '#ffd7be',   textMuted: '#7a4a30',
    cellEmpty: '#2d1010', cellLow: '#5a2000', cellHigh: '#ff6b35',
  },
  frost: {
    bgFrom: '#020810', bgTo: '#061828',
    accent: '#79c0ff', border: '#1a3050',
    text: '#e8f4fd',   textMuted: '#5a7a9a',
    cellEmpty: '#0f2040', cellLow: '#1a3a60', cellHigh: '#79c0ff',
  },
  neon: {
    bgFrom: '#04000a', bgTo: '#0a041a',
    accent: '#ff79c6', border: '#2a0a3a',
    text: '#f0f0f0',   textMuted: '#6a4a7a',
    cellEmpty: '#1a0a2e', cellLow: '#4d1060', cellHigh: '#ff79c6',
  },
  sunset: {
    bgFrom: '#0f060f', bgTo: '#1a0a18',
    accent: '#f48fb1', border: '#3a1030',
    text: '#fce4ec',   textMuted: '#7a4a5a',
    cellEmpty: '#2d1428', cellLow: '#5a1040', cellHigh: '#f48fb1',
  },
  ocean: {
    bgFrom: '#000810', bgTo: '#001020',
    accent: '#29b6f6', border: '#0a2030',
    text: '#b3e5fc',   textMuted: '#3a6a8a',
    cellEmpty: '#001e33', cellLow: '#003d5c', cellHigh: '#29b6f6',
  },
  forest: {
    bgFrom: '#020802', bgTo: '#061006',
    accent: '#66bb6a', border: '#0a2a0a',
    text: '#c8e6c9',   textMuted: '#3a6a3a',
    cellEmpty: '#112211', cellLow: '#1b4d1b', cellHigh: '#66bb6a',
  },
  cyber: {
    bgFrom: '#010803', bgTo: '#030f05',
    accent: '#00ff41', border: '#0a2a0a',
    text: '#00ff41',   textMuted: '#2a5a2a',
    cellEmpty: '#0f1a12', cellLow: '#003b0f', cellHigh: '#00ff41',
  },
};

export function getTheme(name: string): Theme {
  return themes[name] ?? themes['electric'];
}
