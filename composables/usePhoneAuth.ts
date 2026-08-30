export type PhoneRegisterPayload = {
  phone: string
  code: string
  name?: string
  email?: string
}

export const usePhoneAuth = () => {
  const { request } = useApi()

  const normalizePhone = (phone: string) => phone.replace(/\D/g, '')

  const sendCode = async (phone: string) => {
    return await request<{
      message?: string
      expires_in?: number
      delivery?: 'mock' | 'sms'
      dev_code?: string
    }>('/auth/phone/send-code', {
      method: 'POST',
      body: { phone: normalizePhone(phone) },
    })
  }

  const loginWithPhone = async (phone: string, code: string) => {
    return await request<{ access_token: string; user: any }>('/auth/phone/login', {
      method: 'POST',
      body: { phone: normalizePhone(phone), code },
    })
  }

  const verifyCode = async (phone: string, code: string) => {
    return await request<{ access_token?: string; user?: any; is_new_user?: boolean }>(
      '/auth/phone/verify',
      {
        method: 'POST',
        body: { phone: normalizePhone(phone), code },
      },
    )
  }

  const registerWithPhone = async (payload: PhoneRegisterPayload) => {
    return await request<{ access_token: string; user: any }>('/auth/phone/register', {
      method: 'POST',
      body: {
        ...payload,
        phone: normalizePhone(payload.phone),
      },
    })
  }

  return {
    sendCode,
    verifyCode,
    loginWithPhone,
    registerWithPhone,
    normalizePhone,
  }
}
