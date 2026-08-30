export const formatApiError = (error: any, fallback = 'Произошла ошибка. Попробуйте ещё раз.'): string => {
  const data = error?.data ?? error?.response?._data
  if (data?.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors).flat().filter(Boolean)
    if (messages.length > 0) {
      return messages.join('\n')
    }
  }
  return data?.message || error?.message || fallback
}
