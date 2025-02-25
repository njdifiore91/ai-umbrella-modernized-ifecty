import React from 'react'; // v18.2.0
import { ThemeProvider as StyledThemeProvider, DefaultTheme } from 'styled-components'; // v5.3.10
import { lightTheme, darkTheme } from '../../styles/theme';

// Storage key for theme preference persistence
const STORAGE_KEY = 'theme-preference';

// CSS class for theme transition animations
const THEME_TRANSITION_CLASS = 'theme-transition';

// Theme context type definition
interface ThemeContextType {
  theme: DefaultTheme;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

// Create theme context with default light theme
const ThemeContext = React.createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
  isDarkMode: false
});

// Theme provider props type
interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Theme provider component that manages theme state and system preference
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme state from storage or system preference
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Current theme based on dark mode state
  const theme = React.useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

  // Handle system color scheme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Toggle theme with transition animation
  const toggleTheme = React.useCallback(() => {
    setIsDarkMode(prev => {
      const newTheme = !prev ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, newTheme);
      
      // Add transition class
      document.documentElement.classList.add(THEME_TRANSITION_CLASS);
      
      // Remove transition class after animation
      setTimeout(() => {
        document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
      }, 300);
      
      return !prev;
    });
  }, []);

  // Context value with memoization
  const contextValue = React.useMemo(
    () => ({
      theme,
      toggleTheme,
      isDarkMode
    }),
    [theme, toggleTheme, isDarkMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook for accessing theme context with type safety
 * @throws {Error} When used outside of ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = React.useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// Export context for direct access if needed
export default ThemeContext;