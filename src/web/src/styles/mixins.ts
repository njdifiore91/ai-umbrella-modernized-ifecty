import { css } from 'styled-components'; // v5.3.10
import { breakpoints, typography } from './variables';

// Flexbox layout mixins
export const flexCenter = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const flexBetween = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const flexColumn = css`
  display: flex;
  flex-direction: column;
`;

// Text truncation mixin
export const ellipsis = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Hide scrollbar while maintaining functionality
export const hideScrollbar = css`
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

// Types for responsive text options
type Breakpoint = keyof typeof breakpoints.values;

interface ResponsiveTextOptions {
  fontSize: Partial<Record<Breakpoint, string>>;
  lineHeight?: Partial<Record<Breakpoint, string>>;
  fontWeight?: keyof typeof typography.fontWeight;
  letterSpacing?: string;
  accessibility?: {
    minFontSize?: string;
    maxFontSize?: string;
    scaleRatio?: number;
  };
}

/**
 * Generates responsive typography styles with accessibility considerations
 * @param options Configuration object for responsive text styles
 * @returns CSS template literal with responsive typography styles
 */
export const responsiveText = (options: ResponsiveTextOptions) => {
  const {
    fontSize,
    lineHeight = {},
    fontWeight = 'regular',
    letterSpacing = 'normal',
    accessibility = {
      minFontSize: '14px',
      maxFontSize: '24px',
      scaleRatio: 1.2
    }
  } = options;

  // Validate font size entries against breakpoints
  const validBreakpoints = Object.keys(breakpoints.values) as Breakpoint[];
  const validatedFontSizes = Object.entries(fontSize).reduce((acc, [key, value]) => {
    if (validBreakpoints.includes(key as Breakpoint)) {
      acc[key as Breakpoint] = value;
    }
    return acc;
  }, {} as Partial<Record<Breakpoint, string>>);

  // Base styles
  let styles = css`
    font-weight: ${typography.fontWeight[fontWeight]};
    letter-spacing: ${letterSpacing};
    font-family: ${typography.fontFamily.primary};
    
    /* Ensure minimum accessibility standards */
    font-size: clamp(
      ${accessibility.minFontSize},
      ${validatedFontSizes.xs || '1rem'},
      ${accessibility.maxFontSize}
    );
    line-height: ${lineHeight.xs || typography.lineHeight.normal};
  `;

  // Generate media queries for each breakpoint
  validBreakpoints.forEach((breakpoint) => {
    if (validatedFontSizes[breakpoint]) {
      styles = css`
        ${styles}
        ${breakpoints.up(breakpoint)} {
          font-size: clamp(
            ${accessibility.minFontSize},
            ${validatedFontSizes[breakpoint]},
            ${accessibility.maxFontSize}
          );
          line-height: ${lineHeight[breakpoint] || typography.lineHeight.normal};
          /* Scale letter spacing proportionally */
          letter-spacing: calc(${letterSpacing} * ${accessibility.scaleRatio});
        }
      `;
    }
  });

  return styles;
};

// Grid layout mixins
export const gridContainer = css`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: ${typography.fontSize.body1};
`;

// Responsive container mixin
export const responsiveContainer = css`
  width: 100%;
  margin: 0 auto;
  padding: 0 ${typography.fontSize.body1};

  ${breakpoints.up('sm')} {
    max-width: ${breakpoints.values.sm}px;
  }

  ${breakpoints.up('md')} {
    max-width: ${breakpoints.values.md}px;
  }

  ${breakpoints.up('lg')} {
    max-width: ${breakpoints.values.lg}px;
  }

  ${breakpoints.up('xl')} {
    max-width: ${breakpoints.values.xl}px;
  }
`;

// Focus styles for accessibility
export const focusOutline = css`
  outline: 2px solid transparent;
  outline-offset: 2px;
  
  &:focus-visible {
    outline-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.background.default},
                0 0 0 4px ${({ theme }) => theme.colors.primary.main};
  }
`;

// Interactive element hover states
export const interactiveHover = css`
  transition: all 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.1);
  }
  
  &:active {
    transform: translateY(0);
    filter: brightness(0.9);
  }
`;