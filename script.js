'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app') || document.body;

  const IMAGE_PATH = './images/';
  const AUDIO_PATH = './sounds/';

  const VERSION_TEXT = 'Psychology Escape\nVersion 1.0\n© Yuki Yokota';

  const SCREEN_TIME = {
    loading: 900,
    black: 750,
    hallway: 3200,
    outsideDoorOpen: 3200,
    insideDoorOpen: 3200,
    locked: 2400,
    escape: 2300,
  };

  const state = {
    currentRoom: 0,
    wrongCount: 0,
    startTime: null,
    clearTime: null,
    wrongRooms: [],
    isTransitioning: false,
  };

  const rooms = [
    {
      id: 1,
      title: '第1実験室',
      question:
        '情報を記憶する際、それを覚えた状況と類似した状況だと思い出しやすい。これを○○効果というが、〇〇は何か？',
      answers: ['文脈依存', '文脈依存効果', '文脈'],
      hint: '覚えたときの「文脈」が手がかりになります。',
    },
    {
      id: 2,
      title: '第2実験室',
      question:
        '目を二重にしたり涙袋のメイクにすると、元の目よりも大きく見えるが、それは○○錯視によるものである。○○は何か？',
      answers: ['デルブーフ', 'デルブーフ錯視'],
      hint: '周囲の輪郭によって大きさの見え方が変わる錯視です。',
    },
    {
      id: 3,
      title: '第3実験室',
      question:
        'ギャンブルやソーシャルゲームの課金など、たまに大当たりする、つまり報酬が得られると人は行動を消去し辛い。この強化を○○強化という。○○は何か？',
      answers: ['部分', '部分強化'],
      hint: '毎回ではなく、たまに報酬が得られる強化です。',
    },
    {
      id: 4,
      title: '第4実験室',
      question:
        '興味関心をもって勉強していたが、親からご褒美を与えられたとたん、ご褒美目当てで勉強するようになってしまった。このように外的報酬によって内発的動機づけが低下する現象を○○効果という。○○は何か？',
      answers: ['アンダーマイニング', 'アンダーマイニング効果'],
      hint: '外的報酬によって、もともとの動機づけが低下する効果です。',
    },
    {
      id: 5,
      title: '第5実験室',
      question:
        '「あなたは基本的に人と関わることが好きだけど時には一人になりたい時もある」など、多くの人に当てはまるのに自分のことだと思ってしまうことを○○効果という。○○は何か？',
      answers: ['バーナム', 'バーナム効果', 'フォアラー', 'フォアラー効果'],
      hint: '占いや性格診断で起こりやすい効果です。',
    },
        {
      id: 6,
      title: '第6実験室',
      question:
        '報酬を得た時や快楽を感じた時、脳内で分泌が増える神経伝達物質を「○○」という。○○は何か？',
      answers: ['ドーパミン', 'dopamine'],
      hint: '報酬系に関わる神経伝達物質です。',
    },
    {
      id: 7,
      title: '第7実験室',
      question:
        '自分は答えがBだと思っていたが、他の全員がAと答えると自分もAと答えやすくなる。これは○○圧力が働いたといえる。○○は何か？',
      answers: ['同調', '同調圧力'],
      hint: '周囲に合わせようとする、集団における心理です。',
    },
    {
      id: 8,
      title: '第8実験室',
      question:
        '心理学のテストが不安でストレスを感じている。そこでノートをまとめ直したり、繰り返し勉強した。これは○○焦点型コーピングというが、○○は何か？',
      answers: ['問題', '問題焦点', '問題焦点型', '問題焦点型コーピング'],
      hint: 'ストレスの原因そのものに働きかけるコーピングです。',
    },
  ];

  const removeExtraWords = (value) => {
    return value
      .replace(/効果/g, '')
      .replace(/錯視/g, '')
      .replace(/強化/g, '')
      .replace(/圧力/g, '')
      .replace(/焦点/g, '')
      .replace(/型/g, '')
      .replace(/コーピング/g, '');
  };

  const normalize = (value) => {
    return removeExtraWords(
      String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
          String.fromCharCode(s.charCodeAt(0) - 0xfee0)
        )
        .replace(/\s+/g, '')
        .replace(/　/g, '')
        .replace(/[。、．.・]/g, '')
        .replace(/[「」『』"“”‘’']/g, '')
    );
  };

  const isCorrect = (input, answers) => {
    const userAnswer = normalize(input);
    return answers.some((answer) => normalize(answer) === userAnswer);
  };

  const imageSrc = (fileName) => `${IMAGE_PATH}${fileName}`;

  const playSound = (fileName) => {
    const audio = new Audio(`${AUDIO_PATH}${fileName}`);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };
  const wait = (ms) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const clearApp = () => {
    app.innerHTML = '';
  };

  const createElement = (tag, className = '', text = '') => {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== '') {
      element.textContent = text;
    }

    return element;
  };

  const createButton = (text, className, onClick) => {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = className;
    button.textContent = text;
    button.addEventListener('click', onClick);

    return button;
  };

  const formatTime = (ms) => {
    const total = Math.floor(ms / 1000);

    const min = String(Math.floor(total / 60)).padStart(2, '0');
    const sec = String(total % 60).padStart(2, '0');

    return `${min}:${sec}`;
  };

  const renderImageScreen = (fileName, className = '') => {
    clearApp();

    const screen = createElement(
      'main',
      `screen ${className}`.trim()
    );

    const image = document.createElement('img');
    image.className = 'room-image';
    image.src = imageSrc(fileName);

    screen.appendChild(image);
    app.appendChild(screen);
  };

  const renderBlackScreen = () => {
    clearApp();

    const screen = createElement('main', 'screen black-screen');

    app.appendChild(screen);
  };

  const transitionBlack = async () => {
    renderBlackScreen();
    await wait(SCREEN_TIME.black);
  };

  const playDoor = () => {
    playSound('door.mp3');
  };

  const playClick = () => {
    playSound('click.mp3');
  };

  const playLocked = () => {
    playSound('locked.mp3');
  };

  const playClear = () => {
    playSound('clear.mp3');
  };
  const renderLoading = async () => {
    clearApp();

    const screen = createElement('main', 'screen loading-screen');
    const text = createElement('div', 'loading-text', 'Loading...');

    screen.appendChild(text);
    app.appendChild(screen);

    await wait(SCREEN_TIME.loading);

    renderTitle();
  };

  const renderTitle = () => {
    clearApp();

    const screen = createElement('main', 'screen title-screen');

    const image = document.createElement('img');
    image.className = 'room-image';
    image.src = imageSrc('title.png');
    image.alt = '';

    const version = createElement('div', 'version-text', VERSION_TEXT);

    const startButton = createButton('ENTER', 'btn title-button', async () => {
      if (state.isTransitioning) return;

      playClick();

      state.currentRoom = 0;
      state.wrongCount = 0;
      state.startTime = Date.now();
      state.clearTime = null;
      state.wrongRooms = [];
      state.isTransitioning = true;

      await transitionBlack();
      await enterRoom(0);
    });

    screen.append(image, version, startButton);
    app.appendChild(screen);
  };

  const enterRoom = async (roomIndex) => {
    state.isTransitioning = true;

    const room = rooms[roomIndex];

    renderImageScreen(`door-hallway-${room.id}.png`, 'hallway-screen');
    await wait(SCREEN_TIME.hallway);

    await transitionBlack();

    renderImageScreen('knob-outside.png', 'outside-door-open-screen');
    playDoor();
    await wait(SCREEN_TIME.outsideDoorOpen);

    await transitionBlack();

    state.currentRoom = roomIndex;
    renderQuestion();
  };

  const renderQuestion = () => {
    state.isTransitioning = false;
    clearApp();

    const room = rooms[state.currentRoom];

    const screen = createElement('main', 'screen room-screen');

    const image = document.createElement('img');
    image.className = 'room-image';
    image.src = imageSrc('question-room.png');
    image.alt = '';

    const panel = createElement('section', 'question-panel');
    const progress = createElement(
      'div',
      'progress-text',
      `第${room.id}問 / 全${rooms.length}問`
    );
    const title = createElement('h1', 'room-title', room.title);
    const question = createElement('p', 'question', room.question);

    const form = createElement('form', 'answer-form');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'answer-input';
    input.placeholder = '答えを入力';
    input.autocomplete = 'off';
    input.setAttribute('aria-label', '答え');

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn primary';
    submitButton.textContent = '回答する';

    form.append(input, submitButton);
    panel.append(progress, title, question);
    screen.append(image, panel, form);
    app.appendChild(screen);

    input.focus();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (state.isTransitioning) return;

      playClick();

      const correct = isCorrect(input.value, room.answers);

      if (!correct) {
        state.wrongCount += 1;
        state.wrongRooms.push(room.id);
      }

      if (state.wrongCount >= 3) {
        await gameOver();
        return;
      }

      const nextRoomIndex = correct
        ? state.currentRoom + 1
        : Math.max(state.currentRoom - 1, 0);

      await moveAfterAnswer(nextRoomIndex);
    });
  };
  const moveAfterAnswer = async (nextRoomIndex) => {
    state.isTransitioning = true;

    await transitionBlack();

   if (nextRoomIndex >= rooms.length) {
   await clearGame();
   return;
　　}

renderImageScreen('knob-inside.png', 'inside-door-open-screen');
playDoor();
await wait(SCREEN_TIME.insideDoorOpen);

await transitionBlack();

await enterRoom(nextRoomIndex);

    await enterRoom(nextRoomIndex);
  };

  const gameOver = async () => {
    state.isTransitioning = true;

    await transitionBlack();

    renderImageScreen('door-locked-action.png', 'locked-screen');
    playLocked();
    await wait(SCREEN_TIME.locked);

    await transitionBlack();

    clearApp();

    const screen = createElement('main', 'screen gameover-screen');

    const image = document.createElement('img');
    image.className = 'room-image';
    image.src = imageSrc('gameover.png');
    image.alt = '';

    const panel = createElement('div', 'gameover-panel');

    const retryButton = createButton('最初から挑戦する', 'btn primary', async () => {
      if (state.isTransitioning) return;

      playClick();

      state.currentRoom = 0;
      state.wrongCount = 0;
      state.startTime = Date.now();
      state.clearTime = null;
      state.wrongRooms = [];
      state.isTransitioning = true;

      await transitionBlack();
      await enterRoom(0);
    });

    const reviewButton = createButton('間違えた問題を復習する', 'btn secondary', () => {
      playClick();
      state.isTransitioning = false;
      renderReview();
    });

    panel.append(retryButton, reviewButton);
    screen.append(image, panel);
    app.appendChild(screen);

    state.isTransitioning = false;
  };
  const renderReview = () => {
    clearApp();

    const screen = createElement('main', 'screen review-screen');
    const panel = createElement('section', 'review-panel');

    const title = createElement('h1', 'review-title', '間違えた問題の復習');
    panel.appendChild(title);

    const uniqueWrongRooms = [...new Set(state.wrongRooms)];

    uniqueWrongRooms.forEach((roomId) => {
      const room = rooms.find((item) => item.id === roomId);
      if (!room) return;

      const item = createElement('div', 'review-item');
      const q = createElement('p', 'review-question', `${room.title}：${room.question}`);
      const h = createElement('p', 'review-hint', `ヒント：${room.hint}`);

      item.append(q, h);
      panel.appendChild(item);
    });

    const retryButton = createButton('再挑戦する', 'btn primary', async () => {
      playClick();

      state.currentRoom = 0;
      state.wrongCount = 0;
      state.startTime = Date.now();
      state.clearTime = null;
      state.wrongRooms = [];
      state.isTransitioning = true;

      await transitionBlack();
      await enterRoom(0);
    });

    panel.appendChild(retryButton);
    screen.appendChild(panel);
    app.appendChild(screen);

    state.isTransitioning = false;
  };

  const clearGame = async () => {
    state.clearTime = Date.now() - state.startTime;

    renderImageScreen('escape.png', 'escape-screen');
    playClear();
    await wait(SCREEN_TIME.escape);

    await transitionBlack();

    renderCertificate();
  };

const renderCertificate = () => {
  clearApp();

  const screen = createElement('main', 'screen certificate-screen');

  const image = document.createElement('img');
  image.className = 'room-image';
  image.src = imageSrc('certificate.png');
  image.alt = '';

  const message = createElement('div', 'certificate-message');
  message.innerHTML = `
    <div class="congrats-title">〜Congratulations!〜</div>
    <div class="screenshot-guide">名前を入力して画面をスクリーンショットしてください</div>
  `;

  const nameInput = document.createElement('input');
  nameInput.className = 'certificate-name-input';
  nameInput.type = 'text';
  nameInput.placeholder = '氏名を入力';
  nameInput.autocomplete = 'off';

  const info = createElement('div', 'certificate-info');
  info.innerHTML = `クリアタイム：${formatTime(state.clearTime)}<br>ミス回数：${state.wrongCount}回`;

  screen.append(image, message, nameInput, info);
  app.appendChild(screen);

  nameInput.focus();
  state.isTransitioning = false;
};

