import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'

interface ThemeContextType {
	isDarkMode: boolean
	toggleTheme: () => void
	setTheme: (theme: 'light' | 'dark') => void
}

const defaultContextValue: ThemeContextType = {
	isDarkMode: false,
	toggleTheme: () => {},
	setTheme: () => {},
}

const ThemeContext = createContext<ThemeContextType>(defaultContextValue)

export const useTheme = () => useContext(ThemeContext)

interface ThemeProviderProps {
	children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
	const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
	const [isInitialized, setIsInitialized] = useState<boolean>(false)

	const applyTheme = (isDark: boolean): void => {
		const root = document.documentElement

		if (isDark) {
			root.classList.add('dark')
			localStorage.setItem('theme', 'dark')
		} else {
			root.classList.remove('dark')
			localStorage.setItem('theme', 'light')
		}
	}

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null

		let initialTheme = false

		if (savedTheme) {
			initialTheme = savedTheme === 'dark'
		} else {
			initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
		}

		setIsDarkMode(initialTheme)
		applyTheme(initialTheme)
		setIsInitialized(true)
	}, [])

	const toggleTheme = (): void => {
		const newTheme = !isDarkMode
		setIsDarkMode(newTheme)
		applyTheme(newTheme)
	}

	const setTheme = (theme: 'light' | 'dark'): void => {
		const isDark = theme === 'dark'
		setIsDarkMode(isDark)
		applyTheme(isDark)
	}

	if (!isInitialized) {
		return null
	}

	return (
		<ThemeContext.Provider
			value={{
				isDarkMode,
				toggleTheme,
				setTheme,
			}}
		>
			{children}
		</ThemeContext.Provider>
	)
}
