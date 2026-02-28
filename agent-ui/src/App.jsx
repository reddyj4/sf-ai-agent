import { useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };
    setChat((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/chat", {
        message,
      });

      const botMessage = {
        role: "assistant",
        content: JSON.stringify(response.data, null, 2),
      };

      setChat((prev) => [...prev, botMessage]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error calling backend" },
      ]);
    }

    setLoading(false);
    setMessage("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        {/* Salesforce Logo */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg"
          alt="Salesforce"
          style={styles.logo}
        />

        {/* Chat Container */}
        <div style={styles.chatContainer}>
          {/* Header */}
          <div style={styles.header}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
              alt="Bot"
              style={styles.botImage}
            />
            <h2 style={{ marginLeft: 10 }}>Salesforce AI Agent</h2>
          </div>

          {/* Chat Window */}
          <div style={styles.chatBox}>
            {chat.length === 0 && (
              <div style={styles.welcome}>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
                  alt="Bot"
                  style={styles.welcomeBot}
                />
                <p>👋 Hi Ramesh! Ask me about Accounts, Cases or Opportunities.</p>
              </div>
            )}

            {chat.map((msg, index) => (
              <div
                key={index}
                style={
                  msg.role === "user"
                    ? styles.userMessage
                    : styles.botMessage
                }
              >
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </pre>
              </div>
            ))}

            {loading && <p>🤖 Thinking...</p>}
          </div>

          {/* Input Area */}
          <div style={styles.inputArea}>
            <input
              style={styles.input}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about accounts, cases, opportunities..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button style={styles.button} onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    height: "100vh",
    width: "100vw",
    margin: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to right, #eef2f3, #dfe9f3)",
    fontFamily: "Arial, sans-serif",
  },

  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  logo: {
    width: 160,
    marginBottom: 20,
  },

  chatContainer: {
    width: 500,
    background: "white",
    borderRadius: 15,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  header: {
    backgroundColor: "#00A1E0",
    color: "white",
    padding: 15,
    display: "flex",
    alignItems: "center",
  },

  botImage: {
    width: 40,
  },

  chatBox: {
    height: 350,
    padding: 15,
    overflowY: "auto",
    backgroundColor: "#f9f9f9",
    display: "flex",
    flexDirection: "column",
  },

  welcome: {
    textAlign: "center",
    marginTop: 60,
  },

  welcomeBot: {
    width: 80,
    marginBottom: 10,
  },

  userMessage: {
    backgroundColor: "#DCF8C6",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: "flex-end",
    maxWidth: "75%",
  },

  botMessage: {
    backgroundColor: "#e4e6eb",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: "flex-start",
    maxWidth: "75%",
  },

  inputArea: {
    display: "flex",
    padding: 10,
    borderTop: "1px solid #ddd",
  },

  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    outline: "none",
  },

  button: {
    padding: "10px 15px",
    marginLeft: 10,
    borderRadius: 8,
    border: "none",
    backgroundColor: "#00A1E0",
    color: "white",
    cursor: "pointer",
  },
};

export default App;