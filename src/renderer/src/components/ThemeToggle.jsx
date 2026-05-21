import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
      aria-label="Toggle theme"
    >
      <div className={`theme-toggle-track ${isDark ? 'dark' : 'light'}`}>
        <Sun size={12} className="theme-toggle-sun" />
        <Moon size={12} className="theme-toggle-moon" />
        <div className="theme-toggle-knob" />
      </div>
    </button>
  )
}
