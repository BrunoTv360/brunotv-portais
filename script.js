// Caminho correto para o lista.txt
const LIST_URL = "https://raw.githubusercontent.com/BrunoTv360/brunotv-portais/main/lista.txt";

// Carrega o ficheiro lista.txt
async function carregarLista() {
    try {
        const response = await fetch(LIST_URL + "?v=" + Date.now()); // evita cache
        const texto = await response.text();
        processarLista(texto);
    } catch (erro) {
        alert("Erro ao carregar lista: " + erro);
    }
}

// Processa o conteúdo do lista.txt
function processarLista(texto) {
    const blocos = texto.split("---").map(b => b.trim()).filter(b => b.length > 0);

    const lista = blocos.map(bloco => {
        const linhas = bloco.split("\n").map(l => l.trim());
        let portal = "";
        let mac = "";

        linhas.forEach(linha => {
            if (linha.startsWith("Portal:")) {
                portal = linha.replace("Portal:", "").trim();
            }
            if (linha.startsWith("MAC Addr:")) {
                mac = linha.replace("MAC Addr:", "").trim();
            }
        });

        return { portal, mac };
    });

    mostrarPortais(lista);
}

// Mostra os botões dos portais
function mostrarPortais(lista) {
    const div = document.getElementById("portal-list");
    div.innerHTML = "";

    lista.forEach(entry => {
        const btn = document.createElement("button");
        btn.className = "portal-btn";
        btn.textContent = entry.portal + "\n" + entry.mac;

        btn.onclick = () => testarPortal(entry.portal, entry.mac);

        div.appendChild(btn);
    });
}

// Testa o portal
async function testarPortal(portal, mac) {
    alert("A testar portal:\n" + portal + "\nMAC: " + mac);

    try {
        const url = portal + "/server/load.php?type=stb&action=handshake&token=&mac=" + mac;

        const response = await fetch(url);
        const texto = await response.text();

        // Se o servidor devolver HTML, dá erro
        if (texto.trim().startsWith("<")) {
            throw new Error("O portal devolveu HTML em vez de JSON");
        }

        alert("Portal OK:\n" + texto);

    } catch (erro) {
        alert("Falha ao testar portal:\n" + portal + "\nErro: " + erro);
    }
}

// Inicia
carregarLista();
    const backBtn = document.createElement("button");
    backBtn.innerText = "← Voltar às categorias";
    backBtn.onclick = async () => {
        const categories = await getCategories(portal, token, mac);
        showCategories(categories, portal, token, mac);
    };
    app.appendChild(backBtn);

    channels.forEach(ch => {
        const btn = document.createElement("button");
        btn.innerText = ch.name;
        btn.onclick = () => playChannel(portal, token, mac, ch.id);
        app.appendChild(btn);
    });
}

// -----------------------------
// PLAYER
// -----------------------------
async function playChannel(portal, token, mac, channelId) {
    const url = `${portal}/server/load.php?type=itv&action=create_link&cmd=play&id=${channelId}&JsHttpRequest=1-xml`;

    const headers = {
        "User-Agent": "Mozilla/5.0",
        "X-User-Agent": "Model: MAG254; Link: Ethernet",
        "Referer": portal,
        "Cookie": `mac=${mac}; stb_lang=en; timezone=Europe/Lisbon`,
        "Authorization": `Bearer ${token}`
    };

    const res = await fetch(url, { method: "POST", headers });
    const data = await res.json();

    const streamUrl = data.js.cmd.replace("ffmpeg ", "");

    const app = document.getElementById("app");
    app.innerHTML = `
        <h2>Player</h2>
        <video id="player" controls autoplay style="width:100%; max-width:600px;">
            <source src="${streamUrl}" type="application/x-mpegURL">
        </video>
        <br><br>
        <button onclick="history.back()">← Voltar</button>
    `;
}

// -----------------------------
// TESTAR PORTAL
// -----------------------------
async function testPortal(entry) {
    const app = document.getElementById("app");
    app.innerHTML = `<p>A testar portal:<br>${entry.portal}<br>MAC: ${entry.mac}</p>`;

    try {
        const token = await loginStalker(entry.portal, entry.mac);
        const categories = await getCategories(entry.portal, token, entry.mac);
        showCategories(categories, entry.portal, token, entry.mac);
    } catch (err) {
        app.innerHTML = `<p>Falha ao testar portal:<br>${entry.portal}<br>Erro: ${err}</p>`;
    }
}

// -----------------------------
// INICIAR APP
// -----------------------------
async function start() {
    const app = document.getElementById("app");
    app.innerHTML = "<p>A carregar lista...</p>";

    const list = await loadList();
    app.innerHTML = "<h2>Escolhe um portal</h2>";

    list.forEach(entry => {
        const btn = document.createElement("button");
        btn.innerText = entry.portal + "\n" + entry.mac;
        btn.onclick = () => testPortal(entry);
        app.appendChild(btn);
    });
}

start();
