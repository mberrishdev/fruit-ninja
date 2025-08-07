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
exports.MatrixService = void 0;
const common_1 = require("@nestjs/common");
let MatrixService = class MatrixService {
    size = 100;
    matrix = [];
    constructor() {
        this.matrix = Array.from({ length: this.size }, () => Array.from({ length: this.size }, () => 0));
    }
    clear() {
        for (const row of this.matrix)
            row.fill(0);
    }
    setCell(x, y, value) {
        const ix = Math.round(x);
        const iy = Math.round(y);
        if (this.isInBounds(ix, iy)) {
            this.matrix[iy][ix] = value;
        }
        else {
            console.warn(`Attempted to set cell out of bounds: (${ix}, ${iy})`);
        }
    }
    clearFruit(fruit) {
        try {
            for (const { x, y } of fruit.getBounds()) {
                this.setCell(x, y, 0);
            }
        }
        catch (error) {
            console.error(`Error clearing fruit ${fruit.id}:`, error);
        }
    }
    drawFruit(fruit) {
        try {
            for (const { x, y } of fruit.getBounds()) {
                this.setCell(x, y, fruit.id);
            }
        }
        catch (error) {
            console.error(`Error drawing fruit ${fruit.id}:`, error);
        }
    }
    isInBounds(x, y) {
        return x >= 0 && y >= 0 && x < this.size && y < this.size;
    }
    getMatrix() {
        return this.matrix;
    }
};
exports.MatrixService = MatrixService;
exports.MatrixService = MatrixService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MatrixService);
//# sourceMappingURL=matrix.service.js.map