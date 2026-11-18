import { useState, useRef, useEffect } from "react";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [open, setOpen] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);
  const cleanText = (text) => {
  if (!text) return "";

  return text
    .replace(/[*#_`]/g, "")   // ✅ fixed
    .replace(/\n+/g, "\n")
    .trim();
};

const sendMessage = async () => {
  if (!message.trim()) return;

  const userText = message; // ✅ FIX
  const userMsg = { sender: "user", text: userText };

  setChat((prev) => [...prev, userMsg]);
  setMessage("");

  try {
      const instruction = "Act as a smart food assistant. Suggest meals based on user needs like cravings, diet, protein, or budget. Give short or medium helpful explanations. Do not mention ordering, cart, or actions. Only guide and suggest food. Keep it simple and natural. Use plain text only. No markdown.";    
      const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `${userText.trim()}\n${instruction}` // FIX
      }),
    });

    const data = await res.json();

    const botMsg = { sender: "bot", text: data.reply };
    setChat((prev) => [...prev, botMsg]);

  } catch (error) {
    console.log(error);
  }
};

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "55px",
          height: "55px",
          borderRadius: "50%",
          background: "#ff4d4f",
          color: "white",
          border: "none",
          fontSize: "22px",
          cursor: "pointer",
          zIndex: 2000,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
        }}
      >
        💬
      </button>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "320px",
            height: "420px",
            background: "#fff",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            zIndex: 2000
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px",
              background: "#ff4d4f",
              color: "white",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
              fontWeight: "bold"
            }}
          >
            Cravings Food Guide 🤖
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              background: "#f5f5f5"
            }}
          >
            {chat.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start",
                  marginBottom: "8px"
                }}
              >
                <div
                  style={{
                    background:
                      msg.sender === "user" ? "#ff4d4f" : "#e0e0e0",
                    color: msg.sender === "user" ? "white" : "black",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    maxWidth: "70%",
                    wordBreak: "break-word"
                  }}
                >
                  {cleanText(msg.text)}
                </div>
              </div>
            ))}

            {/* Auto Scroll Anchor */}
            <div ref={chatEndRef}></div>
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              borderTop: "1px solid #ddd"
            }}
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Ask for food suggestions..."
              style={{
                flex: 1,
                border: "none",
                padding: "10px",
                outline: "none"
              }}
            />

            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              style={{
                background: message.trim() ? "#ff4d4f" : "#ccc",
                color: "white",
                border: "none",
                padding: "10px 15px",
                cursor: message.trim() ? "pointer" : "not-allowed"
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;