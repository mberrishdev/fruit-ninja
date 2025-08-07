"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fruit = void 0;
const crypto_1 = require("crypto");
class Fruit {
    id;
    name;
    symbol;
    score;
    radius;
    x;
    y;
    speed;
    dx;
    dy;
    constructor(params) {
        Object.assign(this, params);
        this.id = (0, crypto_1.randomUUID)();
    }
    getBounds() {
        const cells = [];
        for (let dy = -this.radius; dy <= this.radius; dy++) {
            for (let dx = -this.radius; dx <= this.radius; dx++) {
                const cx = this.x + dx;
                const cy = this.y + dy;
                if (dx * dx + dy * dy <= this.radius * this.radius) {
                    cells.push({ x: cx, y: cy });
                }
            }
        }
        return cells;
    }
}
exports.Fruit = Fruit;
//# sourceMappingURL=fruit.entity.js.map