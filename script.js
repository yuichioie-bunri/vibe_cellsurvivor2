/* =========================
   調整しやすい変数（上部まとめ）
   ========================= */
const CONFIG = {
  canvasWidth: 1200,
  canvasHeight: 800,
  playerSpeed: 600,
  playerWidth: 80,
  playerHeight: 24,
  // プレイヤーのY位置系
  playerYFromBottom: 60,        // プレイヤー矩形の下端からのオフセット(px)
  fireOffsetFromBottom: 120,    // 発射位置の下端からのオフセット(px)

  bulletSpeed: 1400,
  bulletCooldown: 0.18,
  bulletGravity: 2200,          // 放物線弾の重力（px/s^2）
  // 弾の見た目
  bulletW: 8,
  bulletH: 10,
  bulletTrailExtra: 6,
  bulletTrailHeight: 4,

  enemySpawnInterval: 0.9,
  enemySpeedMin: 140,
  enemySpeedMax: 420,
  enemySizeBase: 80,
  enemyDepthMin: 0.2,
  
  enemyDepthMax: 1.6,
  maxLives: 3,
  maxEnemies: 8,
  scorePerEnemy: 100,
  scoreSpeedFactor: 1.0,        // 敵スピードによるスコア倍率（高いほど速い敵が高得点）
  scoreSizeFactor: 1.0,         // 敵サイズによるスコア倍率（小さい敵が高得点）

  enemyRows: 3,                 // 段数（屋台の射的）
  enemyPerRow: 5,               // 1段あたりの敵数
  enemyRowGap: 150,             // 段の縦間隔(px)
  enemyTopOffset: 180,          // 一番上の段のY座標

  enemyHorizontalRange: 120,    // 左右移動範囲(px)
  enemyRespawnDelay: 1.0,       // 復活までの時間（秒）
  enemyFadeInRate: 2.0,         // 復活時のフェードイン速度(α/秒)
  particleGravity: 800,         // 爆発パーティクルの重力

  gameDuration: 30,             // ゲームの制限時間（秒）

  bgTopColor: "#001a33",        // 背景グラデーション上部（紺色）
  bgBottomColor: "#003366",     // 背景グラデーション下部（紺色）

  localStorageKey: 'my_3d_shooter_highscore_v1',

  // ===== ランキング設定 =====
  maxRanking: 5,                 // ランキング上位5名まで
  rankFont: "20px sans-serif",   // ランキング表示フォント
  rankColor: "#fff",             // ランキング文字色
  newRecordColor: "#ffd700",      // 新記録時のハイライトカラー（金色）

  // ===== ペナルティ敵設定 =====
  penaltyEnemyChance: 1 / 7,   // ペナルティ的が出る確率（1/20）
  penaltyColor: "#4b0082",      // ペナルティ的の色（濃い紫）
  penaltyScoreLoss: 1000,       // 撃った時のスコア減少
  penaltyExplosionColors: ["#ff3300", "#ffaa00"], // 爆発の色
  // ===== ペナルティ敵スコア表示設定 =====
  penaltyTextColor: "#ff3300",    // 「-1000」表示の色
  penaltyTextDuration: 1.0,       // フェードアウトまでの時間（秒）
  penaltyTextRise: 60,             // 上に浮かび上がる距離(px)

  // ===== タイマー関連 =====
  timerDuration: 60,              // ゲーム全体の制限時間（秒）
  timerBarHeight: 18,             // タイムバーの高さ(px)
  timerBarColor: "#ff3333",       // タイムバーの基本色（赤）
  timerBarMargin: 10,             // 画面下からのマージン(px)
  timerWarningTime: 5,            // 点滅開始の残り秒数
  timerFlashColor: "rgba(255,0,0,0.3)", // 点滅時の画面オーバーレイ色
  timerTextFont: "bold 64px sans-serif", // 残り秒数のフォント設定
  timerTextColor: "#ff3333",      // 残り秒数の文字色
  timerFlashDuration: 1.0,
  // === マイルストーン ===
  milestones: [5000, 10000, 20000],     // 閾値
  milestoneToastDuration: 1000,          // 表示時間(ms)

  // ===== 照準マーカー =====
  aimRadius: 14,
  aimLineLen: 20,
  aimStrokeWidth: 2,
  aimAlpha: 0.9,

  // ===== 敵スコア表示 =====
  enemyScoreFont: "16px sans-serif",
  enemyScoreOffset: 8,

  // ===== チュートリアル =====
  tutorialWidth: 400,
  tutorialHeight: 300,
  tutorialTargetRadius: 30,
  tutorialHitFlashGrow: 10,
  tutorialSuccessDelayMs: 1000
};
/* =========================
   基本設定
   ========================= */
