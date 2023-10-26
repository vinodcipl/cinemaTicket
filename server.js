"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var mongoose_1 = require("mongoose");
var app = express();
// Externalizing configuration
var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cinema';
var PORT = process.env.PORT || 8080;
mongoose_1.default.connect(MONGODB_URI);
var CinemaSchema = new mongoose_1.Schema({
    seats: Number,
    purchasedSeats: [Number]
}, { versionKey: '_version' });
var Cinema = mongoose_1.default.model('Cinema', CinemaSchema);
app.use(cors());
app.use(express.json());
// Route to create a cinema
app.post('/cinemas', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var seats, cinema, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                seats = req.body.seats;
                cinema = new Cinema({ seats: seats, purchasedSeats: [] });
                return [4 /*yield*/, cinema.save()];
            case 1:
                _a.sent();
                res.json(cinema);
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                res.status(500).json({ error: err_1.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Route to fetch all cinemas with remaining seat count
app.get('/cinemas', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cinemas, cinemasWithAvailableSeats, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Cinema.find({}, 'id seats purchasedSeats')];
            case 1:
                cinemas = _a.sent();
                cinemasWithAvailableSeats = cinemas.map(function (cinema) { return ({
                    _id: cinema._id,
                    availableSeats: cinema.seats - cinema.purchasedSeats.length
                }); });
                res.json(cinemasWithAvailableSeats);
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                res.status(500).json({ error: err_2.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Route to purchase a specific seat
app.post('/cinemas/:id/purchase', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var seatNumber, cinema, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                seatNumber = req.body.seatNumber;
                return [4 /*yield*/, Cinema.findOneAndUpdate({
                        _id: req.params.id,
                        purchasedSeats: { $ne: seatNumber } // ensures the seat isn't already purchased
                    }, {
                        $push: { purchasedSeats: seatNumber }
                    }, {
                        new: true,
                        runValidators: true // ensures the update respects schema validations
                    })];
            case 1:
                cinema = _a.sent();
                if (!cinema) {
                    return [2 /*return*/, res.status(400).json({ error: 'Seat already purchased or cinema not found' })];
                }
                res.json({ cinema: cinema, message: 'Seat purchased successfully!' });
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                res.status(500).json({ error: err_3.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Route to purchase the first two consecutive free seats
app.post('/cinemas/:id/purchase-consecutive', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var foundSeats, cinema, i, updatedCinema, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                foundSeats = null;
                return [4 /*yield*/, Cinema.findById(req.params.id)];
            case 1:
                cinema = _a.sent();
                if (!cinema) {
                    return [2 /*return*/, res.status(404).json({ error: 'Cinema not found' })];
                }
                for (i = 1; i < cinema.seats; i++) {
                    if (!cinema.purchasedSeats.includes(i) && !cinema.purchasedSeats.includes(i + 1)) {
                        foundSeats = [i, i + 1];
                        break;
                    }
                }
                if (!foundSeats) {
                    return [2 /*return*/, res.status(400).json({ error: 'No two consecutive seats available' })];
                }
                return [4 /*yield*/, Cinema.findOneAndUpdate({
                        _id: req.params.id,
                        purchasedSeats: { $nin: foundSeats } // ensures neither of the seats are already purchased
                    }, {
                        $push: { purchasedSeats: { $each: foundSeats } }
                    }, {
                        new: true,
                        runValidators: true
                    })];
            case 2:
                updatedCinema = _a.sent();
                if (!updatedCinema) {
                    return [2 /*return*/, res.status(400).json({ error: 'Seats were purchased before you could complete the transaction' })];
                }
                res.json({ cinema: updatedCinema, seats: foundSeats });
                return [3 /*break*/, 4];
            case 3:
                err_4 = _a.sent();
                res.status(500).json({ error: err_4.message });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Route to fetch available seats for a cinema
app.get('/cinemas/:id/available-seats', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cinema_1, allSeats, availableSeats, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Cinema.findById(req.params.id, 'seats purchasedSeats')];
            case 1:
                cinema_1 = _a.sent();
                allSeats = Array.from({ length: cinema_1.seats }, function (_, i) { return i + 1; });
                availableSeats = allSeats.filter(function (seat) { return !cinema_1.purchasedSeats.includes(seat); });
                res.json(availableSeats);
                return [3 /*break*/, 3];
            case 2:
                err_5 = _a.sent();
                res.status(500).json({ error: err_5.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.listen(PORT, function () {
    console.log("Server running on http://localhost:".concat(PORT));
});
