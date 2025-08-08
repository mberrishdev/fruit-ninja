export default class FruitNinjaRenderer {
  constructor(socket) {
    this.socket = socket;
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
    this.currentMatrix = null;
    this.fruitData = new Map();

    this.score = 0;
    this.particles = [];
  }

  init() {
    this.setupPixi();
    this.setupWebSocket();
    this.setupEventListeners();
    this.startRenderLoop();
  }

  setupPixi() {
    const PADDING = 40; 
    this.app = new PIXI.Application({
      width: this.MATRIX_SIZE * this.CELL_SIZE + (PADDING * 2),
      height: this.MATRIX_SIZE * this.CELL_SIZE + (PADDING * 2),
      backgroundColor: 0x0f0f23,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    console.log("setupPixi");
    document.getElementById("gameContainer").appendChild(this.app.view);

    this.graphics = new PIXI.Graphics();
    this.app.stage.addChild(this.graphics);

    this.textContainer = new PIXI.Container();
    this.app.stage.addChild(this.textContainer);

    this.handleResize();
  }

  setupWebSocket() {
    this.socket.on("connect", () => {
      this.updateConnectionStatus(true);
    });

    this.socket.on("disconnect", () => {
      this.updateConnectionStatus(false);
    });

    this.socket.on("matrix:update", (data) => {
      // Check if this update is for our room
      const currentRoomCode = sessionStorage.getItem("roomCode");
      if (data.roomCode && data.roomCode !== currentRoomCode) {
        return; // Ignore updates for other rooms
      }

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

    // Listen for score updates
    this.socket.on("score:update", ({ score }) => {
      this.score += score;
      const scoreEl = document.getElementById("score");
      scoreEl.textContent = this.score;

      // Animate score
      scoreEl.classList.add("updated");
      setTimeout(() => scoreEl.classList.remove("updated"), 200);
    });
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.handleResize());

    // Track mouse/touch for slicing
    this.slicePath = new PIXI.Graphics();
    this.app.stage.addChild(this.slicePath);

    // Create particle container for slice effects
    this.particleContainer = new PIXI.Container();
    this.app.stage.addChild(this.particleContainer);

    let isSlicing = false;
    let lastPoint = null;

    // Start animation loop for particles
    this.app.ticker.add(() => this.updateParticles());

    const startSlice = (e) => {
      isSlicing = true;
      const pos = e.data.getLocalPosition(this.app.stage);
      lastPoint = pos;
      this.slicePath.clear();
      
      // Create gradient effect with multiple lines
      // Base white line (thinnest)
      this.slicePath.lineStyle(1, 0xffffff, 1);
      this.slicePath.moveTo(pos.x, pos.y);
      
      // Add glow effect
      const glowFilter = new PIXI.BlurFilter();
      glowFilter.blur = 2;
      glowFilter.quality = 3;
      this.slicePath.filters = [glowFilter];
      
      // Track the start point for the gradient
      this.sliceStartPoint = { x: pos.x, y: pos.y };
    };

    const moveSlice = (e) => {
      if (!isSlicing) return;

      const pos = e.data.getLocalPosition(this.app.stage);
      
      // Clear previous line
      this.slicePath.clear();
      
      // Keep only the most recent segment of the slice
      const maxLength = 100; // Maximum length of the slice trail
      const dx = pos.x - lastPoint.x;
      const dy = pos.y - lastPoint.y;
      const currentLength = Math.sqrt(dx * dx + dy * dy);
      
      let startX = pos.x;
      let startY = pos.y;
      
      if (currentLength > maxLength) {
        // Calculate the start point to maintain max length
        const scale = maxLength / currentLength;
        startX = pos.x - dx * scale;
        startY = pos.y - dy * scale;
      } else {
        startX = lastPoint.x;
        startY = lastPoint.y;
      }

      // Draw white core
      this.slicePath.lineStyle(2, 0xffffff, 0.9);
      this.slicePath.moveTo(startX, startY);
      this.slicePath.lineTo(pos.x, pos.y);

      // Draw outer glow
      this.slicePath.lineStyle(4, 0xffffff, 0.3);
      this.slicePath.moveTo(startX, startY);
      this.slicePath.lineTo(pos.x, pos.y);

      // Add particles along the slice path
      if (lastPoint) {
        // Create particles between last point and current point
        const steps = 5;
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          const x = lastPoint.x + (pos.x - lastPoint.x) * t;
          const y = lastPoint.y + (pos.y - lastPoint.y) * t;

                // Create fewer, more subtle particles
      if (Math.random() < 0.2) { // Only create particles 20% of the time
        // Create white particle for the main trail
        this.createParticle(x, y, 0xffffff, 0.5);
      }
        }

        this.checkSliceCollisions(lastPoint, pos);
      }

      lastPoint = pos;
    };

    const endSlice = () => {
      isSlicing = false;
      lastPoint = null;
      // Fade out slice path
      setTimeout(() => this.slicePath.clear(), 100);
    };

    this.app.view.addEventListener("pointerdown", (e) => {
      startSlice({
        data: {
          getLocalPosition: (stage) => {
            const rect = this.app.view.getBoundingClientRect();
            return {
              x: (e.clientX - rect.left - this.app.stage.position.x) / this.app.stage.scale.x,
              y: (e.clientY - rect.top - this.app.stage.position.y) / this.app.stage.scale.y,
            };
          },
        },
      });
    });

    this.app.view.addEventListener("pointermove", (e) => {
      moveSlice({
        data: {
          getLocalPosition: (stage) => {
            const rect = this.app.view.getBoundingClientRect();
            return {
              x: (e.clientX - rect.left - this.app.stage.position.x) / this.app.stage.scale.x,
              y: (e.clientY - rect.top - this.app.stage.position.y) / this.app.stage.scale.y,
            };
          },
        },
      });
    });

    this.app.view.addEventListener("pointerup", endSlice);
    this.app.view.addEventListener("pointerout", endSlice);
  }

  checkSliceCollisions(start, end) {
    if (!this.fruitData) return;

    this.fruitData.forEach((fruit) => {
      const fruitPos = {
        x: (fruit.x * this.CELL_SIZE + this.CELL_SIZE / 2),
        y: (fruit.y * this.CELL_SIZE + this.CELL_SIZE / 2),
      };

      if (
        this.lineIntersectsCircle(
          start,
          end,
          fruitPos,
          (fruit.radius || 1) * this.CELL_SIZE
        )
      ) {
        const roomCode = sessionStorage.getItem("roomCode");
        this.socket.emit("slice", { fruitId: fruit.id, roomCode });

        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
          this.createParticle(fruitPos.x, fruitPos.y, 0xffff00);
        }
      }
    });
  }

  lineIntersectsCircle(start, end, center, radius) {
    // Vector from start to end
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // Vector from start to circle center
    const fx = center.x - start.x;
    const fy = center.y - start.y;

    // Length of line segment squared
    const segmentSq = dx * dx + dy * dy;

    // Dot product of line vector and start-to-center vector
    const dot = fx * dx + fy * dy;

    // Closest point on line to circle center
    let t = Math.max(0, Math.min(1, dot / segmentSq));

    const closestX = start.x + t * dx;
    const closestY = start.y + t * dy;

    // Distance from closest point to circle center
    const distanceSq =
      Math.pow(center.x - closestX, 2) + Math.pow(center.y - closestY, 2);

    return distanceSq <= radius * radius;
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

    // Calculate padding
    const PADDING = 40; // 40 pixels padding
    const paddingX = PADDING * scale;
    const paddingY = PADDING * scale;

    // Set scale and position with padding
    this.app.stage.scale.set(scale);
    this.app.stage.position.set(paddingX, paddingY);

    // Adjust the view size to include padding
    this.app.renderer.resize(
      matrixW * scale + (PADDING * 2 * scale),
      matrixH * scale + (PADDING * 2 * scale)
    );
  }

  renderMatrix() {
    if (!this.currentMatrix || !this.graphics) return;

    this.graphics.clear();
    this.textContainer.removeChildren();
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

    const pixelX = (x * this.CELL_SIZE + this.CELL_SIZE / 2);
    const pixelY = (y * this.CELL_SIZE + this.CELL_SIZE / 2);

    const baseFontSize = this.CELL_SIZE * 1.2;
    const scaledFontSize = baseFontSize * (fruitData?.radius || 1);

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

  createParticle(x, y, color, startAlpha = 1) {
    const particle = new PIXI.Graphics();
    particle.beginFill(color);
    particle.drawCircle(0, 0, 1); // Smaller particles
    particle.endFill();
    particle.position.set(x, y);
    particle.alpha = startAlpha;
    particle.velocity = {
      x: (Math.random() - 0.5) * 5,
      y: (Math.random() - 0.5) * 5,
    };
    this.particleContainer.addChild(particle);
    this.particles.push({
      sprite: particle,
      life: 1,
    });
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.sprite.alpha = p.life;
      p.sprite.position.x += p.sprite.velocity.x;
      p.sprite.position.y += p.sprite.velocity.y;
      p.life -= 0.05;

      if (p.life <= 0) {
        this.particleContainer.removeChild(p.sprite);
        this.particles.splice(i, 1);
      }
    }
  }

  startRenderLoop() {
    // Start the PIXI ticker for animation
    this.app.ticker.start();
  }
}