const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d', { alpha: true });
const scorePanel = document.getElementById('scorePanel');
const highPanel = document.getElementById('highPanel');
const statePanel = document.getElementById('statePanel');
const btnRestart = document.getElementById('btnRestart');
const btnMute = document.getElementById('btnMute');
const milestoneEl = document.getElementById('milestoneToast');

// === チュートリアル要素 ===
const tutorialOverlay = document.getElementById("tutorialOverlay");
const tutorialCanvas = document.getElementById("tutorialCanvas");
const tctx = tutorialCanvas.getContext("2d");

let tutorialActive = false;
let tutorialTarget = { x: 200, y: 150, r: CONFIG.tutorialTargetRadius };
let tutorialCleared = false;

// ===== 敵画像を読み込み =====
const enemyImage = new Image();
enemyImage.src = "images/enemy_normal.png"; // ← 用意した敵画像のファイル名を指定（index.htmlと同じフォルダに置く）

const penaltyImage = new Image();
penaltyImage.src = "images/enemy_bug.png"; // ← ペナルティ敵用画像を別に用意した場合（なければenemy.pngでも可）

// ゲーム終了フェード関連
const overlay = document.getElementById('gameOverOverlay');
const gameOverTextEl = document.getElementById('gameOverText');
const finalScoreTextEl = document.getElementById('finalScoreText');
const btnMainMenu = document.getElementById('btnMainMenu');

let gameTimer = 0; // 秒カウント
let gameEnded = false;

let lastTime = 0, accumSpawn = 0;
let running = false, muted = false;

let gameState = {
  score: 0, high: 0, lives: CONFIG.maxLives,
  playerX: CONFIG.canvasWidth / 2,
  bullets: [], enemies: [],
  keys: {}, cooldown: 0, playing: false
};

// 次に狙うマイルストーンのインデックス
let nextMilestoneIndex = 0;

function showMilestoneToast(text){
  if(!milestoneEl) return;
  milestoneEl.textContent = text;
  milestoneEl.classList.remove('hidden');
  milestoneEl.classList.remove('show'); // 連続発火対策
  // リフローしてから付け直すとアニメ再生される
  void milestoneEl.offsetWidth;
  milestoneEl.classList.add('show');
  setTimeout(()=>{
    milestoneEl.classList.remove('show');
  }, CONFIG.milestoneToastDuration);
}

function checkMilestone(){
  const thresholds = CONFIG.milestones;
  if(nextMilestoneIndex >= thresholds.length) return;
  if(gameState.score >= thresholds[nextMilestoneIndex]){
    const v = thresholds[nextMilestoneIndex].toLocaleString();
    showMilestoneToast(`${v} ポイント！`);
    nextMilestoneIndex++;
  }
}

/* =========================
   ユーティリティ
   ========================= */
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function rand(a, b) { return a + Math.random() * (b - a); }

function fitCanvas() {
  const wrap = document.getElementById('gameWrap');
  const cw = CONFIG.canvasWidth, ch = CONFIG.canvasHeight;
  const scale = Math.min(wrap.clientWidth / cw, wrap.clientHeight / ch);
  canvas.width = cw;
  canvas.height = ch;
  canvas.style.width = cw * scale + 'px';
  canvas.style.height = ch * scale + 'px';
}
window.addEventListener('resize', fitCanvas);

/* =========================
   ローカルストレージ
   ========================= */
function loadHigh() {
  const raw = localStorage.getItem(CONFIG.localStorageKey);
  let list = [];
  try { list = raw ? JSON.parse(raw) : []; } catch { list = []; }
  if (!Array.isArray(list)) list = [];
  gameState.rankings = list;
  gameState.high = list.length > 0 ? list[0].score : 0;
  highPanel.textContent = `High: ${gameState.high}`;
}
function saveHigh() {
  let list;
  try {
    const raw = localStorage.getItem(CONFIG.localStorageKey);
    list = raw ? JSON.parse(raw) : [];
  } catch {
    list = [];
  }
  if (!Array.isArray(list)) list = [];

  // 現在スコアが新記録か判定
  const lowestScore = list.length >= CONFIG.maxRanking ? list[list.length - 1].score : -Infinity;
  const isNewRecord = gameState.score > lowestScore;

  if (isNewRecord) {
    const playerName = prompt("新記録！あなたの名前を入力してください:", "Player");
    const entry = { name: playerName || "Unknown", score: gameState.score };
    list.push(entry);
    list.sort((a, b) => b.score - a.score);
    if (list.length > CONFIG.maxRanking) list = list.slice(0, CONFIG.maxRanking);

    // ローカルストレージに保存
    localStorage.setItem(CONFIG.localStorageKey, JSON.stringify(list));

    // メモリ上のランキングも即時更新
    gameState.rankings = list;
    gameState.high = list[0]?.score ?? gameState.score;
    highPanel.textContent = `High: ${gameState.high}`;
  }
  // 保存後も必ず最新のランキングを読み直す
  loadHigh();
}

