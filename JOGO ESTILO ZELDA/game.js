const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const LARGURA = canvas.width;
const ALTURA = canvas.height;
const CHAO_Y = 540;
const GRAVIDADE = 0.8;

let estadoJogo = "menu";
let faseAtual = 0;
let pontuacao = 0;
let cristaisColetados = 0;
let mensagens = [];
let frameJogo = 0;
let audioInicializado = false;

const teclas = {};

document.addEventListener("keydown", (e) => {
  const tecla = e.key.toLowerCase();
  teclas[tecla] = true;

  if (e.key === "Shift") {
    teclas["shift"] = true;
  }

  if (!audioInicializado) {
    inicializarAudio();
  }

  if (estadoJogo === "menu" && e.key === "Enter") {
    iniciarJogo();
  }

  if ((estadoJogo === "vitoria" || estadoJogo === "gameover") && e.key === "Enter") {
    voltarMenu();
  }

  if (e.code === "Space") {
    e.preventDefault();
  }
});

document.addEventListener("keyup", (e) => {
  const tecla = e.key.toLowerCase();
  teclas[tecla] = false;

  if (e.key === "Shift") {
    teclas["shift"] = false;
  }
});

function normalizarCaminho(src) {
  return src
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
}

function criarImagem(src) {
  const img = new Image();
  img.onload = () => console.debug("[IMG] loaded", src);
  img.onerror = (e) => console.warn("[IMG] failed to load", src, e);
  img.src = normalizarCaminho(src);
  return img;
}

function criarSom(src, loop = false, volume = 1) {
  const audio = new Audio(normalizarCaminho(src));
  audio.loop = loop;
  audio.volume = volume;
  audio.preload = "auto";
  audio.oncanplaythrough = () => console.debug("[AUDIO] loaded", src);
  audio.onerror = (e) => console.warn("[AUDIO] failed to load", src, e);
  return audio;
}

const assets = {
  jogador: {
    idle: criarImagem("Assets/jogador 1/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets/_Idle.png"),
    run: criarImagem("Assets/jogador 1/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets/_Run.png"),
    jump: criarImagem("Assets/jogador 1/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets/_Jump.png"),
    fall: criarImagem("Assets/jogador 1/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets/_Fall.png"),
    attack: [
      criarImagem("Assets/jogador 1/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets/_Attack.png"),
      criarImagem("Assets/jogador 1/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets/_Attack2.png"),
      criarImagem("Assets/jogador 1/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets/_AttackCombo.png")
    ],
    hurt: criarImagem("Assets/jogador 1/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets/_Hit.png"),
    dash: criarImagem("Assets/jogador 1/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets/_Dash.png"),
    death: criarImagem("Assets/jogador 1/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets/_Death.png")
  },

  inimigo: {
    comum: criarImagem("Assets/jogador 1/FreeKnight_v1/Colour2/NoOutline/120x80_PNGSheets/_Idle.png"),
    rapido: criarImagem("Assets/jogador 1/FreeKnight_v1/Colour2/NoOutline/120x80_PNGSheets/_Run.png"),
    pesado: criarImagem("Assets/jogador 1/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets/_Run.png"),
    elite: criarImagem("Assets/jogador 1/FreeKnight_v1/Colour2/NoOutline/120x80_PNGSheets/_Attack.png"),
    bossIdle: criarImagem("Assets/jogador 1/FreeKnight_v1/Colour2/NoOutline/120x80_PNGSheets/_Idle.png"),
    bossRun: criarImagem("Assets/jogador 1/FreeKnight_v1/Colour2/NoOutline/120x80_PNGSheets/_Run.png"),
    bossAttack: [
      criarImagem("Assets/jogador 1/FreeKnight_v1/Colour2/NoOutline/120x80_PNGSheets/_Attack.png"),
      criarImagem("Assets/jogador 1/FreeKnight_v1/Colour2/NoOutline/120x80_PNGSheets/_Attack2.png"),
      criarImagem("Assets/jogador 1/FreeKnight_v1/Colour2/NoOutline/120x80_PNGSheets/_AttackCombo.png")
    ],
    bossHurt: criarImagem("Assets/jogador 1/FreeKnight_v1/Colour2/NoOutline/120x80_PNGSheets/_Hit.png"),
    bossDeath: criarImagem("Assets/jogador 1/FreeKnight_v1/Colour2/NoOutline/120x80_PNGSheets/_Death.png")
  },

  armas: {
    espadaBase: criarImagem("Assets/armas/Sword.png"),
    espadaPesada: criarImagem("Assets/armas/SWORD2big22.png"),
    espadaAlt: criarImagem("Assets/armas/sword4.png")
  },

  cenario: {
    bg1: criarImagem("Assets/cenario/forest-2/Free_BG_1_320x180px.png"),
    bg2: criarImagem("Assets/cenario/forest-2/Free_BG_2_320x180px.png"),
    bg3: criarImagem("Assets/cenario/forest-2/Free_BG_3_320x180px.png"),
    bg4: criarImagem("Assets/cenario/forest-2/Free_BG_4_320x180px.png"),
    bg5: criarImagem("Assets/cenario/forest-2/Free_BG_5_320x180px.png"),
    bgFull: criarImagem("Assets/cenario/forest-2/Free_BG_Full_1280x720px.png"),
    forest1: criarImagem("Assets/cenario/forest-theme/forest-theme/forest-1.png"),
    forest2: criarImagem("Assets/cenario/forest-theme/forest-theme/forest-2.png"),
    forest3: criarImagem("Assets/cenario/forest-theme/forest-theme/forest-3.png"),
    forest4: criarImagem("Assets/cenario/forest-theme/forest-theme/forest-4.png"),
    ground: criarImagem("Assets/cenario/forest-theme/forest-theme/ground/ground-1.png"),
    desertBg: criarImagem("Assets/cenario 2/DesertTileset/png/BG.png"),
    caveTiles: criarImagem("Assets/cenario 2/Cave Platformer Tileset [16x16][FREE] - RottingPixels/Cave Platformer Tileset [16x16][FREE] - RottingPixels/cave-platformer-tileset-16x16.png")
  },

  hud: {
    panel: criarImagem("Assets/hud/Default/panel_brown.png"),
    panelBorder: criarImagem("Assets/hud/Default/panel_border_brown.png"),
    button: criarImagem("Assets/hud/Default/button_brown.png"),
    lifeFill: criarImagem("Assets/hud/Default/progress_red.png"),
    lifeBorder: criarImagem("Assets/hud/Default/progress_red_border.png"),
    energyFill: criarImagem("Assets/hud/Default/progress_green.png"),
    energyBorder: criarImagem("Assets/hud/Default/progress_green_border.png")
  },

  audio: {
    ataque: criarSom("Assets/audio/attack/340354__smullen93__kick_02_body.wav", false, 0.45),
    dano: criarSom("Assets/audio/damage/458867__raclure__damage-sound-effect.mp3", false, 0.45),
    ambiente: criarSom("Assets/audio/som_floresta/614675__xkeril__drum-in-the-forest.wav", true, 0.18)
  }
};

