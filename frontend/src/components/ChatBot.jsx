import React, { useState, useEffect } from "react";
import { sendMessageToLex } from "../services/lexService";
import "./ChatBot.css";

const ChatBot = () => {
    const [messages, setMessages] = useState([{ from: "bot", text: "¡Hola! Soy NovaLex 🤖. ¿En qué puedo ayudarte hoy?" }]);
    const [input, setInput] = useState("");
    const [sessionId] = useState(() => crypto.randomUUID());

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = { from: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        try {
            const response = await sendMessageToLex(input, sessionId);
            const botResponse = response?.messages?.[0]?.content?.[0]?.text || "Lo siento, no entendí eso.";
            setMessages((prev) => [...prev, { from: "bot", text: botResponse }]);
        } catch (error) {
            setMessages((prev) => [...prev, { from: "bot", text: "Ocurrió un error al comunicarme con Lex." }]);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-box">
                {messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.from}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Escribe tu mensaje..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend}>Enviar</button>
            </div>
        </div>
    );
};

export default ChatBot;
