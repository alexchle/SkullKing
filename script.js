let playerCount = 4;
let playerNames = [];
let bonusVariant = false;
const totalRounds = 10;

document.addEventListener("DOMContentLoaded", () => {
    const playerOptions = document.getElementById("player-count-options");
    const setupArea = document.getElementById("setup-area");

    // Buttons 2-8 erstellen
    for (let i = 2; i <= 8; i++) {
        const btn = document.createElement("div");
        btn.classList.add("player-count-btn");
        btn.innerText = i;
        btn.addEventListener("click", () => {
            playerCount = i;
            bonusVariant = document.getElementById("bonus-variant").checked;

            // Hintergrund grau
            document.body.classList.add("setup-active");

            // Setup-Bereich ausblenden
            setupArea.classList.add("hidden");

            // Namensbereich vorbereiten
            showNameFields();
        });
        playerOptions.appendChild(btn);
    }
});

function showNameFields() {
    const namesArea = document.getElementById("names-area");
    const nameFields = document.getElementById("name-fields");
    nameFields.innerHTML = ""; // alte Felder löschen

    for (let i = 0; i < playerCount; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Spieler ${i+1}`;
        input.required = true;
        nameFields.appendChild(input);
    }

    namesArea.classList.remove("hidden");

    document.getElementById("names-form").onsubmit = function(e) {
        e.preventDefault();
        playerNames = Array.from(nameFields.querySelectorAll("input"))
                            .map((input, index) => input.value.trim() || `Spieler ${index+1}`);

        // Namensbereich ausblenden
        namesArea.classList.add("hidden");

        // Spiel starten
        startGame();
    };
}

function startGame() {
    const table = document.getElementById("game-table");
    table.innerHTML = "";

    // Kopfzeile
    const header = table.insertRow();
    header.insertCell().innerText = "Runde";
    playerNames.forEach(name => {
        header.insertCell().innerText = `${name} Tipp`;
        header.insertCell().innerText = "Stiche";
        header.insertCell().innerText = "Bonus";
    });

    // Runden
    for (let r = 1; r <= totalRounds; r++) {
        const row = table.insertRow();
        row.insertCell().innerText = r; // Nur Runde, Kartenanzahl = r wird implizit genutzt
        for (let p = 0; p < playerCount; p++) {
            row.insertCell().appendChild(createDropdown("tipp", r, p));
            row.insertCell().appendChild(createDropdown("stiche", r, p));
            row.insertCell().appendChild(createDropdown("bonus", r, p));
        }
    }

    // Gesamtpunktezeile
    const totalRow = table.insertRow();
    totalRow.insertCell().innerText = "Gesamtpunkte";
    for (let p = 0; p < playerCount; p++) {
        const cell = totalRow.insertCell();
        cell.id = `total-${p}`;
        cell.colSpan = 3;
        cell.innerText = "0";
    }

    document.getElementById("game-area").classList.remove("hidden");

    // Eventlistener für Berechnung
    table.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", calculateTotals);
    });

    calculateTotals();
}

function createNumberInput(initial = "") {
    const input = document.createElement("input");
    input.type = "number";
    input.min = 0;
    input.value = initial;
    return input;
}

function calculateTotals() {
    const table = document.getElementById("game-table");
    for (let p = 0; p < playerCount; p++) {
        let total = 0;
        for (let r = 1; r <= totalRounds; r++) {
            const row = table.rows[r];
            const spTipp = row.cells[1 + p * 3].querySelector("select");
            const spStiche = row.cells[2 + p * 3].querySelector("select");
            const spBonus = row.cells[3 + p * 3].querySelector("select");

            const tippVal = spTipp.value;
            const sticheVal = spStiche.value;

            // Runde nur berücksichtigen, wenn Tipp und Stiche ausgefüllt
            if (tippVal === "" || sticheVal === "") continue;

            const tipp = parseInt(tippVal) || 0;
            const stiche = parseInt(sticheVal) || 0;
            const bonus = parseInt(spBonus.value) || 0;
            const runde = parseInt(row.cells[0].innerText);

            if (tipp === 0 && stiche === 0) {
                total += runde * 10 + bonus;
            } else if (tipp === stiche) {
                total += tipp * 20 + bonus;
            } else if (bonusVariant) {
                const diff = Math.abs(tipp - stiche);
                if (diff === 1) {
                    total += -10 * diff + Math.floor(bonus / 2); // halber Bonus
                } else {
                    total += -10 * diff + 0; // keine Bonuspunkte
                }
            } else {
                total += -10 * Math.abs(tipp - stiche) + bonus; // normale Variante
            }
        }
        document.getElementById(`total-${p}`).innerText = total;
    }
}

function createDropdown(type, rowIndex, playerIndex) {
    const select = document.createElement("select");

    // Leeres Placeholder-Option
    if(type === "tipp") {
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.text = "--";
        placeholder.disabled = true;
        placeholder.selected = true;
        select.appendChild(placeholder);

        for(let i=0; i<=10; i++){
            const option = document.createElement("option");
            option.value = i;
            option.text = i;
            select.appendChild(option);
        }
    }

    if(type === "stiche") {
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.text = "--";
        placeholder.disabled = true;
        placeholder.selected = true;
        select.appendChild(placeholder);

        for(let i=0; i<=10; i++){
            const option = document.createElement("option");
            option.value = i;
            option.text = i;
            select.appendChild(option);
        }
    }

    if(type === "bonus") {
        const steps = [0,10,20,30,40,50,60,70,80,90,100];
        steps.forEach(v=>{
            const option = document.createElement("option");
            option.value = v;
            option.text = v;
            select.appendChild(option);
        });
    }

    select.addEventListener("change", () => {
    if(type === "tipp") {
        updateTipOptions(rowIndex); // Optionen anpassen
        }
        calculateTotals();
    });

    return select;
}


function createNumberSelector(type, rowIndex, playerIndex) {
    const container = document.createElement("div");
    container.classList.add("num-selector");

    const display = document.createElement("button");
    display.classList.add("num-display");
    display.innerText = "—"; // Platzhalter
    container.appendChild(display);

    const panel = document.createElement("div");
    panel.classList.add("num-panel", "hidden");

    let values = [];
    if(type === "tipp" || type === "stiche") {
        values = Array.from({length:11}, (_,i)=>i); // 0-10
    } else if(type === "bonus") {
        values = [0,10,20,30,40,50,60,70,80,90,100];
    }

    values.forEach(v => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.innerText = v;
        btn.addEventListener("click", ()=>{
            display.innerText = v;
            panel.classList.add("hidden");
            calculateTotals();
        });
        panel.appendChild(btn);
    });

    container.appendChild(panel);

    display.addEventListener("click", ()=>{
        panel.classList.toggle("hidden");
    });

    return container;
}
