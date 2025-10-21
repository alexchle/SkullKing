let playerCount = 4;
let playerNames = [];
let bonusVariant = false;
const totalRounds = 10;
const STORAGE_KEY = 'skullKingGameSession';
const videoElement = document.getElementById('bg-video');


// Farbschema für Spielergruppen
const playerColors = [
    "bg-yellow-50", // Spieler 1
    "bg-blue-50",   // Spieler 2
    "bg-green-50",  // Spieler 3
    "bg-pink-50",   // Spieler 4
    "bg-purple-50", // Spieler 5
    "bg-orange-50", // Spieler 6
    "bg-teal-50",   // Spieler 7
    "bg-red-50"     // Spieler 8
];

function getPlayerColorClass(p) {
    return playerColors[p % playerColors.length];
}

document.addEventListener("DOMContentLoaded", () => {
    const playerOptions = document.getElementById("player-count-options");
    const setupArea = document.getElementById("setup-area");

    if (videoElement) {
        // 2. Setze die Wiedergabegeschwindigkeit (z.B. auf 50% der Normalgeschwindigkeit)
        videoElement.playbackRate = 1; 
        
    }

    if(loadGame()) {
        setupArea.classList.add("hidden");
    } 
    else {
    // Buttons 2-8 erstellen
        for (let i = 2; i <= 8; i++) {
            const btn = document.createElement("div");
            btn.classList.add(
                "w-10", "h-10",
                "flex", "items-center", "justify-center",
                "rounded-full",
                "bg-gray-800", "text-white", "font-semibold",
                "cursor-pointer",
                "hover:bg-gray-600",
                "transition"
            );
            btn.innerText = i;
            btn.addEventListener("click", () => {
                playerCount = i;
                bonusVariant = document.getElementById("bonus-variant").checked;

                setupArea.classList.add("hidden");
                showNameFields();
            });
            playerOptions.appendChild(btn);
        }

    }
});

