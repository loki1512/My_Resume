import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp }
from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

const chat = document.getElementById("chat");

onSnapshot(collection(db, "messages"), (snapshot) => {
  chat.innerHTML = "";
  snapshot.forEach(doc => {
    const d = doc.data();
    chat.innerHTML += `<p><b>${d.name}:</b> ${d.text}</p>`;
  });
  chat.scrollTop = chat.scrollHeight;
});

window.send = async function () {
  const name = document.getElementById("name").value;
  const text = document.getElementById("msg").value;
  if (!name || !text) return;

  await addDoc(collection(db, "messages"), {
    name,
    text,
    time: serverTimestamp()
  });

  document.getElementById("msg").value = "";
};