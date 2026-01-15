import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { STORAGE_KEYS } from '../constants/storageKeys'

type Language = 'en' | 'ko'

interface UiState {
  sidebarCollapsed: boolean
  sidebarOpen: boolean // For mobile/tablet drawer
  masterCodeSidebarOpen: boolean // For master code sidebar mobile/tablet drawer
  theme: 'light' | 'dark'
  language: Language
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarOpen: () => void
  setMasterCodeSidebarOpen: (open: boolean) => void
  toggleMasterCodeSidebarOpen: () => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  setLanguage: (language: Language) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarOpen: false, // Mobile/tablet drawer starts closed
      masterCodeSidebarOpen: false, // Master code sidebar mobile/tablet drawer starts closed
      theme: 'light',
      language: 'en',
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebarOpen: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setMasterCodeSidebarOpen: (open) => set({ masterCodeSidebarOpen: open }),
      toggleMasterCodeSidebarOpen: () => set((state) => ({ masterCodeSidebarOpen: !state.masterCodeSidebarOpen })),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setLanguage: (language) => set({ language }),
    }),
    {
      // Note: Storage key name is 'sidebar_collapsed' for backward compatibility,
      // but it actually stores multiple UI state values (sidebar, theme, language)
      name: STORAGE_KEYS.SIDEBAR_COLLAPSED,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        language: state.language,
        masterCodeSidebarOpen: state.masterCodeSidebarOpen,
      }),
    }
  )
)

