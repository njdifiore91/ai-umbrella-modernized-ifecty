import styled from 'styled-components'; // v5.3.10
import { flexCenter, flexBetween, flexColumn } from '../../styles/mixins';
import { colors, spacing, breakpoints } from '../../styles/variables';

export const PolicyPageContainer = styled.main`
  ${flexColumn}
  min-height: 100vh;
  padding: ${spacing.scale.lg};
  background-color: ${colors.background.default};
  position: relative;
  overflow-x: hidden;

  ${breakpoints.down('md')} {
    padding: ${spacing.scale.md};
  }

  /* Print styles */
  @media print {
    padding: 0;
    background-color: white;
  }

  /* RTL support */
  [dir='rtl'] & {
    direction: rtl;
  }
`;

export const PolicyHeader = styled.header`
  ${flexBetween}
  width: 100%;
  padding: ${spacing.scale.md};
  background-color: ${colors.background.paper};
  border-bottom: 1px solid ${colors.background.disabled};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.layout.header};
  margin-bottom: ${spacing.scale.lg};

  ${breakpoints.down('md')} {
    padding: ${spacing.scale.sm};
    flex-direction: column;
    gap: ${spacing.scale.xs};
  }
`;

export const PolicyContent = styled.section`
  ${flexColumn}
  gap: ${spacing.scale.md};
  flex: 1;
  width: 100%;
  max-width: ${breakpoints.values.lg}px;
  margin: 0 auto;
  padding: ${spacing.scale.md};
  background-color: ${colors.background.paper};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 400px;
  overflow-y: auto;

  ${breakpoints.down('md')} {
    padding: ${spacing.scale.sm};
    gap: ${spacing.scale.sm};
  }

  /* Accessibility focus styles */
  &:focus-within {
    outline: 2px solid ${colors.primary.main};
    outline-offset: 2px;
  }
`;

export const PolicyActions = styled.div`
  ${flexBetween}
  width: 100%;
  padding: ${spacing.scale.md};
  background-color: ${colors.background.paper};
  border-top: 1px solid ${colors.background.disabled};
  position: sticky;
  bottom: 0;
  margin-top: auto;
  gap: ${spacing.scale.sm};

  ${breakpoints.down('md')} {
    flex-direction: column-reverse;
    padding: ${spacing.scale.sm};
    gap: ${spacing.scale.xs};
  }

  /* Print styles */
  @media print {
    display: none;
  }
`;

export const PolicySection = styled.div`
  ${flexColumn}
  gap: ${spacing.scale.sm};
  padding: ${spacing.scale.md};
  border: 1px solid ${colors.background.disabled};
  border-radius: 4px;
  background-color: ${colors.background.default};

  &:hover {
    border-color: ${colors.primary.light};
  }

  ${breakpoints.down('md')} {
    padding: ${spacing.scale.sm};
  }
`;

export const PolicyFormGroup = styled.div`
  ${flexColumn}
  gap: ${spacing.scale.xs};
  width: 100%;
`;

export const PolicyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${spacing.scale.md};
  width: 100%;

  ${breakpoints.down('md')} {
    grid-template-columns: 1fr;
    gap: ${spacing.scale.sm};
  }
`;

export const PolicyInfoCard = styled.div`
  ${flexColumn}
  padding: ${spacing.scale.md};
  background-color: ${colors.background.default};
  border-radius: 4px;
  border: 1px solid ${colors.background.disabled};
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  ${breakpoints.down('md')} {
    padding: ${spacing.scale.sm};
  }
`;

export const PolicyAlert = styled.div<{ severity?: 'error' | 'warning' | 'info' | 'success' }>`
  ${flexCenter}
  width: 100%;
  padding: ${spacing.scale.sm};
  border-radius: 4px;
  background-color: ${({ severity = 'info', theme }) => {
    const alpha = 0.1;
    switch (severity) {
      case 'error':
        return `rgba(${theme.colors.status.error}, ${alpha})`;
      case 'warning':
        return `rgba(${theme.colors.status.warning}, ${alpha})`;
      case 'success':
        return `rgba(${theme.colors.status.success}, ${alpha})`;
      default:
        return `rgba(${theme.colors.status.info}, ${alpha})`;
    }
  }};
  color: ${({ severity = 'info', theme }) => theme.colors.status[severity]};
  margin: ${spacing.scale.xs} 0;
`;

export const RequiredField = styled.span`
  color: ${colors.status.error};
  margin-left: ${spacing.scale.xxs};
  
  [dir='rtl'] & {
    margin-left: 0;
    margin-right: ${spacing.scale.xxs};
  }
`;