const armaInfo = {
  espadaBase: "Espada Comum",
  espadaPesada: "Espada Pesada",
  espadaAlt: "Lâmina Ágil"
};

function tocarSom(audio) {
  if (!audio || audio.error) return;
  try {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (_) {}
}

function inicializarAudio() {
  audioInicializado = true;
  try {
    assets.audio.ambiente.play().catch(() => {});
  } catch (_) {}
}

const jogador = {
  x: 80,
  y: 300,
  w: 38,
  h: 58,
  renderW: 64,
  renderH: 94,
  renderOffsetX: -13,
  renderOffsetY: -36,
  hitboxShrinkX: 6,
  vx: 0,
  vy: 0,
  velocidade: 4,
  vida: 5,
  vidaMax: 5,
  energia: 100,
  energiaMax: 100,
  dano: 1,
  olhando: "right",
  noChao: false,
  atacando: false,
  tempoAtaque: 0,
  tempoDano: 0,
  dashDesbloqueado: true,
  tempoDash: 0,
  ultimaAtaque: 0,
  pulosRestantes: 1,
  armaAtual: "espadaBase",
  morrendo: false,
  tempoMorte: 0
};

let plataformas = [];
let inimigos = [];
let cristais = [];

const fases = [
  {
    nome: "Clareira Inicial",
    corBase: "#355f2a",
    inicioJogador: { x: 90, y: 250 },
    plataformas: [
      { x: 0, y: 540, w: 1000, h: 60, tipo: "chao" },
      { x: 180, y: 450, w: 160, h: 22, tipo: "plataforma" },
      { x: 420, y: 380, w: 180, h: 22, tipo: "plataforma" },
      { x: 700, y: 300, w: 180, h: 22, tipo: "plataforma" }
    ],
    cristais: [
      { x: 770, y: 255, w: 26, h: 26, coletado: false }
    ],
    // --- CORREÇÃO 1: Ajuste de Y e Escala dos Inimigos (Fase 1) ---
    inimigos: [
      {
        x: 240,
        y: 450 - 64, // y da plataforma - altura do inimigo (h:64)
        w: 46,
        h: 64,
        renderW: 110,
        renderH: 140,
        renderOffsetX: -22,
        renderOffsetY: -53, // Alinhado para os pés tocarem o chão
        tipo: "samurai",
        dir: 1,
        vel: 1.3,
        min: 190,
        max: 300,
        vivo: true,
        ultimoAtaque: -1,
        hp: 2
      },
      {
        x: 470,
        y: 380 - 64, // Encostado na plataforma
        w: 46,
        h: 64,
        renderW: 110,
        renderH: 140,
        renderOffsetX: -22,
        renderOffsetY: -53,
        tipo: "samurai",
        dir: 1,
        vel: 1.4,
        min: 430,
        max: 550,
        vivo: true,
        ultimoAtaque: -1,
        hp: 2
      }
    ]
  },
  {
    nome: "Bosque Corrompido",
    corBase: "#3d2b22",
    inicioJogador: { x: 80, y: 300 },
    plataformas: [
      { x: 0, y: 540, w: 1000, h: 60, tipo: "chao" },
      { x: 110, y: 470, w: 170, h: 22, tipo: "plataforma" },
      { x: 330, y: 400, w: 150, h: 22, tipo: "plataforma" },
      { x: 560, y: 340, w: 160, h: 22, tipo: "plataforma" },
      { x: 800, y: 260, w: 120, h: 22, tipo: "plataforma" }
    ],
    cristais: [
      { x: 840, y: 215, w: 26, h: 26, coletado: false }
    ],
    // --- CORREÇÃO 1b: Ajuste de Y e Escala dos Inimigos (Fase 2) ---
    inimigos: [
      {
        x: 150,
        y: 470 - 64,
        w: 46,
        h: 64,
        renderW: 110,
        renderH: 140,
        renderOffsetX: -22,
        renderOffsetY: -53,
        tipo: "samurai",
        dir: 1,
        vel: 1.7,
        min: 120,
        max: 220,
        vivo: true,
        ultimoAtaque: -1,
        hp: 2
      },
      {
        x: 370,
        y: 400 - 64,
        w: 46,
        h: 64,
        renderW: 110,
        renderH: 140,
        renderOffsetX: -22,
        renderOffsetY: -53,
        tipo: "samurai",
        dir: 1,
        vel: 1.8,
        min: 340,
        max: 440,
        vivo: true,
        ultimoAtaque: -1,
        hp: 2
      },
      {
        x: 600,
        y: 340 - 64,
        w: 46,
        h: 64,
        renderW: 110,
        renderH: 140,
        renderOffsetX: -22,
        renderOffsetY: -53,
        tipo: "samurai",
        dir: 1,
        vel: 1.9,
        min: 570,
        max: 670,
        vivo: true,
        ultimoAtaque: -1,
        hp: 2
      }
    ]
  },
  {
    nome: "Núcleo da Sombra",
    corBase: "#251c35",
    inicioJogador: { x: 70, y: 300 },
    plataformas: [
      { x: 0, y: 540, w: 1000, h: 60, tipo: "chao" },
      { x: 110, y: 470, w: 170, h: 22, tipo: "plataforma" },
      { x: 350, y: 390, w: 170, h: 22, tipo: "plataforma" },
      { x: 590, y: 320, w: 180, h: 22, tipo: "plataforma" },
      { x: 800, y: 240, w: 140, h: 22, tipo: "plataforma" }
    ],
    cristais: [
      { x: 850, y: 195, w: 26, h: 26, coletado: false }
    ],
    // --- CORREÇÃO 1c: Ajuste de Y e Escala dos Inimigos (Fase 3) ---
    inimigos: [
      {
        x: 160,
        y: 470 - 64,
        w: 46,
        h: 64,
        renderW: 110,
        renderH: 140,
        renderOffsetX: -22,
        renderOffsetY: -53,
        tipo: "samurai",
        dir: 1,
        vel: 2,
        min: 130,
        max: 230,
        vivo: true,
        ultimoAtaque: -1,
        hp: 2
      },
      {
        x: 390,
        y: 390 - 64,
        w: 46,
        h: 64,
        renderW: 110,
        renderH: 140,
        renderOffsetX: -22,
        renderOffsetY: -53,
        tipo: "samurai",
        dir: 1,
        vel: 2,
        min: 360,
        max: 470,
        vivo: true,
        ultimoAtaque: -1,
        hp: 2
      },
      {
        x: 620,
        y: 320 - 64,
        w: 64,
        h: 70,
        renderW: 150,
        renderH: 180,
        renderOffsetX: -40,
        renderOffsetY: -80,
        tipo: "guerreiroPesado",
        dir: 1,
        vel: 1.4,
        min: 600,
        max: 706,
        vivo: true,
        ultimoAtaque: -1,
        hp: 4,
        dano: 2
      }
    ]
  },
  {
    nome: "Entrada da Caverna",
    corBase: "#1f1d28",
    bg: "caverna",
    inicioJogador: { x: 80, y: 300 },
    plataformas: [
      { x: 0, y: 540, w: 1000, h: 60, tipo: "chao" },
      { x: 150, y: 460, w: 150, h: 22, tipo: "plataforma" },
      { x: 390, y: 400, w: 150, h: 22, tipo: "plataforma" },
      { x: 660, y: 340, w: 160, h: 22, tipo: "plataforma" }
    ],
    cristais: [
      { x: 860, y: 300, w: 26, h: 26, coletado: false }
    ],
    inimigos: [
      {
        x: 200,
        y: 460 - 64,
        w: 46,
        h: 64,
        renderW: 110,
        renderH: 140,
        renderOffsetX: -22,
        renderOffsetY: -53,
        tipo: "elite",
        dir: 1,
        vel: 1.8,
        min: 170,
        max: 254,
        vivo: true,
        ultimoAtaque: -1,
        hp: 3,
        dano: 2
      },
      {
        x: 470,
        y: 400 - 64,
        w: 40,
        h: 60,
        renderW: 100,
        renderH: 130,
        renderOffsetX: -20,
        renderOffsetY: -48,
        tipo: "guerreiroRapido",
        dir: 1,
        vel: 2.6,
        min: 430,
        max: 500,
        vivo: true,
        ultimoAtaque: -1,
        hp: 1,
        dano: 1
      }
    ]
  },
  {
    nome: "Profundezas da Caverna",
    corBase: "#0f0f1a",
    bg: "caverna",
    inicioJogador: { x: 70, y: 300 },
    plataformas: [
      { x: 0, y: 540, w: 1000, h: 60, tipo: "chao" },
      { x: 110, y: 470, w: 170, h: 22, tipo: "plataforma" },
      { x: 340, y: 410, w: 160, h: 22, tipo: "plataforma" },
      { x: 600, y: 345, w: 170, h: 22, tipo: "plataforma" },
      { x: 820, y: 275, w: 150, h: 22, tipo: "plataforma" }
    ],
    cristais: [
      { x: 840, y: 230, w: 26, h: 26, coletado: false },
      { x: 260, y: 430, w: 26, h: 26, coletado: false }
    ],
    inimigos: [
      {
        x: 170,
        y: 470 - 64,
        w: 46,
        h: 64,
        renderW: 110,
        renderH: 140,
        renderOffsetX: -22,
        renderOffsetY: -53,
        tipo: "guerreiroPesado",
        dir: 1,
        vel: 1.2,
        min: 140,
        max: 270,
        vivo: true,
        ultimoAtaque: -1,
        hp: 4,
        dano: 2
      },
      {
        x: 430,
        y: 410 - 64,
        w: 48,
        h: 66,
        renderW: 115,
        renderH: 145,
        renderOffsetX: -24,
        renderOffsetY: -52,
        tipo: "elite",
        dir: 1,
        vel: 1.9,
        min: 400,
        max: 520,
        vivo: true,
        ultimoAtaque: -1,
        hp: 3,
        dano: 2
      },
      {
        x: 840,
        y: 275 - 64,
        w: 40,
        h: 60,
        renderW: 100,
        renderH: 130,
        renderOffsetX: -20,
        renderOffsetY: -48,
        tipo: "guerreiroRapido",
        dir: 1,
        vel: 2.5,
        min: 820,
        max: 930,
        vivo: true,
        ultimoAtaque: -1,
        hp: 1,
        dano: 1
      }
    ]
  },
  {
    nome: "Ruínas do Deserto",
    corBase: "#a06f44",
    bg: "deserto",
    inicioJogador: { x: 80, y: 300 },
    plataformas: [
      { x: 0, y: 540, w: 1000, h: 60, tipo: "chao" },
      { x: 120, y: 470, w: 160, h: 22, tipo: "plataforma" },
      { x: 360, y: 410, w: 140, h: 22, tipo: "plataforma" },
      { x: 570, y: 345, w: 180, h: 22, tipo: "plataforma" },
      { x: 760, y: 285, w: 160, h: 22, tipo: "plataforma" }
    ],
    cristais: [
      { x: 780, y: 245, w: 26, h: 26, coletado: false }
    ],
    inimigos: [
      {
        x: 800,
        y: 285 - 72,
        w: 52,
        h: 72,
        renderW: 120,
        renderH: 152,
        renderOffsetX: -24,
        renderOffsetY: -55,
        tipo: "boss",
        dir: 1,
        vel: 1.4,
        min: 760,
        max: 868,
        vivo: true,
        ultimoAtaque: -1,
        hp: 14,
        dano: 2,
        ataqueCooldown: 0
      }
    ]
  }
];

function copiarObjeto(obj) {
  return { ...obj };
}

function mostrarMensagem(texto, tempo = 120) {
  mensagens.push({ texto, tempo });
}

function iniciarJogo() {
  estadoJogo = "jogando";
  faseAtual = 0;
  pontuacao = 0;
  cristaisColetados = 0;
  mensagens = [];
  jogador.vidaMax = 5;
  jogador.energiaMax = 100;
  jogador.dano = 1;
  jogador.vida = jogador.vidaMax;
  jogador.energia = jogador.energiaMax;
  jogador.armaAtual = "espadaBase";
  jogador.morrendo = false;
  jogador.tempoMorte = 0;
  carregarFase(0);
}

function voltarMenu() {
  estadoJogo = "menu";
  mensagens = [];
  jogador.vida = jogador.vidaMax;
  jogador.energia = jogador.energiaMax;
  jogador.vx = 0;
  jogador.vy = 0;
}

function carregarFase(indice) {
  faseAtual = indice;
  const fase = fases[indice];

  plataformas = fase.plataformas.map(copiarObjeto);
  inimigos = fase.inimigos.map(copiarObjeto);
  inimigos.forEach((inimigo) => {
    inimigo.vy = 0;
    inimigo.noChao = false;
  });
  cristais = fase.cristais.map(copiarObjeto);

  jogador.x = fase.inicioJogador.x;
  jogador.y = fase.inicioJogador.y;
  jogador.vx = 0;
  jogador.vy = 0;
  jogador.noChao = false;
  jogador.atacando = false;
  jogador.tempoAtaque = 0;
  jogador.tempoDano = 0;
  jogador.tempoDash = 0;
  jogador.pulosRestantes = 1;
  jogador.morrendo = false;
  jogador.tempoMorte = 0;

  if (indice >= 1) {
    jogador.dashDesbloqueado = true;
    jogador.armaAtual = "espadaPesada";
    jogador.dano = 2;
    mostrarMensagem("Dash ativo! Use SHIFT", 170);
  }

  if (indice === 2) {
    jogador.armaAtual = "espadaAlt";
    jogador.dano = 2;
    mostrarMensagem("Espada alternativa equipada!", 170);
  }

  if (indice === 3) {
    jogador.vidaMax = Math.max(jogador.vidaMax, 6);
    jogador.energiaMax = Math.max(jogador.energiaMax, 110);
    mostrarMensagem("Resistência do explorador aumentada!", 170);
  }

  if (indice === 4) {
    jogador.dano = 3;
    mostrarMensagem("Força do guerreiro aumentada!", 170);
  }

  if (indice === 5) {
    jogador.dano = 4;
    jogador.energiaMax = Math.max(jogador.energiaMax, 120);
    jogador.vidaMax = Math.max(jogador.vidaMax, 8);
    mostrarMensagem("Preparado para o chefe final!", 170);
  }

  jogador.vida = Math.min(jogador.vida, jogador.vidaMax);
  jogador.energia = Math.min(jogador.energia, jogador.energiaMax);

  mostrarMensagem("Fase " + (indice + 1) + ": " + fase.nome, 180);
}

function areaColisao(entidade) {
  if (!entidade) return entidade;

  const isDynamicEnemy = entidade.tipo && entidade.tipo !== "chao" && entidade.tipo !== "plataforma";
  const shrinkX = entidade.hitboxShrinkX !== undefined ? entidade.hitboxShrinkX : (isDynamicEnemy ? 6 : 0);
  const shrinkY = entidade.hitboxShrinkY !== undefined ? entidade.hitboxShrinkY : (isDynamicEnemy ? 4 : 0);

  return {
    x: entidade.x + shrinkX / 2,
    y: entidade.y + shrinkY / 2,
    w: Math.max(8, entidade.w - shrinkX),
    h: Math.max(8, entidade.h - shrinkY)
  };
}

function colisao(a, b) {
  const aa = areaColisao(a);
  const bb = areaColisao(b);
  return (
    aa.x < bb.x + bb.w &&
    aa.x + aa.w > bb.x &&
    aa.y < bb.y + bb.h &&
    aa.y + aa.h > bb.y
  );
}

function limitar(valor, min, max) {
  return Math.max(min, Math.min(max, valor));
}

function caixaAtaque() {
  const larguraAtaque = 60;
  const alturaAtaque = 34;

  if (jogador.olhando === "right") {
    return { x: jogador.x + jogador.w - 2, y: jogador.y + 18, w: larguraAtaque, h: alturaAtaque };
  }

  return { x: jogador.x - larguraAtaque + 2, y: jogador.y + 18, w: larguraAtaque, h: alturaAtaque };
}

function aplicarFisicaJogador() {
  jogador.vy += GRAVIDADE;
  jogador.y += jogador.vy;
  jogador.noChao = false;

  for (const plataforma of plataformas) {
    if (colisao(jogador, plataforma)) {
      if (jogador.vy >= 0 && jogador.y + jogador.h - jogador.vy <= plataforma.y + 12) {
        jogador.y = plataforma.y - jogador.h;
        jogador.vy = 0;
        jogador.noChao = true;
        jogador.pulosRestantes = 1;
      } else if (jogador.vy < 0 && jogador.y >= plataforma.y + plataforma.h - 12) {
        jogador.y = plataforma.y + plataforma.h;
        jogador.vy = 0;
      }
    }
  }

  jogador.x = limitar(jogador.x, 0, LARGURA - jogador.w);

  if (jogador.y > ALTURA + 100) {
    jogador.vida = 0;
    estadoJogo = "gameover";
  }
}

function resolverColisaoHorizontal() {
  jogador.x += jogador.vx;

  for (const plataforma of plataformas) {
    if (colisao(jogador, plataforma)) {
      if (jogador.vx > 0) {
        jogador.x = plataforma.x - jogador.w;
      } else if (jogador.vx < 0) {
        jogador.x = plataforma.x + plataforma.w;
      }
    }
  }

  jogador.x = limitar(jogador.x, 0, LARGURA - jogador.w);
}

let puloTravado = false;
let ataqueTravado = false;
let dashTravado = false;

function atualizarJogador() {
  jogador.vx = 0;

  if (teclas["a"] || teclas["arrowleft"]) {
    jogador.vx = -jogador.velocidade;
    jogador.olhando = "left";
  }

  if (teclas["d"] || teclas["arrowright"]) {
    jogador.vx = jogador.velocidade;
    jogador.olhando = "right";
  }

  const teclaPulo = teclas["w"] || teclas["arrowup"] || teclas[" "];
  if (teclaPulo && !puloTravado && jogador.pulosRestantes > 0) {
    jogador.vy = -13;
    jogador.noChao = false;
    jogador.pulosRestantes--;
    puloTravado = true;
  }
  if (!teclaPulo) {
    puloTravado = false;
  }

  const teclaAtaque = teclas["j"];
  if (teclaAtaque && !ataqueTravado && jogador.tempoAtaque <= 0) {
    jogador.atacando = true;
    jogador.tempoAtaque = 16;
    jogador.ultimaAtaque++;
    ataqueTravado = true;
    tocarSom(assets.audio.ataque);
  }
  if (!teclaAtaque) {
    ataqueTravado = false;
  }

  const teclaDash = teclas["shift"];
  if (
    jogador.dashDesbloqueado &&
    teclaDash &&
    !dashTravado &&
    jogador.tempoDash <= 0 &&
    jogador.energia >= 25
  ) {
    const distanciaDash = 90;
    jogador.energia -= 25;

    if (jogador.olhando === "right") {
      jogador.x += distanciaDash;
    } else {
      jogador.x -= distanciaDash;
    }

    jogador.x = limitar(jogador.x, 0, LARGURA - jogador.w);
    jogador.tempoDash = 45;
    dashTravado = true;
  }
  if (!teclaDash) {
    dashTravado = false;
  }

  if (jogador.tempoAtaque > 0) {
    jogador.tempoAtaque--;
  } else {
    jogador.atacando = false;
  }

  if (jogador.tempoDano > 0) {
    jogador.tempoDano--;
  }

  if (jogador.tempoDash > 0) {
    jogador.tempoDash--;
  }

  jogador.energia = Math.min(jogador.energiaMax, jogador.energia + 0.15);

  resolverColisaoHorizontal();
  aplicarFisicaJogador();
}

function atualizarInimigos() {
  for (const inimigo of inimigos) {
    if (!inimigo.vivo) continue;

    inimigo.vy = inimigo.vy || 0;
    inimigo.noChao = false;

    inimigo.vy += GRAVIDADE;
    inimigo.y += inimigo.vy;

    for (const plataforma of plataformas) {
      if (colisao(inimigo, plataforma)) {
        if (inimigo.vy >= 0 && inimigo.y + inimigo.h - inimigo.vy <= plataforma.y + 8) {
          inimigo.y = plataforma.y - inimigo.h;
          inimigo.vy = 0;
          inimigo.noChao = true;
        } else if (inimigo.vy < 0 && inimigo.y >= plataforma.y + plataforma.h - 8) {
          inimigo.y = plataforma.y + plataforma.h;
          inimigo.vy = 0;
        }
      }
    }

    if (inimigo.tipo === "boss") {
      if (inimigo.ataqueCooldown <= 0 && Math.abs(jogador.x - inimigo.x) < 240) {
        inimigo.ataqueCooldown = 90;
        inimigo.dir = jogador.x < inimigo.x ? -1 : 1;
      }

      const velocidadeAtual = inimigo.ataqueCooldown > 70 ? inimigo.vel * 2.5 : inimigo.vel;
      inimigo.x += velocidadeAtual * inimigo.dir;
      inimigo.ataqueCooldown = Math.max(0, inimigo.ataqueCooldown - 1);
    } else {
      const deslocamento = inimigo.vel * inimigo.dir * (inimigo.noChao ? 1 : 0.5);
      inimigo.x += deslocamento;
    }

    if (inimigo.x <= inimigo.min) {
      inimigo.x = inimigo.min;
      inimigo.dir = 1;
    }

    if (inimigo.x + inimigo.w >= inimigo.max) {
      inimigo.x = inimigo.max - inimigo.w;
      inimigo.dir = -1;
    }

    inimigo.x = limitar(inimigo.x, 0, LARGURA - inimigo.w);

    if (colisao(jogador, inimigo) && jogador.tempoDano <= 0) {
      const danoInimigo = inimigo.dano || 1;
      jogador.vida -= danoInimigo;
      jogador.tempoDano = 90;

      if (jogador.x < inimigo.x) {
        jogador.x -= 50;
      } else {
        jogador.x += 50;
      }

      jogador.vy = -6;
      jogador.x = limitar(jogador.x, 0, LARGURA - jogador.w);

      tocarSom(assets.audio.dano);
      mostrarMensagem("Kael sofreu dano!", 60);

      if (jogador.vida <= 0) {
        jogador.vida = 0;
        jogador.morrendo = true;
        jogador.tempoMorte = 60;
        estadoJogo = "morrendo";
      }
    }
  }
}

function atualizarAtaque() {
  if (!jogador.atacando) return;

  const ataque = caixaAtaque();
  const danoPorAtaque = jogador.dano || 1;

  for (const inimigo of inimigos) {
    if (!inimigo.vivo) continue;

    if (colisao(ataque, inimigo) && inimigo.ultimoAtaque !== jogador.ultimaAtaque) {
      inimigo.hp -= danoPorAtaque;
      inimigo.ultimoAtaque = jogador.ultimaAtaque;

      if (inimigo.hp <= 0) {
        inimigo.vivo = false;
        pontuacao += inimigo.tipo === "boss" ? 300 : 80;

        if (inimigo.tipo === "boss") {
          mostrarMensagem("A Sombra foi derrotada!", 180);
        }
      }
    }
  }
}

function atualizarCristais() {
  for (const cristal of cristais) {
    if (!cristal.coletado && colisao(jogador, cristal)) {
      cristal.coletado = true;
      cristaisColetados++;
      pontuacao += 120;
      mostrarMensagem("Cristal restaurado!", 120);
    }
  }

  const todosCristais = cristais.every(c => c.coletado);
  const bossVivo = inimigos.some(i => i.tipo === "boss" && i.vivo);

  if (todosCristais) {
    if (faseAtual < fases.length - 1) {
      carregarFase(faseAtual + 1);
    } else if (!bossVivo) {
      estadoJogo = "vitoria";
    }
  }
}

function atualizarMensagens() {
  for (const msg of mensagens) {
    msg.tempo--;
  }
  mensagens = mensagens.filter(msg => msg.tempo > 0);
}

function atualizar() {
  frameJogo++;

  if (estadoJogo === "morrendo") {
    if (jogador.tempoMorte > 0) {
      jogador.tempoMorte--;
    } else {
      estadoJogo = "gameover";
    }

    atualizarMensagens();
    return;
  }

  if (estadoJogo !== "jogando") return;

  atualizarJogador();
  atualizarInimigos();
  atualizarAtaque();
  atualizarCristais();
  atualizarMensagens();
}

function desenharImagem(img, x, y, w, h) {
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x, y, w, h);
    return true;
  }
  return false;
}

