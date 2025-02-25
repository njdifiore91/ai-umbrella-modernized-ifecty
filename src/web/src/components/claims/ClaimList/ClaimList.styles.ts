import styled from 'styled-components'; // v5.3.10
import { flexBetween, flexColumn, responsiveText } from '../../../styles/mixins';

/**
 * Container component for the claims list with responsive layout and accessibility features
 */
export const ClaimListContainer = styled.div`
  ${flexColumn};
  width: 100%;
  min-height: 100%;
  padding: ${({ theme }) => theme.spacing.scale.md};
  gap: ${({ theme }) => theme.spacing.scale.md};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    padding: ${({ theme }) => theme.spacing.scale.sm};
    gap: ${({ theme }) => theme.spacing.scale.sm};
  }

  /* Ensure proper focus management for keyboard navigation */
  &:focus-within {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main};
  }
`;

/**
 * Header component for claims list with responsive layout and action buttons
 */
export const ClaimListHeader = styled.div`
  ${flexBetween};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.scale.md};
  padding-bottom: ${({ theme }) => theme.spacing.scale.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.background.disabled};

  /* Typography settings for header text */
  h2 {
    ${responsiveText({
      fontSize: {
        xs: '1.5rem',
        sm: '1.75rem',
        md: '2rem'
      },
      fontWeight: 'semibold',
      accessibility: {
        minFontSize: '20px',
        maxFontSize: '32px',
        scaleRatio: 1.2
      }
    })};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.scale.sm};
  }
`;

/**
 * Accessible table component with responsive design and ARIA attributes
 */
export const ClaimTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid ${({ theme }) => theme.colors.background.disabled};
  border-radius: 4px;
  overflow: hidden;

  /* Accessibility attributes */
  &[role="table"] {
    caption-side: top;
  }

  /* Ensure table is scrollable on mobile */
  @media (max-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    max-width: 100vw;
    margin: 0 -${({ theme }) => theme.spacing.scale.sm};
    padding: 0 ${({ theme }) => theme.spacing.scale.sm};
  }
`;

/**
 * Table header with enhanced contrast and screen reader support
 */
export const ClaimTableHeader = styled.th`
  ${responsiveText({
    fontSize: {
      xs: '0.875rem',
      sm: '1rem'
    },
    fontWeight: 'semibold',
    accessibility: {
      minFontSize: '14px',
      maxFontSize: '16px',
      scaleRatio: 1.1
    }
  })};
  padding: ${({ theme }) => theme.spacing.scale.sm};
  text-align: left;
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.background.disabled};
  white-space: nowrap;

  /* Accessibility support */
  &[role="columnheader"] {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  }

  /* First and last cell border radius */
  &:first-child {
    padding-left: ${({ theme }) => theme.spacing.scale.md};
  }
  
  &:last-child {
    padding-right: ${({ theme }) => theme.spacing.scale.md};
  }
`;

/**
 * Interactive table row with hover states and keyboard navigation
 */
export const ClaimTableRow = styled.tr`
  transition: background-color 0.2s ease;

  /* Interactive states */
  &:hover {
    background: ${({ theme }) => theme.colors.background.paper};
  }

  &:focus-within {
    outline: none;
    background: ${({ theme }) => theme.colors.background.paper};
    box-shadow: inset 0 0 0 2px ${({ theme }) => theme.colors.primary.main};
  }

  /* Accessibility */
  &[role="row"] {
    cursor: pointer;
  }

  /* Alternating row colors for better readability */
  &:nth-child(even) {
    background: ${({ theme }) => theme.colors.background.default};
  }

  /* Border between rows */
  border-bottom: 1px solid ${({ theme }) => theme.colors.background.disabled};
  &:last-child {
    border-bottom: none;
  }
`;

/**
 * Table cell with responsive typography and proper alignment
 */
export const ClaimTableCell = styled.td`
  ${responsiveText({
    fontSize: {
      xs: '0.875rem',
      sm: '1rem'
    },
    accessibility: {
      minFontSize: '14px',
      maxFontSize: '16px',
      scaleRatio: 1.1
    }
  })};
  padding: ${({ theme }) => theme.spacing.scale.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  vertical-align: middle;

  /* Ensure minimum width on mobile */
  @media (max-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    min-width: 140px;
    white-space: nowrap;
  }

  /* First and last cell padding */
  &:first-child {
    padding-left: ${({ theme }) => theme.spacing.scale.md};
  }
  
  &:last-child {
    padding-right: ${({ theme }) => theme.spacing.scale.md};
  }

  /* Status cell specific styling */
  &[data-status] {
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }

  /* Accessibility support */
  &[role="cell"] {
    text-align: left;
  }
`;