/**
 * 価格を日本円フォーマットで表示
 */
export const formatPrice = (price: number) => `¥${price.toLocaleString()}`