function inferirFrames(img) {
  if (!(img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0)) {
    return 1;
  }

  const proporcao = img.naturalWidth / img.naturalHeight;

  if (proporcao < 1.35) {
    return 1;
  }

  const frames = Math.floor(proporcao);
  return Math.max(1, Math.min(frames, 12));
}

function desenharSpriteAuto(img, x, y, w, h, espelhar = false, velocidade = 8, forcarFrames = null) {
  if (!(img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0)) {
    return false;
  }

  const frames = forcarFrames || inferirFrames(img);
  const frameAtual = Math.floor(frameJogo / velocidade) % frames;
  const frameLargura = img.naturalWidth / frames;
  const frameAltura = img.naturalHeight;

  ctx.save();

  if (espelhar) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(
      img,
      frameAtual * frameLargura,
      0,
      frameLargura,
      frameAltura,
      0,
      0,
      w,
      h
    );
  } else {
    ctx.drawImage(
      img,
      frameAtual * frameLargura,
      0,
      frameLargura,
      frameAltura,
      x,
      y,
      w,
      h
    );
  }

  ctx.restore();
  return true;
}

function desenharFrameUnico(img, x, y, w, h, espelhar = false) {
  if (!(img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0)) {
    return false;
  }

  ctx.save();

  if (espelhar) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, w, h);
  } else {
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, x, y, w, h);
  }

  ctx.restore();
  return true;
}

