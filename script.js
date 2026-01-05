import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* FIREBASE */
const firebaseConfig = {
  apiKey: "AIzaSyBDdyBI_y8pDHtvCY8IzKH6aU_l4br8m7c",
  authDomain: "chat-anywhere-test.firebaseapp.com",
  projectId: "chat-anywhere-test",
  storageBucket: "chat-anywhere-test.appspot.com",
  messagingSenderId: "153337832150",
  appId: "1:153337832150:web:ba87a5b49d04ceccbd1f77"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* PASSWORDS */
const PUBLIC_PASSWORD = "khushi";
const PRIVATE_PASSWORD = "Loki";

window.addEventListener("DOMContentLoaded", () => {

  const login = document.getElementById("login");
  const appDiv = document.getElementById("app");
  const chat = document.getElementById("chat");

  const nameInput = document.getElementById("nameInput");
  const passwordInput = document.getElementById("passwordInput");
  const enterBtn = document.getElementById("enterBtn");

  const input = document.getElementById("msg");
  const sendBtn = document.getElementById("sendBtn");
  const clearBtn = document.getElementById("clearBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const replyBar = document.getElementById("replyBar");
  const replyName = document.getElementById("replyName");
  const replyText = document.getElementById("replyText");
  const cancelReplyBtn = document.getElementById("cancelReplyBtn");

  const roomTitle = document.getElementById("roomTitle");

  let username = "";
  let roomId = "";
  let replyData = null;
  let unsubscribe = null;

  function enterRoom() {
    const name = nameInput.value.trim();
    const pass = passwordInput.value;

    if (!name || !pass) return alert("Enter name and password");

    if (pass === PUBLIC_PASSWORD) {
      roomId = "room_public";
      roomTitle.innerText = "Chat Anywhere";
    } else if (pass === PRIVATE_PASSWORD) {
      roomId = "room_private";
      roomTitle.innerText = "Private Room";
    } else {
      return alert("Wrong password");
    }

    username = name;
    login.style.display = "none";
    appDiv.style.display = "block";
    loadMessages();
  }

  function loadMessages() {
    if (unsubscribe) unsubscribe();

    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("time")
    );

    unsubscribe = onSnapshot(q, snap => {
      chat.innerHTML = "";
      snap.forEach(d => {
        const m = d.data();

        const row = document.createElement("div");
        row.className = "msg-row " + (m.name === username ? "me-row" : "other-row");

        const bubble = document.createElement("div");
        bubble.className = "msg " + (m.name === username ? "me" : "other");

        if (m.reply) {
          bubble.innerHTML += `
            <div class="reply-box">
              ${m.reply.name}: ${m.reply.text}
            </div>
          `;
        }

        bubble.innerHTML += `<div class="name">${m.name}</div>${m.text}`;

        enableSwipe(bubble, m);
        row.appendChild(bubble);
        chat.appendChild(row);
      });

      chat.scrollTop = chat.scrollHeight;
    });
  }

  function enableSwipe(el, msg) {
    let startX = 0;
    el.addEventListener("touchstart", e => startX = e.touches[0].clientX);
    el.addEventListener("touchend", e => {
      if (e.changedTouches[0].clientX - startX > 60) {
        replyData = { name: msg.name, text: msg.text };
        replyName.innerText = msg.name;
        replyText.innerText = msg.text;
        replyBar.style.display = "block";
      }
    });
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    await addDoc(collection(db, "rooms", roomId, "messages"), {
      name: username,
      text,
      reply: replyData,
      time: serverTimestamp()
    });

    input.value = "";
    replyData = null;
    replyBar.style.display = "none";
  }

  async function clearChat() {
    if (!confirm("Clear this chat?")) return;
    const snap = await getDocs(collection(db, "rooms", roomId, "messages"));
    snap.forEach(d => deleteDoc(doc(db, "rooms", roomId, "messages", d.id)));
  }

  /* EVENTS */
  enterBtn.addEventListener("click", enterRoom);
  passwordInput.addEventListener("keydown", e => e.key === "Enter" && enterRoom());

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", e => e.key === "Enter" && sendMessage());

  clearBtn.addEventListener("click", clearChat);
  logoutBtn.addEventListener("click", () => location.reload());
  cancelReplyBtn.addEventListener("click", () => {
    replyData = null;
    replyBar.style.display = "none";
  });
});