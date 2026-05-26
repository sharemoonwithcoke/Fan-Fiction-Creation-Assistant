import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GuestState {
  guestToken: string | null
  setGuestToken: (token: string) => void
  clearGuestToken: () => void
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set) => ({
      guestToken: null,
      setGuestToken: (guestToken) => set({ guestToken }),
      clearGuestToken: () => set({ guestToken: null }),
    }),
    { name: 'fanfic-guest' },
  ),
)
