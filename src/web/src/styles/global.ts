import { createGlobalStyle } from 'styled-components'; // v5.3.10
import { colors, typography, spacing } from './variables';
import { flexColumn } from './mixins';

export const GlobalStyle = createGlobalStyle`
  /* CSS Custom Properties for theming */
  :root {
    /* Color tokens */
    --color-primary: ${colors.primary.main};
    --color-primary-light: ${colors.primary.light};
    --color-primary-dark: ${colors.primary.dark};
    --color-primary-contrast: ${colors.primary.contrast};
    
    /* Background colors */
    --color-background: ${colors.background.default};
    --color-surface: ${colors.background.paper};
    --color-disabled: ${colors.background.disabled};
    
    /* Text colors */
    --color-text-primary: ${colors.text.primary};
    --color-text-secondary: ${colors.text.secondary};
    --color-text-disabled: ${colors.text.disabled};
    --color-text-hint: ${colors.text.hint};
    
    /* Status colors */
    --color-error: ${colors.status.error};
    --color-warning: ${colors.status.warning};
    --color-info: ${colors.status.info};
    --color-success: ${colors.status.success};
    
    /* Typography */
    --font-family-primary: ${typography.fontFamily.primary};
    --font-family-secondary: ${typography.fontFamily.secondary};
    --font-family-mono: ${typography.fontFamily.monospace};
    
    /* Spacing */
    --spacing-base: ${spacing.base}px;
    --spacing-gutter: ${spacing.layout.gutter};
    --spacing-margin: ${spacing.layout.margin};
    --spacing-padding: ${spacing.layout.padding};
  }

  /* Modern CSS Reset with accessibility considerations */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Improved handling of images within the layout flow */
  img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
    height: auto;
  }

  /* Remove built-in form typography styles */
  input, button, textarea, select {
    font: inherit;
  }

  /* Avoid text overflows */
  p, h1, h2, h3, h4, h5, h6 {
    overflow-wrap: break-word;
  }

  /* Create a root stacking context */
  #root {
    isolation: isolate;
    height: 100%;
    ${flexColumn}
  }

  /* Base styles */
  html {
    font-size: 100%;
    text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    font-smooth: always;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    scroll-behavior: smooth;
  }

  body {
    font-family: var(--font-family-primary);
    font-size: clamp(${typography.fontSize.body2}, 1vw + 0.75rem, ${typography.fontSize.body1});
    line-height: ${typography.lineHeight.normal};
    color: var(--color-text-primary);
    background-color: var(--color-background);
    min-height: 100vh;
    text-rendering: optimizeSpeed;
  }

  /* Typography */
  h1 {
    font-size: ${typography.fontSize.h1};
    line-height: ${typography.lineHeight.tight};
    font-weight: ${typography.fontWeight.bold};
    margin-bottom: ${spacing.scale.lg};
  }

  h2 {
    font-size: ${typography.fontSize.h2};
    line-height: ${typography.lineHeight.tight};
    font-weight: ${typography.fontWeight.semibold};
    margin-bottom: ${spacing.scale.md};
  }

  h3 {
    font-size: ${typography.fontSize.h3};
    line-height: ${typography.lineHeight.tight};
    font-weight: ${typography.fontWeight.medium};
    margin-bottom: ${spacing.scale.sm};
  }

  h4 {
    font-size: ${typography.fontSize.h4};
    line-height: ${typography.lineHeight.normal};
    font-weight: ${typography.fontWeight.medium};
    margin-bottom: ${spacing.scale.sm};
  }

  /* Links */
  a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color 0.2s ease, text-decoration 0.2s ease;

    &:hover {
      color: var(--color-primary-dark);
      text-decoration: underline;
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
      border-radius: 2px;
    }
  }

  /* Form elements */
  button {
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    padding: ${spacing.scale.xs} ${spacing.scale.sm};
    transition: all 0.2s ease;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
      border-radius: 2px;
    }
  }

  input, textarea, select {
    font-family: inherit;
    font-size: ${typography.fontSize.body1};
    padding: ${spacing.scale.xs} ${spacing.scale.sm};
    border: 1px solid var(--color-text-hint);
    border-radius: 4px;
    background-color: var(--color-background);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px ${colors.primary.light}40;
    }

    &:disabled {
      background-color: var(--color-disabled);
      cursor: not-allowed;
    }
  }

  /* Lists */
  ul, ol {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  /* Tables */
  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: ${spacing.scale.md};
  }

  th, td {
    padding: ${spacing.scale.xs} ${spacing.scale.sm};
    text-align: left;
    border-bottom: 1px solid var(--color-text-hint);
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* High contrast mode adjustments */
  @media (forced-colors: active) {
    * {
      border-color: ButtonText;
    }
  }

  /* Print styles */
  @media print {
    body {
      background: none;
      color: rgb(0 0 0 / 100%);
    }

    a {
      color: rgb(0 0 0 / 100%);
      text-decoration: underline;
    }
  }
`;

export default GlobalStyle;