import styled from 'styled-components'; // v5.3.10
import { flexCenter, flexBetween, ellipsis } from '../../styles/mixins';

export const SelectContainer = styled.div`
  position: relative;
  width: 100%;
  min-width: 120px;
  max-width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
`;

export const SelectTrigger = styled.button<{
  error?: boolean;
  disabled?: boolean;
}>`
  ${flexBetween};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.scale.sm};
  border: 1px solid ${({ theme, error }) => 
    error ? theme.colors.status.error : theme.colors.text.secondary};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.background.default};
  color: ${({ theme, disabled }) => 
    disabled ? theme.colors.text.disabled : theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.body1};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.7 : 1};
  transition: all 0.2s ease;
  min-height: 40px;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main};
  }
  
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    min-height: 44px;
    padding: ${({ theme }) => theme.spacing.scale.md};
  }
`;

export const SelectDropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.background.default};
  border: 1px solid ${({ theme }) => theme.colors.text.secondary};
  border-radius: 4px;
  margin-top: ${({ theme }) => theme.spacing.scale.xs};
  z-index: ${({ theme }) => theme.zIndex.overlay.popover};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  
  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    width: 100%;
    max-height: 50vh;
    border-radius: 12px 12px 0 0;
    border-bottom: none;
  }
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.text.secondary};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.paper};
  }
`;

export const SelectOption = styled.div<{
  isSelected?: boolean;
}>`
  ${flexBetween};
  ${ellipsis};
  padding: ${({ theme }) => `${theme.spacing.scale.sm} ${theme.spacing.scale.md}`};
  cursor: pointer;
  background: ${({ isSelected, theme }) => 
    isSelected ? theme.colors.primary.main : 'transparent'};
  color: ${({ isSelected, theme }) => 
    isSelected ? theme.colors.primary.contrast : theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.body1};
  transition: all 0.2s ease;
  min-height: 40px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary.light};
    color: ${({ theme }) => theme.colors.primary.contrast};
  }
  
  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.primary.light};
    color: ${({ theme }) => theme.colors.primary.contrast};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    min-height: 44px;
    padding: ${({ theme }) => theme.spacing.scale.md};
  }
`;