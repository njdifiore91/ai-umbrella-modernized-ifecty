import styled from 'styled-components'; // v5.3.10
import { flexBetween, flexColumn, ellipsis } from '../../../styles/mixins';

// Main container for the policy list with responsive layout
export const PolicyListContainer = styled.div`
  ${flexColumn};
  width: 100%;
  gap: ${({ theme }) => theme.spacing.scale.md};
  padding: ${({ theme }) => theme.spacing.compound.cardPadding};
  background-color: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.spacing.scale.xs};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  ${({ theme }) => theme.breakpoints.values.sm} {
    padding: ${({ theme }) => theme.spacing.compound.cardPadding};
  }
`;

// Enhanced table component with theme integration
export const PolicyTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.spacing.scale.xs};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;

  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}) {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

// Table header with enhanced typography and accessibility
export const TableHeader = styled.th`
  ${flexBetween};
  padding: ${({ theme }) => theme.spacing.scale.md};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: left;
  white-space: nowrap;
  border-bottom: 2px solid ${({ theme }) => theme.colors.form.border};
  transition: background-color 0.2s ease;

  &:first-child {
    border-top-left-radius: ${({ theme }) => theme.spacing.scale.xs};
  }

  &:last-child {
    border-top-right-radius: ${({ theme }) => theme.spacing.scale.xs};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}) {
    padding: ${({ theme }) => theme.spacing.scale.sm};
  }
`;

// Interactive table row with hover and focus states
export const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.form.border};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.elevated};
  }

  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: -2px;
  }

  &:last-child {
    border-bottom: none;
  }
`;

// Enhanced table cell with text handling and accessibility
export const TableCell = styled.td`
  ${ellipsis};
  padding: ${({ theme }) => theme.spacing.scale.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  max-width: 200px;
  vertical-align: middle;

  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}) {
    padding: ${({ theme }) => theme.spacing.scale.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
`;

// Status indicator cell with semantic colors
export const StatusCell = styled(TableCell)<{ status: 'active' | 'pending' | 'expired' }>`
  ${flexBetween};
  color: ${({ theme, status }) => {
    switch (status) {
      case 'active':
        return theme.colors.feedback.success.main;
      case 'pending':
        return theme.colors.feedback.warning.main;
      case 'expired':
        return theme.colors.feedback.error.main;
      default:
        return theme.colors.text.primary;
    }
  }};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

// Action cell with button styling
export const ActionCell = styled(TableCell)`
  ${flexBetween};
  gap: ${({ theme }) => theme.spacing.scale.sm};
  white-space: nowrap;
  width: 120px;

  button {
    padding: ${({ theme }) => `${theme.spacing.scale.xs} ${theme.spacing.scale.sm}`};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    border-radius: ${({ theme }) => theme.spacing.scale.xs};
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.primary.main};
      outline-offset: 2px;
    }
  }
`;

// Empty state container
export const EmptyState = styled.div`
  ${flexColumn};
  align-items: center;
  gap: ${({ theme }) => theme.spacing.scale.md};
  padding: ${({ theme }) => theme.spacing.scale.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;