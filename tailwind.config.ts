import type { Config } from "tailwindcss";
const colors = require('tailwindcss/colors')

const config: any = {
  darkMode: ["class", "class"],
  content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./zenith/src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./zenith/src/pages/**/*.{js,ts,jsx,tsx,mdx}",
	],
  theme: {
    extend: {
      fontFamily: {
        'cal-sans': ['Cal Sans', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        ...colors,
        primary: "#F29849",
        secondary: "#518C66",
        secondary_lite: '#E5F9E4',
        complementary: '#6F553C',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
        yearcolors: {
          ey: '#F5EEDC',
          s4: '#B4EBE6',
          s5: '#F5CBCB',
          s6: '#E7F2E4',
        },
        gradecolors: {
          90: '#50d2b5',
          80: '#5caea6',
          70: '#7bbf95',
          60: '#9ac66f',
          50: '#f3c743',
          below: '#e24d3f',
        },
        ai_category_colors: {
          1: '#7ADAA5',
          2: '#50D2B5',
          3: '#5CAEA6',
          4: '#7BBF95',
          5: '#9AC66F',
          6: '#F3C743',
          7: '#E24D3F',
          8: '#F29849',
          9: '#239BA7',
          10: '#F29849',
        },
        statColors: {
          1: '#7ADAA5',
          2: '#239BA7',
          3: '#F08B51',
          4: '#F2EDD1',
          5: '#F5EEDC',
          6: '#F2EDD1',
          7: '#BBDCE5',
          8: '#F78D60',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
      // Dashboard-prefixed colors from zenith
      'dashboard-border': 'hsl(var(--dashboard-border))',
      'dashboard-input': 'hsl(var(--dashboard-input))',
      'dashboard-ring': 'hsl(var(--dashboard-ring))',
      'dashboard-background': 'hsl(var(--dashboard-background))',
      'dashboard-foreground': 'hsl(var(--dashboard-foreground))',
      'dashboard-primary': {
        DEFAULT: 'hsl(var(--dashboard-primary))',
        dark: 'hsl(var(--dashboard-primary-dark))',
        foreground: 'hsl(var(--dashboard-primary-foreground))',
      },
      'dashboard-success': {
        DEFAULT: 'hsl(var(--dashboard-success))',
        dark: 'hsl(var(--dashboard-success-dark))',
        foreground: 'hsl(var(--dashboard-success-foreground))',
      },
      'dashboard-secondary': {
        DEFAULT: 'hsl(var(--dashboard-secondary))',
        foreground: 'hsl(var(--dashboard-secondary-foreground))',
      },
      'dashboard-destructive': {
        DEFAULT: 'hsl(var(--dashboard-destructive))',
        foreground: 'hsl(var(--dashboard-destructive-foreground))',
      },
      'dashboard-muted': {
        DEFAULT: 'hsl(var(--dashboard-muted))',
        foreground: 'hsl(var(--dashboard-muted-foreground))',
      },
      'dashboard-accent': {
        DEFAULT: 'hsl(var(--dashboard-accent))',
        foreground: 'hsl(var(--dashboard-accent-foreground))',
      },
      'dashboard-popover': {
        DEFAULT: 'hsl(var(--dashboard-popover))',
        foreground: 'hsl(var(--dashboard-popover-foreground))',
      },
      'dashboard-card': {
        DEFAULT: 'hsl(var(--dashboard-card))',
        foreground: 'hsl(var(--dashboard-card-foreground))',
      },
      'dashboard-sidebar': {
        DEFAULT: 'hsl(var(--dashboard-sidebar-background))',
        foreground: 'hsl(var(--dashboard-sidebar-foreground))',
        primary: 'hsl(var(--dashboard-sidebar-primary))',
        'primary-foreground': 'hsl(var(--dashboard-sidebar-primary-foreground))',
        accent: 'hsl(var(--dashboard-sidebar-accent))',
        'accent-foreground': 'hsl(var(--dashboard-sidebar-accent-foreground))',
        border: 'hsl(var(--dashboard-sidebar-border))',
        ring: 'hsl(var(--dashboard-sidebar-ring))',
      },
  		},
  		maxWidth: {
  			'section-lg': '1024px',
  			'section-sm': '768px'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
        // Dashboard-prefixed borderRadius
        'dashboard-lg': 'var(--dashboard-radius)',
        'dashboard-md': 'calc(var(--dashboard-radius) - 2px)',
        'dashboard-sm': 'calc(var(--dashboard-radius) - 4px)',
  		},
      keyframes: {
        // Existing keyframes
        'accordion-down': {
          from: { height: '0', opacity: '0' },
          to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
          to: { height: '0', opacity: '0' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'hover-scale': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.02)' }
        },
        // Dashboard-prefixed keyframes
        'dashboard-accordion-down': {
          from: { height: '0', opacity: '0' },
          to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
        },
        'dashboard-accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
          to: { height: '0', opacity: '0' }
        },
        'dashboard-fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'dashboard-fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' }
        },
        'dashboard-scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'dashboard-slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'dashboard-hover-scale': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.02)' }
        },
        // Animation for the background
        moveHorizontal: {
          "0%": {
            transform: "translateX(-50%) translateY(-10%)",
          },
          "50%": {
            transform: "translateX(50%) translateY(10%)",
          },
          "100%": {
            transform: "translateX(-50%) translateY(-10%)",
          },
        },
        moveInCircle: {
          "0%": {
            transform: "rotate(0deg)",
          },
          "50%": {
            transform: "rotate(180deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        moveVertical: {
          "0%": {
            transform: "translateY(-50%)",
          },
          "50%": {
            transform: "translateY(50%)",
          },
          "100%": {
            transform: "translateY(-50%)",
          },
        },
      },
      animation: {
        // Existing animations
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'hover-scale': 'hover-scale 0.2s ease-out',
        // Dashboard-prefixed animation
        'dashboard-accordion-down': 'dashboard-accordion-down 0.2s ease-out',
        'dashboard-accordion-up': 'dashboard-accordion-up 0.2s ease-out',
        'dashboard-fade-in': 'dashboard-fade-in 0.3s ease-out',
        'dashboard-fade-out': 'dashboard-fade-out 0.3s ease-out',
        'dashboard-scale-in': 'dashboard-scale-in 0.2s ease-out',
        'dashboard-slide-in-right': 'dashboard-slide-in-right 0.3s ease-out',
        'dashboard-hover-scale': 'dashboard-hover-scale 0.2s ease-out',
        // Animation for the background
        first: "moveVertical 30s ease infinite",
        second: "moveInCircle 20s reverse infinite",
        third: "moveInCircle 40s linear infinite",
        fourth: "moveHorizontal 40s ease infinite",
        fifth: "moveInCircle 20s ease infinite",
      },
  	},
  },
  plugins: [require("tailgrids/plugin"), require("tailwindcss-animate")],
};
export default config;