import { create } from 'zustand'

import type { MenuItem, Restaurant } from './restaurants'

export type CartItem = MenuItem & {
  quantity: number
}

type CartStore = {
  items: CartItem[]
  restaurant: Restaurant | null
  addItem: (item: MenuItem, restaurant: Restaurant) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  subtotal: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  restaurant: null,

  addItem: (item, restaurant) => {
    const { items, restaurant: currentRestaurant } = get()
    if (currentRestaurant && currentRestaurant.id !== restaurant.id) {
      set({ items: [{ ...item, quantity: 1 }], restaurant })
      return
    }
    const existing = items.find((i) => i.id === item.id)
    if (existing) {
      set({
        items: items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
        restaurant,
      })
    } else {
      set({ items: [...items, { ...item, quantity: 1 }], restaurant })
    }
  },

  removeItem: (itemId) => {
    const { items } = get()
    const newItems = items.filter((i) => i.id !== itemId)
    set({
      items: newItems,
      restaurant: newItems.length === 0 ? null : get().restaurant,
    })
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId)
      return
    }
    set({
      items: get().items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
    })
  },

  clearCart: () => set({ items: [], restaurant: null }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}))
