import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { chatAPI } from '../api/services';

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Bonjour ! Je suis votre assistant de test. Posez-moi vos questions sur les cas de test, les campagnes, les anomalies ou les rapports.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);
    try {
      const { data } = await chatAPI.send(text);
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (err) {
      // Le backend renvoie un message clair dans { reply } même en cas d'erreur (429, etc.)
      const msg =
        err.response?.data?.reply ||
        "L'assistant est momentanément indisponible. Réessayez plus tard.";
      setMessages((prev) => [...prev, { role: 'assistant', text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary-600 hover:bg-primary-700
                   text-white shadow-lg flex items-center justify-center transition hover:scale-105"
        aria-label="Assistant IA"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Fenêtre de chat */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)]
                     h-[520px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl
                     border border-gray-200 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <p className="text-sm font-semibold leading-tight">Assistant IA</p>
                <p className="text-[11px] text-white/80 leading-tight">Gestion des tests</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="hover:bg-white/20 rounded p-1 transition"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2.5 flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Saisie */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-1 px-3 py-2 text-sm bg-gray-100 rounded-full focus:outline-none
                         focus:ring-2 focus:ring-primary-200 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 flex-shrink-0 rounded-full bg-primary-600 hover:bg-primary-700 text-white
                         flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Envoyer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
