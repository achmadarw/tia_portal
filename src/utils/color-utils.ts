/**
 * Utility functions for generating color variants from base colors
 * Used for roster shift colors in both PDF and UI
 */

/**
 * Convert RGB values to hex string
 */
function rgbToHex(r: number, g: number, b: number): string {
    return (
        '#' +
        [r, g, b]
            .map((x) => Math.round(x).toString(16).padStart(2, '0'))
            .join('')
    );
}

/**
 * Parse color from various formats (hex, hsl, rgb) to hex
 */
export function parseColorToHex(color: string): string {
    if (!color) return '#6B7280';

    // Already hex format
    if (color.startsWith('#')) {
        return color;
    }

    // HSL format: hsl(85, 70%, 50%)
    if (color.startsWith('hsl')) {
        const match = color.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
        if (match) {
            const h = parseInt(match[1]);
            const s = parseFloat(match[2]) / 100;
            const l = parseFloat(match[3]) / 100;
            return hslToHex(h, s, l);
        }
    }

    // RGB format: rgb(255, 0, 0)
    if (color.startsWith('rgb')) {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            return rgbToHex(r, g, b);
        }
    }

    return color;
}

/**
 * Convert HSL to hex
 */
function hslToHex(h: number, s: number, l: number): string {
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color);
    };
    return rgbToHex(f(0), f(8), f(4));
}

/**
 * Generate lighter/darker color variants for backgrounds, borders and text
 * Same algorithm as PDF template for consistency
 */
export function generateColorVariants(hexColor: string): {
    bg: string;
    border: string;
    text: string;
} {
    // Parse hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Generate lighter background: blend 55% white + 45% base color
    const bgR = Math.round(r * 0.45 + 255 * 0.55);
    const bgG = Math.round(g * 0.45 + 255 * 0.55);
    const bgB = Math.round(b * 0.45 + 255 * 0.55);
    const bg = rgbToHex(bgR, bgG, bgB);

    // Generate stronger border: blend 20% white + 80% base color
    const borderR = Math.round(r * 0.8 + 255 * 0.2);
    const borderG = Math.round(g * 0.8 + 255 * 0.2);
    const borderB = Math.round(b * 0.8 + 255 * 0.2);
    const border = rgbToHex(borderR, borderG, borderB);

    // Generate darker text: reduce brightness by 65%
    const textR = Math.round(r * 0.35);
    const textG = Math.round(g * 0.35);
    const textB = Math.round(b * 0.35);
    const text = rgbToHex(textR, textG, textB);

    return { bg, border, text };
}

/**
 * Get color variants for a shift
 * Handles both base color parsing and variant generation
 */
export function getShiftColorVariants(shiftColor: string): {
    bg: string;
    border: string;
    text: string;
} {
    const baseColor = parseColorToHex(shiftColor);
    return generateColorVariants(baseColor);
}
