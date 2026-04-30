import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f8fa",
          100: "#eceef2",
          200: "#d6dae3",
          300: "#a4abbb",
          400: "#6c7488",
          500: "#444c61",
          600: "#2d3346",
          700: "#1d2235",
          800: "#121627",
          900: "#0a0d1a",
        },
        accent: {
          50: "#fff5e6",
          100: "#ffe2b8",
          400: "#ff9a1f",
          500: "#f57c00",
          600: "#cf6300",
        },
        sovereign: {
          50: "#eef5ff",
          100: "#d9e7ff",
          500: "#3461d6",
          600: "#264fb3",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Noto Sans TC", "PingFang TC", "Helvetica Neue", "sans-serif"],
        mono: ["ui-monospace", "SF Mono", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
