import { computed } from 'vue'

export interface CartItem {
  id: number | string
  title: string
  price: number
  quantity: number
  image: string
}

export const useCart = () => {
  const items = useState<CartItem[]>('global_cart_items', () => [
    {
      id: 1,
      title: 'Балансир Лунный Кот',
      price: 8900,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80'
    }
  ])

  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const addItem = (product: { id: number | string; title: string; price: number | string; image: string }) => {
    const numPrice = typeof product.price === 'number' 
      ? product.price 
      : parseInt(String(product.price).replace(/\D/g, ''), 10) || 8900

    const existing = items.value.find(i => String(i.id) === String(product.id) || i.title === product.title)
    if (existing) {
      existing.quantity += 1
    } else {
      items.value.push({
        id: product.id,
        title: product.title,
        price: numPrice,
        quantity: 1,
        image: product.image
      })
    }
  }

  const removeItem = (id: number | string) => {
    const idx = items.value.findIndex(i => String(i.id) === String(id))
    if (idx > -1) {
      items.value.splice(idx, 1)
    }
  }

  const increaseQty = (id: number | string) => {
    const item = items.value.find(i => String(i.id) === String(id))
    if (item) {
      item.quantity += 1
    }
  }

  const decreaseQty = (id: number | string) => {
    const item = items.value.find(i => String(i.id) === String(id))
    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1
      } else {
        removeItem(id)
      }
    }
  }

  const clearCart = () => {
    items.value = []
  }

  return {
    items,
    totalCount,
    totalPrice,
    addItem,
    removeItem,
    increaseQty,
    decreaseQty,
    clearCart
  }
}
