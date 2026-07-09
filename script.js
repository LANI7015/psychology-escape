/*=========================================================
  心理学研究所 ― 第8実験室 ―
  Psychology Escape Version 1.0

  script.js ①
  基本設定・ゲーム状態・効果音・共通関数
=========================================================*/


/*=========================================================
  Game State
=========================================================*/

const Game = {
    stage: 0,              // 現在の実験室。0 = 第1実験室
    mistakes: 0,           // ミス回数
    wrongStages: [],       // 間違えた実験室番号
    startTime: null,       // ゲーム開始時刻
    locked: false          // 連打防止
};


/*=========================================================
  DOM
=========================================================*/

const app = document.getElementById("app");


/*=========================================================
  Sound Manager
=========================================================*/

const Sound = {
    click: document.getElementById("clickSound"),
    door: document.getElementById("doorSound"),
    locked: document.getElementById("lockedSound"),
    clear: document.getElementById("clearSound"),

    init() {
        if (this.click) this.click.volume = 0.10;
        if (this.door) this.door.volume = 0.18;
        if (this.locked) this.locked.volume = 0.22;
        if (this.clear) this.clear.volume = 0.25;
    },

    play(audio) {
        if (!audio) return;

        try {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        } catch (error) {
            // 音声再生できない環境では何もしない
        }
    },

    playClick() {
        this.play(this.click);
    },

    playDoor() {
        this.play(this.door);
    },

    playLocked() {
        this.play(this.locked);
    },

    playClear() {
        this.play(this.clear);
    }
};


/*=========================================================
  Key Control
=========================================================*/

function setKeyAction(action) {
    document.onkeydown = (event) => {
        if (event.key === "Enter") {
            action();
        }
    };
}


function clearKeyAction() {
    document.onkeydown = null;
}


/*=========================================================
  Screen Transition
=========================================================*/

function changeScreen(callback) {
    if (Game.locked) return;

    Game.locked = true;
    clearKeyAction();

    app.classList.add("fade-out");

    setTimeout(() => {
        app.classList.remove("fade-out");

        callback();

        app.classList.add("fade-in");

        setTimeout(() => {
            app.classList.remove("fade-in");
            Game.locked = false;
        }, 300);

    }, 300);
}


/*=========================================================
  Utility
=========================================================*/

function normalizeAnswer(text) {
    return String(text)
        .trim()
        .replace(/　/g, "")
        .replace(/\s+/g, "")
        .toLowerCase();
}


function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function textToHtml(text) {
    return escapeHtml(text).replace(/\n/g, "<br>");
}


function lifeHtml() {
    return `
        <div class="life">
            ${"❤️".repeat(3 - Game.mistakes)}
            ${"🤍".repeat(Game.mistakes)}
        </div>
    `;
}
/*=========================================================
  アプリ起動
=========================================================*/

window.onload = () => {

    Sound.init();

    showLoading();

};



/*=========================================================
  Loading
=========================================================*/

function showLoading() {

    app.innerHTML = `

        <div class="scene">

            <div class="center">

                <h2 style="color:white;">

                    Loading...

                </h2>

            </div>

        </div>

    `;

    setTimeout(() => {

        changeScreen(showTitle);

    },500);

}



/*=========================================================
  タイトル画面
=========================================================*/

function showTitle() {

    setKeyAction(startGame);

    app.innerHTML = `

        <div
            class="scene"
            style="background-image:url('images/title.png');">

            <button
                class="title-button"
                onclick="startGame()">

                入室

            </button>

            <div class="version">

                Psychology Escape
                <br>

                Version 1.0

                <br><br>

                © Yuki Yokota

            </div>

        </div>

    `;

}



/*=========================================================
  ゲーム開始
=========================================================*/

function startGame() {

    if(Game.locked) return;

    Sound.playClick();

    Game.stage = 0;

    Game.mistakes = 0;

    Game.wrongStages = [];

    Game.startTime = new Date();

    changeScreen(showHallway);

}



/*=========================================================
  第○実験室（廊下）
=========================================================*/

function showHallway() {

    const stage = stages[Game.stage];

    setKeyAction(showOutsideDoor);

    app.innerHTML = `

        <div
            class="scene"
            style="background-image:url('${stage.hallway}')">

            ${lifeHtml()}

            <button
                class="title-button"
                onclick="showOutsideDoor()">

                第${stage.room}実験室へ入る

            </button>

        </div>

    `;

}



/*=========================================================
  外からドアを開ける
=========================================================*/

function showOutsideDoor() {

    if(Game.locked) return;

    clearKeyAction();

    Sound.playDoor();

    app.innerHTML = `

        <div
            class="scene"
            style="background-image:url('images/knob-outside.png');">

        </div>

    `;

    setTimeout(() => {

        changeScreen(showQuestion);

    },900);

}
/*=========================================================
  問題画面
=========================================================*/

function showQuestion() {

    const stage = stages[Game.stage];

    setKeyAction(checkAnswer);

    app.innerHTML = `

        <div
            class="scene"
            style="background-image:url('images/question-room.png');">

            ${lifeHtml()}

            <div class="question-box">

                <div class="question-title">
                    問題
                </div>

                <div class="question-text">
                    ${textToHtml(stage.story)}
                </div>

                <br>

                <h2>
                    ${escapeHtml(stage.question)}
                </h2>

                <br><br>

                <input
                    id="answerInput"
                    autocomplete="off"
                    spellcheck="false"
                    placeholder="答えを入力">

                <br><br>

                <button
                    class="answer-button"
                    onclick="checkAnswer()">

                    決定

                </button>

            </div>

        </div>

    `;

    const input = document.getElementById("answerInput");

    input.focus();

}



