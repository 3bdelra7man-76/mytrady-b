// theme.js - global dark mode logic

function applyDarkModeFromStorage() {
    const html = document.documentElement;
    const savedMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedMode === 'dark' || (!savedMode && systemPrefersDark)) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
}

function toggleDarkMode() {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    localStorage.setItem('darkMode', isDark ? 'dark' : 'light');
}

// Apply dark mode on every page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyDarkModeFromStorage);
} else {
    applyDarkModeFromStorage();
}
