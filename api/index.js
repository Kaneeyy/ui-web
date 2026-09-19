import CryptoJS from 'crypto-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const firebaseConfig = {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || `https://${process.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
  };
  const dbSecret = process.env.VITE_DB_SECRET || "";

  const decrypt = (encryptedText) => {
    try {
      if (!encryptedText) return null;
      const bytes = CryptoJS.AES.decrypt(encryptedText, dbSecret);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) { return null; }
  };

  const encrypt = (data) => {
    if (!data) return "";
    return CryptoJS.AES.encrypt(JSON.stringify(data), dbSecret).toString();
  };

  const dbGet = async (path) => {
    const response = await fetch(`${firebaseConfig.databaseURL}/${path}.json`);
    const data = await response.json();
    return decrypt(data);
  };

  const dbSet = async (path, data) => {
    const encrypted = encrypt(data);
    const response = await fetch(`${firebaseConfig.databaseURL}/${path}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encrypted)
    });
    return await response.json();
  };

  const getAppMetadata = async (secret, appName) => {
    const appData = await dbGet(`applications/${secret}/${appName}/metadata`);
    return appData || null;
  };

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const endpoint = pathParts[0] || '';

  const body = req.body || {};

  try {
    if (endpoint === 'license') {
      const { key, license, secret, appName, appVersion, hwid } = body;
      const licenseKey = (key || license)?.trim();
      if (!licenseKey || !secret || !appName || !appVersion) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const appData = await getAppMetadata(secret, appName);
      if (!appData) return res.status(404).json({ success: false, message: 'Application not found' });
      if (appData.applicationPaused) return res.status(403).json({ success: false, message: 'APPLICATION_PAUSED' });
      if ((appData.version || 'UNKNOWN') !== appVersion) {
        return res.status(409).json({ success: false, message: 'VERSION_MISMATCH', serverVersion: appData.version || 'UNKNOWN' });
      }

      const userData = await dbGet(`applications/${secret}/${appName}/users/${licenseKey}`);
      if (userData) {
        if (userData.isBanned) return res.status(403).json({ success: false, message: 'USER_BANNED' });
        if (userData.hwidLock) {
          if (!userData.sid) {
            if (hwid) {
              userData.sid = hwid;
              await dbSet(`applications/${secret}/${appName}/users/${licenseKey}`, userData);
            }
          } else if (userData.sid !== hwid) {
            return res.status(403).json({ success: false, message: 'HWID_MISMATCH' });
          }
        }
        if (userData.expiry && userData.expiry !== 'lifetime') {
          if (new Date(userData.expiry) < new Date()) {
            return res.status(403).json({ success: false, message: 'LICENSE_EXPIRED' });
          }
        }
        return res.status(200).json({
          success: true,
          message: 'LOGIN_SUCCESS',
          username: licenseKey,
          subscription: userData.subscription || 'default',
          expiry: userData.expiry || 'lifetime'
        });
      }

      const licenseData = await dbGet(`applications/${secret}/${appName}/licenses/${licenseKey}`);
      if (!licenseData) return res.status(404).json({ success: false, message: 'Invalid License Key' });
      if (licenseData.used && licenseData.associatedUser !== licenseKey) {
        return res.status(409).json({ success: false, message: 'License key already used' });
      }

      const newUser = {
        password: licenseKey,
        hwidLock: true,
        sid: hwid || "",
        isBanned: false,
        license: licenseKey,
        expiry: licenseData.expiry || 'lifetime',
        subscription: licenseData.rank || 'default',
        created: new Date().toISOString()
      };

      await dbSet(`applications/${secret}/${appName}/users/${licenseKey}`, newUser);
      licenseData.used = true;
      licenseData.associatedUser = licenseKey;
      await dbSet(`applications/${secret}/${appName}/licenses/${licenseKey}`, licenseData);

      return res.status(200).json({
        success: true,
        message: 'LOGIN_SUCCESS',
        username: licenseKey,
        subscription: licenseData.rank || 'default',
        expiry: licenseData.expiry || 'lifetime'
      });
    }

    if (endpoint === 'login') {
      const { username, password, secret, appName, appVersion, hwid } = body;
      if (!username || !password || !secret || !appName || !appVersion) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const appData = await getAppMetadata(secret, appName);
      if (!appData) return res.status(404).json({ success: false, message: 'Application not found' });
      if (appData.applicationPaused) return res.status(403).json({ success: false, message: 'APPLICATION_PAUSED' });
      if ((appData.version || 'UNKNOWN') !== appVersion) {
        return res.status(409).json({ success: false, message: 'VERSION_MISMATCH', serverVersion: appData.version || 'UNKNOWN' });
      }

      const userData = await dbGet(`applications/${secret}/${appName}/users/${username}`);
      if (!userData || userData.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      if (userData.isBanned) return res.status(403).json({ success: false, message: 'USER_BANNED' });

      if (userData.hwidLock) {
        if (!userData.sid) {
          if (hwid) {
            userData.sid = hwid;
            await dbSet(`applications/${secret}/${appName}/users/${username}`, userData);
          }
        } else if (userData.sid !== hwid) {
          return res.status(403).json({ success: false, message: 'HWID_MISMATCH' });
        }
      }

      if (userData.expiry && userData.expiry !== 'lifetime') {
        if (new Date(userData.expiry) < new Date()) {
          return res.status(403).json({ success: false, message: 'LICENSE_EXPIRED' });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'LOGIN_SUCCESS',
        username: username,
        subscription: userData.subscription || 'default',
        expiry: userData.expiry || 'lifetime'
      });
    }

    if (endpoint === 'get_free_key') {
      const globalFreeConfig = await dbGet('system/config/globalFreeKey');
      if (!globalFreeConfig || !globalFreeConfig.enabled) {
        return res.status(403).json({ success: false, message: 'Free Key System Disabled' });
      }

      const targetSecret = globalFreeConfig.targetSecret;
      const targetAppName = globalFreeConfig.targetAppName;
      const durationDays = parseInt(globalFreeConfig.durationDays || 1);

      if (!targetSecret || !targetAppName) {
        return res.status(500).json({ success: false, message: 'Target app not configured' });
      }

      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const generatedKey = `KCA-TR-${randomPart}`;

      const expDate = new Date();
      expDate.setDate(expDate.getDate() + durationDays);

      const licenseData = {
        used: false,
        rank: 'FREE TRIAL',
        expiry: expDate.toISOString(),
        createdBy: 'FREE_KEY_SYSTEM',
        note: 'Generated via Free Key Button',
        created: new Date().toISOString()
      };

      await dbSet(`applications/${targetSecret}/${targetAppName}/licenses/${generatedKey}`, licenseData);

      return res.status(200).json({
        success: true,
        key: generatedKey,
        expiry: expDate.toISOString(),
        durationDays
      });
    }

    return res.status(404).json({ success: false, message: 'API Route Not Found' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
