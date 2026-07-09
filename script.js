'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app') || document.body;

  const IMAGE_PATH = './images/';

  const SCREEN_TIME = {
    insideDoorOpen: 900,
    roomOutside: 900,
    outsideDoorOpen: 900,
  };

  const state = {
    currentRoom: 0,
    wrongCount: 0,
    isTransitioning: false,
  };

  const rooms = [
    {
      id: 1,
      title: '第1実験室',
      question:
        '情報を記憶する際、それを覚えた状況と類似した状況だと思い出しやすい。これを○○効果というが、〇〇は何か？',
      answer: ['文脈依存'],
      hint: '覚えたときの「文脈」が手がかりになります。',
      images: {
        question: 'room01_question.png',
        insideDoorOpen: 'room01_inside_open.png',
        outside: 'room01_outside.png',
        outsideDoorOpen: 'room01_outside_open.png',
      },
    },
    {
      id: 2,
      title: '第2実験室',
      question:
        '目を二重にしたり涙袋のメイクにすると、元の目よりも大きく見えるが、それは○○錯視によるものである。○○は何か？',
      answer: ['デルブーフ'],
      hint: '周囲の輪郭によって大きさの見え方が変わる錯視です。',
      images: {
        question: 'room02_question.png',
        insideDoorOpen: 'room02_inside_open.png',
        outside: 'room02_outside.png',
        outsideDoorOpen: 'room02_outside_open.png',
      },
    },
    {
      id: 3,
      title: '第3実験室',
      question:
        'ギャンブルやソーシャルゲームの課金など、たまに大当たりする、つまり報酬が得られると人は行動を消去し辛い。この強化を○○強化という。○○は何か？',
      answer: ['部分'],
      hint: '毎回ではなく、たまに報酬が得られる強化です。',
      images: {
        question: 'room03_question.png',
        insideDoorOpen: 'room03_inside_open.png',
        outside: 'room03_outside.png',
        outsideDoorOpen: 'room03_outside_open.png',
      },
    },
    {
      id: 4,
      title: '第4実験室',
      question:
        '興味関心をもって勉強していたが、親からご褒美を与えられたとたん、ご褒美目当てで勉強するようになった。このように外的報酬によって内発的動機づけから外発的動機づけに変わることを○○効果という。○○は何か？',
      answer: ['アンダーマイニング'],
      hint: '外的報酬によって、もともとの動機づけが低下する効果です。',
      images: {
        question: 'room04_question.png',
        insideDoorOpen: 'room04_inside_open.png',
        outside: 'room04_outside.png',
        outsideDoorOpen: 'room04_outside_open.png',
      },
    },
    {
      id: 5,
      title: '第5実験室',
      question:
        '”あなたは基本的に人と関わることが好きだけど時には1人になりたい時もある”など、多くの人に当てはまるのに自分のことだと思ってしまうことを○○効果という。○○は何か？',
      answer: ['バーナム'],
      hint: '占いや性格診断で起こりやすい効果です。',
      images: {
        question: 'room05_question.png',
        insideDoorOpen: 'room05_inside_open.png',
        outside: 'room05_outside.png',
        outsideDoorOpen: 'room05_outside_open.png',
      },
    },
    {
      id: 6,
      title: '第6実験室',
      question:
        '報酬を得た時や快楽を感じた時、脳内のある神経伝達物質が増える。その神経伝達物質とは何か？',
      answer: ['ドーパミン'],
      hint: '報酬系に関わる神経伝達物質です。',
      images: {
        question: 'room06_question.png',
        insideDoorOpen: 'room06_inside_open.png',
        outside: 'room06_outside.png',
        outsideDoorOpen: 'room06_outside_open.png',
      },
    },
    {
      id: 7,
      title: '第7実験室',
      question:
        '自分は答えがBだと思っていたが、他の全員がAと答えると自分もAと答えやすくなる。これは○○圧力が働いたといえる。○○は何か？',
      answer: ['同調'],
      hint: '周囲に合わせようとする、集団における心理です。',
      images: {
        question: 'room07_question.png',
        insideDoorOpen: 'room07_inside_open.png',
        outside: 'room07_outside.png',
        outsideDoorOpen: 'room07_outside_open.png',
      },
    },
    {
      id: 8,
      title: '第8実験室',
      question:
        '心理学のテストが不安でストレスを感じている。そこで自分がまとめたノートを何度も読み返して対処した。これは○○焦点型コーピングというが、○○は何か？',
      answer: ['問題'],
      hint: 'ストレスの原因そのものに働きかけるコーピングです。',
      images: {
        question: 'room08_question.png',
        insideDoorOpen: 'room08_inside_open.png',
        outside: 'room08_outside.png',
        outsideDoorOpen: 'room08_outside_open.png',
      },
    },
  ];

  const endingImage = 'ending.png';

  const normalize = (value) => {
    return String(value || '')
      .trim()
      .replace(/\s+/g, '')
      .replace(/　/g, '')
      .replace(/[。、．.]/g, '')
      .toLowerCase();
  };

  const isCorrect = (input, answers) => {
    const userAnswer = normalize(input);
    return answers.some((answer) => normalize(answer) === userAnswer);
  };

  const clearApp = () => {
    app.innerHTML = '';
  };

  const createElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const createButton = (text, className, onClick) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className || 'btn';
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
  };

  const imageSrc = (fileName) => {
    return `${IMAGE_PATH}${fileName}`;
  };

  const wait = (ms) => {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  };

  const renderImageScreen = (fileName, className = '') => {
    clearApp();

    const wrapper = createElement('main', `screen image-screen ${className}`.trim());
    const image = document.createElement('img');

    image.className = 'room-image';
    image.src = imageSrc(fileName);
    image.alt = '';

    wrapper.appendChild(image);
    app.appendChild(wrapper);
  };

  const renderStart = () => {
    clearApp();

    const wrapper = createElement('main', 'screen start-screen');
    const title = createElement('h1', 'game-title', '心理学研究所 ― 第8実験室 ―');
    const lead = createElement(
      'p',
      'lead',
      'あなたは研究所に閉じ込められました。8つの実験室の問題に正解して脱出してください。'
    );

    const rules = createElement('div', 'rules');
    rules.innerHTML = `
      <h2>遊び方</h2>
      <ul>
        <li>答えを入力し、Enterキーまたは「回答する」を押してください。</li>
        <li>正解すると、次の実験室へ進みます。</li>
        <li>不正解の場合は、ひとつ前の実験室へ戻ります。</li>
        <li>第1実験室で不正解の場合は、第1実験室に戻ります。</li>
      </ul>
    `;

    const startButton = createButton('実験を開始する', 'btn primary', () => {
      state.currentRoom = 0;
      state.wrongCount = 0;
      state.isTransitioning = false;
      renderRoom();
    });

    wrapper.append(title, lead, rules, startButton);
    app.appendChild(wrapper);
  };

  const renderRoom = () => {
    state.isTransitioning = false;
    clearApp();

    const room = rooms[state.currentRoom];

    const wrapper = createElement('main', 'screen room-screen');

    const image = document.createElement('img');
    image.className = 'room-image';
    image.src = imageSrc(room.images.question);
    image.alt = '';

    const panel = createElement('section', 'question-panel');
    const progress = createElement('div', 'progress-text', `第${room.id}問 / 全${rooms.length}問`);
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

    const hintButton = createButton('ヒントを見る', 'btn secondary', () => {
      feedback.textContent = `ヒント：${room.hint}`;
      feedback.className = 'feedback hint';
    });

    const feedback = createElement('div', 'feedback');

    form.append(input, submitButton);

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (state.isTransitioning) return;

      const correct = isCorrect(input.value, room.answer);
      const nextRoomIndex = getNextRoomIndex(correct);

      if (!correct) {
        state.wrongCount += 1;
      }

      transitionToRoom(nextRoomIndex);
    });

    panel.append(progress, title, question, form, hintButton, feedback);
    wrapper.append(image, panel);
    app.appendChild(wrapper);

    input.focus();
  };

  const getNextRoomIndex = (correct) => {
    if (correct) {
      return Math.min(state.currentRoom + 1, rooms.length);
    }

    return Math.max(state.currentRoom - 1, 0);
  };

  const transitionToRoom = async (nextRoomIndex) => {
    state.isTransitioning = true;

    const currentRoom = rooms[state.currentRoom];

    renderImageScreen(currentRoom.images.insideDoorOpen, 'inside-door-open-screen');
    await wait(SCREEN_TIME.insideDoorOpen);

    if (nextRoomIndex >= rooms.length) {
      renderEnding();
      return;
    }

    const nextRoom = rooms[nextRoomIndex];

    renderImageScreen(nextRoom.images.outside, 'room-outside-screen');
    await wait(SCREEN_TIME.roomOutside);

    renderImageScreen(nextRoom.images.outsideDoorOpen, 'outside-door-open-screen');
    await wait(SCREEN_TIME.outsideDoorOpen);

    state.currentRoom = nextRoomIndex;
    renderRoom();
  };

  const renderEnding = () => {
    state.isTransitioning = false;
    clearApp();

    const wrapper = createElement('main', 'screen ending-screen');

    const image = document.createElement('img');
    image.className = 'ending-image';
    image.src = imageSrc(endingImage);
    image.alt = '';

    const restartButton = createButton('もう一度遊ぶ', 'btn primary', () => {
      state.currentRoom = 0;
      state.wrongCount = 0;
      state.isTransitioning = false;
      renderStart();
    });

    wrapper.append(image, restartButton);
    app.appendChild(wrapper);
  };

  renderStart();
});