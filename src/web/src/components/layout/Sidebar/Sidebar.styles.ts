import styled from 'styled-components'; // v5.3.10
import { flexColumn, flexCenter } from '../../../styles/mixins';

/**
 * Main sidebar container component with responsive layout and accessibility features.
 * Implements fixed positioning with mobile-friendly transitions and proper z-indexing.
 */
export const SidebarContainer = styled.aside<{ isOpen?: boolean }>`
  ${flexColumn};
  position: fixed;
  left: 0;
  top: 0;
  width: ${({ theme }) => theme.spacing.scale.xxl};
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-right: 1px solid ${({ theme }) => theme.colors.form.border};
  padding: ${({ theme }) => theme.spacing.scale.md};
  z-index: ${({ theme }) => theme.zIndex.drawer};
  
  /* Performance optimizations */
  will-change: transform;
  transform: translateX(${({ isOpen }) => (isOpen ? '0' : '-100%')});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Responsive behavior */
  @media (min-width: ${({ theme }) => theme.breakpoints.values.md}) {
    transform: translateX(0);
  }

  /* Accessibility focus styles */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: -2px;
  }

  /* Ensure proper stacking context */
  isolation: isolate;
`;

/**
 * Semantic navigation container with proper ARIA attributes and spacing.
 * Implements vertical layout for navigation items.
 */
export const SidebarNav = styled.nav`
  ${flexColumn};
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.scale.lg};
  gap: ${({ theme }) => theme.spacing.scale.sm};

  /* Accessibility attributes */
  role: navigation;
  aria-label: Main navigation;
`;

/**
 * Interactive navigation item component with proper states and accessibility.
 * Implements hover and active states with smooth transitions.
 */
export const SidebarItem = styled.div<{ isActive?: boolean }>`
  ${flexCenter};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.scale.md};
  border-radius: ${({ theme }) => theme.spacing.base};
  cursor: pointer;

  /* Text styling */
  color: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary.main : theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme, isActive }) => 
    isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.regular};

  /* Background states */
  background-color: ${({ theme, isActive }) => 
    isActive ? `${theme.colors.primary.main}15` : 'transparent'};

  /* Interactive states */
  transition: all 0.2s ease-in-out;
  will-change: background-color, color, transform;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary.main}10`};
    transform: translateX(4px);
  }

  &:active {
    transform: translateX(2px);
  }

  /* Accessibility focus styles */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: -2px;
  }

  /* ARIA attributes */
  role: menuitem;
  aria-current: ${({ isActive }) => isActive ? 'page' : undefined};
`;

/**
 * Container for the sidebar logo or branding element.
 * Implements proper spacing and alignment.
 */
export const SidebarBrand = styled.div`
  ${flexCenter};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.scale.sm};
  margin-bottom: ${({ theme }) => theme.spacing.scale.md};
`;

/**
 * Container for the sidebar footer content.
 * Implements proper spacing and positioning.
 */
export const SidebarFooter = styled.div`
  ${flexColumn};
  width: 100%;
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing.scale.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.form.border};
`;

/**
 * Divider element for visual separation of sidebar sections.
 * Implements consistent styling with theme colors.
 */
export const SidebarDivider = styled.hr`
  width: 100%;
  height: 1px;
  margin: ${({ theme }) => theme.spacing.scale.md} 0;
  border: none;
  background-color: ${({ theme }) => theme.colors.form.border};
`;