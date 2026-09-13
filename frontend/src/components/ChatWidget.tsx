"use client";

import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
} from "react";

type ChatMessage = {
    id: number;
    role: "user" | "assistant";
    content: string;
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

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000"
).replace(/\/$/, "");

const initialMessages: ChatMessage[] = [
    {
        id: 1,
        role: "assistant",
        content:
            "Hello! I’m WildHive’s honey guide. How can I help you today?",
    },
];
export default function ChatWidget() {
    const [previousInteractionId, setPreviousInteractionId] = useState<string | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] =
        useState<ChatMessage[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, isLoading, isOpen]);

    async function sendMessage(content: string) {
        const cleanedMessage = content.trim();

        if (!cleanedMessage || isLoading) {
            return;
        }

        const userMessage: ChatMessage = {
            id: Date.now(),
            role: "user",
            content: cleanedMessage,
        };

        setMessages((currentMessages) => [
            ...currentMessages,
            userMessage,
        ]);

        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/chat`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message: cleanedMessage,
                        previous_interaction_id: previousInteractionId,
                        conversation_history: messages
                            .slice(-6)
                            .map((message) => ({
                                role: message.role,
                                content: message.content,
                            })),
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const data: ChatResponse = await response.json();
            setPreviousInteractionId(data.interaction_id);

            const assistantMessage: ChatMessage = {
                id: Date.now() + 1,
                role: "assistant",
                content: data.reply,
            };

            setMessages((currentMessages) => [
                ...currentMessages,
                assistantMessage,
            ]);
        } catch (error) {
            console.error("Chat request failed:", error);

            const errorMessage: ChatMessage = {
                id: Date.now() + 1,
                role: "assistant",
                content:
                    "I’m unable to connect right now. Please try again shortly.",
            };

            setMessages((currentMessages) => [
                ...currentMessages,
                errorMessage,
            ]);
        } finally {
            setIsLoading(false);
        }
    }
    function startNewConversation() {
        if (isLoading) {
            return;
        }

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
                <section className="fixed bottom-24 right-4 z-50 flex h-[540px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-[#e6ddcc] bg-white shadow-2xl sm:right-6">
                    <header className="flex items-center justify-between bg-[#315c3a] px-5 py-4 text-white">
                        <div>
                            <p className="font-bold">WildHive Honey Guide</p>
                            <p className="mt-1 text-xs text-[#d8e5d9]">
                                Ask about our honey
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={startNewConversation}
                                disabled={isLoading}
                                className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                New chat
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl transition hover:bg-white/20"
                                aria-label="Close chatbot"
                            >
                                ×
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 space-y-4 overflow-y-auto bg-[#fffaf0] p-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user"
                                        ? "rounded-br-sm bg-[#315c3a] text-white"
                                        : "rounded-bl-sm border border-[#eadfca] bg-white text-[#3e5142]"
                                        }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl rounded-bl-sm border border-[#eadfca] bg-white px-4 py-3 text-sm text-[#657168]">
                                    WildHive is thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} aria-hidden="true" />
                    </div>

                    <div className="border-t border-[#eee7d8] bg-white p-4">
                        <form
                            onSubmit={handleSubmit}
                            className="flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={input}
                                disabled={isLoading}
                                onChange={(event) => setInput(event.target.value)}
                                placeholder="Ask about WildHive honey..."
                                className="min-w-0 flex-1 rounded-full border border-[#d8d0c1] px-4 py-3 text-sm text-[#243b2a] outline-none transition placeholder:text-[#929a93] focus:border-[#d88a16]"
                            />

                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d88a16] font-bold text-white transition hover:bg-[#bd7410] disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Send message"
                            >
                                ➜
                            </button>
                        </form>
                    </div>
                </section>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((currentValue) => !currentValue)}
                className="fixed bottom-5 right-4 z-50 flex h-14 items-center gap-3 rounded-full bg-[#315c3a] px-5 font-semibold text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#264b2f] sm:right-6"
                aria-label="Open honey guide"
            >
                <span className="text-xl">✦</span>
                <span>Ask WildHive</span>
            </button>
        </>
    );
}