/* =========================
   ゲーム制御
   ========================= */
function resetGame() {
  gameState.score = 0;
  gameState.lives = CONFIG.maxLives;
  gameState.bullets = [];
  gameState.enemies = [];
  gameState.enemyRows = []; // ← 追加：明示的に初期化
  gameState.playerX = CONFIG.canvasWidth / 2;
  gameState.cooldown = 0;
  accumSpawn = 0;
  lastTime = performance.now();
  loadHigh();
  updateUI();

  // 敵をすぐに生成
  spawnGalleryIfEmpty();
  nextMilestoneIndex = 0;
}

function startGame() {
  resetGame();
  // 最新のハイスコアとランキングを読み込む
  loadHigh();
  // メインゲームの代わりにまずチュートリアルを起動
  launchTutorial();
}

/* =========================
   チュートリアル処理
   ========================= */
function launchTutorial() {
  tutorialActive = true;
  tutorialCleared = false;
  tutorialOverlay.classList.remove("hidden");
  resizeTutorialCanvas();
  drawTutorial();
}

function resizeTutorialCanvas() {
  tutorialCanvas.width = CONFIG.tutorialWidth;
  tutorialCanvas.height = CONFIG.tutorialHeight;
}

function drawTutorial() {
  if (!tutorialActive) return;
  tctx.clearRect(0, 0, tutorialCanvas.width, tutorialCanvas.height);

  // ターゲット
  tctx.save();
  tctx.strokeStyle = "#00ffff";
  tctx.lineWidth = 4;
  tctx.beginPath();
  tctx.arc(tutorialTarget.x, tutorialTarget.y, tutorialTarget.r, 0, Math.PI * 2);
  tctx.stroke();
  tctx.restore();

  requestAnimationFrame(drawTutorial);
}

tutorialCanvas.addEventListener("click", (e) => {
  if (!tutorialActive || tutorialCleared) return;
  const rect = tutorialCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const dx = x - tutorialTarget.x;
  const dy = y - tutorialTarget.y;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (dist < tutorialTarget.r) {
    tutorialCleared = true;
    tctx.fillStyle = "rgba(0,255,0,0.3)";
    tctx.beginPath();
    tctx.arc(tutorialTarget.x, tutorialTarget.y, tutorialTarget.r + CONFIG.tutorialHitFlashGrow, 0, Math.PI * 2);
    tctx.fill();

    // 規定ディレイ後にメインゲーム開始
    setTimeout(() => {
      tutorialOverlay.classList.add("hidden");
      tutorialActive = false;
      beginMainGame();
    }, CONFIG.tutorialSuccessDelayMs);
  }
});

function beginMainGame() {
  running = true;
  gameState.playing = true;
  statePanel.style.display = 'none';
  overlay.classList.remove('show');
  gameOverTextEl.classList.remove('visible');
  finalScoreTextEl.classList.remove('visible');
  btnMainMenu.classList.remove('visible');
  gameEnded = false;
  gameTimer = 0;
  requestAnimationFrame(loop);
}

function gameOver() {
  running = false;
  gameState.playing = false;
  saveHigh();
  statePanel.style.display = 'block';
  statePanel.textContent = `GAME OVER — Score: ${gameState.score} — Press SPACE or Restart`;
  updateUI();
}

function updateUI() {
  scorePanel.textContent = `Score: ${gameState.score}`;
  highPanel.textContent = `High: ${gameState.high}`;
}

/* =========================
   タイムバーと赤点滅アニメーション描画
   ========================= */
let flashTimer = 0;
function drawTimerOverlay(dt) {
  const remaining = Math.max(0, CONFIG.timerDuration - gameTimer);
  const barWidth = (remaining / CONFIG.timerDuration) * CONFIG.canvasWidth;

  // タイムバー
  ctx.save();
  ctx.fillStyle = CONFIG.timerBarColor;
  ctx.fillRect(0, CONFIG.canvasHeight - CONFIG.timerBarHeight - CONFIG.timerBarMargin, barWidth, CONFIG.timerBarHeight);
  ctx.restore();

  // 5秒前から警告演出
  if (remaining <= CONFIG.timerWarningTime) {
    flashTimer += dt;
    const flashPhase = Math.sin((flashTimer / CONFIG.timerFlashDuration) * Math.PI);

    // 画面赤点滅
    ctx.save();
    ctx.globalAlpha = flashPhase * 0.6;
    ctx.fillStyle = CONFIG.timerFlashColor;
    ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
    ctx.restore();

    // 残り秒数表示（フェードイン/アウト）
    ctx.save();
    ctx.globalAlpha = 0.5 + 0.5 * flashPhase;
    ctx.font = CONFIG.timerTextFont;
    ctx.fillStyle = CONFIG.timerTextColor;
    ctx.textAlign = "center";
    ctx.fillText(Math.ceil(remaining), CONFIG.canvasWidth / 2, CONFIG.canvasHeight - 50);
    ctx.restore();
  }
}

