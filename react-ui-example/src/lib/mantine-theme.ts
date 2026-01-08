import { createTheme, MantineColorsTuple } from '@mantine/core';

// Deep Indigo/Slate primary color
const indigo: MantineColorsTuple = [
  '#eef3ff',
  '#dce4f5',
  '#b9c7e2',
  '#94a8d0',
  '#748dc0',
  '#5f7cb8',
  '#5474b4',
  '#44639f',
  '#3a5890',
  '#2b4a80',
];

// Strava Orange accent color
const stravaOrange: MantineColorsTuple = [
  '#fff4e6',
  '#ffe8cc',
  '#ffd199',
  '#ffb866',
  '#ffa33a',
  '#ff951c',
  '#fc4c02', // Main Strava Orange
  '#e34400',
  '#c93c00',
  '#ae3300',
];

export const mantineTheme = createTheme({
  primaryColor: 'indigo',
  colors: {
    indigo,
    stravaOrange,
  },
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '600',
  },
  radius: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  defaultRadius: 'md',
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'xl',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
        centered: true,
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
    },
  },
});
