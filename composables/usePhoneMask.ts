/**
 * Format raw string into +7 (7XX) XXX-XX-XX format
 * Restricts to max 11 digits (7 + 10 digits) and only digits.
 * Properly allows backspace / deletion and full clearing without getting stuck on hyphens or brackets.
 */
export function formatKazakhstanPhone(value: string, isDeleting = false): string {
  if (!value) return ''
  
  // Extract only digits
  let digits = value.replace(/\D/g, '')
  
  if (!digits) return ''

  // If user cleared everything except initial 7/8
  if (digits === '7' || digits === '8') {
    if (value.length <= 2 || isDeleting) {
      return ''
    }
  }

  // If starts with 8, normalize to 7
  if (digits.startsWith('8')) {
    digits = '7' + digits.slice(1)
  } else if (!digits.startsWith('7')) {
    digits = '7' + digits
  }

  // Strictly limit to 11 digits (Kazakhstan / CIS: 7 + 10 digits)
  digits = digits.slice(0, 11)

  if (digits.length <= 1 && isDeleting) {
    return ''
  }

  let formatted = '+7'
  
  if (digits.length > 1) {
    formatted += ' (' + digits.slice(1, Math.min(4, digits.length))
  }
  if (digits.length > 4) {
    formatted += ') ' + digits.slice(4, Math.min(7, digits.length))
  } else if (digits.length === 4 && !isDeleting) {
    formatted += ') '
  }
  
  if (digits.length > 7) {
    formatted += '-' + digits.slice(7, Math.min(9, digits.length))
  } else if (digits.length === 7 && !isDeleting) {
    formatted += '-'
  }
  
  if (digits.length > 9) {
    formatted += '-' + digits.slice(9, Math.min(11, digits.length))
  } else if (digits.length === 9 && !isDeleting) {
    formatted += '-'
  }

  return formatted
}

export function handlePhoneInput(event: Event, updateFn: (val: string) => void) {
  const target = event.target as HTMLInputElement
  const inputEvent = event as InputEvent
  const isDeleting = inputEvent?.inputType === 'deleteContentBackward' || inputEvent?.inputType === 'deleteContentForward'
  
  let raw = target.value

  if (isDeleting) {
    // If ending with punctuation, trim it off
    raw = raw.replace(/[\s\(\)\-]+$/, '')
  }

  const digits = raw.replace(/\D/g, '')
  if (!digits || (digits.length <= 1 && isDeleting)) {
    updateFn('')
    target.value = ''
    return
  }

  const formatted = formatKazakhstanPhone(raw, isDeleting)
  updateFn(formatted)
  target.value = formatted
}
