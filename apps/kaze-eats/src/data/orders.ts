export type OrderStatus = 'preparing' | 'on-the-way' | 'delivered' | 'cancelled'

export type OrderItem = {
  id: string
  name: string
  quantity: number
  price: number
}

export type Order = {
  id: string
  restaurantId: string
  restaurantName: string
  items: OrderItem[]
  total: number
  deliveryFee: number
  status: OrderStatus
  orderDate: string
  estimatedDelivery: string
  deliveryAddress: string
  driverName?: string
  driverPhone?: string
}

export const orders: Order[] = [
  {
    id: 'o1',
    restaurantId: 'r1',
    restaurantName: 'Sakura Sushi',
    items: [
      { id: 'i1', name: 'Salmon Nigiri Set', quantity: 1, price: 1580 },
      { id: 'i2', name: 'Dragon Roll', quantity: 1, price: 1280 },
      { id: 'i3', name: 'Miso Soup', quantity: 2, price: 280 },
    ],
    total: 3720,
    deliveryFee: 300,
    status: 'delivered',
    orderDate: '2026-03-07T12:30:00',
    estimatedDelivery: '2026-03-07T13:05:00',
    deliveryAddress: '東京都渋谷区神宮前 1-2-3',
    driverName: 'Kenji Tanaka',
  },
  {
    id: 'o2',
    restaurantId: 'r4',
    restaurantName: 'Seoul Kitchen',
    items: [
      { id: 'i4', name: 'Bibimbap', quantity: 2, price: 1080 },
      { id: 'i5', name: 'Korean Fried Chicken', quantity: 1, price: 1280 },
    ],
    total: 3740,
    deliveryFee: 300,
    status: 'on-the-way',
    orderDate: '2026-03-08T11:45:00',
    estimatedDelivery: '2026-03-08T12:20:00',
    deliveryAddress: '東京都渋谷区神宮前 1-2-3',
    driverName: 'Yuki Sato',
    driverPhone: '090-1234-5678',
  },
  {
    id: 'o3',
    restaurantId: 'r2',
    restaurantName: 'Napoli Pizza House',
    items: [
      { id: 'i6', name: 'Margherita Pizza', quantity: 1, price: 1380 },
      { id: 'i7', name: 'Carbonara', quantity: 1, price: 1280 },
      { id: 'i8', name: 'Tiramisu', quantity: 1, price: 680 },
    ],
    total: 3690,
    deliveryFee: 350,
    status: 'preparing',
    orderDate: '2026-03-08T12:00:00',
    estimatedDelivery: '2026-03-08T12:40:00',
    deliveryAddress: '東京都渋谷区神宮前 1-2-3',
  },
  {
    id: 'o4',
    restaurantId: 'r5',
    restaurantName: 'Burger Lab',
    items: [
      { id: 'i9', name: 'Double Bacon Burger', quantity: 2, price: 1380 },
      { id: 'i10', name: 'Truffle Fries', quantity: 1, price: 580 },
      { id: 'i11', name: 'Milkshake', quantity: 2, price: 580 },
    ],
    total: 4500,
    deliveryFee: 200,
    status: 'delivered',
    orderDate: '2026-03-06T19:00:00',
    estimatedDelivery: '2026-03-06T19:20:00',
    deliveryAddress: '東京都渋谷区神宮前 1-2-3',
    driverName: 'Haruto Ito',
  },
  {
    id: 'o5',
    restaurantId: 'r7',
    restaurantName: 'Sweet Tooth Bakery',
    items: [
      { id: 'i12', name: 'Matcha Cheesecake', quantity: 2, price: 680 },
      { id: 'i13', name: 'Strawberry Shortcake', quantity: 1, price: 780 },
    ],
    total: 2490,
    deliveryFee: 350,
    status: 'delivered',
    orderDate: '2026-03-05T15:30:00',
    estimatedDelivery: '2026-03-05T16:05:00',
    deliveryAddress: '東京都渋谷区神宮前 1-2-3',
    driverName: 'Mika Watanabe',
  },
  {
    id: 'o6',
    restaurantId: 'r3',
    restaurantName: 'Dragon Palace',
    items: [
      { id: 'i14', name: 'Peking Duck', quantity: 1, price: 2480 },
      { id: 'i15', name: 'Xiaolongbao (6pc)', quantity: 2, price: 980 },
    ],
    total: 4690,
    deliveryFee: 250,
    status: 'cancelled',
    orderDate: '2026-03-04T18:15:00',
    estimatedDelivery: '2026-03-04T18:45:00',
    deliveryAddress: '東京都渋谷区神宮前 1-2-3',
  },
  {
    id: 'o7',
    restaurantId: 'r8',
    restaurantName: 'Taro Ramen',
    items: [
      { id: 'i16', name: 'Tonkotsu Ramen', quantity: 1, price: 1080 },
      { id: 'i17', name: 'Gyoza (6pc)', quantity: 1, price: 480 },
      { id: 'i18', name: 'Karaage', quantity: 1, price: 580 },
    ],
    total: 2390,
    deliveryFee: 250,
    status: 'delivered',
    orderDate: '2026-03-03T12:00:00',
    estimatedDelivery: '2026-03-03T12:25:00',
    deliveryAddress: '東京都渋谷区神宮前 1-2-3',
    driverName: 'Aoi Nakamura',
  },
  {
    id: 'o8',
    restaurantId: 'r6',
    restaurantName: 'Green Bowl Cafe',
    items: [
      { id: 'i19', name: 'Acai Bowl', quantity: 1, price: 980 },
      { id: 'i20', name: 'Matcha Latte', quantity: 1, price: 480 },
    ],
    total: 1760,
    deliveryFee: 300,
    status: 'delivered',
    orderDate: '2026-03-02T08:30:00',
    estimatedDelivery: '2026-03-02T09:00:00',
    deliveryAddress: '東京都渋谷区神宮前 1-2-3',
    driverName: 'Sakura Yoshida',
  },
]
