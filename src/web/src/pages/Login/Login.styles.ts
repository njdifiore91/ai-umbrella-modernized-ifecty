import styled from 'styled-components'; // v5.3.10
import { flexCenter, flexColumn } from '../../styles/mixins';

export const LoginContainer = styled.div`
  ${flexCenter}
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing.scale.lg};
`;

export const LoginForm = styled.form`
  ${flexColumn}
  width: 100%;
  max-width: ${({ theme }) => theme.breakpoints.values.xs};
  padding: ${({ theme }) => theme.spacing.compound.cardPadding};
  background-color: ${({ theme }) => theme.colors.background.default};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.form.border};

  @media (min-width: ${({ theme }) => theme.breakpoints.values.sm}) {
    padding: ${({ theme }) => theme.spacing.compound.modalPadding};
  }
`;

export const LoginTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.scale.lg};
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
`;

export const LoginButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.scale.md};
  margin-top: ${({ theme }) => theme.spacing.scale.lg};
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.primary.contrast};
  border: none;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.form.disabled};
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;

export const FormGroup = styled.div`
  ${flexColumn}
  margin-bottom: ${({ theme }) => theme.spacing.compound.formGroup};
`;

export const FormLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.scale.xs};
`;

export const FormInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.scale.md};
  border: 1px solid ${({ theme }) => theme.colors.form.border};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.background.default};
  transition: border-color 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.form.borderFocus};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.form.borderFocus};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.form.placeholder};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.form.disabled};
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.span`
  color: ${({ theme }) => theme.colors.feedback.error.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.scale.xs};
`;

export const ForgotPasswordLink = styled.a`
  color: ${({ theme }) => theme.colors.primary.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-decoration: none;
  align-self: flex-end;
  margin-top: ${({ theme }) => theme.spacing.scale.sm};

  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primary.dark};
  }
`;