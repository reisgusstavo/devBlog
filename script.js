// 🔥 IMPORTS FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCiCI5WS_Pqj7htyO7Ch68cc3ZBKPC-phQ",
  authDomain: "devblog2026.firebaseapp.com",
  projectId: "devblog2026",
  storageBucket: "devblog2026.firebasestorage.app",
  messagingSenderId: "399155269646",
  appId: "1:399155269646:web:21f12d8d3bf169da5c2c5f"
};

// 🔥 INIT
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =============================
// AVATAR
function gerarAvatar(user) {
    return `https://ui-avatars.com/api/?name=${user}&background=random&color=fff&size=128`;
}

// =============================
// REGISTRAR
async function registrar() {
    let user = document.getElementById("regUser").value;
    let pass = document.getElementById("regPass").value;

    await addDoc(collection(db, "usuarios"), {
        user,
        pass,
        foto: gerarAvatar(user)
    });

    alert("Registrado com sucesso!");
    window.location.href = "index.html";
}

// =============================
// LOGIN
async function login() {
    let user = document.getElementById("loginUser").value;
    let pass = document.getElementById("loginPass").value;

    let querySnapshot = await getDocs(collection(db, "usuarios"));

    let encontrado = false;

    querySnapshot.forEach(doc => {
        let u = doc.data();
        if (u.user === user && u.pass === pass) {
            encontrado = true;
        }
    });

    if (encontrado) {
        localStorage.setItem("logado", user);
        window.location.href = "dashboard.html";
    } else {
        alert("Usuário ou senha incorretos");
    }
}

// =============================
// LOGOUT
function logout() {
    localStorage.removeItem("logado");
    window.location.href = "index.html";
}

// =============================
// PERFIL
async function carregarPerfil() {
    let user = localStorage.getItem("logado");
    let div = document.getElementById("perfil");

    let querySnapshot = await getDocs(collection(db, "usuarios"));

    querySnapshot.forEach(doc => {
        let u = doc.data();
        if (u.user === user) {
            div.innerHTML = `
                <div class="perfilBox">
                    <img src="${u.foto}" class="fotoPerfil">
                    <p>${u.user}</p>
                </div>
            `;
        }
    });
}

// =============================
// CRIAR POST
async function criarPost() {
    let texto = document.getElementById("postTexto").value;
    let user = localStorage.getItem("logado");

    if (!texto) return alert("Digite algo!");

    await addDoc(collection(db, "posts"), {
        user,
        texto,
        likes: 0,
        comentarios: [],
        data: new Date().toISOString()
    });

    document.getElementById("postTexto").value = "";
    carregarPosts();
}

// =============================
// CURTIR
async function curtirPost(id, likesAtual) {
    let ref = doc(db, "posts", id);

    await updateDoc(ref, {
        likes: likesAtual + 1
    });

    carregarPosts();
}

// =============================
// COMENTAR
async function comentarPost(id) {
    let input = document.getElementById(`comentario-${id}`);
    let texto = input.value;
    let user = localStorage.getItem("logado");

    if (!texto) return;

    let ref = doc(db, "posts", id);
    let snapshot = await getDocs(collection(db, "posts"));

    snapshot.forEach(async (d) => {
        if (d.id === id) {
            let post = d.data();

            let novosComentarios = post.comentarios || [];

            novosComentarios.push({ user, texto });

            await updateDoc(ref, {
                comentarios: novosComentarios
            });
        }
    });

    carregarPosts();
}

// =============================
// CARREGAR POSTS
async function carregarPosts() {
    let div = document.getElementById("posts");
    div.innerHTML = "";

    let querySnapshot = await getDocs(collection(db, "posts"));

    let posts = [];

    querySnapshot.forEach(docSnap => {
        posts.push({ id: docSnap.id, ...docSnap.data() });
    });

    posts.reverse().forEach(p => {

        let comentariosHTML = (p.comentarios || []).map(c => `
            <div class="comentario">
                <strong>${c.user}</strong>
                <span>${c.texto}</span>
            </div>
        `).join("");

        div.innerHTML += `
        <div class="post-card">
            
            <div class="post-header">
                <span class="username">${p.user}</span>
            </div>

            <div class="post-content">
                <p>${p.texto}</p>
            </div>

            <div class="post-actions">
                <button onclick="curtirPost('${p.id}', ${p.likes})">
                    ❤️ ${p.likes}
                </button>
            </div>

            <div class="comentarios">
                ${comentariosHTML}

                <div class="comentario-box">
                    <textarea id="comentario-${p.id}"></textarea>
                    <button onclick="comentarPost('${p.id}')">Enviar</button>
                </div>
            </div>

        </div>
        `;
    });
}

// =============================
// LOAD
window.onload = function() {
    carregarPosts();
    carregarPerfil();
};

// =============================
// EXPORTAR FUNÇÕES
window.login = login;
window.registrar = registrar;
window.criarPost = criarPost;
window.curtirPost = curtirPost;
window.comentarPost = comentarPost;
window.logout = logout;