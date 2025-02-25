import React, { FC } from 'react'; // v18.2.0
import { FooterContainer, StatusMessage } from './Footer.styles';

/**
 * Interface defining props for Footer component
 * @property {string} statusMessage - Optional status message to display in the footer
 */
interface FooterProps {
  statusMessage?: string;
}

/**
 * Footer component that implements the footer section of the main application template.
 * Displays status messages and application information with theme-based styling and
 * enhanced accessibility features.
 *
 * @param {FooterProps} props - Component props
 * @returns {JSX.Element} Rendered footer component
 */
const Footer: FC<FooterProps> = ({ statusMessage }) => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer
      role="contentinfo"
      aria-label="Application footer"
    >
      <StatusMessage
        aria-live="polite"
        aria-atomic="true"
        data-testid="footer-status-message"
      >
        {statusMessage || 'System ready'}
      </StatusMessage>

      <StatusMessage
        as="small"
        aria-label="Copyright information"
        data-testid="footer-copyright"
      >
        &copy; {currentYear} AI Umbrella Insurance. All rights reserved.
      </StatusMessage>
    </FooterContainer>
  );
};

export default Footer;