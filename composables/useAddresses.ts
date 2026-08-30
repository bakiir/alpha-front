export interface UserAddress {
  id: number
  label: string
  city: string
  street: string
  building: string
  apartment?: string | null
  entrance?: string | null
  floor?: string | null
  comment?: string | null
  is_default: boolean
  full_address?: string
}

export type AddressPayload = Omit<UserAddress, 'id' | 'is_default' | 'full_address'> & {
  is_default?: boolean
}

export const useAddresses = () => {
  const { request } = useApi()

  const fetchAddresses = async () => {
    const res = await request<{ data?: UserAddress[] } | UserAddress[]>('/addresses')
    if (Array.isArray(res)) return res
    return res?.data ?? []
  }

  const createAddress = async (payload: AddressPayload) => {
    return await request<{ data: UserAddress }>('/addresses', {
      method: 'POST',
      body: payload,
    })
  }

  const updateAddress = async (id: number, payload: Partial<AddressPayload>) => {
    return await request<{ data: UserAddress }>(`/addresses/${id}`, {
      method: 'PUT',
      body: payload,
    })
  }

  const deleteAddress = async (id: number) => {
    return await request<{ message?: string }>(`/addresses/${id}`, {
      method: 'DELETE',
    })
  }

  const setDefaultAddress = async (id: number) => {
    return await request<{ data: UserAddress }>(`/addresses/${id}/default`, {
      method: 'POST',
    })
  }

  return {
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  }
}
