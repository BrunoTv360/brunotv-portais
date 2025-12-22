const LIST_URL = "https://raw.githubusercontent.com/BrunoTv360/brunotv-portais/main/lista.txt";

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

function showCategories(categories) {
    const app = document.getElementById("app");
    app.innerHTML = "<h2>Categorias</h2>";

    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.innerText = cat.title;
        btn.onclick = () => alert(`Categoria: ${cat.title} (ID: ${cat.id})`);
        app.appendChild(btn);
    });
}

async function testPortal(entry) {
    const app = document.getElementById("app");
    app.innerHTML = `<p>A testar portal:<br>${entry.portal}<br>MAC: ${entry.mac}</p>`;

    try {
        const token = await loginStalker(entry.portal, entry.mac);
        const categories = await getCategories(entry.portal, token, entry.mac);
        showCategories(categories);
    } catch (err) {
        app.innerHTML = `<p>Falha ao testar portal:<br>${entry.portal}<br>Erro: ${err}</p>`;
    }
}

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
