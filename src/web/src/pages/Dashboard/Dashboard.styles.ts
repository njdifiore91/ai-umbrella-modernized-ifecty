import styled from 'styled-components'; // v5.3.10
import { flexCenter, flexBetween, flexColumn, responsiveText } from '../../styles/mixins';

// Main container for the dashboard layout
export const DashboardContainer = styled.div`
  ${flexColumn};
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.layout.container};
  background-color: ${({ theme }) => theme.colors.background.default};
  transition: background-color 0.3s ease-in-out;

  ${({ theme }) => theme.breakpoints.values.md} {
    padding: ${({ theme }) => theme.spacing.layout.section};
  }
`;

// Header area with logo, user info and navigation
export const DashboardHeader = styled.header`
  ${flexBetween};
  width: 100%;
  height: 64px;
  padding: ${({ theme }) => `${theme.spacing.scale.md} ${theme.spacing.scale.lg}`};
  background-color: ${({ theme }) => theme.colors.background.paper};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.header};
`;

// Navigation breadcrumbs container
export const BreadcrumbNav = styled.nav`
  ${flexBetween};
  padding: ${({ theme }) => theme.spacing.scale.sm} ${({ theme }) => theme.spacing.scale.md};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.form.border};
`;

// Main content area with responsive grid layout
export const ContentArea = styled.main`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.scale.lg};
  padding: ${({ theme }) => theme.spacing.scale.xl} 0;
  flex: 1;

  ${({ theme }) => theme.breakpoints.values.sm} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${({ theme }) => theme.breakpoints.values.lg} {
    grid-template-columns: repeat(3, 1fr);
  }

  ${({ theme }) => theme.breakpoints.values.xl} {
    grid-template-columns: repeat(4, 1fr);
  }
`;

// Left panel for navigation menu
export const LeftPanel = styled.aside`
  ${flexColumn};
  width: 240px;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-right: 1px solid ${({ theme }) => theme.colors.form.border};
  padding: ${({ theme }) => theme.spacing.scale.md};
  height: 100%;
  position: fixed;
  left: 0;
  top: 64px;
  overflow-y: auto;
  transition: transform 0.3s ease-in-out;

  @media (max-width: ${({ theme }) => theme.breakpoints.values.md}) {
    transform: translateX(-100%);
    &.open {
      transform: translateX(0);
    }
  }
`;

// Container for dashboard widgets
export const WidgetContainer = styled.div`
  ${flexColumn};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.compound.cardPadding};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease-in-out;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  h3 {
    ${responsiveText({
      fontSize: {
        xs: '1.25rem',
        sm: '1.5rem'
      },
      fontWeight: 'semibold'
    })};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.scale.sm};
  }
`;

// Status bar at the bottom of the dashboard
export const StatusBar = styled.footer`
  ${flexBetween};
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  padding: 0 ${({ theme }) => theme.spacing.scale.lg};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-top: 1px solid ${({ theme }) => theme.colors.form.border};
  z-index: ${({ theme }) => theme.zIndex.header};

  span {
    ${responsiveText({
      fontSize: {
        xs: '0.875rem'
      },
      fontWeight: 'regular'
    })};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

// Menu toggle button for mobile view
export const MenuToggle = styled.button`
  display: none;
  ${flexCenter};
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: ${({ theme }) => theme.breakpoints.values.md}) {
    display: flex;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

// User profile section in header
export const UserProfile = styled.div`
  ${flexCenter};
  gap: ${({ theme }) => theme.spacing.scale.sm};

  img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }

  span {
    ${responsiveText({
      fontSize: {
        xs: '0.875rem',
        sm: '1rem'
      },
      fontWeight: 'medium'
    })};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;