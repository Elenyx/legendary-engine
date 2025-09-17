import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        float: {
          "0%, 100%": {
            opacity: "0.2",
            transform: "translateY(0px)",
          },
          "50%": {
            opacity: "1",
            transform: "translateY(-10px)",
          },
        },
        pulse: {
          "0%, 100%": {
            opacity: "0.2",
          },
          "50%": {
            opacity: "1",
          },
        },
        shimmer: {
          "0%": {
            backgroundPosition: "-200% 0",
          },
          "100%": {
            backgroundPosition: "200% 0",
          },
        },
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(0, 212, 255, 0.6)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        glow: "glow 2s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "space-gradient": "linear-gradient(135deg, hsl(219, 39%, 11%) 0%, hsl(221, 39%, 8%) 100%)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), 
    require("@tailwindcss/typography"),
    function({ addUtilities }: any) {
      const newUtilities = {
        '.glass-effect': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glow-effect': {
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
        },
        '.btn-primary': {
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 212, 255, 0.4)',
          },
        },
        '.feature-card': {
          transition: 'all 0.3s ease',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          '&:hover': {
            transform: 'translateY(-5px)',
            borderColor: 'var(--primary)',
            boxShadow: '0 10px 40px rgba(0, 212, 255, 0.2)',
          },
        },
        '.stat-number': {
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.nav-link': {
          transition: 'all 0.3s ease',
          '&:hover': {
            color: 'var(--primary)',
            textShadow: '0 0 8px rgba(0, 212, 255, 0.6)',
          },
        },
        '.floating-stars': {
          position: 'absolute',
          inset: '0',
          opacity: '0.2',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: '1px',
            height: '1px',
            background: 'var(--primary)',
            borderRadius: '50%',
            animation: 'float 3s ease-in-out infinite',
          },
          '&::before': {
            top: '10%',
            left: '10%',
            animationDelay: '0s',
          },
          '&::after': {
            top: '20%',
            right: '20%',
            animationDelay: '1.5s',
          },
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
} satisfies Config;
