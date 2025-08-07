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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const fruit_worker_service_1 = require("./game/fruit-worker/fruit-worker.service");
let AppController = class AppController {
    appService;
    fruitWorker;
    constructor(appService, fruitWorker) {
        this.appService = appService;
        this.fruitWorker = fruitWorker;
    }
    getHello() {
        return this.appService.getHello();
    }
    getFruitStats() {
        return this.fruitWorker.getFruitStats();
    }
    setGlobalSpeed(body) {
        this.fruitWorker.setGlobalSpeedMultiplier(body.multiplier);
        return { message: `Global speed multiplier set to ${body.multiplier}` };
    }
    boostFruitType(body) {
        const count = this.fruitWorker.boostFruitType(body.fruitName, body.multiplier);
        return {
            message: `Boosted ${count} ${body.fruitName} fruits by ${body.multiplier}x`,
            boostedCount: count
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('fruits/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getFruitStats", null);
__decorate([
    (0, common_1.Post)('fruits/speed/global'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "setGlobalSpeed", null);
__decorate([
    (0, common_1.Post)('fruits/speed/boost'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "boostFruitType", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        fruit_worker_service_1.FruitWorkerService])
], AppController);
//# sourceMappingURL=app.controller.js.map