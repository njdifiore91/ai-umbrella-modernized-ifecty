import { DefaultTheme } from 'styled-components'; // v5.3.10

// Color system with semantic variations and states
export const colors = {
  primary: {
    main: '#1976d2', // Primary brand color
    light: '#42a5f5',
    dark: '#1565c0',
    contrast: '#ffffff'
  },
  secondary: {
    main: '#9c27b0', // Secondary brand color
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrast: '#ffffff'
  },
  background: {
    default: '#ffffff', // Default background
    paper: '#f5f5f5', // Elevated surface color
    disabled: '#eeeeee'
  },
  text: {
    primary: '#212121', // Primary text
    secondary: '#757575', // Secondary text
    disabled: '#9e9e9e',
    hint: '#9e9e9e'
  },
  status: {
    error: '#d32f2f', // Error state
    warning: '#ed6c02', // Warning state
    info: '#0288d1', // Info state
    success: '#2e7d32' // Success state
  }
};

// Typography system with semantic variations
export const typography = {
  fontFamily: {
    primary: '"Roboto", "Helvetica", "Arial", sans-serif',
    secondary: '"Open Sans", "Helvetica", "Arial", sans-serif',
    monospace: '"Roboto Mono", monospace'
  },
  fontSize: {
    h1: '2.5rem', // 40px
    h2: '2rem', // 32px
    h3: '1.75rem', // 28px
    h4: '1.5rem', // 24px
    body1: '1rem', // 16px
    body2: '0.875rem', // 14px
    caption: '0.75rem', // 12px
    button: '0.875rem' // 14px
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2
  }
};

// Spacing system for consistent layout metrics
export const spacing = {
  base: 8, // Base spacing unit in pixels
  scale: {
    xxs: '0.25rem', // 4px
    xs: '0.5rem', // 8px
    sm: '1rem', // 16px
    md: '1.5rem', // 24px
    lg: '2rem', // 32px
    xl: '3rem', // 48px
    xxl: '4rem' // 64px
  },
  layout: {
    gutter: '2rem', // 32px
    margin: '1.5rem', // 24px
    padding: '1rem' // 16px
  }
};

// Breakpoint system with helper functions
export const breakpoints = {
  values: {
    xs: 0, // Extra small devices
    sm: 600, // Small devices
    md: 960, // Medium devices
    lg: 1280, // Large devices
    xl: 1920, // Extra large devices
    xxl: 2560 // Extra extra large devices
  },
  up: (key: string): string => {
    const value = breakpoints.values[key as keyof typeof breakpoints.values];
    return `@media (min-width: ${value}px)`;
  },
  down: (key: string): string => {
    const value = breakpoints.values[key as keyof typeof breakpoints.values];
    return `@media (max-width: ${value - 0.05}px)`;
  },
  between: (start: string, end: string): string => {
    const startValue = breakpoints.values[start as keyof typeof breakpoints.values];
    const endValue = breakpoints.values[end as keyof typeof breakpoints.values];
    return `@media (min-width: ${startValue}px) and (max-width: ${endValue - 0.05}px)`;
  }
};

// Z-index system for managing stacking contexts
export const zIndex = {
  layout: {
    header: 1000,
    footer: 1000,
    sidebar: 1100
  },
  overlay: {
    modal: 1300,
    drawer: 1200,
    popover: 1400,
    tooltip: 1500,
    snackbar: 1600
  }
};

// Type augmentation for styled-components DefaultTheme
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: typeof colors;
    typography: typeof typography;
    spacing: typeof spacing;
    breakpoints: typeof breakpoints;
    zIndex: typeof zIndex;
  }
}