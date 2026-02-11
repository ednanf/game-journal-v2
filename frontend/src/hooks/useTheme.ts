import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

const setThemeColorMeta = (color: string) => {
    const meta = document.querySelector<HTMLMetaElement>(
        'meta[name="theme-color"]',
    );

    if (meta) {
        meta.setAttribute('content', color);
    }
};

export const useTheme = () => {
    // Lazy initializer: ensures this logic runs only once during state
    // initialization
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        if (stored) return stored; // Prefer stored theme if it exists

        // Fallback, only runs if no theme was previously set or first visit
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    });

    // Sync theme to DOM and localStorage after initial render and on theme
    // changes
    useEffect(() => {
        // Apply theme at the document root to drive CSS variables
        document.documentElement.setAttribute('data-theme', theme);

        // Persist theme preference
        localStorage.setItem(STORAGE_KEY, theme);

        // Set the color in index.html (for PWA theming)
        setThemeColorMeta(theme === 'dark' ? '#1e2228' : '#e0e5ec');
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return { theme, toggleTheme };
};
