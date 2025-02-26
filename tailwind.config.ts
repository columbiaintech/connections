import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
		backgroundImage:{
			'style1':'url("/clean.svg")',
			'style2':'url("/noise.svg")',
		},
		colors: {
			'rose': '#FF69A8',
			'rose-600': '#ff81b7',
			'rose-500': '#ff8ec1',
			'rose-400': '#ffacd1',
			'rose-300': '#ffcbd7',
			'rose-200': '#ffdfe9',
			'rose-100': '#ffeef5',

			'teal': '#44B2BA',
			'teal-500': '#4bb8c0',
			'teal-400':'#5cbfc7',
			'teal-300':'#7fd0d5',
			'teal-200':'#b0dde0',
			'teal-100':'#c3e4e7',

			'sea': '#157A77',
			'sea-100': '#cde7e3',
			'sea-200': '#b8dcd7',
			'sea-300': '#9ad0c5',
			'sea-400': '#6db6b5',
			'sea-500': '#4aa2a1',
			'sea-600': '#2d8d8a',


			'tangy': '#ff9861',
			'tangy-100': '#ffe9d0',
			'tangy-200': '#ffe2b1',
			'tangy-400':'#ffba92',

			'mustard': '#F7C568',
			'mustard-600': '#f8cb79',

			'mustard-100': '#fff4dc',
			'mustard-200': '#ffeec6',

			'blue': '#81A6FF',
			'blue-100': '#e2eaff',
			'blue-200': '#d8e0ff',

			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
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
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
