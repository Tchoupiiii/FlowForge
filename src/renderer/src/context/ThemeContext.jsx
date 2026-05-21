import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

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

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try {
      if (window.electronAPI) window.electronAPI.setTheme(next)
    } catch (e) {}
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
