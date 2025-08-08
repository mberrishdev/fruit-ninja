export default class FruitNinjaRenderer {
  constructor() {
    this.MATRIX_SIZE = 100;
    this.CELL_SIZE = 5;

    this.fruitSymbols = new Map([
      ["Apple", "🍎"],
      ["Orange", "🍊"],
      ["Banana", "🍌"],
      ["Cherry", "🍒"],
      ["Watermelon", "🍉"],
      ["Grape", "🍇"],
      ["Strawberry", "🍓"],
      ["Pineapple", "🍍"],
      ["Peach", "🍑"],
      ["default", "🍎"],
    ]);

    this.fruitColors = new Map([
      ["Apple", 0xff6b6b],
      ["Orange", 0xffa500],
      ["Banana", 0xffff00],
      ["Cherry", 0xdc143c],
      ["Watermelon", 0x00ff00],
      ["Grape", 0x9932cc],
      ["Strawberry", 0xff69b4],
      ["Pineapple", 0xffd700],
      ["Peach", 0xffcba4],
      ["default", 0xff6b6b],
    ]);

    this.app = null;
    this.graphics = null;
    this.textContainer = null;
    this.socket = null;
    this.currentMatrix = null;
    this.fruitCount = 0;
    this.fruitData = new Map();

    this.lastFrameTime = performance.now();
    this.frameCount = 0;

    this.init();
  }

  init() {
    this.setupPixi();
    this.setupWebSocket();
    this.setupEventListeners();
    this.startRenderLoop();
  }

  setupPixi() {
    this.app = new PIXI.Application({
      width: this.MATRIX_SIZE * this.CELL_SIZE,
      height: this.MATRIX_SIZE * this.CELL_SIZE,
      backgroundColor: 0x0f0f23,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    document.getElementById("gameContainer").appendChild(this.app.view);

    this.graphics = new PIXI.Graphics();
    this.app.stage.addChild(this.graphics);

    this.textContainer = new PIXI.Container();
    this.app.stage.addChild(this.textContainer);

    this.handleResize();
  }

  setupWebSocket() {
    this.socket = io("ws://localhost:3000", {
      transports: ["websocket"],
      upgrade: false,
    });

    // this.socket = io(
    //   "http://ec2-18-195-72-62.eu-central-1.compute.amazonaws.com",
    //   {
    //     transports: ["websocket"],
    //     upgrade: false,
    //   }
    // );

    this.socket.on("connect", () => {
      this.updateConnectionStatus(true);
    });

    this.socket.on("disconnect", () => {
      this.updateConnectionStatus(false);
    });

    this.socket.on("matrix:update", (data) => {
      if (data.matrix) {
        this.currentMatrix = data.matrix;
        if (data.fruits) {
          this.fruitData.clear();
          data.fruits.forEach((fruit) => {
            this.fruitData.set(fruit.id, fruit);
          });
        }
        this.renderMatrix();
      } else {
        this.currentMatrix = data;
        this.renderMatrix();
      }
    });

    this.socket.on("connect_error", () => {
      this.updateConnectionStatus(false);
    });
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.handleResize());
  }

  handleResize() {
    if (!this.app) return;

    const matrixW = this.MATRIX_SIZE * this.CELL_SIZE;
    const matrixH = this.MATRIX_SIZE * this.CELL_SIZE;

    const container = document.getElementById("gameContainer");
    const rect = container.getBoundingClientRect();
    const scale = Math.min(
      (rect.width * 0.9) / matrixW,
      (rect.height * 0.9) / matrixH,
      3
    );

    this.app.stage.scale.set(scale);
    this.app.stage.position.set(0, 0);
  }

  renderMatrix() {
    if (!this.currentMatrix || !this.graphics) return;

    this.graphics.clear();
    this.textContainer.removeChildren();
    this.fruitCount = 0;

    this.drawGrid();

    for (let y = 0; y < this.MATRIX_SIZE; y++) {
      for (let x = 0; x < this.MATRIX_SIZE; x++) {
        const cell = this.currentMatrix[y][x];
        if (cell !== 0) {
          this.drawFruit(x, y, cell);
          this.fruitCount++;
        }
      }
    }

    document.getElementById("fruitCount").textContent = this.fruitCount;
  }

  drawGrid() {
    this.graphics.clear();
    this.graphics.position.set(0, 0);
    this.graphics.lineStyle(0.2, 0x333333, 0.3);
    for (let x = 0; x <= this.MATRIX_SIZE; x++) {
      this.graphics.moveTo(x * this.CELL_SIZE, 0);
      this.graphics.lineTo(
        x * this.CELL_SIZE,
        this.MATRIX_SIZE * this.CELL_SIZE
      );
    }
    for (let y = 0; y <= this.MATRIX_SIZE; y++) {
      this.graphics.moveTo(0, y * this.CELL_SIZE);
      this.graphics.lineTo(
        this.MATRIX_SIZE * this.CELL_SIZE,
        y * this.CELL_SIZE
      );
    }
  }

  drawFruit(x, y, fruitId) {
    const fruitData = this.fruitData.get(fruitId);
    const fruitName = fruitData ? fruitData.name : "default";
    const symbol =
      this.fruitSymbols.get(fruitName) || this.fruitSymbols.get("default");

    const pixelX = x * this.CELL_SIZE + this.CELL_SIZE / 2;
    const pixelY = y * this.CELL_SIZE + this.CELL_SIZE / 2;

    const baseFontSize = this.CELL_SIZE * 1.2;
    const scaledFontSize = baseFontSize * (fruitData.radius || 1);
    
    const text = new PIXI.Text(symbol, {
      fontFamily: "Arial, sans-serif",
      fontSize: Math.max(8, scaledFontSize),
      fill: 0xffffff,
      stroke: 0x000000,
      strokeThickness: 1,
      align: "center",
    });

    text.anchor.set(0.5);
    text.x = pixelX;
    text.y = pixelY;

    this.textContainer.addChild(text);
  }

  updateConnectionStatus(connected) {
    const statusElement = document.getElementById("connectionStatus");
    if (connected) {
      statusElement.textContent = "Connected";
      statusElement.className = "connected";
    } else {
      statusElement.textContent = "Disconnected";
      statusElement.className = "disconnected";
    }
  }

  startRenderLoop() {
    setInterval(() => {
      const now = performance.now();
      const fps = Math.round(1000 / (now - this.lastFrameTime));
      document.getElementById("fps").textContent = fps;
      this.lastFrameTime = now;
    }, 1000);
  }
}