/* =========================
   入力処理
   ========================= */
window.addEventListener('keydown', (e) => { gameState.keys[e.code] = true; if (e.code === 'Space') e.preventDefault(); });
window.addEventListener('keyup',   (e) => { gameState.keys[e.code] = false; });
btnRestart.addEventListener('click', startGame);
btnMute.addEventListener('click', () => { muted = !muted; btnMute.textContent = muted ? 'Unmute' : 'Mute'; });

/* =========================
   入力（マウス / タッチ / コントローラ）と放物線弾設定
   ========================= */
let mouse = { x: CONFIG.canvasWidth/2, y: CONFIG.canvasHeight/2, down: false };
let gamepadAim = { x: 0, y: 0, fired: false }; // 簡易ゲームパッド入力

// マウス位置を取る（キャンバス座標系）
canvas.addEventListener('mousemove', (e) => {
  const r = canvas.getBoundingClientRect();
  const sx = canvas.width / r.width;
  mouse.x = (e.clientX - r.left) * sx;
  mouse.y = (e.clientY - r.top) * sx;
});
canvas.addEventListener('mousedown', (e) => { mouse.down = true; });
window.addEventListener('mouseup', (e) => { mouse.down = false; });

// タッチ（タップで撃つ・ドラッグで照準）
canvas.addEventListener('touchstart', (e) => {
  const t = e.changedTouches[0];
  const r = canvas.getBoundingClientRect();
  const sx = canvas.width / r.width;
  mouse.x = (t.clientX - r.left) * sx;
  mouse.y = (t.clientY - r.top) * sx;
  mouse.down = true;
  e.preventDefault();
}, { passive:false });
canvas.addEventListener('touchmove', (e) => {
  const t = e.changedTouches[0];
  const r = canvas.getBoundingClientRect();
  const sx = canvas.width / r.width;
  mouse.x = (t.clientX - r.left) * sx;
  mouse.y = (t.clientY - r.top) * sx;
  e.preventDefault();
}, { passive:false });
canvas.addEventListener('touchend', (e) => { mouse.down = false; }, { passive:false });

// 弾：放物線のための重力（px/s^2相当の概念）
CONFIG.bulletGravity = CONFIG.bulletGravity ?? 2200; // 調整可能（上部CONFIGに移動可）

// 発射位置（プレイヤー）を決める関数（スクリーン→仮想座標を使う）
function getPlayerFirePos(){
  return { x: gameState.playerX, y: CONFIG.canvasHeight - CONFIG.fireOffsetFromBottom };
}

// 新しい shoot(): 目標（mouse or gamepad）に向けて放物線を描けるように初速を計算して発射
function shoot() {
  if (!gameState.playing) return;
  if (gameState.cooldown > 0) return;
  // 発射元
  const p = getPlayerFirePos();
  // 目標座標（優先：ゲームパッドの照準がある場合、それを使う）
  let targetX = mouse.x, targetY = mouse.y;
  // 簡易ゲームパッド入力（左スティックでaim）--- 更新はループで行う
  if (Math.abs(gamepadAim.x) > 0.2 || Math.abs(gamepadAim.y) > 0.2) {
    // スクリーン中央からの相対方向を使って遠めのターゲットを作る
    targetX = CONFIG.canvasWidth/2 + gamepadAim.x * 600;
    targetY = CONFIG.canvasHeight/2 + gamepadAim.y * 600;
  }

  // 目標までの水平距離と高さ差
  const dx = targetX - p.x;
  const dy = targetY - p.y; // canvas座標系（下が増える）
  // y(t) = py + vy*t + 0.5 * g * t^2
  const horizDist = Math.hypot(dx, 0);
  const baseSpeed = CONFIG.bulletSpeed;
  const t = clamp(horizDist / (baseSpeed*0.6), 0.25, 1.2);
  const vx = dx / t;
  const g = CONFIG.bulletGravity;
  const vy = (dy - 0.5 * g * t * t) / t;

  const b = {
    x: p.x,
    y: p.y,
    w: 8, h: 10,
    vx, vy,
    gravity: g,
    alive: true,
    age: 0
  };
  gameState.bullets.push(b);
  gameState.cooldown = CONFIG.bulletCooldown;
}

