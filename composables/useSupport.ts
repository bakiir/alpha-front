export interface SupportMessage {
  id: number
  body: string
  sender_type: 'user' | 'staff' | 'system'
  created_at: string
  user?: { name?: string }
}

export interface SupportTicket {
  id: number
  subject: string
  topic?: string
  status: 'open' | 'pending' | 'closed' | string
  created_at: string
  updated_at?: string
  messages?: SupportMessage[]
}

export type CreateTicketPayload = {
  subject: string
  topic?: string
  message: string
  name?: string
  phone?: string
  email?: string
}

export const useSupport = () => {
  const { request } = useApi()

  const fetchTickets = async () => {
    const res = await request<{ data?: SupportTicket[] } | SupportTicket[]>('/support-tickets')
    if (Array.isArray(res)) return res
    return res?.data ?? []
  }

  const fetchTicket = async (id: number) => {
    const res = await request<{ data?: SupportTicket } | SupportTicket>(`/support-tickets/${id}`)
    if (res && typeof res === 'object' && 'data' in res && res.data) return res.data
    return res as SupportTicket
  }

  const createTicket = async (payload: CreateTicketPayload) => {
    return await request<{ data: SupportTicket }>('/support-tickets', {
      method: 'POST',
      body: payload,
    })
  }

  const updateTicket = async (id: number, payload: { subject?: string; status?: string }) => {
    return await request<{ data: SupportTicket }>(`/support-tickets/${id}`, {
      method: 'PUT',
      body: payload,
    })
  }

  const deleteTicket = async (id: number) => {
    return await request<{ message?: string }>(`/support-tickets/${id}`, {
      method: 'DELETE',
    })
  }

  const fetchMessages = async (ticketId: number) => {
    const res = await request<{ data?: SupportMessage[] } | SupportMessage[]>(
      `/support-tickets/${ticketId}/messages`,
    )
    if (Array.isArray(res)) return res
    return res?.data ?? []
  }

  const sendMessage = async (ticketId: number, body: string) => {
    return await request<{ data: SupportMessage }>(`/support-tickets/${ticketId}/messages`, {
      method: 'POST',
      body: { body },
    })
  }

  return {
    fetchTickets,
    fetchTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    fetchMessages,
    sendMessage,
  }
}
