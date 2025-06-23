import { createTheme } from '@mantine/core';

export const theme = createTheme({
  colors: {
    brand: [
      '#f4e8e8',
      '#e5c5c6',
      '#d6a2a4',
      '#c77f82',
      '#b85b60',
      '#ac0f0f', // brand[5] - main red
      '#8a0c0c',
      '#670909',
      '#450606',
      '#220303',
    ],
    brandDark: [
      '#e8e9eb',
      '#c6c9d0',
      '#a4aab5',
      '#828b9a',
      '#606d7f',
      '#401516', // brandDark[5] - main maroon
      '#331112',
      '#260d0e',
      '#1a0909',
      '#0d0405',
    ],
  },
  primaryColor: 'brand',
}); 