/* =========================
   敵（射的）生成：横並びに配置して左右移動する
   - 敵は固定スロットに配置され、消滅後は1秒でフェードインして復活
   - 敵が撃たれたらパーティクル（文字）がはじける
   ========================= */
// 文字パーティクルの候補
const COMMIE_CHARS = ['□','☆','♡'];

function spawnGalleryIfEmpty() {
  if (gameState.enemyRows && gameState.enemyRows.length > 0) return;

  gameState.enemyRows = [];
  const cols = CONFIG.enemyPerRow;
  const rows = CONFIG.enemyRowsCount ?? CONFIG.enemyRows;
  const gapX = Math.min(120, (CONFIG.canvasWidth - 200) / cols);
  const startX = (CONFIG.canvasWidth - (gapX * (cols - 1))) / 2;

  for (let row = 0; row < rows; row++) {
    const enemies = [];
    const y = CONFIG.enemyTopOffset + row * CONFIG.enemyRowGap;
    for (let col = 0; col < cols; col++) {
      const ex = startX + col * gapX;
      const dir = ((row + col) % 2 === 0) ? 1 : -1;
      const speed = dir * rand(10, 160);
      const sizeScale = rand(1/3, 1);
      const isPenalty = Math.random() < CONFIG.penaltyEnemyChance;
      enemies.push({
        id: cryptoRandomId(),
        x: ex, y,
        baseX: ex, baseY: y,
        w: CONFIG.enemySizeBase * 0.7 * sizeScale,
        h: CONFIG.enemySizeBase * 0.6 * sizeScale,
        vx: speed,
        alive: true,
        dead: false,
        deadTime: 0,
        alpha: 1,
        particles: [],
        score: Math.floor(CONFIG.scorePerEnemy * (Math.abs(speed)/80) / sizeScale),
        penalty: isPenalty
      });
    }
    gameState.enemyRows.push(enemies);
  }

  // 旧互換のため、flatな配列も用意
  gameState.enemies = gameState.enemyRows.flat();
}

function cryptoRandomId(){ return Math.random().toString(36).slice(2,10); }

/* 衝突判定（AABB）*/
function hitTest(a, b) {
  const aw = a.w || 0, ah = a.h || 0;
  const bw = b.w || b.size || 0, bh = b.h || b.size || 0;
  return !(a.x + aw/2 < b.x - bw/2 ||
           a.x - aw/2 > b.x + bw/2 ||
           a.y + ah/2 < b.y - bh/2 ||
           a.y - ah/2 > b.y + bh/2);
}

/* 敵被弾時の処理：はじける文字パーティクルを作る */
function explodeEnemy(e) {
  e.dead = true;
  e.deadTime = 0;
  e.alpha = 1;
  e.alive = false;
  e.particles = [];
  const num = 10 + Math.floor(Math.random() * 6);

  if (e.penalty) {
    // ペナルティ敵の爆発（赤とオレンジの■が飛び散る）
    for (let i = 0; i < num; i++) {
      const color = CONFIG.penaltyExplosionColors[Math.floor(Math.random() * CONFIG.penaltyExplosionColors.length)];
      const angle = rand(0, Math.PI * 2);
      const speed = rand(150, 480);
      e.particles.push({
        char: "■",
        color,
        x: e.x,
        y: e.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.6 - 100,
        life: 0,
        ttl: 0.9 + Math.random() * 0.6,
        alpha: 1,
        scale: 1 + Math.random() * 0.8
      });
    }
    // スコアを減点
    gameState.score -= CONFIG.penaltyScoreLoss;
    if (gameState.score < 0) gameState.score = 0;

    // 「-1000」フェードアウト表示を追加
    e.penaltyText = {
      text: `-${CONFIG.penaltyScoreLoss}`,
      x: e.x,
      y: e.y,
      alpha: 0,
      time: 0
    };
  } else {
    // 通常敵の爆発（従来の文字パーティクル）
    for (let i = 0; i < num; i++) {
      const ch = COMMIE_CHARS[Math.floor(Math.random() * COMMIE_CHARS.length)];
      const angle = rand(0, Math.PI * 2);
      const speed = rand(120, 420);
      e.particles.push({
        char: ch,
        x: e.x,
        y: e.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.6 - 120,
        life: 0,
        ttl: 0.9 + Math.random() * 0.6,
        alpha: 1,
        scale: 1 + Math.random() * 0.8
      });
    }
    gameState.score += CONFIG.scorePerEnemy;
    checkMilestone();
  }
}