function desenharSpriteFrame(img, x, y, w, h, espelhar = false, quadros = null, indice = 0) {
  if (!(img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0)) {
    return false;
  }

  const frames = quadros || inferirFrames(img);
  const frameLargura = img.naturalWidth / frames;
  const frameAltura = img.naturalHeight;

  ctx.save();

  if (espelhar) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(
      img,
      indice * frameLargura,
      0,
      frameLargura,
      frameAltura,
      0,
      0,
      w,
      h
    );
  } else {
    ctx.drawImage(
      img,
      indice * frameLargura,
      0,
      frameLargura,
      frameAltura,
      x,
      y,
      w,
      h
    );
  }

  ctx.restore();
  return true;
}

function escolherFrame(lista, velocidade = 12) {
  if (!lista || lista.length === 0) return null;
  const indice = Math.floor(frameJogo / velocidade) % lista.length;
  return lista[indice];
}

function spriteJogadorAtual() {
  if (jogador.morrendo) {
    return { tipo: "auto", img: assets.jogador.death, velocidade: 10, forcarFrames: 6 };
  }

  if (jogador.tempoDano > 0) {
    return { tipo: "auto", img: assets.jogador.hurt, velocidade: 8 };
  }

  if (jogador.tempoDash > 30) {
    return { tipo: "auto", img: assets.jogador.dash, velocidade: 6 };
  }

  if (jogador.atacando) {
    const attackFrames = assets.jogador.attack;
    const attackDuration = 16;
    const phase = Math.floor((attackDuration - jogador.tempoAtaque) / (attackDuration / attackFrames.length));
    const ataqueIndice = Math.min(attackFrames.length - 1, Math.max(0, phase));
    return {
      tipo: "auto",
      img: attackFrames[ataqueIndice],
      velocidade: 4,
      forcarFrames: 4
    };
  }

  if (!jogador.noChao) {
    if (jogador.vy < 0) {
      return { tipo: "auto", img: assets.jogador.jump, velocidade: 10 };
    }
    return { tipo: "auto", img: assets.jogador.fall, velocidade: 10 };
  }

  if (Math.abs(jogador.vx) > 0.2) {
    return { tipo: "auto", img: assets.jogador.run, velocidade: 4 };
  }

  return { tipo: "static", img: assets.jogador.idle };
}

