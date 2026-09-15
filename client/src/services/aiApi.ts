/**
 * Client for the AI endpoints. Mirrors the axios pattern in enquiryApi.ts.
 *
 * Note what these functions do NOT do: throw on a degraded backend. Search
 * returns keyword results when the AI is unavailable, and the assistant reports
 * `available: false` rather than erroring. The UI is built around that, so a
 * deployment without an API key shows a working site, not a broken one.
 */

import axios from 'axios';
import type { Product } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export interface SearchResponse {
  success: true;
  /** 'ai' when the model ranked these, 'keyword' when it fell back. */
  mode: 'ai' | 'keyword';
  summary: string;
  count: number;
  products: Product[];
  note?: string;
  cached?: boolean;
}

export async function searchProducts(query: string): Promise<SearchResponse> {
  const { data } = await api.post<SearchResponse>('/search', { query });
  return data;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantResponse {
  available: boolean;
  reply?: string;
  reason?: string;
  rateLimited?: boolean;
  guardrailTriggered?: boolean;
  error?: boolean;
}

export async function askAssistant(messages: ChatTurn[]): Promise<AssistantResponse> {
  const { data } = await api.post<AssistantResponse>('/assistant', { messages });
  return data;
}

/**
 * Whether the assistant is enabled on this deployment.
 * Sends a probe with an empty history; the endpoint answers `available` before
 * it looks at the messages, so this costs nothing and makes no model call.
 */
export async function assistantAvailable(): Promise<boolean> {
  try {
    const { data } = await api.post<AssistantResponse>('/assistant', { messages: [] });
    return data.available !== false;
  } catch {
    return false;
  }
}
