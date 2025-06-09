import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
	darkMode: "class",
	extend: {
		fontFamily: {
		  oswald: ['var(--font-oswald)'],
		  roboto: ['var(--font-roboto)'],
		},
		colors: {
		  background: '#EDF2F4',
		  foreground: 'hsl(0, 0%, 10%)',
  
		  card: '#FFFFFF',
		  'card-foreground': 'hsl(0, 0%, 10%)',
  
		  popover: '#FFFFFF',
		  'popover-foreground': 'hsl(0, 0%, 10%)',
  
		  primary: '#2B2D42',
		  'primary-foreground': '#FFFFFF',
  
		  secondary: '#D9D9D9',
		  'secondary-foreground': '#1C1C1C',
  
		  muted: '#F1F1F1',
		  'muted-foreground': '#5A5A5A',
  
		  accent: '#FFB703',
		  'accent-foreground': '#1C1C1C',
  
		  destructive: '#EF233C',
		  'destructive-foreground': '#FFFFFF',
  
		  border: '#D9D9D9',
		  input: '#D9D9D9',
		  ring: '#2B2D42',
  
		  // Chart colors
		  'chart-1': 'hsl(0, 84%, 60%)',
		  'chart-2': 'hsl(210, 10%, 40%)',
		  'chart-3': 'hsl(45, 90%, 51%)',
		  'chart-4': 'hsl(0, 0%, 30%)',
		  'chart-5': 'hsl(220, 15%, 80%)',
		},
		borderRadius: {
		  DEFAULT: '0.5rem',
		},
	  },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
