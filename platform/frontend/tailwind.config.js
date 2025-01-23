import daisyui from "daisyui"
import typography from "@tailwindcss/typography"
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        "dark": {
          "color-scheme": "dark",
          "primary": "#9FE88D",
          "secondary": "#FF7D5C",
          "accent": "#C792E9",
          "neutral": "#1c212b",
          "neutral-content": "#B2CCD6",
          "base-100": "#2A303C",
          "base-200": "#242933",
          "base-300": "#20252E",
          "base-content": "#B2CCD6",
          "info": "#28ebff",
          "success": "#62efbd",
          "warning": "#efd057",
          "error": "#ffae9b",
        },


      }, {
        "light": {
          "color-scheme": "light",
          "primary": "oklch(56.86% 0.255 257.57)",
          "secondary": "#463AA2",
          "accent": "#C148AC",
          "neutral": "#021431",
          "base-100": "oklch(100% 0 0)",
          "base-200": "#F2F7FF",
          "base-300": "#E3E9F4",
          "base-content": "#394E6A",
          "info": "#93E7FB",
          "success": "#81CFD1",
          "warning": "#EFD7BB",
          "error": "#E58B8B",
        },
      }
    ],
  },
  
  darkMode: ['selector', '[data-theme="light"]'],
  plugins: [daisyui, typography],
}

