import { saveScore } from "./score.js";

const Toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true
});

async function showEndDialog({ title = '', text = '', icon = 'info', timeUsed = null }) {
    isGameOver = true;
    timerRunning = false;

    const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,   // maps to Exit to Home 
        showDenyButton: true,     // maps to Leaderboard
        confirmButtonText: 'Replay',
        denyButtonText: 'Leaderboard',
        cancelButtonText: 'Exit to Home',
        background: 'rgba(255, 255, 255, 0.95)',
        customClass: {
            popup: 'swal-popup-custom',
            confirmButton: 'swal-replay-btn',
            denyButton: 'swal-leaderboard-btn',
            cancelButton: 'swal-exit-btn',
            actions: 'swal-actions-row'
        },
        buttonsStyling: false
    });

    // result handling
    if (result.isConfirmed) {
        resetGame(game.scene.scenes[0]); //replay
        return;
    }

    if (result.isDenied) {
        if (timeUsed !== null) {
            await saveScoreToFirebase(timeUsed); 
        } else {
            window.location.href = "leaderboard.html";
        }
        return;
    }
    window.location.href = "home.html";
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    dom: { createContainer: true },
    scene: { preload, create, update },
    transparent: true
};

let game = new Phaser.Game(config);

let level = 1;
let globalTime = 100;
let timerText, levelText, resultText;
let currentSolution = null;
let isGameOver = false;
let puzzleImg;
let timerContainer, timerCircle;
let timerRunning = true;

// Save score to  Firebase then Leaderboard
async function saveScoreToFirebase(timeUsed) {
    try {
        await saveScore(Number(timeUsed));
        window.location.href = "leaderboard.html";
    } catch (err) {
        console.error("Save failed", err);
        Toast.fire({ icon: "error", title: "Failed to save score!" });
    }
}

// Win toast
function showWinToast(timeUsed) {
    showEndDialog({
        title: `🎉 You Wonnn!!!`,
        text: `Time: ${timeUsed}s — What do you want to do next?`,
        icon: 'success',
        timeUsed
    });
}

// Preload
function preload() {
    this.load.image('background', 'assets/banana_bg.jpg');
    this.load.image('levelBadge', 'assets/level_bg.png');
    this.load.image('timerBg', 'assets/timer_bg.png');
}

// Phaser create
function create() {
    const scene = this;

    // Background
    this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background')
        .setDisplaySize(window.innerWidth, window.innerHeight);

    // Level badge image
    const badge = this.add.image(190, 60, 'levelBadge');
    badge.setScale(0.6);

    // Level text
    levelText = this.add.text(badge.x + 45, badge.y + 10, level, {
        fontSize: '42px',
        color: '#FFD700',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 6,
        fontFamily: 'Comic Sans MS', 
    }).setOrigin(0.5);

    // Timer Container
    timerContainer = this.add.container(window.innerWidth - 150, 100);

    // White background circle 
    const timerWhiteBg = this.add.circle(0, 20, 80, 0xFFFFFF);
    timerContainer.add(timerWhiteBg);

    // Background image
    const timerBgImg = this.add.image(0, 20, 'timerBg').setScale(0.55);

    // Timer progress
    timerCircle = this.add.graphics();
    timerCircle.x = 5;
    timerCircle.y = 20;

    // Timer text
    timerText = this.add.text(5, 20, globalTime, {
        fontSize: '60px',          
        color: '#ff0000ff',          
        fontStyle: 'bold',
        padding: { x: 10, y: 5 },
        align: 'center',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    timerContainer.add([timerBgImg, timerCircle, timerText]);


    // Result
    resultText = this.add.text(window.innerWidth / 2, window.innerHeight - 140, '', {
        fontSize: '28px',
        color: '#FFF',
        stroke: '#000',
        strokeThickness: 4
    }).setOrigin(0.5);

    createKeypad(scene);
    startLevel(scene, level);
    drawTimerCircle();
}

// Timer
function update(time, delta) {
    if (!isGameOver && timerRunning && globalTime > 0) {
        globalTime -= delta / 1000;
        drawTimerCircle();
        timerText.setText(Math.floor(globalTime));

        if (globalTime <= 0) {
            Toast.fire({ icon: 'error', title: "⏳ Time's up!" });
            showEndDialog({
                title: "⏳ Time's up!",
                text: "You ran out of time. Try again or view leaderboard.",
                icon: 'error'
            });
        }
    }
}

// Timer circle
function drawTimerCircle() {
    const progress = Math.max(globalTime / 100, 0);
    const angle = Phaser.Math.DegToRad(360 * progress);
    timerCircle.clear();

    let color = 0x008F00;
    if (progress < 0.5) color = 0xffff00;
    if (progress < 0.25) color = 0xff0000;

    timerCircle.lineStyle(10, color, 1).beginPath();
    timerCircle.arc(0, 0, 55, -Math.PI/2, angle - Math.PI/2, false).strokePath();
}


function startLevel(scene, lvl) {
    level = lvl;
    levelText.setText("LEVEL: " + level);
    resultText.setText('');

    if (puzzleImg) puzzleImg.destroy();

    const url = `https://marcconrad.com/uob/banana/api.php?out=json&v=${Date.now()}`;
    fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`)
        .then(r => r.text())
        .then(data => {
            const p = JSON.parse(data);
            currentSolution = Number(p.solution);

            const img = document.createElement("img");
            img.src = p.question; img.style.width="500px"; img.style.height="500px";
            img.onload = () => {
                puzzleImg = scene.add.dom(window.innerWidth/2, window.innerHeight/2-60, img).setAlpha(0);
                scene.tweens.add({ targets:puzzleImg, alpha:1, duration:400 });
            };
        })
        .catch(() => resultText.setText("⚠️ Load Failed"));

    drawTimerCircle();
}

// Keypad
function createKeypad(scene) {
    const container = document.createElement("div");
    container.classList.add("keypad-container");

    for (let i = 0; i <= 9; i++) {
        const btn = document.createElement("div");
        btn.classList.add("keypad-number");
        btn.textContent = i;
        btn.onclick = () => handleAnswer(scene, i);
        container.appendChild(btn);
    }

    document.body.appendChild(container);
}

function handleAnswer(scene, num) {
    if (Number(num) === currentSolution) {
        if (level >= 5) {
            const used = Number((100 - globalTime).toFixed(2));
            showWinToast(used);
        } else setTimeout(() => startLevel(scene, level+1), 400);
    } else {
        Toast.fire({ icon:'error', title:' Wrong answer!' });
        showEndDialog({
            title: 'Wrong answer!',
            text: 'That answer is incorrect. What would you like to do next?',
            icon: 'error'
        });
    }
}

// Reset
function resetGame(scene) {
    globalTime = 100; level = 1;
    isGameOver = false; timerRunning = true;
    startLevel(scene, level);
}

// Resize
window.addEventListener("resize", () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});
