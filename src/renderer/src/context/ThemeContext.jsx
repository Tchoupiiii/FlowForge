import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const THEMES = ['dark', 'light', 'mono', 'cyberpunk', 'ocean', 'forest', 'dracula', 'sakura']

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const loadTheme = async () => {
      try {
        if (window.electronAPI) {
          const saved = await window.electronAPI.getTheme()
          if (saved) setTheme(saved)
        }
      } catch (e) {
        console.log('Theme load fallback to dark')
      }
    }
    loadTheme()
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const changeTheme = (newTheme) => {
    if (THEMES.includes(newTheme)) {
      setTheme(newTheme)
      try {
        if (window.electronAPI) window.electronAPI.setTheme(newTheme)
      } catch (e) {}
    }
  }

  const toggleTheme = () => {
    const currentIndex = THEMES.indexOf(theme)
    const nextIndex = (currentIndex + 1) % THEMES.length
    const next = THEMES[nextIndex]
    changeTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, changeTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export default ThemeContext

