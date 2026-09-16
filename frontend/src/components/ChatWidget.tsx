"use client";

import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
    type ReactNode,
} from "react";

type ChatMessage = {
    id: number;
    role: "user" | "assistant";
    content: string;
    sources?: ChatSource[];
};

type ChatResponse = {
    reply: string;
    interaction_id: string;
    sources: ChatSource[];
};

type ChatSource = {
    title: string;
    source_type: string;
    similarity: number;
};

const SUGGESTED_PROMPTS = [
    "What varieties of honey do you offer?",
    "Is WildHive honey 100% raw and natural?",
    "What is the price of Jamun Honey?",
    "Do you use artificial flavours or colours?",
];

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000"
).replace(/\/$/, "");

const initialMessages: ChatMessage[] = [
    {
        id: 1,
        role: "assistant",
        content:
            "Hello! I am your **WildHive Honey Guide**. Ask me anything about our raw forest harvests, floral origins, health benefits, or ordering.",
    },
];

function formatMarkdown(content: string): ReactNode {
    const lines = content.split("\n");
    const elements: ReactNode[] = [];
    let currentList: string[] = [];

    const flushList = () => {
        if (currentList.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="my-1.5 list-disc space-y-1 pl-4 text-xs">
                    {currentList.map((item, idx) => (
                        <li key={idx}>
                            {renderInlineFormatting(item)}
                        </li>
                    ))}
                </ul>
            );
            currentList = [];
        }
    };

    const renderInlineFormatting = (text: string): ReactNode => {
        // Simple parser for bold **text** and `code`
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={index} className="font-semibold text-[#1c2e24]">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            currentList.push(trimmed.slice(2));
        } else {
            flushList();
            if (trimmed.length > 0) {
                elements.push(
                    <p key={`p-${index}`} className="my-1">
                        {renderInlineFormatting(trimmed)}
                    </p>
                );
            }
        }
    });

    flushList();
    return elements.length > 0 ? elements : renderInlineFormatting(content);
}

