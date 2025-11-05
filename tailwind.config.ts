import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        cyan: {
          50: "hsl(187 92% 94%)",
          100: "hsl(187 92% 88%)",
          400: "hsl(187 85% 53%)",
          500: "hsl(188 86% 42%)",
          600: "hsl(188 86% 35%)",
          700: "hsl(189 85% 29%)",
          900: "hsl(192 91% 20%)",
        },
        pink: {
          50: "hsl(327 73% 97%)",
          100: "hsl(326 78% 95%)",
          400: "hsl(330 81% 67%)",
          500: "hsl(330 81% 60%)",
          600: "hsl(330 81% 55%)",
          700: "hsl(330 79% 46%)",
        },
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, hsl(187 85% 53%) 0%, hsl(330 81% 60%) 100%)",
        "gradient-primary": "linear-gradient(135deg, hsl(187 85% 53%) 0%, hsl(188 86% 42%) 100%)",
        "gradient-accent": "linear-gradient(135deg, hsl(330 81% 60%) 0%, hsl(330 81% 55%) 100%)",
        "gradient-success": "linear-gradient(135deg, hsl(142 71% 58%) 0%, hsl(142 71% 45%) 100%)",
        "gradient-glass": "linear-gradient(135deg, hsla(187 85% 53% / 0.1) 0%, hsla(330 81% 60% / 0.1) 100%)",
      },
      boxShadow: {
        "cyan-glow": "0 0 20px hsla(187 85% 53% / 0.3)",
        "pink-glow": "0 0 20px hsla(330 81% 60% / 0.3)",
        "card-hover": "0 20px 25px -5px hsla(187 85% 53% / 0.2)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.95)", opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        pulse: {
          "0%, 100%": {
            boxShadow: "0 0 0 0 hsla(330 81% 60% / 0.7)",
          },
          "50%": {
            boxShadow: "0 0 0 10px hsla(330 81% 60% / 0)",
          },
        },
        "gradient-shift": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
        "fly-in-rasante": {
          "0%": {
            transform: "translateX(-150%) translateY(-20px) rotate(15deg) scale(0.8)",
            opacity: "0",
          },
          "60%": {
            transform: "translateX(5%) translateY(0px) rotate(-3deg) scale(1.05)",
            opacity: "1",
          },
          "100%": {
            transform: "translateX(0%) translateY(0px) rotate(0deg) scale(1)",
            opacity: "1",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            filter: "drop-shadow(0 0 12px rgba(6, 182, 212, 0.5)) drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))",
          },
          "50%": {
            filter: "drop-shadow(0 0 20px rgba(6, 182, 212, 0.7)) drop-shadow(0 0 30px rgba(168, 85, 247, 0.6))",
          },
        },
        "audio-bounce": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-6px) scale(1.1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
        "fly-in-rasante": "fly-in-rasante 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "float": "float 3s ease-in-out 0.8s infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "audio-bounce": "audio-bounce 0.8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
