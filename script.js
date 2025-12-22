// Caminho da lista
const LIST_URL = "https://raw.githubusercontent.com/BrunoTv360/brunotv-portais/main/lista.txt";

// -----------------------------
// INICIAR APP
// -----------------------------
start();

async function start() {
    const app = document.getElementById("app");
    app.innerHTML = "<h2>A carregar lista...</h2>";

    try {
        const response = await fetch(LIST_URL + "?v=" + Date.now());
        const texto = await response.text();

        const blocos = texto.split("---").map(b => b.trim()).filter(b => b.length > 0);

        const lista = blocos.map(bloco => {
            const linhas = bloco.split("\n").map(l => l.trim());
            let portal = "";
            let mac = "";

            linhas.forEach(linha => {
                if (linha.startsWith("Portal:")) portal = linha.replace("Portal:", "").trim();
                if (linha.startsWith("MAC Addr:")) mac = linha.replace("MAC Addr:", "").trim();
            });

            return { portal, mac };
        });

        app.innerHTML = "<h2>Escolhe um portal</h2>";

        lista.forEach(entry => {
            const btn = document.createElement("button");
            btn.innerText = entry.portal + "\n" + entry.mac;
            btn.onclick = () => testPortal(entry);
            app.appendChild(btn);
        });

    } catch (erro) {
        app.innerHTML = "<p>Erro ao carregar lista: " + erro + "</p>";
    }
}

// -----------------------------
// TESTAR PORTAL + LOGIN
// -----------------------------
async function testPortal(entry) {
    const app = document.getElementById("app");
    app.innerHTML = `<h2>A testar portal...</h2><p>${entry.portal}<br>${entry.mac}</p>`;

    try {
        const token = await loginStalker(entry.portal, entry.mac);
        const categories = await getCategories(entry.portal, token, entry.mac);
        showCategories(categories, entry.portal, token, entry.mac);
    } catch (err) {
        app.innerHTML = `<p>Falha ao testar portal:<br>${entry.portal}<br>Erro: ${err}</p>`;
    }
}

// -----------------------------
// LOGIN STALKER
// -----------------------------
async function loginStalker(portal, mac) {
    const url = `${portal}/server/load.php?type=stb&action=handshake&token=&mac=${mac}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.js.token;
}

// -----------------------------
// CATEGORIAS
// -----------------------------
async function getCategories(portal, token, mac) {
    const url = `${portal}/server/load.php?type=itv&action=get_genres&JsHttpRequest=1-xml`;

    const headers = {
        "User-Agent": "Mozilla/5.0",
        "X-User-Agent": "Model: MAG254; Link: Ethernet",
        "Referer": portal,
        "Cookie": `mac=${mac}; stb_lang=en; timezone=Europe/Lisbon`,
        "Authorization": `Bearer ${token}`
    };

    const res = await fetch(url, { method: "POST", headers });
    const data = await res.json();
    return data.js.data;
}

function showCategories(categories, portal, token, mac) {
    const app = document.getElementById("app");
    app.innerHTML = "<h2>Categorias</h2>";

    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.innerText = cat.title;
        btn.onclick = () => loadChannels(portal, token, mac, cat.id);
        app.appendChild(btn);
    });

    const back = document.createElement("button");
    back.innerText = "← Voltar aos portais";
    back.onclick = start;
    app.appendChild(back);
}

// -----------------------------
// CANAIS
// -----------------------------
async function loadChannels(portal, token, mac, categoryId) {
    const app = document.getElementById("app");
    app.innerHTML = "<h2>A carregar canais...</h2>";

    const url = `${portal}/server/load.php?type=itv&action=get_ordered_list&genre=${categoryId}&JsHttpRequest=1-xml`;

    const headers = {
        "User-Agent": "Mozilla/5.0",
        "X-User-Agent": "Model: MAG254; Link: Ethernet",
        "Referer": portal,
        "Cookie": `mac=${mac}; stb_lang=en; timezone=Europe/Lisbon`,
        "Authorization": `Bearer ${token}`
    };

    const res = await fetch(url, { method: "POST", headers });
    const data = await res.json();

    showChannels(data.js.data, portal, token, mac);
}

function showChannels(channels, portal, token, mac) {
    const app = document.getElementById("app");
    app.innerHTML = "<h2>Canais</h2>";

    channels.forEach(ch => {
        const btn = document.createElement("button");
        btn.innerText = ch.name;
        btn.onclick = () => playChannel(portal, token, mac, ch.id);
        app.appendChild(btn);
    });

    const back = document.createElement("button");
    back.innerText = "← Voltar às categorias";
    back.onclick = async () => {
        const categories = await getCategories(portal, token, mac);
        showCategories(categories, portal, token, mac);
    };
    app.appendChild(back);
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
        <video controls autoplay>
            <source src="${streamUrl}" type="application/x-mpegURL">
        </video>
        <button onclick="history.back()">← Voltar</button>
    `;
}
