"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)()); // Add this line to allow all origins
app.use(express_1.default.json());
// Helper functions
const generateSecret = () => speakeasy_1.default.generateSecret({ length: 20 });
// TOTP Implementation
app.get('/totp-generate', (req, res) => {
    const secret = generateSecret();
    res.json({ secret: secret.base32 });
});
app.post('/totp-verify', (req, res) => {
    const { token, secret } = req.body;
    const verified = speakeasy_1.default.totp.verify({
        secret,
        encoding: 'base32',
        token
    });
    console.log('verified =>', verified);
    res.json({ verified });
});
// HOTP Implementation
app.post('/hotp-generate', (req, res) => {
    const secret = generateSecret();
    const counter = req.body.counter;
    const token = speakeasy_1.default.hotp({
        secret: secret.base32,
        encoding: 'base32',
        counter
    });
    res.json({
        secret: secret.base32,
        token
    });
});
app.post('/hotp-verify', (req, res) => {
    const { token, secret, counter } = req.body;
    const verified = speakeasy_1.default.hotp.verify({
        secret,
        encoding: 'base32',
        token,
        counter
    });
    res.json({ verified });
});
// QR Code Implementation
app.get('/qrcode-generate', (req, res) => {
    const secret = generateSecret();
    const otpauthURL = speakeasy_1.default.otpauthURL({
        secret: secret.ascii,
        label: 'My Service',
        encoding: 'ascii'
    });
    qrcode_1.default.toDataURL(otpauthURL, (err, dataURL) => {
        if (err) {
            return res.status(500).json({ error: 'Could not generate QR Code' });
        }
        res.json({
            qrcode: dataURL,
            secret: secret.base32
        });
    });
});
// Endpoint to verify TOTP from QR Code
app.post('/qrcode-totp-verify', (req, res) => {
    const { token, secret } = req.body;
    const verified = speakeasy_1.default.totp.verify({
        secret,
        encoding: 'base32',
        token
    });
    res.json({ verified });
});
const port = 3000;
const host = '2fa.test';
app.listen(port, host, () => console.log(`2FA server running on https://${host}:${port}`));
