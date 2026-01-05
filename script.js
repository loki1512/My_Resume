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

/* ASK NAME EVERY LOAD */
let username = prompt("Enter your name");
if (!username || username.trim() === "") {
  username = "User" + Math.floor(Math.random() * 1000);
}

/* DOM */
const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");
const replyBar = document.getElementById("replyBar");
const replyName = document.getElementById("replyName");
const replyText = document.getElementById("replyText");

let replyData = null;

/* LOAD MESSAGES ORDERED */
const q = query(collection(db, "messages"), orderBy("time"));
onSnapshot(q, (snapshot) => {
  chat.innerHTML = "";

  snapshot.forEach(d => {
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

    bubble.innerHTML += `
      <div class="name">${m.name}</div>
      ${m.text}
    `;

    enableSwipe(bubble, m);
    row.appendChild(bubble);
    chat.appendChild(row);
  });

  chat.scrollTop = chat.scrollHeight;
});

/* SWIPE TO REPLY */
function enableSwipe(el, msg) {
  let startX = 0;

  el.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  el.addEventListener("touchend", e => {
    const diff = e.changedTouches[0].clientX - startX;
    if (diff > 60) setReply(msg);
  });
}

/* SET REPLY */
function setReply(msg) {
  replyData = { name: msg.name, text: msg.text };
  replyName.innerText = msg.name;
  replyText.innerText = msg.text;
  replyBar.style.display = "block";
}

/* CANCEL REPLY */
window.cancelReply = function () {
  replyData = null;
  replyBar.style.display = "none";
};

/* SEND MESSAGE */
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  await addDoc(collection(db, "messages"), {
    name: username,
    text: text,
    reply: replyData,
    time: serverTimestamp()
  });

  input.value = "";
  cancelReply();
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", e => e.key === "Enter" && sendMessage());

/* FIX KEYBOARD OVERLAP */
input.addEventListener("focus", () => {
  setTimeout(() => chat.scrollTop = chat.scrollHeight, 300);
});

/* CLEAR CHAT */
window.clearChat = async function () {
  if (!confirm("Clear all messages for everyone?")) return;
  const snap = await getDocs(collection(db, "messages"));
  snap.forEach(d => deleteDoc(doc(db, "messages", d.id)));
};

/* LOGOUT */
window.logout = function () {
  location.reload();
};