function desenharCamadaParallax(img, fator, y = 0, altura = ALTURA) {
  if (!(img && img.complete && img.naturalWidth > 0)) return;

  const deslocamento = -(frameJogo * fator) % LARGURA;
  ctx.drawImage(img, deslocamento, y, LARGURA, altura);
  ctx.drawImage(img, deslocamento + LARGURA, y, LARGURA, altura);
}

function desenharCenario() {
  const fase = fases[faseAtual];

  ctx.fillStyle = fase.corBase;
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  if (fase.bg === "deserto") {
    if (!desenharImagem(assets.cenario.desertBg, 0, 0, LARGURA, ALTURA)) {
      ctx.fillStyle = "#c9a15d";
      ctx.fillRect(0, 0, LARGURA, ALTURA);
    }
    ctx.fillStyle = "rgba(255, 240, 180, 0.14)";
    ctx.fillRect(0, 0, LARGURA, ALTURA);
  } else if (fase.bg === "caverna") {
    ctx.fillStyle = "#11101d";
    ctx.fillRect(0, 0, LARGURA, ALTURA);

    if (assets.cenario.caveTiles && assets.cenario.caveTiles.complete) {
      const tileSize = 32;
      for (let y = 0; y < ALTURA; y += tileSize) {
        for (let x = 0; x < LARGURA; x += tileSize) {
          ctx.drawImage(assets.cenario.caveTiles, 0, 0, 16, 16, x, y, tileSize, tileSize);
        }
      }
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, 0, LARGURA, ALTURA);
  } else {
    if (!desenharImagem(assets.cenario.bgFull, 0, 0, LARGURA, ALTURA)) {
      desenharCamadaParallax(assets.cenario.bg5, 0.05);
      desenharCamadaParallax(assets.cenario.bg4, 0.09);
      desenharCamadaParallax(assets.cenario.bg3, 0.15);
      desenharCamadaParallax(assets.cenario.bg2, 0.25);
      desenharCamadaParallax(assets.cenario.bg1, 0.4);
    }
    ctx.fillStyle = "rgba(20, 50, 20, 0.18)";
    ctx.fillRect(0, 0, LARGURA, ALTURA);
  }

  for (const plataforma of plataformas) {
    if (plataforma.tipo === "chao") {
      if (fase.bg === "deserto") {
        ctx.fillStyle = "#8d6c39";
        ctx.fillRect(plataforma.x, plataforma.y, plataforma.w, plataforma.h);
        ctx.fillStyle = "#c6a25a";
        ctx.fillRect(plataforma.x, plataforma.y, plataforma.w, 4);
      } else if (fase.bg === "caverna") {
        ctx.fillStyle = "#2a2a3d";
        ctx.fillRect(plataforma.x, plataforma.y, plataforma.w, plataforma.h);
        ctx.fillStyle = "#55556f";
        ctx.fillRect(plataforma.x, plataforma.y, plataforma.w, 4);
      } else {
        if (!desenharImagem(assets.cenario.ground, plataforma.x, plataforma.y, plataforma.w, plataforma.h)) {
          ctx.fillStyle = "#4a6d2a";
          ctx.fillRect(plataforma.x, plataforma.y, plataforma.w, plataforma.h);
        }
      }
    } else {
      if (fase.bg === "deserto") {
        ctx.fillStyle = "#b68b4f";
      } else if (fase.bg === "caverna") {
        ctx.fillStyle = "#3b3c5a";
      } else {
        ctx.fillStyle = "#6b4f2a";
      }
      ctx.fillRect(plataforma.x, plataforma.y, plataforma.w, plataforma.h);
      ctx.fillStyle = fase.bg === "caverna" ? "#7477a0" : "#8a6a3a";
      ctx.fillRect(plataforma.x, plataforma.y, plataforma.w, 5);
    }
  }
}

