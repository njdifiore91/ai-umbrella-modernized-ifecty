import styled from 'styled-components'; // v5.3.10
import { flexCenter, flexColumn } from '../../styles/mixins';

export const ModalOverlay = styled.div`
  ${flexCenter}
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background.default}80;
  backdrop-filter: blur(2px);
  z-index: ${({ theme }) => theme.zIndex.overlay.modal};
  transition: opacity 0.2s ease-in-out;
  
  /* Fallback for browsers that don't support backdrop-filter */
  @supports not (backdrop-filter: blur(2px)) {
    background-color: ${({ theme }) => theme.colors.background.default}B3;
  }
`;

export const ModalContainer = styled.div`
  ${flexColumn}
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.spacing.scale.sm};
  padding: ${({ theme }) => theme.spacing.scale.lg};
  max-width: 90%;
  max-height: 90vh;
  width: min(600px, 100%);
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.text.primary}20;
  transform: translateZ(0); /* Force GPU acceleration */
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.text.hint};
    border-radius: 3px;
  }
  
  /* Responsive adjustments */
  @media ${({ theme }) => theme.breakpoints.down('sm')} {
    max-width: 95%;
    padding: ${({ theme }) => theme.spacing.scale.md};
    margin: ${({ theme }) => theme.spacing.scale.xs};
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.scale.md};
  padding-right: ${({ theme }) => theme.spacing.scale.sm};
  
  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.h4};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  }
  
  @media ${({ theme }) => theme.breakpoints.down('sm')} {
    h2 {
      font-size: ${({ theme }) => theme.typography.fontSize.h4};
    }
  }
`;

export const ModalContent = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.scale.lg};
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.body1};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  
  /* Ensure proper spacing for content */
  > * + * {
    margin-top: ${({ theme }) => theme.spacing.scale.md};
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.scale.md};
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing.scale.md};
  border-top: 1px solid ${({ theme }) => theme.colors.background.disabled};
  
  /* Responsive button layout */
  @media ${({ theme }) => theme.breakpoints.down('sm')} {
    flex-direction: column-reverse;
    gap: ${({ theme }) => theme.spacing.scale.sm};
    
    > button {
      width: 100%;
    }
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.scale.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.h4};
  line-height: 1;
  
  /* Accessibility improvements */
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.disabled};
    border-radius: ${({ theme }) => theme.spacing.scale.xxs};
  }
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
    border-radius: ${({ theme }) => theme.spacing.scale.xxs};
  }
  
  /* Touch-friendly sizing on mobile */
  @media ${({ theme }) => theme.breakpoints.down('sm')} {
    padding: ${({ theme }) => theme.spacing.scale.md};
  }
  
  /* Hide from screen readers but keep clickable */
  span {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;