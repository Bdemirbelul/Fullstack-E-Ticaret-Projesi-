import { api } from './api'

export type AssistantChatContext = {
  page: string
  selectedCategory: string | null
  cartItems: Array<{
    productId: number
    name: string
    quantity: number
    finalPrice: number
    categoryName?: string
  }>
}

export type AssistantChatRequest = {
  message: string
  context: AssistantChatContext
}

export type AssistantChatResponse = {
  reply: string
}

export async function postAssistantChat(body: AssistantChatRequest) {
  const { data } = await api.post<AssistantChatResponse>('/api/assistant/chat', body)
  return data
}
