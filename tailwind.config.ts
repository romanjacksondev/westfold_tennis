/**
 * @format
 * @type {import('tailwindcss').Config}
 */

module.exports = {
  darkMode: ["class"],
  content: ["./src/**/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        "hero-1": [
          "5.125rem",
          {
            lineHeigth: "5.075rem",
            fontWeith: "700",
            letterSpacing: "-0.04em",
          },
        ],
        "heading-h1": [
          "3.75rem",
          {
            lineHeigth: "4.75rem",
            fontWeith: "700",
            letterSpacing: "-0.01em",
          },
        ],
        "heading-h2": [
          "3.125rem",
          {
            lineHeigth: "3.75rem",
            fontWeith: "700",
            letterSpacing: "-0.02em",
          },
        ],
        "heading-h3": [
          "2.75rem",
          {
            lineHeigth: "3.5rem",
            fontWeith: "700",
            letterSpacing: "-0.02em",
          },
        ],
        "heading-h4": [
          "2.125rem",
          {
            lineHeigth: "2.5rem",
            fontWeith: "700",
            letterSpacing: "-0.02em",
          },
        ],
        headline: [
          "3rem",
          {
            lineHeigth: "3.5rem",
            fontWeith: "700",
            letterSpacing: "-0.02em",
          },
        ],
        "text-body-xs": ["0.075rem", "1.125rem"],
      },
      screens: {
        "mobile-xs": {
          raw: "(min-width: 280px)",
        },
        "mobile-sm": {
          raw: "(min-width: 320px)",
        },
        "mobile-md": {
          raw: "(min-width: 360px)",
        },
        "mobile-lg": {
          raw: "(min-width: 480px)",
        },
        "sm-h": {
          raw: "(min-height: 768px)",
        },
        "md-h": {
          raw: "(min-height: 900px)",
        },
        "lg-h": {
          raw: "(min-height: 1080px)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        rolandGarrosRed: "#BB4915",
        rolandGarrosOrange: "#D06B28",
        wimbledonGreen: "#02734A",
        primary: "#AAC0C7",
        secondary: "#8EB4C0",
        tertiary: "#F0F6FA",
        cta: "#EC0039",
        success: "#4EC291",
        error: "#F52046",
        disabled: "#AAB4BD",
        "disabled-gray": "#D0D0D0",
        hover: "#D60033",
        focus: "#6395AA",
        black: "#131313",
        white: "#FFFFFF",
        gray: {
          "100": "#F9F9F9",
          "200": "#F3F3F3",
          "300": "#E8E8E8",
          "400": "#C8C8C8",
          "500": "#929292",
          "600": "#414141",
        },
        red: {
          "300": "#EA1D25",
          "400": "#EA1D25",
          "500": "#EA1D25",
        },
        border: "#B7B7B7",
        "input-border": "#B2D2DF",
        input: "#3F8EAF",
        link: "#3F8EAF",
        subtitle: "#69717A",
        placeholder: "#808B95",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
