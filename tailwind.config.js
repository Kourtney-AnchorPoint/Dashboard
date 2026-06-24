import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        critical: "hsl(var(--risk-critical))",
        high: "hsl(var(--risk-high))",
        moderate: "hsl(var(--risk-moderate))",
        low: "hsl(var(--risk-low))",
        "critical-bg": "hsl(var(--risk-critical-bg))",
        "high-bg": "hsl(var(--risk-high-bg))",
        "moderate-bg": "hsl(var(--risk-moderate-bg))",
        "low-bg": "hsl(var(--risk-low-bg))",
        ink: "#E0E0EE",
        field: "#07070F",
        line: "#1a1a2e",
        pine: "#10D8F0",
        moss: "#8888A8",
        amber: "#ff6b35",
        coral: "#D4159A",
        clinic: "#09091a",
        panel: "#0a0a18",
        surface: "#0d0d1a",
        "dark-card": "#111125",
        cardline: "#28284A",
        purple: "#8844E8",
        gold: "#f0c040",
        census: {
          bg: "#07070F",
          shell: "#09091a",
          panel: "#0a0a18",
          surface: "#0d0d1a",
          card: "#111125",
          border: "#1a1a2e",
          cardline: "#28284A",
          magenta: "#D4159A",
          purple: "#8844E8",
          cyan: "#10D8F0",
          foreground: "#E0E0EE",
          muted: "#8888A8",
          high: "#ff6b35",
          moderate: "#f0c040",
        },
      },
      boxShadow: {
        panel: "0 16px 40px rgba(0, 0, 0, 0.32)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [animate],
};