function desenharJogador() {
  if (jogador.morrendo) {
    const deathSprite = spriteJogadorAtual();
    desenharSpriteAuto(
      deathSprite.img,
      jogador.x + jogador.renderOffsetX,
      jogador.y + jogador.renderOffsetY,
      jogador.renderW,
      jogador.renderH,
      jogador.olhando === "left",
      deathSprite.velocidade,
      deathSprite.forcarFrames
    );
    return;
  }

  const estaFerido = jogador.tempoDano > 0;
  if (estaFerido) {
    ctx.save();
    ctx.globalAlpha = 0.85;
  }

  const sprite = spriteJogadorAtual();
  const espelhar = jogador.olhando === "left";

  const drawX = jogador.x + jogador.renderOffsetX;
  const drawY = jogador.y + jogador.renderOffsetY;

  let desenhou = false;

  if (sprite.tipo === "auto") {
    desenhou = desenharSpriteAuto(
      sprite.img,
      drawX,
      drawY,
      jogador.renderW,
      jogador.renderH,
      espelhar,
      sprite.velocidade,
      sprite.forcarFrames
    );
  } else if (sprite.tipo === "static") {
    desenhou = desenharSpriteFrame(
      sprite.img,
      drawX,
      drawY,
      jogador.renderW,
      jogador.renderH,
      espelhar,
      null,
      0
    );
  } else if (sprite.quadros && sprite.quadros > 1) {
    desenhou = desenharSpriteFrame(
      sprite.img,
      drawX,
      drawY,
      jogador.renderW,
      jogador.renderH,
      espelhar,
      sprite.quadros,
      sprite.frame
    );
  } else {
    desenhou = desenharFrameUnico(
      sprite.img,
      drawX,
      drawY,
      jogador.renderW,
      jogador.renderH,
      espelhar
    );
  }

  if (!desenhou) {
    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(jogador.x, jogador.y, jogador.w, jogador.h);
  }

  if (jogador.atacando) {
    const ataque = caixaAtaque();
    const arma = assets.armas[jogador.armaAtual];

    if (!desenharFrameUnico(arma, ataque.x, ataque.y - 14, 64, 64, jogador.olhando === "left")) {
      ctx.fillStyle = "#f1c40f";
      ctx.fillRect(ataque.x, ataque.y, ataque.w, ataque.h);
    }
  }

  if (estaFerido) {
    ctx.restore();
  }
}

