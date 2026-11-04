export type SupportCategory =
  | 'subscription'
  | 'delivery'
  | 'toys'
  | 'payment'
  | 'purchase'
  | 'rental'
  | 'gifts'
  | 'other'

export type SupportTicketStatus =
  | 'new'
  | 'in_progress'
  | 'awaiting_client'
  | 'resolved'
  | 'closed'

export interface SupportMessage {
  id: number
  body: string
  is_staff: boolean
  created_at: string
}

export interface SupportTicket {
  id: number
  ticket_number?: string
  category: SupportCategory
  subject: string
  status: SupportTicketStatus | string
  city_id?: number | null
  created_at: string
  closed_at?: string | null
  messages?: SupportMessage[]
}

export type CreateTicketPayload = {
  category: SupportCategory
  subject: string
  body: string
}

export const useSupport = () => {
  const { request } = useApi()
  const { cityId } = useCity()

  const fetchTickets = async (): Promise<SupportTicket[]> => {
    const res = await request<{ data?: SupportTicket[] } | SupportTicket[]>('/support-tickets')
    if (Array.isArray(res)) return res
    return res?.data ?? []
  }

  const fetchTicket = async (id: number): Promise<SupportTicket> => {
    const res = await request<{ data?: SupportTicket } | SupportTicket>(`/support-tickets/${id}`)
    if (res && typeof res === 'object' && 'data' in res && res.data) return res.data
    return res as SupportTicket
  }

  const createTicket = async (payload: CreateTicketPayload) => {
    return await request<{ data: SupportTicket }>('/support-tickets', {
      method: 'POST',
      body: {
        category: payload.category,
        subject: payload.subject,
        body: payload.body,
        city_id: cityId.value || undefined,
      },
    })
  }

  const replyToTicket = async (ticketId: number, body: string) => {
    return await request<{ data: SupportTicket }>(`/support-tickets/${ticketId}/reply`, {
      method: 'POST',
      body: { body },
    })
  }

  return {
    fetchTickets,
    fetchTicket,
    createTicket,
    replyToTicket,
  }
}
