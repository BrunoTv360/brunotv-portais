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
        if (line.startsWith("Portal")) {
            portal = line.split(":")[1].trim();
        }
        if (line.startsWith("MAC Addr")) {
            mac = line.split(":")[1].trim();
        }
        if (line.startsWith("---")) {
            if (portal && mac) entries.push({ portal, mac });
            portal = null;
            mac = null;
        }
    }

    if (portal && mac) entries.push({ portal, mac });

    return entries;
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

async function testPortal(entry) {
    alert("Aqui vamos testar o portal:\n" + entry.portal + "\nMAC: " + entry.mac);

    // Aqui depois implemento:
    // - handshake
    // - login
    // - categorias
    // - canais
    // - player

    // Por agora só mostra que funciona
}

start();
