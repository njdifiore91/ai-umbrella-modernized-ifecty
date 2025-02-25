import { DefaultTheme } from 'styled-components'; // v5.3.10
import { colors, typography, spacing, breakpoints, zIndex } from './variables';

// Light theme configuration
export const lightTheme: DefaultTheme = {
  colors: {
    primary: {
      main: '#007bff',
      light: '#3395ff',
      dark: '#0056b3',
      contrast: '#ffffff'
    },
    secondary: {
      main: '#6c757d',
      light: '#868e96',
      dark: '#495057',
      contrast: '#ffffff'
    },
    background: {
      default: '#ffffff',
      paper: '#f8f9fa',
      elevated: '#ffffff'
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
      disabled: '#adb5bd'
    },
    feedback: {
      error: {
        main: '#dc3545',
        light: '#e35d6a',
        dark: '#a71d2a',
        contrast: '#ffffff'
      },
      success: {
        main: '#28a745',
        light: '#34ce57',
        dark: '#1e7e34',
        contrast: '#ffffff'
      },
      warning: {
        main: '#ffc107',
        light: '#ffcd39',
        dark: '#d39e00',
        contrast: '#000000'
      },
      info: {
        main: '#17a2b8',
        light: '#1fc8e3',
        dark: '#117a8b',
        contrast: '#ffffff'
      }
    },
    form: {
      border: '#ced4da',
      borderFocus: '#80bdff',
      placeholder: '#6c757d',
      disabled: '#e9ecef'
    }
  },
  typography: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      xxl: '2rem',
      display: {
        sm: '2.5rem',
        md: '3rem',
        lg: '3.5rem'
      }
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      loose: 1.8,
      reset: 1
    },
    textTransform: {
      uppercase: 'uppercase',
      lowercase: 'lowercase',
      capitalize: 'capitalize'
    }
  },
  spacing: {
    base: '0.25rem',
    scale: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      xxl: '3rem'
    },
    layout: {
      container: '1.5rem',
      section: '4rem',
      page: '6rem'
    },
    compound: {
      formGroup: '1.5rem',
      cardPadding: '1.25rem',
      modalPadding: '2rem'
    }
  },
  breakpoints: {
    values: {
      xs: '320px',
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      xxl: '1400px'
    },
    container: {
      sm: '540px',
      md: '720px',
      lg: '960px',
      xl: '1140px',
      xxl: '1320px'
    }
  },
  zIndex: {
    mobileStepper: 1000,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
    drawer: 1200,
    appBar: 1100,
    dropdown: 1000,
    header: 900,
    overlay: 800
  }
};

// Dark theme configuration with adjusted semantic tokens
export const darkTheme: DefaultTheme = {
  colors: {
    primary: {
      main: '#0d6efd',
      light: '#3d8bfd',
      dark: '#0a58ca',
      contrast: '#ffffff'
    },
    secondary: {
      main: '#495057',
      light: '#6c757d',
      dark: '#343a40',
      contrast: '#ffffff'
    },
    background: {
      default: '#212529',
      paper: '#343a40',
      elevated: '#495057'
    },
    text: {
      primary: '#f8f9fa',
      secondary: '#adb5bd',
      disabled: '#6c757d'
    },
    feedback: {
      error: {
        main: '#dc3545',
        light: '#e35d6a',
        dark: '#a71d2a',
        contrast: '#ffffff'
      },
      success: {
        main: '#28a745',
        light: '#34ce57',
        dark: '#1e7e34',
        contrast: '#ffffff'
      },
      warning: {
        main: '#ffc107',
        light: '#ffcd39',
        dark: '#d39e00',
        contrast: '#000000'
      },
      info: {
        main: '#17a2b8',
        light: '#1fc8e3',
        dark: '#117a8b',
        contrast: '#ffffff'
      }
    },
    form: {
      border: '#495057',
      borderFocus: '#0d6efd',
      placeholder: '#adb5bd',
      disabled: '#343a40'
    }
  },
  typography: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      xxl: '2rem',
      display: {
        sm: '2.5rem',
        md: '3rem',
        lg: '3.5rem'
      }
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      loose: 1.8,
      reset: 1
    },
    textTransform: {
      uppercase: 'uppercase',
      lowercase: 'lowercase',
      capitalize: 'capitalize'
    }
  },
  spacing: {
    base: '0.25rem',
    scale: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      xxl: '3rem'
    },
    layout: {
      container: '1.5rem',
      section: '4rem',
      page: '6rem'
    },
    compound: {
      formGroup: '1.5rem',
      cardPadding: '1.25rem',
      modalPadding: '2rem'
    }
  },
  breakpoints: {
    values: {
      xs: '320px',
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      xxl: '1400px'
    },
    container: {
      sm: '540px',
      md: '720px',
      lg: '960px',
      xl: '1140px',
      xxl: '1320px'
    }
  },
  zIndex: {
    mobileStepper: 1000,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
    drawer: 1200,
    appBar: 1100,
    dropdown: 1000,
    header: 900,
    overlay: 800
  }
};