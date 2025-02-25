import styled from 'styled-components'; // v5.3.10
import { flexBetween, hideScrollbar } from '../../../styles/mixins';

// Container component with responsive overflow handling and accessibility support
export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  ${hideScrollbar};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    margin: 0 -${({ theme }) => theme.spacing.scale.sm};
  }
`;

// Main table component with semantic theme tokens and responsive design
export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.background.default};
  border: 1px solid ${({ theme }) => theme.colors.text.disabled};
  border-radius: ${({ theme }) => theme.spacing.scale.xs};
  transition: all 0.2s ease-in-out;
  table-layout: fixed;
`;

// Styled table header with enhanced accessibility and semantic colors
export const TableHeader = styled.thead`
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.layout.header};
  box-shadow: 0 1px 0 ${({ theme }) => theme.colors.text.disabled};
`;

// Styled table body with optimized style computation
export const TableBody = styled.tbody`
  background: ${({ theme }) => theme.colors.background.default};
  transition: background-color 0.2s ease-in-out;
  
  &:empty {
    display: none;
  }
`;

// Styled table row with hover effects and focus states
export const TableRow = styled.tr<{ isSelected?: boolean }>`
  &:hover {
    background: ${({ theme }) => theme.colors.background.paper};
  }

  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: -2px;
  }

  ${({ isSelected, theme }) =>
    isSelected &&
    `
    background: ${theme.colors.primary.light}15;
    &:hover {
      background: ${theme.colors.primary.light}25;
    }
  `}
`;

// Styled table cell with responsive padding and semantic borders
export const TableCell = styled.td<{
  align?: 'left' | 'center' | 'right';
  width?: string;
}>`
  padding: ${({ theme }) => theme.spacing.scale.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.text.disabled};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.body2};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  text-align: ${({ align = 'left' }) => align};
  ${({ width }) => width && `width: ${width};`}
  
  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    padding: ${({ theme }) => theme.spacing.scale.xs};
    font-size: ${({ theme }) => theme.typography.fontSize.caption};
  }
`;

// Styled header cell with enhanced sort indicators and accessibility
export const TableHeaderCell = styled(TableCell).attrs({ as: 'th' })<{
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | undefined;
}>`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  white-space: nowrap;
  user-select: none;
  ${flexBetween};
  
  ${({ sortable }) =>
    sortable &&
    `
    cursor: pointer;
    padding-right: 24px;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      right: 8px;
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
    }
  `}
  
  ${({ sortDirection, theme }) =>
    sortDirection === 'asc' &&
    `
    &::after {
      border-bottom: 4px solid ${theme.colors.text.primary};
      border-top: none;
    }
  `}
  
  ${({ sortDirection, theme }) =>
    sortDirection === 'desc' &&
    `
    &::after {
      border-top: 4px solid ${theme.colors.text.primary};
      border-bottom: none;
    }
  `}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: -2px;
  }
`;