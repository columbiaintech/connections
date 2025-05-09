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

			'midnight':'#222838',
			'midnight-600': '#313A50',
			'midnight-500': '#404B68',
			'midnight-400': '#4E5B80',
			'midnight-300': '#5D6C97',
			'midnight-200': '#7280A8',
			'midnight-100': '#8592C0',

			'steel':'#3C6783',
			'steel-600':'#467898',
			'steel-500':'#4F87AC',
			'steel-400':'#6195B7',
			'steel-300':'#75A2C0',
			'steel-200':'#89AFC9',
			'steel-100':'#9DBCD2',

			'loch': '#46948D',
			'loch-600': '#4FA7A0',
			'loch-500': '#5DB3AC',
			'loch-400': '#6FBBB5',
			'loch-300': '#81C4BE',
			'loch-200': '#93CCC8',
			'loch-100': '#A5D5D1',

			'berry': '#BB4D7D',
			'berry-600': '#C25E89',
			'berry-500': '#C86E95',
			'berry-400': '#CE7EA1',
			'berry-300': '#D48EAC',
			'berry-200': '#DA9EB8',
			'berry-100': '#E0AEC4',

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
