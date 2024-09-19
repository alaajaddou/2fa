async function fetchSecret(url, body, method = 'POST') {
  const baseUrl = 'http://2fa.test:3000';
  let response;
  if (method === 'POST') {
    const init = {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    response = await fetch(`${baseUrl}/${url}`, init);
  } else {
    response = await fetch(`${baseUrl}/${url}`);
  }
  return response.json();
}

async function generateTOTPSecret() {
  const { secret } = await fetchSecret('totp-generate', null, 'get');
  document.getElementById('totp-secret').value = secret;
}

async function verifyTOTP() {
  const token = document.getElementById('totp-token').value;
  const secret = document.getElementById('totp-secret').value;
  const response = await fetch('http://2fa.test:3000/totp-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, secret })
  });
  const { verified } = await response.json();
  const text = document.getElementById('totp-verification-text');
  text.innerHTML = verified ? 'Verification Success' : 'Verification Failed';

  const icon = document.getElementById('totp-verification-icon');
  icon.className = verified ? 'verification-icon fas fa-check' : 'verification-icon fas fa-times';
}

async function generateHOTPToken() {
  const counter = document.getElementById('hotp-counter').value;
  const { secret, token } = await fetchSecret(`hotp-generate`, {counter});
  document.getElementById('hotp-secret').value = secret;
  document.getElementById('hotp-token').value = token;
}

async function verifyHOTP() {
  const token = document.getElementById('hotp-token').value;
  const secret = document.getElementById('hotp-secret').value;
  const counter = document.getElementById('hotp-counter').value;
  const response = await fetch('http://2fa.test:3000/hotp-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, secret, counter })
  });
  const { verified } = await response.json();
  const text = document.getElementById('hotp-verification-text');
  text.innerHTML = verified ? 'Verification Success' : 'Verification Failed';
  const icon = document.getElementById('hotp-verification-icon');
  icon.className = verified ? 'verification-icon fas fa-check' : 'verification-icon fas fa-times';
  // alert(`HOTP Verification: ${verified}`);
}

async function generateQRCode() {
  const response = await fetch('http://2fa.test:3000/qrcode-generate');
  const { qrcode, secret } = await response.json();
  document.getElementById('qrcode-img').src = qrcode;
  document.getElementById('qrcode-secret').value = secret;
}

async function verifyQRCodeTOTP() {
  const token = document.getElementById('qrcode-totp-token').value;
  const secret = document.getElementById('qrcode-secret').value;
  const response = await fetch('http://2fa.test:3000/qrcode-totp-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, secret })
  });
  const { verified } = await response.json();
  const text = document.getElementById('qrcode-verification-text');
  text.innerHTML = verified ? 'Verification Success' : 'Verification Failed';
  const icon = document.getElementById('qrcode-verification-icon');
  icon.className = verified ? 'verification-icon fas fa-check' : 'verification-icon fas fa-times';
  // alert(`QR Code TOTP Verification: ${verified}`);
}