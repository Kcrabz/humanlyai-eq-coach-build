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
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				humanly: {
					teal: {
						light: '#4fb5c7',
						DEFAULT: '#0097b2', 
						dark: '#007d94'
					},
					green: {
						light: '#a1e47a',
						DEFAULT: '#7ed957',
						dark: '#64c03d'
					},
					gray: {
						lightest: '#F1F0FB',
						light: '#C8C8C9',
						DEFAULT: '#8E9196',
						dark: '#403E43'
					},
					// New pastel colors inspired by calmi.so
					pastel: {
						blue: '#D3E5F8',
						lavender: '#E5DEFF',
						mint: '#D6F5E6',
						peach: '#FFE8D6',
						pink: '#FFE0E6',
						yellow: '#FFF7D6'
					}
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: '1rem',
				'2xl': '1.5rem'
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
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'gradient-flow': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'float': {
					'0%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' },
					'100%': { transform: 'translateY(0px)' }
				},
				'scale-fade-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
				'gradient-flow': 'gradient-flow 6s ease infinite',
				'float': 'float 6s ease-in-out infinite',
				'scale-fade-in': 'scale-fade-in 0.4s ease-out',
				'slide-up': 'slide-up 0.3s ease-out'
			},
			fontFamily: {
				sans: ['Inter', 'Lato', 'system-ui', 'sans-serif'],
				display: ['Inter', 'Lato', 'system-ui', 'sans-serif']
			},
			backgroundSize: {
				'size-200': '200% 200%',
			},
			boxShadow: {
				'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
				'soft-lg': '0 8px 30px rgba(0, 0, 0, 0.07)'
			},
			typography: (theme) => ({
				DEFAULT: {
					css: {
						color: theme('colors.gray.900'),
						a: {
							color: theme('colors.humanly.teal.DEFAULT'),
							'&:hover': {
								color: theme('colors.humanly.teal.dark'),
							},
						},
						h1: {
							color: theme('colors.gray.900'),
							fontWeight: '600',
						},
						h2: {
							color: theme('colors.gray.900'),
							fontWeight: '600',
						},
						h3: {
							color: theme('colors.gray.900'),
							fontWeight: '600',
						},
						h4: {
							color: theme('colors.gray.900'),
							fontWeight: '600',
						},
						code: {
							color: theme('colors.humanly.teal.dark'),
							backgroundColor: theme('colors.humanly.gray.lightest'),
							borderRadius: theme('borderRadius.sm'),
							padding: '0.2em 0.4em',
							fontWeight: '400',
						},
						'code::before': {
							content: '""',
						},
						'code::after': {
							content: '""',
						},
						pre: {
							backgroundColor: theme('colors.humanly.gray.lightest'),
							borderRadius: theme('borderRadius.md'),
							padding: theme('spacing.4'),
						},
						blockquote: {
							borderLeftColor: theme('colors.humanly.teal.light'),
							backgroundColor: theme('colors.humanly.gray.lightest'),
							fontStyle: 'normal',
							padding: theme('spacing.4'),
							borderRadius: theme('borderRadius.md'),
							marginLeft: 0,
							marginRight: 0,
						}
					},
				},
			}),
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/typography")
	],
} satisfies Config;
