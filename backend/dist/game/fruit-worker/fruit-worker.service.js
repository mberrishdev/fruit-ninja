"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FruitWorkerService = void 0;
const common_1 = require("@nestjs/common");
const matrix_service_1 = require("../matrix/matrix.service");
const game_gateway_1 = require("../../gateway/game/game.gateway");
const fruit_entity_1 = require("../fruit.entity");
let FruitWorkerService = class FruitWorkerService {
    matrix;
    gateway;
    fruits = [];
    fruitTypes = [
        {
            name: 'Apple',
            symbol: '🍎',
            speed: 0.8,
            score: 5,
            radius: 2,
            rarity: 0.1,
        },
        {
            name: 'Orange',
            symbol: '🍊',
            speed: 1.0,
            score: 8,
            radius: 2,
            rarity: 0.3,
        },
        {
            name: 'Banana',
            symbol: '🍌',
            speed: 1.2,
            score: 10,
            radius: 3,
            rarity: 0.5,
        },
        {
            name: 'Cherry',
            symbol: '🍒',
            speed: 1.8,
            score: 15,
            radius: 1,
            rarity: 0.7,
        },
        {
            name: 'Watermelon',
            symbol: '🍉',
            speed: 0.4,
            score: 20,
            radius: 4,
            rarity: 0.9,
        },
    ];
    constructor(matrix, gateway) {
        this.matrix = matrix;
        this.gateway = gateway;
    }
    onModuleInit() {
        this.loop();
        console.log('FruitWorkerService initialized with varied fruit speeds at 24 FPS');
    }
    loop() {
        setInterval(() => {
            this.moveFruits();
        }, 42);
    }
    spawnFruit() {
        const fruitConfig = this.selectFruitType();
        const fruit = new fruit_entity_1.Fruit({
            name: fruitConfig.name,
            symbol: fruitConfig.symbol,
            radius: fruitConfig.radius,
            score: fruitConfig.score,
            speed: fruitConfig.speed,
            x: Math.floor(Math.random() * (100 - fruitConfig.radius * 2)) + fruitConfig.radius,
            y: 0,
            dx: (Math.random() - 0.5) * 0.5,
            dy: 1,
        });
        this.fruits.push(fruit);
        console.log(`Spawned ${fruit.name} at (${fruit.x}, ${fruit.y}) - Speed: ${fruit.speed}, Direction: (${fruit.dx.toFixed(2)}, ${fruit.dy}), ID: ${fruit.id}`);
    }
    selectFruitType() {
        const random = Math.random();
        for (const fruitType of this.fruitTypes) {
            if (random < 1 - fruitType.rarity) {
                return fruitType;
            }
        }
        return this.fruitTypes[0];
    }
    applyGravity() {
        for (const fruit of this.fruits) {
            fruit.speed = Math.min(fruit.speed + 0.01, 3.0);
        }
    }
    boostFruitType(fruitName, speedMultiplier) {
        const boostedCount = this.fruits
            .filter((f) => f.name === fruitName)
            .map((f) => {
            f.speed *= speedMultiplier;
            return f;
        }).length;
        console.log(`Boosted ${boostedCount} ${fruitName} fruits by ${speedMultiplier}x`);
        return boostedCount;
    }
    moveFruits() {
        if (Math.random() < 0.05)
            this.spawnFruit();
        this.applyGravity();
        for (const f of this.fruits) {
            this.matrix.clearFruit(f);
        }
        for (const f of this.fruits) {
            f.x = Math.round(f.x + f.dx * f.speed);
            f.y = Math.round(f.y + f.dy * f.speed);
            if (!this.matrix.isInBounds(f.x, f.y)) {
                this.fruits = this.fruits.filter((ff) => ff.id !== f.id);
                console.log(`Removed ${f.name} ${f.id} - out of bounds at (${f.x}, ${f.y})`);
                continue;
            }
            this.matrix.drawFruit(f);
        }
        this.gateway.broadcastMatrix({
            matrix: this.matrix.getMatrix(),
            fruits: this.fruits.map(f => ({
                id: f.id,
                name: f.name,
                symbol: f.symbol,
                x: f.x,
                y: f.y,
                speed: f.speed,
                score: f.score
            }))
        });
    }
    setGlobalSpeedMultiplier(multiplier) {
        for (const fruit of this.fruits) {
            fruit.speed *= multiplier;
        }
        console.log(`Applied speed multiplier: ${multiplier}`);
    }
    getFruitStats() {
        return {
            totalFruits: this.fruits.length,
            fruitsByType: this.fruits.reduce((acc, fruit) => {
                acc[fruit.name] = (acc[fruit.name] || 0) + 1;
                return acc;
            }, {}),
            averageSpeed: this.fruits.reduce((sum, f) => sum + f.speed, 0) / this.fruits.length,
        };
    }
};
exports.FruitWorkerService = FruitWorkerService;
exports.FruitWorkerService = FruitWorkerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [matrix_service_1.MatrixService,
        game_gateway_1.GameGateway])
], FruitWorkerService);
//# sourceMappingURL=fruit-worker.service.js.map