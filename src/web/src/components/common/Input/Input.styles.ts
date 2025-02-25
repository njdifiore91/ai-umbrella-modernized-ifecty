import styled from 'styled-components'; // v5.3.10
import { flexColumn, responsiveText } from '../../../styles/mixins';

export const InputContainer = styled.div`
  ${flexColumn}
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.scale.md};
  position: relative;
`;

export const StyledInput = styled.input<{ error?: boolean; disabled?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.scale.sm} ${({ theme }) => theme.spacing.scale.md};
  border: 1px solid ${({ theme, error }) => 
    error ? theme.colors.status.error : theme.colors.text.secondary};
  border-radius: 4px;
  background-color: ${({ theme, disabled }) => 
    disabled ? theme.colors.background.disabled : theme.colors.background.default};
  color: ${({ theme }) => theme.colors.text.primary};
  
  ${responsiveText({
    fontSize: {
      xs: '0.875rem',
      sm: '1rem'
    },
    lineHeight: {
      xs: '1.5',
      sm: '1.5'
    },
    fontWeight: 'regular',
    accessibility: {
      minFontSize: '14px',
      maxFontSize: '16px',
      scaleRatio: 1.1
    }
  })}

  transition: all 0.2s ease-in-out;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.hint};
  }

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light}40;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    background-color: ${({ theme }) => theme.colors.background.paper};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme, error }) => 
      error ? theme.colors.status.error : theme.colors.text.secondary};

    &::placeholder {
      color: ${({ theme }) => theme.colors.text.disabled};
    }
  }

  /* Reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const InputLabel = styled.label`
  ${responsiveText({
    fontSize: {
      xs: '0.875rem',
      sm: '1rem'
    },
    fontWeight: 'medium',
    accessibility: {
      minFontSize: '14px',
      maxFontSize: '16px',
      scaleRatio: 1
    }
  })}
  
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.scale.xs};
  display: block;

  &[data-required='true']::after {
    content: '*';
    color: ${({ theme }) => theme.colors.status.error};
    margin-left: ${({ theme }) => theme.spacing.scale.xxs};
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export const ErrorMessage = styled.span`
  ${responsiveText({
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem'
    },
    fontWeight: 'regular',
    accessibility: {
      minFontSize: '12px',
      maxFontSize: '14px',
      scaleRatio: 1
    }
  })}

  color: ${({ theme }) => theme.colors.status.error};
  margin-top: ${({ theme }) => theme.spacing.scale.xxs};
  opacity: 0;
  transform: translateY(-4px);
  transition: all 0.2s ease-in-out;

  &[data-visible='true'] {
    opacity: 1;
    transform: translateY(0);
  }

  /* Reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none;
  }
`;