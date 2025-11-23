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
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
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
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        trail: {
          fundamentos: {
            primary: "hsl(var(--trail-fundamentos-primary))",
            accent: "hsl(var(--trail-fundamentos-accent))",
            glow: "hsl(var(--trail-fundamentos-glow))",
          },
          "dia-a-dia": {
            primary: "hsl(var(--trail-dia-a-dia-primary))",
            accent: "hsl(var(--trail-dia-a-dia-accent))",
            glow: "hsl(var(--trail-dia-a-dia-glow))",
          },
          negocios: {
            primary: "hsl(var(--trail-negocios-primary))",
            accent: "hsl(var(--trail-negocios-accent))",
            glow: "hsl(var(--trail-negocios-glow))",
          },
          renda: {
            primary: "hsl(var(--trail-renda-primary))",
            accent: "hsl(var(--trail-renda-accent))",
            glow: "hsl(var(--trail-renda-glow))",
          },
          criativa: {
            primary: "hsl(var(--trail-criativa-primary))",
            accent: "hsl(var(--trail-criativa-accent))",
            glow: "hsl(var(--trail-criativa-glow))",
          },
          etica: {
            primary: "hsl(var(--trail-etica-primary))",
            accent: "hsl(var(--trail-etica-accent))",
            glow: "hsl(var(--trail-etica-glow))",
          },
          automacoes: {
            primary: "hsl(var(--trail-automacoes-primary))",
            accent: "hsl(var(--trail-automacoes-accent))",
            glow: "hsl(var(--trail-automacoes-glow))",
          },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-hero": "var(--gradient-hero)",
        "gradient-primary": "var(--gradient-primary)",
        "gradient-brand": "var(--gradient-brand)",
        "gradient-card": "var(--gradient-card)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        elegant: "var(--shadow-elegant)",
        glow: "var(--shadow-glow)",
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
            filter: "drop-shadow(0 0 12px rgba(236, 72, 153, 0.6)) drop-shadow(0 0 20px rgba(219, 39, 119, 0.4))",
          },
          "50%": {
            filter: "drop-shadow(0 0 20px rgba(236, 72, 153, 0.8)) drop-shadow(0 0 30px rgba(219, 39, 119, 0.6))",
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
