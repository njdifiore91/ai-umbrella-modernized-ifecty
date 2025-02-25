import styled from 'styled-components'; // v5.3.10
import { flexColumn, flexBetween, responsiveText } from '../../../styles/mixins';

export const Container = styled.div`
  ${flexColumn};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.scale.lg};
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease-in-out;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.values.md}) {
    padding: ${({ theme }) => theme.spacing.scale.md};
  }
`;

export const Header = styled.div`
  ${flexBetween};
  width: 100%;
  padding-bottom: ${({ theme }) => theme.spacing.scale.md};
  margin-bottom: ${({ theme }) => theme.spacing.scale.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.form.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.scale.sm};
  }
`;

export const Content = styled.div`
  ${flexColumn};
  width: 100%;
  gap: ${({ theme }) => theme.spacing.scale.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.values.md}) {
    gap: ${({ theme }) => theme.spacing.scale.sm};
  }
`;

export const Section = styled.div`
  ${flexColumn};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.scale.md};
  background: ${({ theme }) => theme.colors.background.default};
  border: 1px solid ${({ theme }) => theme.colors.form.border};
  border-radius: 4px;
  transition: border-color 0.2s ease-in-out;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light};
  }
`;

export const Label = styled.span`
  ${responsiveText({
    fontSize: {
      xs: '0.875rem',
      sm: '0.875rem',
      md: '1rem'
    },
    fontWeight: 'medium',
    accessibility: {
      minFontSize: '12px',
      maxFontSize: '16px',
      scaleRatio: 1.2
    }
  })};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.scale.xs};
`;

export const Value = styled.span`
  ${responsiveText({
    fontSize: {
      xs: '1rem',
      sm: '1rem',
      md: '1.125rem'
    },
    fontWeight: 'regular',
    accessibility: {
      minFontSize: '14px',
      maxFontSize: '18px',
      scaleRatio: 1.2
    }
  })};
  color: ${({ theme }) => theme.colors.text.primary};
  word-break: break-word;

  &:empty::before {
    content: '—';
    color: ${({ theme }) => theme.colors.text.disabled};
  }
`;

export const Row = styled.div`
  ${flexBetween};
  width: 100%;
  gap: ${({ theme }) => theme.spacing.scale.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.scale.sm};
  }
`;

export const Column = styled.div`
  ${flexColumn};
  flex: 1;
  min-width: 0; // Prevent flex items from overflowing
  gap: ${({ theme }) => theme.spacing.scale.xs};
`;

export const ActionButton = styled.button`
  ${responsiveText({
    fontSize: {
      xs: '0.875rem',
      sm: '0.875rem',
      md: '1rem'
    },
    fontWeight: 'medium'
  })};
  padding: ${({ theme }) => `${theme.spacing.scale.sm} ${theme.spacing.scale.md}`};
  color: ${({ theme }) => theme.colors.primary.contrast};
  background: ${({ theme }) => theme.colors.primary.main};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.form.disabled};
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;