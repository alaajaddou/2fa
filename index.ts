import express, {
	Request,
	Response
} from 'express';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import cors from 'cors';

const app = express();
app.use(cors()); // Add this line to allow all origins
app.use(express.json());

// Helper functions
const generateSecret = () => speakeasy.generateSecret({ length: 20 });

// TOTP Implementation
app.get('/totp-generate', (req: Request, res: Response) => {
	const secret = generateSecret();
	res.json({ secret: secret.base32 });
});

app.post('/totp-verify', (req: Request, res: Response) => {
	const {
		      token,
		      secret
	      } = req.body;
	const verified = speakeasy.totp.verify({
		secret,
		encoding: 'base32',
		token
	});
	console.log('verified =>', verified)
	res.json({ verified });
});

// HOTP Implementation
app.post('/hotp-generate', (req: Request, res: Response) => {
	const secret = generateSecret();
	const counter = req.body.counter;
	const token = speakeasy.hotp({
		secret: secret.base32,
		encoding: 'base32',
		counter
	});
	res.json({
		secret: secret.base32,
		token
	});

});

app.post('/hotp-verify', (req: Request, res: Response) => {
	const {
		      token,
		      secret,
		      counter
	      } = req.body;
	const verified = speakeasy.hotp.verify({
		secret,
		encoding: 'base32',
		token,
		counter
	});
	res.json({ verified });
});

// QR Code Implementation
app.get('/qrcode-generate', (req: Request, res: Response) => {
	const secret = generateSecret();
	const otpauthURL = speakeasy.otpauthURL({
		secret: secret.ascii,
		label: 'My Service',
		encoding: 'ascii'
	});

	qrcode.toDataURL(otpauthURL, (err, dataURL) => {
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
app.post('/qrcode-totp-verify', (req: Request, res: Response) => {
	const {
		      token,
		      secret
	      } = req.body;
	const verified = speakeasy.totp.verify({
		secret,
		encoding: 'base32',
		token
	});
	res.json({ verified });
});
const port = 3000;
const host = '2fa.test';
app.listen(port, host, () => console.log(`2FA server running on https://${host}:${port}`));
