import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))',
                },
                // Project Kisan farming theme colors
                farm: {
                    soil: 'hsl(var(--farm-soil))',
                    leaf: 'hsl(var(--farm-leaf))',
                    sun: 'hsl(var(--farm-sun))',
                    sky: 'hsl(var(--farm-sky))',
                },
                // Custom colors related to ArtiSAN.ai for primary/hero variants
                'arti-primary': 'hsl(var(--arti-primary))',
                'arti-secondary': 'hsl(var(--arti-secondary))',
                // Additional functional colors for success/warning/error
                success: {
                    DEFAULT: 'hsl(var(--success))',
                    foreground: 'hsl(var(--success-foreground))',
                },
                warning: {
                    DEFAULT: 'hsl(var(--warning))',
                    foreground: 'hsl(var(--warning-foreground))',
                },
                error: {
                    DEFAULT: 'hsl(var(--error))',
                    foreground: 'hsl(var(--error-foreground))',
                },
                // Chart colors for data visualization
                chart: {
                    1: 'hsl(var(--chart-1))',
                    2: 'hsl(var(--chart-2))',
                    3: 'hsl(var(--chart-3))',
                    4: 'hsl(var(--chart-4))',
                    5: 'hsl(var(--chart-5))',
                }
            },
            fontFamily: {
                primary: 'var(--font-primary)',
                indian: 'var(--font-indian)',
            },
            boxShadow: {
                soft: 'var(--shadow-soft)',
                medium: 'var(--shadow-medium)',
                // Custom shadows for ArtiSAN.ai
                glow: '0 0 10px rgba(var(--primary-rgb), 0.5), 0 0 20px rgba(var(--primary-rgb), 0.3)',
                strong: '7px 7px 20px rgba(0, 0, 0, 0.15)',
                card: 'var(--shadow-card)',
            },
            backgroundImage: {
                'rural-gradient': 'linear-gradient(135deg, hsl(var(--rural-gradient-start)), hsl(var(--rural-gradient-middle)) 50%, hsl(var(--rural-gradient-end)))',
                'farm-gradient': 'linear-gradient(135deg, hsl(var(--farm-leaf)), hsl(var(--farm-sun)) 50%, hsl(var(--farm-sky)))',
                // Custom gradients for ArtiSAN.ai
                'gradient-primary': 'linear-gradient(to right, hsl(var(--arti-primary)), hsl(var(--arti-secondary)))',
                'gradient-hero': 'linear-gradient(to bottom right, hsl(var(--arti-primary)), hsl(var(--arti-secondary)))',
                'gradient-muted': 'linear-gradient(to right, hsl(var(--muted)) 0%, hsl(var(--faded-muted)) 100%)',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'accordion-down': {
                    from: {
                        height: '0'
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)'
                    }
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)'
                    },
                    to: {
                        height: '0'
                    }
                },
                'bounce-gentle': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' }
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.8', transform: 'scale(1.05)' }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                'ripple': {
                    '0%': { transform: 'scale(0)', opacity: '1' },
                    '100%': { transform: 'scale(4)', opacity: '0' }
                },
                'pulse-slow': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' }
                },
                'wave': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' }
                },
                'pulse-fast': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' }
                },
                'spin-slow': {
                    'from': { transform: 'rotate(0deg)' },
                    'to': { transform: 'rotate(360deg)' }
                }
            },
			animation: {
				'accordion-down': 'accordion-down 0.4s ease-out',
				'accordion-up': 'accordion-up 0.4s ease-out',
				'bounce-gentle': 'bounce-gentle 4s infinite',
				'pulse-soft': 'pulse-soft 4s infinite',
				'float': 'float 6s ease-in-out infinite',
				'ripple': 'ripple 1.2s linear',
				'pulse-slow': 'pulse-slow 6s infinite ease-in-out',
				'wave': 'wave 3s infinite ease-in-out',
				'pulse-fast': 'pulse-fast 2s infinite ease-in-out',
				'spin-slow': 'spin-slow 10s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")], // eslint-disable-line @typescript-eslint/no-require-imports
} satisfies Config;
