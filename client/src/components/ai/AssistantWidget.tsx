/**
 * Floating buyer assistant.
 *
 * Mounted once in the Layout, so it is available on every page.
 *
 * It probes /api/assistant on mount and renders NOTHING if the endpoint reports
 * it is unconfigured. That matters more than it sounds: this is a real client's
 * site, and a chat button that opens onto an error is worse than no chat button
 * at all. A deployment without an ANTHROPIC_API_KEY looks exactly like the site
 * did before this feature existed.
 *
 * What it will not do is answer commercial questions — price, minimum order,
 * certifications, delivery dates. Those are enforced server-side in
 * api/_lib/guardrails.ts, both in the prompt and on the way out.
 */

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { askAssistant, assistantAvailable, type ChatTurn } from '../../services/aiApi';

const GREETING =
  'Hello. I can help you find products in our catalogue and tell you what to include in an enquiry. ' +
  'Pricing and shipping terms are quoted per enquiry, so for those the team will reply directly.';

const SUGGESTIONS = [
  'What fruits do you export?',
  'Do you have basmati rice?',
  'What should I include in an enquiry?',
];

export default function AssistantWidget() {
  const [enabled, setEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    assistantAvailable().then((available) => {
      if (!cancelled) setEnabled(available);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, isThinking]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || isThinking) return;

    const nextTurns: ChatTurn[] = [...turns, { role: 'user', content: message }];
    setTurns(nextTurns);
    setInput('');
    setIsThinking(true);

    try {
      const response = await askAssistant(nextTurns);
      setTurns([
        ...nextTurns,
        {
          role: 'assistant',
          content:
            response.reply ??
            'Sorry, I could not answer that. Please use the enquiry form and the team will reply.',
        },
      ]);
    } catch {
      setTurns([
        ...nextTurns,
        {
          role: 'assistant',
          content:
            'I am having trouble connecting. Please use the enquiry form and the team will reply directly.',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  if (!enabled) return null;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open product assistant"
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 bg-green-600 text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-green-700 hover:scale-105 transition-all duration-200"
        >
          <MessageCircle size={18} />
          <span className="text-sm font-medium">Ask about products</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-5 sm:right-5 z-50 w-full sm:w-[380px] h-[85vh] sm:h-[540px] bg-white border border-gray-200 sm:rounded-lg shadow-2xl flex flex-col overflow-hidden">
          <header className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] text-white flex-shrink-0">
            <div>
              <p className="text-sm font-semibold">Product assistant</p>
              <p className="text-[11px] text-gray-400">Raaya Global Solutions</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
              className="p-1 hover:text-green-500 transition-colors"
            >
              <X size={18} />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <div className="bg-gray-50 rounded-lg px-3.5 py-3 text-sm text-gray-700 leading-relaxed">
              {GREETING}
            </div>

            {turns.length === 0 && (
              <div className="space-y-1.5 pt-1">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => void send(suggestion)}
                    className="block w-full text-left text-xs text-gray-600 hover:text-green-600 border border-gray-200 hover:border-green-600 rounded-md px-3 py-2 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {turns.map((turn, i) => (
              <div
                key={i}
                className={turn.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    turn.role === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  {turn.content}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-gray-50 rounded-lg px-3.5 py-2.5">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              </div>
            )}
          </div>

          <div className="px-4 pb-2 flex-shrink-0">
            <p className="text-[11px] text-gray-400 leading-snug">
              Prices, minimum quantities and shipping dates are quoted per enquiry.{' '}
              <Link
                to="/enquiry"
                onClick={() => setIsOpen(false)}
                className="text-green-600 hover:underline"
              >
                Send an enquiry
              </Link>
              .
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 flex-shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about our products…"
              aria-label="Message the product assistant"
              maxLength={2000}
              className="flex-1 text-sm px-3 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-colors"
            />
            <button
              type="submit"
              disabled={isThinking || !input.trim()}
              aria-label="Send message"
              className="bg-green-600 text-white p-2.5 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