function spriteInimigoAtual(inimigo) {
  const tipo = inimigo.tipo;

  if (tipo === "boss") {
    if (inimigo.hp <= 1) {
      return {
        tipo: "static",
        img: assets.inimigo.bossHurt
      };
    }

    if (inimigo.ataqueCooldown > 70) {
      return {
        tipo: "static",
        img: assets.inimigo.bossAttack[0]
      };
    }

    if (inimigo.ataqueCooldown > 40) {
      return {
        tipo: "static",
        img: assets.inimigo.bossAttack[1]
      };
    }

    if (inimigo.ataqueCooldown > 0) {
      return {
        tipo: "static",
        img: assets.inimigo.bossAttack[2]
      };
    }

    if (Math.abs(jogador.x - inimigo.x) < 50) {
      return {
        tipo: "static",
        img: assets.inimigo.bossIdle
      };
    }

    return {
      tipo: "static",
      img: assets.inimigo.bossRun
    };
  }

  if (inimigo.hp <= 1) {
    return {
      img: assets.inimigo[tipo] || assets.inimigo.comum,
      velocidade: 8
    };
  }

  if (tipo === "guerreiroRapido") {
    return {
      tipo: "static",
      img: assets.inimigo.rapido
    };
  }

  if (tipo === "guerreiroPesado") {
    return {
      tipo: "static",
      img: assets.inimigo.pesado
    };
  }

  if (tipo === "elite") {
    return {
      tipo: "static",
      img: assets.inimigo.elite
    };
  }

  return {
    tipo: "static",
    img: assets.inimigo.comum
  };
}

function desenharInimigos() {
  for (const inimigo of inimigos) {
    if (!inimigo.vivo) continue;

    const sprite = spriteInimigoAtual(inimigo);

    const drawX = inimigo.x + inimigo.renderOffsetX;
    const drawY = inimigo.y + inimigo.renderOffsetY;

    let desenhou = false;

    if (sprite.tipo === "static") {
      desenhou = desenharSpriteFrame(
        sprite.img,
        drawX,
        drawY,
        inimigo.renderW,
        inimigo.renderH,
        inimigo.dir < 0,
        null,
        0
      );
    } else {
      desenhou = desenharSpriteAuto(
        sprite.img,
        drawX,
        drawY,
        inimigo.renderW,
        inimigo.renderH,
        inimigo.dir < 0,
        sprite.velocidade
      );
    }

    if (!desenhou) {
      ctx.fillStyle = inimigo.tipo === "boss" ? "#6c3483" : "#c0392b";
      ctx.fillRect(inimigo.x, inimigo.y, inimigo.w, inimigo.h);
    }

    if (inimigo.tipo === "boss") {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(inimigo.x - 4, inimigo.y - 18, 80, 10);

      ctx.fillStyle = "#922b21";
      ctx.fillRect(inimigo.x, inimigo.y - 16, 72, 6);

      ctx.fillStyle = "#2ecc71";
      ctx.fillRect(inimigo.x, inimigo.y - 16, Math.max(0, inimigo.hp * 12), 6);

      ctx.fillStyle = "white";
      ctx.font = "14px Arial";
      ctx.fillText("A Sombra", inimigo.x, inimigo.y - 22);
    }
  }
}

