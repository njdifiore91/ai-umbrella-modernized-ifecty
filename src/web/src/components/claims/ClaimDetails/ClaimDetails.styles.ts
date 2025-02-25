import styled from 'styled-components'; // v5.3.10
import { flexCenter, flexBetween, flexColumn, ellipsis } from '../../../styles/mixins';

export const Container = styled.div`
  ${flexColumn};
  width: 100%;
  max-width: ${({ theme }) => theme.breakpoints.values.lg}px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.scale.lg};
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;

  @media (max-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    padding: ${({ theme }) => theme.spacing.scale.md};
  }
`;

export const Header = styled.div`
  ${flexBetween};
  padding-bottom: ${({ theme }) => theme.spacing.scale.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.background.disabled};
  margin-bottom: ${({ theme }) => theme.spacing.scale.lg};

  h1 {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.h4};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.primary};
    ${ellipsis};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.scale.sm};
  }
`;

export const ActionBar = styled.div`
  ${flexCenter};
  gap: ${({ theme }) => theme.spacing.scale.sm};

  button {
    font-size: ${({ theme }) => theme.typography.fontSize.button};
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
`;

export const ClaimInfo = styled.div`
  ${flexColumn};
  gap: ${({ theme }) => theme.spacing.scale.md};
  margin-bottom: ${({ theme }) => theme.spacing.scale.lg};

  label {
    font-size: ${({ theme }) => theme.typography.fontSize.body2};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.spacing.scale.xxs};
  }

  .claim-number {
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.body1};
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }
`;

export const StatusSection = styled.div`
  ${flexColumn};
  gap: ${({ theme }) => theme.spacing.scale.sm};
  padding: ${({ theme }) => theme.spacing.scale.md};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.background.disabled};

  .status-options {
    ${flexColumn};
    gap: ${({ theme }) => theme.spacing.scale.xs};
  }

  label {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.scale.xs};
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing.scale.xs};
    border-radius: 4px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: ${({ theme }) => theme.colors.background.paper};
    }
  }
`;

export const DocumentSection = styled.div`
  ${flexColumn};
  gap: ${({ theme }) => theme.spacing.scale.md};
  margin-top: ${({ theme }) => theme.spacing.scale.lg};

  .upload-button {
    ${flexCenter};
    gap: ${({ theme }) => theme.spacing.scale.xs};
    padding: ${({ theme }) => theme.spacing.scale.sm};
    border: 2px dashed ${({ theme }) => theme.colors.primary.light};
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: ${({ theme }) => theme.colors.background.paper};
      border-color: ${({ theme }) => theme.colors.primary.main};
    }
  }
`;

export const DocumentList = styled.div`
  ${flexColumn};
  gap: ${({ theme }) => theme.spacing.scale.xs};
  max-height: 300px;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.scale.sm};
  border: 1px solid ${({ theme }) => theme.colors.background.disabled};
  border-radius: 4px;

  .document-item {
    ${flexBetween};
    padding: ${({ theme }) => theme.spacing.scale.xs};
    border-radius: 4px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: ${({ theme }) => theme.colors.background.paper};
    }

    .document-name {
      ${ellipsis};
      max-width: 70%;
    }
  }
`;

export const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.background.disabled};
  border-radius: 4px;
  overflow: hidden;
  margin: ${({ theme }) => theme.spacing.scale.md} 0;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ progress }) => progress}%;
    background: ${({ theme }) => theme.colors.primary.main};
    transition: width 0.3s ease-in-out;
  }

  /* Accessibility attributes */
  &[role="progressbar"] {
    aria-valuemin: 0;
    aria-valuemax: 100;
    aria-valuenow: ${({ progress }) => progress};
  }
`;

export const ButtonGroup = styled.div`
  ${flexBetween};
  margin-top: ${({ theme }) => theme.spacing.scale.xl};
  padding-top: ${({ theme }) => theme.spacing.scale.md};
  border-top: 1px solid ${({ theme }) => theme.colors.background.disabled};

  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.scale.sm};
    
    button {
      width: 100%;
    }
  }
`;