/* 敵を復活させる（フェードイン） */
function reviveEnemyAtIndex(idx) {
  const cols = CONFIG.enemyPerRow;
  const rows = CONFIG.enemyRows;
  const gapX = Math.min(120, (CONFIG.canvasWidth - 200) / cols);
  const startX = (CONFIG.canvasWidth - (gapX * (cols - 1))) / 2;

  // idx から行(row)と列(col)を逆算
  const row = Math.floor(idx / cols);
  const col = idx % cols;

  const x = startX + col * gapX;
  const y = CONFIG.enemyTopOffset + row * CONFIG.enemyRowGap;
  const dir = ((row + col) % 2 === 0) ? 1 : -1;

  const speed = dir * rand(10, 160);
  const sizeScale = rand(1/3, 1);
  const isPenalty = Math.random() < CONFIG.penaltyEnemyChance;

  const newEnemy = {
    id: cryptoRandomId(),
    x, y,
    baseX: x,
    baseY: y,
    w: CONFIG.enemySizeBase * 0.7 * sizeScale,
    h: CONFIG.enemySizeBase * 0.6 * sizeScale,
    vx: speed,
    alive: true,
    dead: false,
    deadTime: 0,
    alpha: 0,
    particles: [],
    score: Math.floor(CONFIG.scorePerEnemy * (Math.abs(speed)/80) / sizeScale),
    penalty: isPenalty
  };

  // 段ごとの構造を更新
  if (gameState.enemyRows?.[row]?.[col]) {
    gameState.enemyRows[row][col] = newEnemy;
  }

  // 描画用の flat 配列も再生成
  gameState.enemies = gameState.enemyRows.flat();
}

/* =========================
   メインループ
   ========================= */
function loop(ts) {
  if (!lastTime) lastTime = ts;
  const dt = Math.min(0.05, (ts - lastTime) / 1000);
  lastTime = ts;

  // ゲーム時間の進行
  if (gameState.playing && !gameEnded) {
    gameTimer += dt;
    if (gameTimer >= CONFIG.timerDuration) {
      endGameSequence();
      return;
    }
  }

  // 入力処理
  const left = gameState.keys['ArrowLeft'] || gameState.keys['KeyA'];
  const right = gameState.keys['ArrowRight'] || gameState.keys['KeyD'];
  if (left) gameState.playerX -= CONFIG.playerSpeed * dt;
  if (right) gameState.playerX += CONFIG.playerSpeed * dt;
  gameState.playerX = clamp(gameState.playerX, CONFIG.playerWidth / 2, CONFIG.canvasWidth - CONFIG.playerWidth / 2);

  // --- 入力による発射（マウス/タッチ/ゲームパッド） ---
  // ゲームパッド読み取り（簡易）：左スティックで照準、ボタン0で発射
  const gps = navigator.getGamepads ? navigator.getGamepads() : [];
  if (gps && gps[0]) {
    const gp = gps[0];
    // 左スティック： axes[0], axes[1]
    if (gp.axes && gp.axes.length >= 2) {
      gamepadAim.x = gp.axes[0];
      gamepadAim.y = gp.axes[1];
    }
    // ボタン0（A）などで発射
    if (gp.buttons && gp.buttons[0] && gp.buttons[0].pressed) {
      if (!gamepadAim.fired) { shoot(); gamepadAim.fired = true; }
    } else {
      gamepadAim.fired = false;
    }
  }
  // マウス/タッチの発射
  if (mouse.down) shoot();
  if (gameState.cooldown > 0) gameState.cooldown -= dt;

  // ギャラリーが未作成なら作る
  spawnGalleryIfEmpty();

  // --- 弾更新（放物線） ---
  for (const b of gameState.bullets) {
    if (!b.alive) continue;
    b.age += dt;
    // Euler integration
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    // gravity is positive downward
    b.vy += b.gravity * dt;
    // remove if out of screen bounds
    if (b.x < -100 || b.x > CONFIG.canvasWidth + 100 || b.y < -200 || b.y > CONFIG.canvasHeight + 200) {
      b.alive = false;
    }
  }
  gameState.bullets = gameState.bullets.filter(b => b.alive);

  // --- 敵更新（左右往復、復活処理、パーティクル更新） ---
  for (let idx=0; idx<gameState.enemies.length; idx++){
    const e = gameState.enemies[idx];
    if (!e) continue;
    if (e.dead) {
      e.deadTime += dt;
      // update particles
      for (const p of e.particles) {
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // apply simple gravity
        p.vy += 800 * dt;
        p.alpha = Math.max(0, 1 - (p.life / p.ttl));
      }

      // 「-1000」表示の更新
      if (e.penaltyText) {
        e.penaltyText.time += dt;
        const t = e.penaltyText.time / CONFIG.penaltyTextDuration;
        if (t < 1) {
          e.penaltyText.alpha = Math.min(1, t < 0.2 ? t * 5 : 1 - (t - 0.2));
          e.penaltyText.y = e.y - t * CONFIG.penaltyTextRise;
        } else {
          e.penaltyText = null;
        }
      }
      // after 1 second, revive with fade-in
      if (e.deadTime >= 1.0) {
        // revive at same index (fade in)
        reviveEnemyAtIndex(idx);
      }
      continue;
    }
    // 復活したばかりの敵（alpha < 1）をフェードインさせる
    if (e.alpha < 1) {
      e.alpha = Math.min(1, e.alpha + dt * 2.0); // 約0.5秒で完全表示
    }
    // 敵は左右にのみ動く（上下固定）
    e.x += e.vx * dt;
    const leftBound = e.baseX - 120;
    const rightBound = e.baseX + 120;
    if (e.x < leftBound) { e.x = leftBound; e.vx *= -1; }
    if (e.x > rightBound) { e.x = rightBound; e.vx *= -1; }
    e.y = e.baseY; // 固定（上下には動かない）
  }

  // --- 段別当たり判定（カーソル段のみ有効） ---
  const rowHeight = CONFIG.enemyRowGap;
  const topRowY = CONFIG.enemyTopOffset;
  const midRowY = topRowY + rowHeight;
  const bottomRowY = midRowY + rowHeight;

  // マウス位置から有効な段を判定（上・中・下いずれか1段のみ）
  let activeRow = 0;
  if (mouse.y < midRowY - rowHeight / 2) {
    activeRow = 0; // 上段
  } else if (mouse.y < bottomRowY - rowHeight / 2) {
    activeRow = 1; // 中段
  } else {
    activeRow = 2; // 下段
  }

  // --- 段構造対応版：マウスがある段（enemyRows[activeRow]）のみ判定 ---
  for (const b of gameState.bullets) {
    if (!b.alive) continue;
    const rowEnemies = gameState.enemyRows?.[activeRow];
    if (!rowEnemies) continue;

    for (const e of rowEnemies) {
      if (!e || e.dead || !e.alive) continue;

      if (hitTest(b, e)) {
        b.alive = false;
        explodeEnemy(e);
        if (!e.penalty) {
          gameState.score += e.score ?? CONFIG.scorePerEnemy;
          checkMilestone();
        }
        break;
      }
    }
  }

  // 描画
  draw();

  // タイムバーと残り時間の表示
  drawTimerOverlay(dt);

  // 次フレーム
  if (running) requestAnimationFrame(loop);
}