export default function ChatWidget() {
    const [previousInteractionId, setPreviousInteractionId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const nextIdRef = useRef(10);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading, isOpen]);

    useEffect(() => {
        function handleOpenChat() {
            setIsOpen(true);
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
            }
        }
        window.addEventListener("open-chat", handleOpenChat);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("open-chat", handleOpenChat);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen]);

    async function sendMessage(content: string) {
        const cleanedMessage = content.trim();
        if (!cleanedMessage || isLoading) return;

        const userMsgId = nextIdRef.current++;
        const userMessage: ChatMessage = {
            id: userMsgId,
            role: "user",
            content: cleanedMessage,
        };

        setMessages((currentMessages) => [...currentMessages, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: cleanedMessage,
                    previous_interaction_id: previousInteractionId,
                    conversation_history: messages.slice(-6).map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const data: ChatResponse = await response.json();
            setPreviousInteractionId(data.interaction_id);

            const assistantMsgId = nextIdRef.current++;
            const assistantMessage: ChatMessage = {
                id: assistantMsgId,
                role: "assistant",
                content: data.reply,
                sources: data.sources,
            };

            setMessages((currentMessages) => [...currentMessages, assistantMessage]);
        } catch (error) {
            console.error("Chat request failed:", error);
            const errorMsgId = nextIdRef.current++;
            const errorMessage: ChatMessage = {
                id: errorMsgId,
                role: "assistant",
                content: "I'm having trouble connecting to the hive server right now. Please try again or reach out through our [Contact](/contact) page.",
            };
            setMessages((currentMessages) => [...currentMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }

    function startNewConversation() {
        if (isLoading) return;
        setMessages(initialMessages);
        setPreviousInteractionId(null);
        setInput("");
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void sendMessage(input);
    }

    return (
        <>
            {isOpen && (
                <section
                    role="dialog"
                    aria-label="WildHive AI Honey Guide"
                    className="fixed bottom-24 right-4 z-50 flex h-[min(580px,calc(100dvh-7.5rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-[#ede8dd] bg-[#faf9f5] shadow-2xl transition-all sm:right-6"
                >
                    {/* Header */}
                    <header className="flex items-center justify-between border-b border-[#ede8dd] bg-[#1e3d2f] px-5 py-4 text-white">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c98a2c]/20 text-[#c98a2c] font-bold text-sm">
                                ✦
                            </div>
                            <div>
                                <p className="font-semibold text-sm leading-tight text-white">WildHive AI Guide</p>
                                <p className="text-[11px] text-[#faf9f5]/70 flex items-center gap-1.5 mt-0.5">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                                    Verified forest knowledge
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={startNewConversation}
                                disabled={isLoading}
                                className="rounded-full border border-white/20 px-2.5 py-1 text-[11px] font-medium text-[#faf9f5] transition hover:bg-white/10 disabled:opacity-40"
                            >
                                Reset
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 text-lg transition"
                                aria-label="Close chatbot"
                            >
                                ✕
                            </button>
                        </div>
                    </header>

                    {/* Messages Body */}
                    <div className="flex-1 space-y-3.5 overflow-y-auto p-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex flex-col ${
                                    message.role === "user" ? "items-end" : "items-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                                        message.role === "user"
                                            ? "rounded-br-sm bg-[#1e3d2f] text-white"
                                            : "rounded-bl-sm border border-[#ede8dd] bg-white text-[#1c2e24] shadow-xs"
                                    }`}
                                >
                                    {formatMarkdown(message.content)}
                                </div>

                                {message.sources && message.sources.length > 0 && (
                                    <div className="mt-1.5 flex max-w-[88%] flex-wrap items-center gap-1">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#c98a2c]">
                                            Sources:
                                        </span>
                                        {message.sources.map((s, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center rounded-md border border-[#ede8dd] bg-white px-1.5 py-0.5 text-[10px] text-[#6b7770]"
                                            >
                                                {s.title}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {messages.length <= 1 && (
                            <div className="mt-3 space-y-2">
                                <p className="text-[11px] font-semibold text-[#8a948c] uppercase tracking-wider">
                                    Suggested questions
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => void sendMessage(prompt)}
                                            className="rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-left text-xs font-medium text-[#1c2e24] transition hover:border-[#c98a2c] hover:bg-[#faf9f5]"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-[#ede8dd] bg-white px-4 py-2.5 text-xs text-[#6b7770]">
                                    <span className="inline-block h-2 w-2 animate-ping rounded-full bg-[#c98a2c]" />
                                    WildHive is consulting the honey archive...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} aria-hidden="true" />
                    </div>

                    {/* Input footer */}
                    <div className="border-t border-[#ede8dd] bg-white p-3">
                        <form onSubmit={handleSubmit} className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                disabled={isLoading}
                                onChange={(event) => setInput(event.target.value)}
                                placeholder="Ask about purity, origins, batch tests..."
                                className="min-w-0 flex-1 rounded-full border border-[#ede8dd] bg-[#faf9f5] px-4 py-2.5 text-xs sm:text-sm text-[#1c2e24] outline-none transition placeholder:text-[#8a948c] focus:border-[#1e3d2f] focus:bg-white"
                            />

                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c98a2c] text-white font-bold transition hover:bg-[#b07823] disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Send message"
                            >
                                ↑
                            </button>
                        </form>
                    </div>
                </section>
            )}

            {/* Float Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="fixed bottom-5 right-4 z-50 flex h-12 items-center gap-2.5 rounded-full bg-[#1e3d2f] px-5 text-xs sm:text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#152c22] sm:right-6"
                aria-label="Open AI Honey Guide"
            >
                <span className="text-sm text-[#c98a2c]">✦</span>
                <span>Ask AI Guide</span>
            </button>
        </>
    );
}