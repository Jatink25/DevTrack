import {
    useCallback,
    useLayoutEffect,
    useMemo,
    useState,
} from "react";
import { ThemeContext } from "./ThemeContext.js";

const STORAGE_KEY = "devtrack:theme";

function getInitialTheme() {
    try {
        return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
    } catch {
        return "light";
    }
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);

    useLayoutEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        document.documentElement.style.colorScheme = theme;

        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // The selected theme still applies for this session if storage is unavailable.
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((current) => (current === "dark" ? "light" : "dark"));
    }, []);
    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