/* =========================
   ゲーム終了フェード処理
   ========================= */
function endGameSequence() {
  gameEnded = true;
  running = false;
  gameState.playing = false;

  // フェードイン開始
  overlay.classList.add('show');
  gameOverTextEl.classList.add('visible');

  // 2秒後に「ゲーム終了」フェードアウト → スコア表示
  setTimeout(() => {
    gameOverTextEl.classList.remove('visible');
    setTimeout(() => {
      finalScoreTextEl.textContent = `合計スコア：${gameState.score}`;
      finalScoreTextEl.classList.add('visible');
      btnMainMenu.classList.add('visible');
      // 最新スコアを保存 → 再読み込み → 表示
      saveHigh();
      setTimeout(() => {
        loadHigh();
        showRanking();
      }, 500);
    }, 1500);
  }, 2500);
}

/* =========================
   ランキング表示（overlay内にHTMLで）
   ========================= */
function showRanking() {
  // 最新ランキングをロード
  loadHigh();
  const rankings = Array.isArray(gameState.rankings) ? gameState.rankings : [];

  // 既存ランキング要素を削除
  const old = document.getElementById("rankingDisplay");
  if (old) old.remove();

  // ランキング用のdivを作成
  const div = document.createElement("div");
  div.id = "rankingDisplay";
  div.style.textAlign = "center";
  div.style.marginTop = "30px";
  div.style.color = "#fff";

  // タイトル
  let html = `<h2 style="color:white;margin-bottom:10px;">🏆 RANKING 🏆</h2>`;

  if (rankings.length === 0) {
    html += `<p style="font-size:18px;opacity:0.7;">まだスコアが記録されていません</p>`;
  } else {
    html += `<ol style="list-style:none;padding:0;margin:0;">`;
    rankings.forEach((r, i) => {
      const color = (r.score === gameState.score) ? CONFIG.newRecordColor : CONFIG.rankColor;
      html += `<li style="font-size:20px;margin:6px 0;color:${color};">${i + 1}. ${r.name} — ${r.score}</li>`;
    });
    html += `</ol>`;
  }

  div.innerHTML = html;

  // overlayの一番下（main menuボタンの下）に追加
  overlay.appendChild(div);
}