/*=========================================================
  回答判定
=========================================================*/

function checkAnswer() {

    if(Game.locked) return;

    const input = document.getElementById("answerInput");

    if(!input) return;

    const userAnswer = normalizeAnswer(input.value);

    if(userAnswer === "") {

        input.focus();

        return;

    }

    const stage = stages[Game.stage];

    const isCorrect = stage.answers.some(answer => {
        return normalizeAnswer(answer) === userAnswer;
    });

    openInsideDoor(isCorrect);

}



/*=========================================================
  部屋の中からドアを開ける
=========================================================*/

function openInsideDoor(isCorrect) {

    if(Game.locked) return;

    Game.locked = true;

    clearKeyAction();

    Sound.playDoor();

    app.innerHTML = `

        <div
            class="scene"
            style="background-image:url('images/knob-inside.png');">

        </div>

    `;

    setTimeout(() => {

        moveRoom(isCorrect);

        Game.locked = false;

    },900);

}



/*=========================================================
  部屋移動
  ※正解・不正解は表示しない
=========================================================*/

function moveRoom(isCorrect) {

    if(isCorrect) {

        Game.stage++;

    } else {

        Game.mistakes++;

        if(!Game.wrongStages.includes(Game.stage)) {

            Game.wrongStages.push(Game.stage);

        }

        if(Game.stage > 0) {

            Game.stage--;

        }

    }


    /*============================
      3回ミスでGAME OVER
    ============================*/

    if(Game.mistakes >= 3) {

        changeScreen(showLockedDoor);

        return;

    }


    /*============================
      第8実験室クリア
    ============================*/

    if(Game.stage >= stages.length) {

        changeScreen(showEscape);

        return;

    }


    /*============================
      次の画面へ
    ============================*/

    changeScreen(showHallway);

}
/*=========================================================
  ドアが開かない
=========================================================*/

function showLockedDoor() {

    clearKeyAction();

    Sound.playLocked();

    app.innerHTML = `

        <div
            class="scene"
            style="background-image:url('images/door-locked-action.png');">

        </div>

    `;

    setTimeout(() => {

        changeScreen(showGameOver);

    },1500);

}



/*=========================================================
  GAME OVER
=========================================================*/

function showGameOver() {

    setKeyAction(startGame);

    app.innerHTML = `

        <div
            class="scene"
            style="background-image:url('images/gameover.png');">

            <div class="gameover-buttons">

                <button onclick="startGame()">

                    最初から挑戦する

                </button>

                <button onclick="showHint()">

                    間違えた問題を復習する

                </button>

            </div>

        </div>

    `;

}



/*=========================================================
  復習
  ※答えは表示しない
=========================================================*/

function showHint() {

    clearKeyAction();

    let html = `

        <div class="scene">

            <div class="question-box">

                <h1>

                    間違えた問題を復習

                </h1>

                <br>

    `;


    if(Game.wrongStages.length === 0) {

        html += `

            <p>

                間違えた問題はありません。

            </p>

        `;

    } else {

        Game.wrongStages.forEach(index => {

            const stage = stages[index];

            html += `

                <hr>

                <br>

                <h2>

                    第${stage.room}実験室

                </h2>

                <br>

                <p>

                    ${textToHtml(stage.hint)}

                </p>

                <br>

            `;

        });

    }


    html += `

                <br>

                <p>

                    もう一度挑戦してみましょう。

                </p>

                <br>

                <button onclick="startGame()">

                    最初から挑戦する

                </button>

            </div>

        </div>

    `;

    app.innerHTML = html;

}



/*=========================================================
  脱出
=========================================================*/

function showEscape() {

    clearKeyAction();

    Sound.playClear();

    app.innerHTML = `

        <div
            class="scene"
            style="background-image:url('images/escape.png');">

        </div>

    `;

    setTimeout(() => {

        changeScreen(showCertificate);

    },2000);

}



/*=========================================================
  修了認定証：名前入力
=========================================================*/

function showCertificate() {

    clearKeyAction();

    app.innerHTML = `

        <div
            class="scene"
            style="background-image:url('images/certificate.png');">

            <div class="certificate">

                <h1>

                    修了認定証

                </h1>

                <br><br>

                <p>

                    氏名

                </p>

                <br>

                <input
                    id="playerName"
                    placeholder="氏名を入力">

                <br><br>

                <button onclick="finishCertificate()">

                    認定証を受け取る

                </button>

            </div>

        </div>

    `;

    const input = document.getElementById("playerName");

    input.focus();

    setKeyAction(finishCertificate);

}



/*=========================================================
  修了認定証：完成
=========================================================*/

function finishCertificate() {

    const input = document.getElementById("playerName");

    const name = input
        ? input.value.trim() || "受講者"
        : "受講者";

    const totalSeconds = Math.floor(
        (new Date() - Game.startTime) / 1000
    );

    const minutes = Math.floor(totalSeconds / 60);

    const seconds = String(totalSeconds % 60).padStart(2, "0");

    clearKeyAction();

    app.innerHTML = `

        <div
            class="scene"
            style="background-image:url('images/certificate.png');">

            <div class="certificate">

                <h1>

                    心理学研究所

                </h1>

                <h2>

                    第8実験室 修了認定証

                </h2>

                <br><br>

                <h2>

                    ${escapeHtml(name)}

                </h2>

                <br>

                <div class="result">

                    クリアタイム

                    <br>

                    ${minutes}分 ${seconds}秒

                    <br><br>

                    ミス回数

                    <br>

                    ${Game.mistakes}回

                    <br><br>

                    第8実験室を修了したことを認定します。

                    <br><br>

                    この画面をスクリーンショットし、

                    授業で提示してください。

                </div>

            </div>

        </div>

    `;

}