function showNameFields() {
    const namesArea = document.getElementById("names-area");
    const nameFields = document.getElementById("name-fields");
    nameFields.innerHTML = "";

    for (let i = 0; i < playerCount; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Spieler ${i+1}`;
        input.required = true;
        input.classList.add(
            "w-48",
            "px-3", "py-2",
            "rounded-lg",
            "border", "border-gray-300",
            "shadow-sm",
            "text-center",
            "focus:outline-none",
            "focus:ring-2",
            "focus:ring-grey-800"
        );
        nameFields.appendChild(input);
    }

    namesArea.classList.remove("hidden");

    document.getElementById("names-form").onsubmit = function(e) {
        e.preventDefault();
        playerNames = Array.from(nameFields.querySelectorAll("input"))
                            .map((input, index) => input.value.trim() || `Spieler ${index+1}`);

        namesArea.classList.add("hidden");
        saveGame();
        startGame();
    };
}

function startGame() {
    const table = document.getElementById("game-table");
    table.innerHTML = "";

    // Kopfzeile
    const header = table.insertRow();
    header.classList.add("bg-gray-200");
    let th = document.createElement("th");
    th.innerText = "Runde";
    th.classList.add("border", "border-gray-300", "px-2", "py-1");
    header.appendChild(th);

    playerNames.forEach((name, p) => {
        ["Tipp", "Stiche", "Bonus"].forEach((label) => {
            let th = document.createElement("th");
            th.innerText = (label === "Tipp" ? name + " " : "") + label;
            th.classList.add(
                "border", "border-gray-300", "px-2", "py-1",
                getPlayerColorClass(p)
            );
            header.appendChild(th);
        });
    });

    // Runden
    for (let r = 1; r <= totalRounds; r++) {
        const row = table.insertRow();
        let td = row.insertCell();
        td.innerText = r;
        td.classList.add("border", "border-gray-300", "px-2", "py-1", "font-semibold");

        for (let p = 0; p < playerCount; p++) {
            const color = getPlayerColorClass(p);

            let cell1 = row.insertCell();
            cell1.classList.add("border", "border-gray-300", "px-2", "py-1", color, "text-center");
            cell1.appendChild(createDropdown("tipp", r, p));

            let cell2 = row.insertCell();
            cell2.classList.add("border", "border-gray-300", "px-2", "py-1", color, "text-center");
            cell2.appendChild(createDropdown("stiche", r, p));

            let cell3 = row.insertCell();
            cell3.classList.add("border", "border-gray-300", "px-2", "py-1", color, "text-center");
            cell3.appendChild(createDropdown("bonus", r, p));
        }
    }

    // Gesamtpunktezeile
    const totalRow = table.insertRow();
    let td = totalRow.insertCell();
    td.innerText = "Gesamtpunkte";
    td.classList.add("font-bold", "px-2", "py-1", "border", "border-gray-400", "bg-gray-200");

    for (let p = 0; p < playerCount; p++) {
        const cell = totalRow.insertCell();
        cell.id = `total-${p}`;
        cell.colSpan = 3;
        cell.innerText = "0";
        cell.classList.add(
            "text-center",
            "font-bold",
            "px-2", "py-1",
            "border", "border-gray-400",
            getPlayerColorClass(p) // gleiche Farbe wie Spieler-Spalten
        );
    }

    document.getElementById("game-area").classList.remove("hidden");


    // Gimmick-Piratenbutton anzeigen
    const pirateContainer = document.getElementById("pirate-button-container");
    pirateContainer.classList.remove("hidden");

    // Sound abspielen
    const pirateBtn = document.getElementById("pirate-button");
    const audio = new Audio("../Assets/SkullKing.mp3"); // deine Musikdatei
    pirateBtn.addEventListener("click", () => {
        audio.currentTime = 0; // immer von vorne starten
        audio.play();
    });

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
                    total += -10 * diff + Math.floor(bonus / 2);
                } else {
                    total += -10 * diff;
                }
            } else {
                total += -10 * Math.abs(tipp - stiche) + bonus;
            }
        }
        document.getElementById(`total-${p}`).innerText = total;
    }
    saveGame();
}

function createDropdown(type, rowIndex, playerIndex) {
    const select = document.createElement("select");
    select.classList.add(
        "bg-gray-800", "text-white",
        "rounded-lg", "px-2", "py-1",
        "cursor-pointer", "text-center",
        "border", "border-gray-600",  "appearance-none"
    );

    if(type === "tipp" || type === "stiche") {
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

    select.addEventListener("change", calculateTotals);

    return select;
}

function saveGame() {
    const gameState = {
        playerCount: playerCount,
        playerNames: playerNames,
        bonusVariant: bonusVariant,
        //Tabelle speichern
        roundsData: [] 
    };

    
    if (playerNames.length > 0) {
        const table = document.getElementById("game-table");
        if (table && table.rows.length > 1) { 
             for (let r = 1; r <= totalRounds; r++) {
                const row = table.rows[r];
                const round = { tips: [], tricks: [], bonus: [] };

                for (let p = 0; p < playerCount; p++) {
                    const spTipp = row.cells[1 + p * 3].querySelector("select");
                    const spStiche = row.cells[2 + p * 3].querySelector("select");
                    const spBonus = row.cells[3 + p * 3].querySelector("select");
                    
                    
                    round.tips.push(spTipp ? spTipp.value : "");
                    round.tricks.push(spStiche ? spStiche.value : "");
                    round.bonus.push(spBonus ? spBonus.value : "");
                }
                gameState.roundsData.push(round);
            }
        }
    }
    
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
        console.error("Fehler beim Speichern in sessionStorage:", e);
    }
}

function loadGame() {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (!stored) return false; 

        const gameState = JSON.parse(stored);

        
        playerCount = gameState.playerCount || 4;
        playerNames = gameState.playerNames || [];
        bonusVariant = gameState.bonusVariant || false;

        if (playerNames.length > 0) {
            startGame(); 

            const table = document.getElementById("game-table");
            if (table && gameState.roundsData) {
                gameState.roundsData.forEach((round, rIndex) => {
                    const row = table.rows[rIndex + 1]; 
                    if (row) {
                        for (let p = 0; p < playerCount; p++) {
                            
                            const spTipp = row.cells[1 + p * 3].querySelector("select");
                            const spStiche = row.cells[2 + p * 3].querySelector("select");
                            const spBonus = row.cells[3 + p * 3].querySelector("select");
                            
                            if (spTipp) spTipp.value = round.tips[p] || "";
                            if (spStiche) spStiche.value = round.tricks[p] || "";
                            if (spBonus) spBonus.value = round.bonus[p] || "0"; 
                        }
                    }
                });
            }
            calculateTotals(); 
            return true;
        }
        return false;
    } catch (e) {
        console.error("Fehler beim Laden aus localStorage:", e);
        return false;
    }
}