import { themes, getTheme, mergeTheme } from '../src/themes';
import { ThemeName } from '../src/types';

describe('Themes', () => {
  describe('themes object', () => {
    it('should have all expected themes', () => {
      const expectedThemes: ThemeName[] = [
        'electric',
        'midnight',
        'aurora',
        'ember',
        'frost',
        'neon',
        'sunset',
        'ocean',
        'forest',
        'cyber',
      ];

      expectedThemes.forEach((theme) => {
        expect(themes[theme]).toBeDefined();
      });
    });

    it('should have all required color properties', () => {
      const requiredProps = [
        'background',
        'text',
        'textSecondary',
        'accent',
        'accentGlow',
        'border',
        'icon',
        'progressBackground',
        'progressFill',
      ];

      Object.values(themes).forEach((theme) => {
        requiredProps.forEach((prop) => {
          expect(theme).toHaveProperty(prop);
        });
      });
    });

    it('should have valid hex color values', () => {
      const hexColorRegex = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/;

      Object.values(themes).forEach((theme) => {
        expect(theme.background).toMatch(hexColorRegex);
        expect(theme.text).toMatch(hexColorRegex);
        expect(theme.accent).toMatch(hexColorRegex);
      });
    });
  });

  describe('getTheme', () => {
    it('should return the correct theme', () => {
      const electric = getTheme('electric');
      expect(electric.background).toBe('#0d1117');
      expect(electric.accent).toBe('#58a6ff');
    });

    it('should return electric theme as fallback for invalid theme name', () => {
      const fallback = getTheme('invalid' as ThemeName);
      expect(fallback).toEqual(themes.electric);
    });

    it('should return different themes correctly', () => {
      expect(getTheme('midnight').background).toBe('#0f0f23');
      expect(getTheme('aurora').background).toBe('#0a192f');
      expect(getTheme('ember').background).toBe('#1a0a0a');
      expect(getTheme('frost').background).toBe('#0a1628');
    });
  });

  describe('mergeTheme', () => {
    it('should return base theme when no custom colors provided', () => {
      const result = mergeTheme('electric');
      expect(result).toEqual(themes.electric);
    });

    it('should merge custom colors with base theme', () => {
      const customColors = {
        background: '#000000',
        accent: '#ff0000',
      };
      const result = mergeTheme('electric', customColors);

      expect(result.background).toBe('#000000');
      expect(result.accent).toBe('#ff0000');
      expect(result.text).toBe(themes.electric.text);
    });

    it('should not modify the original theme', () => {
      const originalBackground = themes.electric.background;
      mergeTheme('electric', { background: '#ffffff' });
      expect(themes.electric.background).toBe(originalBackground);
    });

    it('should work with partial custom colors', () => {
      const result = mergeTheme('midnight', { text: '#ffffff' });
      expect(result.text).toBe('#ffffff');
      expect(result.background).toBe(themes.midnight.background);
      expect(result.accent).toBe(themes.midnight.accent);
    });
  });
});
