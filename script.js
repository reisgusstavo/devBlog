// REGISTRAR
function registrar() {
    let user = document.getElementById("regUser").value;
    let pass = document.getElementById("regPass").value;
    let file = document.getElementById("fotoPerfil").files[0];

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    if (!file) {
        usuarios.push({ user, pass, foto: null });
        salvarUsuario(usuarios);
        return;
    }

    let reader = new FileReader();

    reader.onload = function(e) {
        usuarios.push({
            user,
            pass,
            foto: e.target.result
        });

        salvarUsuario(usuarios);
    };

    reader.readAsDataURL(file);
}

function salvarUsuario(usuarios) {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    alert("Registrado com sucesso!");
    window.location.href = "index.html";
}

// LOGIN
function login() {
    let user = document.getElementById("loginUser").value;
    let pass = document.getElementById("loginPass").value;

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    let encontrado = usuarios.find(u => u.user === user && u.pass === pass);

    if (encontrado) {
        localStorage.setItem("logado", user);
        window.location.href = "dashboard.html";
    } else {
        alert("Usuário ou senha incorretos");
    }
}

// LOGOUT
function logout() {
    localStorage.removeItem("logado");
    window.location.href = "index.html";
}

// PERFIL
function carregarPerfil() {
    let user = localStorage.getItem("logado");
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    let atual = usuarios.find(u => u.user === user);

    let div = document.getElementById("perfil");

    if (!div || !atual) return;

    div.innerHTML = `
        <div class="perfilBox">
            <img src="${atual.foto || 'https://via.placeholder.com/80'}" class="fotoPerfil">
            <p>${atual.user}</p>
        </div>
    `;
}

// CRIAR POST
function criarPost() {
    let texto = document.getElementById("postTexto").value;
    let user = localStorage.getItem("logado");

    if (!user) {
        alert("Faça login!");
        return;
    }

    if (!texto) {
        alert("Digite algo!");
        return;
    }

    let posts = JSON.parse(localStorage.getItem("posts")) || [];

    posts.push({
        user,
        texto,
        likes: 0,
        comentarios: []
    });

    localStorage.setItem("posts", JSON.stringify(posts));

    document.getElementById("postTexto").value = "";

    carregarPosts();
}

// CURTIR
function curtirPost(index) {
    let posts = JSON.parse(localStorage.getItem("posts")) || [];

    posts[index].likes++;

    localStorage.setItem("posts", JSON.stringify(posts));

    carregarPosts();
}

// COMENTAR
function comentarPost(index) {
    let input = document.getElementById(`comentario-${index}`);
    let texto = input.value;
    let user = localStorage.getItem("logado");

    if (!texto) return;

    let posts = JSON.parse(localStorage.getItem("posts")) || [];

    posts[index].comentarios.push({
        user,
        texto
    });

    localStorage.setItem("posts", JSON.stringify(posts));

    carregarPosts();
}

// EXCLUIR POST
function excluirPost(index) {
    let posts = JSON.parse(localStorage.getItem("posts")) || [];

    posts.splice(index, 1);

    localStorage.setItem("posts", JSON.stringify(posts));

    carregarPosts();
}

// CARREGAR POSTS
function carregarPosts() {
    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    let div = document.getElementById("posts");

    if (!div) return;

    div.innerHTML = "";

    if (posts.length === 0) {
        div.innerHTML = "<p>Nenhum post ainda...</p>";
        return;
    }

    posts.slice().reverse().forEach((p, i) => {
        let indexOriginal = posts.length - 1 - i;

        div.innerHTML += `
            <div class="post">
                <strong>${p.user}</strong>
                <p>${p.texto}</p>

                <button onclick="curtirPost(${indexOriginal})">
                    ❤️ ${p.likes}
                </button>

                <button onclick="excluirPost(${indexOriginal})">
                    🗑️
                </button>

                <div class="comentarios">
                    ${(p.comentarios || []).map(c => `
                        <p><strong>${c.user}:</strong> ${c.texto}</p>
                    `).join("")}

                    <input type="text" id="comentario-${indexOriginal}" placeholder="Comentar...">
                    <button onclick="comentarPost(${indexOriginal})">Enviar</button>
                </div>
            </div>
        `;
    });
}

// LOAD
window.onload = function() {
    carregarPosts();
    carregarPerfil();
};