function desenharCristais() {
  for (const cristal of cristais) {
    if (cristal.coletado) continue;

    const pulso = Math.sin(frameJogo * 0.15) * 2;
    ctx.fillStyle = "#6be7ff";
    ctx.beginPath();
    ctx.moveTo(cristal.x + cristal.w / 2, cristal.y - pulso);
    ctx.lineTo(cristal.x + cristal.w, cristal.y + cristal.h / 2);
    ctx.lineTo(cristal.x + cristal.w / 2, cristal.y + cristal.h + pulso);
    ctx.lineTo(cristal.x, cristal.y + cristal.h / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(cristal.x + 8, cristal.y + 4, 5, 8);
  }
}

function desenharHUD() {
  const hudX = 12;
  const hudY = 12;
  const hudW = 280;
  const hudH = 118;
  const barraAltura = 18;
  const barraLargura = 118;
  const espacamento = 14;

  if (!desenharImagem(assets.hud.panel, hudX, hudY, hudW, hudH)) {
    ctx.fillStyle = "rgba(0,0,0,0.72)";
    ctx.fillRect(hudX, hudY, hudW, hudH);
  }

  const vidaPct = jogador.vida / jogador.vidaMax;
  const energiaPct = jogador.energia / jogador.energiaMax;

  const vidaX = hudX + 14;
  const energiaX = hudX + hudW - barraLargura - 14;
  const barraY = hudY + 18;

  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(vidaX, barraY, barraLargura, barraAltura);
  ctx.fillRect(energiaX, barraY, barraLargura, barraAltura);

  ctx.fillStyle = "#d63031";
  ctx.fillRect(vidaX, barraY, Math.max(8, barraLargura * vidaPct), barraAltura);

  ctx.fillStyle = "#2ecc71";
  ctx.fillRect(energiaX, barraY, Math.max(8, barraLargura * energiaPct), barraAltura);

  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 2;
  ctx.strokeRect(vidaX, barraY, barraLargura, barraAltura);
  ctx.strokeRect(energiaX, barraY, barraLargura, barraAltura);
  ctx.strokeRect(hudX + 10, hudY + 8, hudW - 20, hudH - 16);

  ctx.fillStyle = "#f8f8f0";
  ctx.font = "14px Arial";
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(0,0,0,0.75)";
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  ctx.fillText("Fase: " + (faseAtual + 1), hudX + 14, barraY + barraAltura + espacamento);
  ctx.fillText("Arma: " + (armaInfo[jogador.armaAtual] || "Desconhecida"), hudX + 14, barraY + barraAltura + espacamento + 20);
  ctx.fillText("Cristais: " + cristaisColetados, hudX + 14, barraY + barraAltura + espacamento + 40);

  ctx.shadowColor = "transparent";
  ctx.textBaseline = "alphabetic";
}

function desenharMensagem() {
  if (mensagens.length === 0) return;

  const msg = mensagens[0];
  const w = 460;
  const h = 36;
  const x = (LARGURA - w) / 2;
  const y = ALTURA - h - 18;

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = "#ffffff";
  ctx.font = "18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(msg.texto, LARGURA / 2, y + 8);
  ctx.textAlign = "start";
}

function desenharMenu() {
  ctx.fillStyle = "#0c1420";
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  desenharCamadaParallax(assets.cenario.bg5, 0.05);
  desenharCamadaParallax(assets.cenario.bg4, 0.08);
  desenharCamadaParallax(assets.cenario.bg3, 0.12);
  desenharCamadaParallax(assets.cenario.bg2, 0.16);
  desenharCamadaParallax(assets.cenario.bg1, 0.22);

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  ctx.textAlign = "center";

  ctx.fillStyle = "#173d52";
  ctx.font = "bold 74px Arial Black";
  ctx.fillText("ECOS DA FLORESTA", LARGURA / 2 + 5, 188);

  ctx.fillStyle = "#7fe7ff";
  ctx.fillText("ECOS DA FLORESTA", LARGURA / 2, 180);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Arial";
  ctx.fillText("Kael precisa restaurar os cristais e deter a Sombra", LARGURA / 2, 230);
  ctx.fillText("Explore Deserto, Caverna e a Fortaleza Sombria", LARGURA / 2, 260);

  ctx.fillStyle = "#ffffff";
  ctx.font = "20px Arial";
  ctx.fillText("ENTER = COMEÇAR", LARGURA / 2, 345);
  ctx.fillText("A / D ou setas = mover", LARGURA / 2, 385);
  ctx.fillText("W / seta cima / espaço = pular", LARGURA / 2, 415);
  ctx.fillText("J = atacar", LARGURA / 2, 445);
  ctx.fillText("SHIFT = dash", LARGURA / 2, 475);

  ctx.textAlign = "start";
}

function desenharGameOver() {
  ctx.fillStyle = "#200";
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  ctx.fillStyle = "#ff5a5a";
  ctx.font = "bold 58px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", LARGURA / 2, 220);

  ctx.fillStyle = "#ffffff";
  ctx.font = "28px Arial";
  ctx.fillText("Pontuação: " + pontuacao, LARGURA / 2, 300);
  ctx.fillText("Pressione ENTER para voltar ao menu", LARGURA / 2, 360);

  ctx.textAlign = "start";
}

function desenharVitoria() {
  ctx.fillStyle = "#0d2c18";
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  ctx.fillStyle = "#7CFC00";
  ctx.font = "bold 54px Arial";
  ctx.textAlign = "center";
  ctx.fillText("VITÓRIA!", LARGURA / 2, 180);

  ctx.fillStyle = "#ffffff";
  ctx.font = "28px Arial";
  ctx.fillText("A floresta voltou a respirar.", LARGURA / 2, 250);
  ctx.fillText("Kael restaurou o equilíbrio mágico.", LARGURA / 2, 290);
  ctx.fillText("Pontuação final: " + pontuacao, LARGURA / 2, 360);
  ctx.fillText("Pressione ENTER para voltar ao menu", LARGURA / 2, 440);

  ctx.textAlign = "start";
}

function desenharJogo() {
  desenharCenario();
  desenharCristais();
  desenharInimigos();
  desenharJogador();
  desenharHUD();
  desenharMensagem();
}

function desenhar() {
  ctx.clearRect(0, 0, LARGURA, ALTURA);

  if (estadoJogo === "menu") {
    desenharMenu();
    return;
  }

  if (estadoJogo === "gameover") {
    desenharGameOver();
    return;
  }

  if (estadoJogo === "vitoria") {
    desenharVitoria();
    return;
  }

  desenharJogo();
}

function loop() {
  atualizar();
  desenhar();
  requestAnimationFrame(loop);
}

loop();