// メインメニューに戻る
btnMainMenu.addEventListener('click', () => {
  overlay.classList.remove('show');
  gameOverTextEl.classList.remove('visible');
  finalScoreTextEl.classList.remove('visible');
  btnMainMenu.classList.remove('visible');

  // ==== ゲームデータを完全リセットして真っさらな状態に戻す ====
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  gameState.score = 0;
  gameState.lives = CONFIG.maxLives;
  gameState.bullets = [];
  gameState.enemies = [];
  gameState.playerX = CONFIG.canvasWidth / 2;
  gameState.playing = false;
  running = false;
  gameEnded = false;
  gameTimer = 0;

  // UIリセット
  statePanel.style.display = 'block';
  statePanel.textContent = 'Press SPACE to start';
  scorePanel.textContent = 'Score: 0';
  highPanel.textContent = `High: ${gameState.high}`;

  // 背景も再描画して真っさらに見せる
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#001a33");  // 紺色の上部
  grad.addColorStop(1, "#003366");  // 紺色の下部
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

/* =========================
   描画
   ========================= */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 背景（遠近の線）
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#001a33");  // 紺色の上部
  grad.addColorStop(1, "#003366");  // 紺色の下部
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- 弾（放物線） ---
  ctx.fillStyle = "#ffd87f";
  for (const b of gameState.bullets) {
    ctx.save();
    ctx.translate(b.x, b.y);
    // 弾の後ろに短い尾
    ctx.globalAlpha = 0.95;
    ctx.fillRect(-b.w/2 - 3, -b.h/2 + 2, b.w+6, 4);
    ctx.fillStyle = "#ffd87f";
    ctx.fillRect(-b.w/2, -b.h/2, b.w, b.h);
    ctx.restore();
  }

  // --- 敵（射的）: alive / dead に応じて描画 ---
  for (let idx=0; idx<gameState.enemies.length; idx++){
    const e = gameState.enemies[idx];
    if (!e) continue;
    if (e.dead) {
      // パーティクル（文字）を描く
      for (const p of e.particles) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.font = `${18 * p.scale}px sans-serif`;
        ctx.fillStyle = p.color ?? `rgba(255,255,255,${p.alpha})`;
        ctx.fillText(p.char, p.x - 8, p.y + 8);
        ctx.restore();
      }

      // 「-1000」フェードテキストを描画
      if (e.penaltyText) {
        ctx.save();
        ctx.globalAlpha = e.penaltyText.alpha;
        ctx.font = "bold 32px sans-serif";
        ctx.fillStyle = CONFIG.penaltyTextColor;
        ctx.textAlign = "center";
        ctx.fillText(e.penaltyText.text, e.penaltyText.x, e.penaltyText.y);
        ctx.restore();
      }
      continue;
    }
    // alive: 画像で描画
    ctx.save();
    ctx.globalAlpha = e.alpha ?? 1;
    const img = e.penalty ? penaltyImage : enemyImage;
    ctx.drawImage(img, e.x - e.w/2, e.y - e.h/2, e.w, e.h);
    ctx.restore();

    // スコア表示（敵の上部に）
    ctx.save();
    ctx.globalAlpha = e.alpha ?? 1;
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(`+${e.score}`, e.x, e.y - e.h/2 - 8);
    ctx.restore();
  }

  // --- 照準マーカー（マウス or gamepad） ---
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  // prefer mouse position
  const aimX = (Math.abs(gamepadAim.x)>0.2 || Math.abs(gamepadAim.y)>0.2) ? (CONFIG.canvasWidth/2 + gamepadAim.x*600) : mouse.x;
  const aimY = (Math.abs(gamepadAim.x)>0.2 || Math.abs(gamepadAim.y)>0.2) ? (CONFIG.canvasHeight/2 + gamepadAim.y*600) : mouse.y;
  ctx.beginPath();
  ctx.arc(aimX, aimY, 14, 0, Math.PI*2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(aimX-20, aimY);
  ctx.lineTo(aimX+20, aimY);
  ctx.moveTo(aimX, aimY-20);
  ctx.lineTo(aimX, aimY+20);
  ctx.stroke();
  ctx.restore();

  updateUI();
}

/* =========================
   開始処理
   ========================= */
fitCanvas();
loadHigh();
statePanel.textContent = "Press SPACE to start";
updateUI();

window.addEventListener('keydown', e => {
  if (e.code === 'Space' && !running) startGame();
});