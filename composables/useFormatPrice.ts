export const useFormatPrice = () => {
  const formatPrice = (val: number | string | null | undefined): string => {
    const num = typeof val === 'number' ? val : parseInt(String(val ?? '0').replace(/\D/g, ''), 10) || 0
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  return { formatPrice }
}
