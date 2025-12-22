
// Caminho correto para o lista.txt
const LIST_URL = "https://raw.githubusercontent.com/BrunoTv360/brunotv-portais/main/lista.txt";

// -----------------------------
// CARREGAR LISTA
// -----------------------------
async function start() {
    const app = document.getElementById("portal-list");
    app.innerHTML = "<p>A carregar lista...</p>";

    try {
        const response = await fetch(LIST_URL + "?v=" + Date.now()); // evita cache
        const texto = await response.text();

        const blocos = texto
            .split("---")
            .map(b => b.trim())
            .filter(b => b.length > 0);

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

        app.innerHTML = "<h2>Escolhe um portal</h2>";

        lista.forEach(entry => {
            const btn = document.createElement("button");
            btn.innerText = entry.portal + "\n" + entry.mac;
            btn.onclick = () => testarPortal(entry.portal, entry.mac);
            app.appendChild(btn);
        });

    } catch (erro) {
        app.innerHTML = "<p>Erro ao carregar lista: " + erro + "</p>";
    }
}

// -----------------------------
// TESTAR PORTAL (handshake)
// -----------------------------
async function testarPortal(portal, mac) {
    alert("A testar portal:\n" + portal + "\nMAC: " + mac);

    try {
        const url = `${portal}/server/load.php?type=stb&action=handshake&token=&mac=${mac}`;
        const response = await fetch(url);
        const texto = await response.text();

        if (texto.trim().startsWith("<")) {
            throw new Error("O portal devolveu HTML em vez de JSON");
        }

        alert("Portal OK:\n" + texto);

    } catch (erro) {
        alert("Falha ao testar portal:\n" + portal + "\nErro: " + erro);
    }
}

// -----------------------------
// INICIAR APP
// -----------------------------
start();
