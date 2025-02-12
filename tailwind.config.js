/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
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
      backgroundImage: {
        'beam-gradient': 'linear-gradient(to right, rgba(217,217,217,0) 0%, rgba(234,128,81,1) 33%, rgba(234,128,81,1) 56%, rgba(93,27,154,1) 70%, rgba(115,115,115,0) 100%)',
      },
      colors: {
        'nav-dark': '#121212',
        'body-dark': '#000000',
        'card-dark': '#000000',
        'card-border': '#94A3B8',
        'stat-border': '#2E3445',
        'green-highlight': '#22C55E',
        'red-highlight': '#EF4444',
        'btn-green': '#22C55E',
        'btn-hover-green': '#16A34A',
        'text-primary': '#FFFFFF',
        'text-secondary': '#94A3B8',
        'progress-bg': '#2A3041',
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
        }
      },
      keyframes: {
        'grid-beam-x': {
          '0%': {
            transform: 'translateX(-20vw)',
            opacity: '0',
          },
          '10%, 90%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translateX(100vw)',
            opacity: '0',
          }
        },
        'grid-beam-y': {
          '0%': {
            transform: 'translateY(-100vh)',
            opacity: '0',
          },
          '10%, 90%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(100vh)',
            opacity: '0',
          }
        },
        'gradient-slide': {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '100%': {
            transform: 'translateX(500%)',
          },
        },
        'fade-out': {
          '0%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
          }
        },
        'border-beam': {
          '100%': {
            'background-position-x': '200%'
          }
        }
      },
      animation: {
        'beam-x': 'grid-beam-x 3s ease-in-out infinite',
        'beam-y': 'grid-beam-y 3s ease-in-out 3s infinite',
        'gradient-slide': 'gradient-slide 2s linear infinite',
        'fade-out': 'fade-out 0.5s ease-out forwards',
        'border-pulse': 'border-beam 3s linear infinite',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}