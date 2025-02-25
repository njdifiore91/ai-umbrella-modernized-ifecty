import styled from 'styled-components'; // v5.3.10
import { flexBetween } from '../../../styles/mixins';
import { colors, spacing, typography, zIndex } from '../../../styles/variables';

export const HeaderContainer = styled.header`
  ${flexBetween};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  padding: ${spacing.scale.md};
  background-color: ${colors.background.default};
  border-bottom: 1px solid ${colors.text.hint};
  z-index: ${zIndex.layout.header};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const LogoSection = styled.div`
  display: flex;
  align-items: center;
  padding-left: ${spacing.scale.sm};
  
  img {
    height: 32px;
    width: auto;
    transition: transform 0.2s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

export const UserSection = styled.div`
  ${flexBetween};
  gap: ${spacing.scale.md};
  padding-right: ${spacing.scale.sm};
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.body2};
  color: ${colors.text.primary};

  > * {
    display: flex;
    align-items: center;
    gap: ${spacing.scale.xs};
  }

  svg {
    width: 20px;
    height: 20px;
    color: ${colors.primary.main};
  }
`;

export const NavigationSection = styled.nav`
  padding: ${spacing.scale.sm} ${spacing.scale.md};
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.body2};
  color: ${colors.text.secondary};
  
  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: ${colors.primary.main};
    }
    
    &:not(:last-child)::after {
      content: '/';
      margin: 0 ${spacing.scale.xs};
      color: ${colors.text.hint};
    }
  }
`;

export const GlobalActionsSection = styled.div`
  ${flexBetween};
  gap: ${spacing.scale.sm};
  margin-left: auto;
  padding-right: ${spacing.scale.sm};

  button {
    display: flex;
    align-items: center;
    gap: ${spacing.scale.xxs};
    padding: ${spacing.scale.xs} ${spacing.scale.sm};
    border: none;
    border-radius: 4px;
    background: transparent;
    color: ${colors.text.primary};
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.button};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: ${colors.background.paper};
      color: ${colors.primary.main};
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

export const BreadcrumbContainer = styled.div`
  display: flex;
  align-items: center;
  padding: ${spacing.scale.xs} ${spacing.scale.md};
  background-color: ${colors.background.paper};
  border-bottom: 1px solid ${colors.text.hint};
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.body2};
  color: ${colors.text.secondary};
`;