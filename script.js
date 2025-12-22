
// URL da tua lista no GitHub
const LIST_URL = "https://raw.githubusercontent.com/BrunoTv360/brunotv-portais/main/lista.txt";

// -----------------------------
// LER LISTA DE PORTAIS
// -----------------------------
async function loadList() {
    const res = await fetch(LIST_URL);
    const text = await res.text();
    return parseList(text);
}

function parseList(text) {
    const lines = text.split("\n");
    const entries = [];
    let portal = null;
    let mac = null;

    for (let line of lines) {
        if (line.startsWith("Portal")) portal = line.split(":")[1].trim();
        if (line.startsWith("MAC Addr")) mac = line.split(":")[1].trim();
        if (line.startsWith("---")) {
            if (portal && mac) entries.push({ portal, mac });
            portal = null;
            mac = null;
        }
    }

    if (portal && mac) entries.push({ portal, mac });
    return entries;
}

// -----------------------------
// LOGIN STALKER / MAG
// -----------------------------
async function loginStalker(portal, mac) {
    const url = `${portal}/server/load.php?type=stb&action=handshake&JsHttpRequest=1-xml`;

    const headers = {
        "User-Agent": "Mozilla/5.0",
        "X-User-Agent": "Model: MAG254; Link: Ethernet",
        "Referer": portal,
        "Cookie": `mac=${mac}; stb_lang=en; timezone=Europe/Lisbon`
    };

    const res = await fetch(url, { method: "POST", headers });
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
    return data.js;
}

function showCategories(categories, portal, token, mac) {
    const app = document.getElementById("app");
    app.innerHTML = "<h2>Categorias</h2>";

    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.innerText = cat.title;
        btn.onclick = async () => {
            const channels = await getChannels(portal, token, mac, cat.id);
            showChannels(portal, token, mac, cat.id, channels);
        };
        app.appendChild(btn);
    });
}

// -----------------------------
// CANAIS
// -----------------------------
async function getChannels(portal, token, mac, categoryId) {
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
    return data.js.data;
}

function showChannels(portal, token, mac, categoryId, channels) {
    const app = document.getElementById("app");
    app.innerHTML = `<h2>Canais</h2>`;

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
