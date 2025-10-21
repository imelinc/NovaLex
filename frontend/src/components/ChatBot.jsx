import React, { useState, useEffect, useRef } from "react";
import { sendMessageToLex } from "../services/lexService";
import "./ChatBot.css";

const ChatBot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sessionId] = useState(() => crypto.randomUUID());
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = { from: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        try {
            const response = await sendMessageToLex(input, sessionId);
            // Lex V2 returns messages directly in the response object
            const botResponse = response?.messages?.[0]?.content || "Lo siento, no entendí eso.";
            setMessages((prev) => [...prev, { from: "bot", text: botResponse }]);
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
            setMessages((prev) => [...prev, { from: "bot", text: "Ocurrió un error al comunicarme con Lex. Verifica tu configuración." }]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h1>NovaLex</h1>
                <p>Hola! ¿En qué puedo ayudarte hoy?</p>
            </div>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💬</div>
                        <p>Escribe tu primera pregunta para comenzar</p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} className={`message-wrapper ${msg.from}`}>
                            <div className="message">
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
                <div className="chat-input">
                    <input
                        type="text"
                        placeholder="Ingrese su pregunta aquí..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button onClick={handleSend} disabled={!input.trim()}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="19" x2="12" y2="5"></line>
                            <polyline points="5 12 12 5 19 12"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;
