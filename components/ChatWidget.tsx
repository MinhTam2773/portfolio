"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, MessageCircle, Minimize2, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function renderMessageContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let bulletItems: string[] = [];

  const flushBullets = () => {
    if (bulletItems.length === 0) return;

    elements.push(
      <ul key={`list-${elements.length}`} className="list-disc space-y-1 pl-5">
        {bulletItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>
    );

    bulletItems = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("* ")) {
      bulletItems.push(trimmed.slice(2));
      return;
    }

    flushBullets();

    if (trimmed.length === 0) {
      return;
    }

    elements.push(
      <p key={`paragraph-${elements.length}`}>{renderInlineMarkdown(trimmed)}</p>
    );
  });

  flushBullets();

  return <div className="space-y-2">{elements}</div>;
}


const STORAGE_KEY = "tam-chat-history";
const SESSION_OPENED_KEY = "tam-chat-opened";
const MAX_MESSAGES = 50;
const OPENER =
  "Hi! I can tell you about Tam's projects, tech stack, experience, or how to reach him. What are you curious about?";

function trimMessages(messages: Message[]) {
  return messages.slice(-MAX_MESSAGES);
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const openerTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        if (Array.isArray(parsed)) {
          setMessages(trimMessages(parsed));
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    setIsOpen(true);

    if (!window.sessionStorage.getItem(SESSION_OPENED_KEY)) {
      window.sessionStorage.setItem(SESSION_OPENED_KEY, "true");
      openerTimeoutRef.current = window.setTimeout(() => {
        setMessages((current) => {
          if (current.length > 0) return current;
          return [{ role: "assistant", content: OPENER }];
        });
      }, 600);
    }

    return () => {
      if (openerTimeoutRef.current) {
        window.clearTimeout(openerTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimMessages(messages)));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  async function sendMessage() {
    const content = input.trim();
    if (!content || isLoading) return;

    const nextMessages = trimMessages([...messages, { role: "user", content }]);
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok || !data.reply) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setMessages((current) =>
        trimMessages([...current, { role: "assistant", content: data.reply as string }])
      );
    } catch {
      setError("Unable to reach the assistant right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  function closeChat() {
    setIsExpanded(false);
    setIsOpen(false);
  }

  function toggleChat() {
    setIsOpen((current) => {
      if (current) {
        setIsExpanded(false);
      }

      return !current;
    });
  }

  function toggleExpanded() {
    setIsExpanded((current) => !current);
  }

  return (
    <div className={`fixed z-[70] flex flex-col gap-3 ${isExpanded ? "inset-y-0 right-0" : "bottom-6 right-6 items-end"}`}>
      {isExpanded && <div className="hidden w-[min(42rem,calc(100vw-2rem))] md:block" />}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isExpanded ? { opacity: 0, x: 40 } : { opacity: 0, scale: 0.9, y: 12 }}
            animate={isExpanded ? { opacity: 1, x: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isExpanded ? { opacity: 0, x: 40 } : { opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: "spring", damping: 24, stiffness: 220 }}
            className={`flex flex-col overflow-hidden border border-border/50 bg-background/90 shadow-2xl backdrop-blur-xl ${
              isExpanded
                ? "h-screen w-screen rounded-none md:h-screen md:w-[min(42rem,calc(100vw-2rem))] md:rounded-l-[24px]"
                : "h-[480px] w-[320px] rounded-[20px]"
            }`}
          >
            <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">Tam&apos;s AI Assistant</p>
              </div>
              <button
                type="button"
                onClick={toggleExpanded}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={closeChat}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className={`flex-1 space-y-3 overflow-y-auto py-4 ${isExpanded ? "px-4 md:px-5" : "px-3"}`}>
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}-${message.content.slice(0, 16)}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-6 ${
                      isExpanded ? "max-w-[80%] md:max-w-[75%]" : "max-w-[85%]"
                    } ${
                      message.role === "user"
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-muted text-white"
                    }`}
                  >
                    {message.role === "assistant"
                      ? renderMessageContent(message.content)
                      : message.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-muted px-3 py-3 text-white">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className={`border-t border-border/50 p-3 ${isExpanded ? "md:p-4" : ""}`}>
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder="Ask me anything about Tam..."
                  className="h-10 flex-1 rounded-xl border border-border/50 bg-muted/40 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
                />
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={!canSend}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isExpanded && (
        <button
          type="button"
          onClick={toggleChat}
          className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-500 text-white shadow-[0_10px_30px_rgba(59,130,246,0.45)] transition-transform hover:scale-105"
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
