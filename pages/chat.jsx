import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api, BASE_URL } from "../lib/api";
import styles from "../styles/Chat.module.scss";

export default function ChatPage() {
  const { token } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const socketRef = useRef(null);
  const activeIdRef = useRef(null);

  // Boshlang'ich suhbatlar ro'yxatini yuklash
  useEffect(() => {
    if (!token) return;
    api.get("/chat/chats", token).then(setChats).catch(() => {});
  }, [token]);

  // WebSocket ulanish — faqat bir marta
  useEffect(() => {
    if (!token) return;
    const socket = io(`${BASE_URL}/chat`, { auth: { token } });
    socketRef.current = socket;

    socket.on("chat:chats", (p) => setChats(p.chats));
    socket.on("chat:history", (p) => setMessages(p.messages));
    socket.on("chat:message", (m) => {
      if (m.chatId !== activeIdRef.current) return;
      setMessages((list) => [...list, m]);
    });

    return () => socket.close();
  }, [token]);

  function openChat(id) {
    activeIdRef.current = id;
    setActiveId(id);
    setMessages([]);
    socketRef.current?.emit("chat:join", { chatId: id });
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    socketRef.current?.emit("chat:message", { chatId: activeId, text });
    setText("");
  }

  return (
    <Layout title="Chat">
      <div className={styles.wrap}>
        <div className={styles.list}>
          {chats.length === 0 && <div className={styles.listItem}>Suhbatlar yo'q</div>}
          {chats.map((c) => (
            <div
              key={c.id}
              className={`${styles.listItem} ${activeId === c.id ? styles.listItemActive : ""}`}
              onClick={() => openChat(c.id)}
            >
              <div className={styles.listName}>
                {c.guestName}
                {c.unreadForAdmin > 0 && <span className={styles.unread}>{c.unreadForAdmin}</span>}
              </div>
              <div className={styles.listPreview}>{c.lastMessage || "—"}</div>
            </div>
          ))}
        </div>

        <div className={styles.panel}>
          {!activeId ? (
            <div className={styles.empty}>Suhbatni tanlang</div>
          ) : (
            <>
              <div className={styles.panelHeader}>
                {chats.find((c) => c.id === activeId)?.guestName || "Suhbat"}
              </div>
              <div className={styles.messages}>
                {messages.map((m, i) => (
                  <div key={i} className={`${styles.msg} ${m.sender === "admin" ? styles.msgMine : ""}`}>
                    {m.text}
                  </div>
                ))}
              </div>
              <form className={styles.composer} onSubmit={sendMessage}>
                <input
                  placeholder="Xabar yozing..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  Yuborish
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
