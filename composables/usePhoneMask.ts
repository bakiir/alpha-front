/**
 * Format raw string into +7 (7XX) XXX-XX-XX format for Kazakhstan / CIS
 * Restricts to max 11 digits (7 + 10 digits).
 * Properly allows backspace / deletion and full clearing without getting stuck on hyphens or brackets.
 * Handles copy-paste and browser autofill cleanly.
 */
export function formatKazakhstanPhone(value: string, isDeleting = false): string {
  if (!value) return ''
  
  // Extract only digits
  let digits = value.replace(/\D/g, '')
  if (!digits) return ''

  // If user is deleting and only 1 digit left, allow clearing
  if (isDeleting && digits.length <= 1) {
    return ''
  }

  // If starts with 8, normalize to 7
  if (digits.startsWith('8')) {
    digits = '7' + digits.slice(1)
  } else if (!digits.startsWith('7')) {
    // If starts with 7XX, prepend 7
    digits = '7' + digits
  }

  // Limit to 11 digits (7 + 10 digits)
  digits = digits.slice(0, 11)

  let formatted = '+7'
  
  if (digits.length > 1) {
    formatted += ' (' + digits.slice(1, Math.min(4, digits.length))
  }
  
  if (digits.length >= 4) {
    formatted += ') ' + digits.slice(4, Math.min(7, digits.length))
  }
  
  if (digits.length >= 7) {
    formatted += '-' + digits.slice(7, Math.min(9, digits.length))
  }
  
  if (digits.length >= 9) {
    formatted += '-' + digits.slice(9, Math.min(11, digits.length))
  }

  return formatted
}

export function handlePhoneInput(event: Event, updateFn: (val: string) => void) {
  const target = event.target as HTMLInputElement
  if (!target) return
  
  const inputEvent = event as InputEvent
  const isDeleting = inputEvent?.inputType === 'deleteContentBackward' || inputEvent?.inputType === 'deleteContentForward'
  
  let raw = target.value

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

export function handlePhonePaste(event: ClipboardEvent, updateFn: (val: string) => void) {
  event.preventDefault()
  const pastedText = event.clipboardData?.getData('text') || ''
  const formatted = formatKazakhstanPhone(pastedText, false)
  const target = event.target as HTMLInputElement
  updateFn(formatted)
  if (target) {
    target.value = formatted
  }
}
