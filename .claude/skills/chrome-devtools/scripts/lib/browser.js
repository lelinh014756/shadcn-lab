/**
 * Shared browser utilities for Chrome DevTools scripts
 * Supports persistent browser sessions via WebSocket endpoint file
 */
import puppeteer from 'puppeteer';
import debug from 'debug';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const log = debug('chrome-devtools:browser');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_FILE = path.join(__dirname, '..', '.browser-session.json');
const AUTH_SESSION_FILE = path.join(__dirname, '..', '.auth-session.json');
const SESSION_MAX_AGE_MS = 60 * 60 * 1000;
const SESSION_VERSION = 2;

let browserInstance = null;
let pageInstance = null;

export function resolveHeadless(value) {
  if (value === false || value === 'false') return false;
  if (value === true || value === 'true') return true;

  if (process.env.CI || process.env.GITHUB_ACTIONS || process.env.GITLAB_CI || process.env.JENKINS_URL) {
    log('Auto-detected CI environment → headless');
    return true;
  }

  if (process.platform === 'linux') {
    log('Auto-detected Linux → headless');
    return true;
  }

  log(`Auto-detected ${process.platform} → headed`);
  return false;
}

function getDefaultChromeProfilePath() {
  switch (process.platform) {
    case 'darwin':
      return `${process.env.HOME}/Library/Application Support/Google/Chrome`;
    case 'win32':
      return `${process.env.LOCALAPPDATA}/Google/Chrome/User Data`;
    default:
      return `${process.env.HOME}/.config/google-chrome`;
  }
}

function normalizePageMeta(activePage) {
  if (!activePage || typeof activePage !== 'object') return null;
  const url = String(activePage.url || '').trim();
  if (!url) return null;

  return {
    url,
    title: String(activePage.title || '').trim(),
    reason: String(activePage.reason || '').trim() || 'session-reuse',
    updatedAt: Number(activePage.updatedAt) || Date.now(),
  };
}

function normalizeSession(data) {
  if (!data || typeof data !== 'object') return null;

  const wsEndpoint = String(data.wsEndpoint || '').trim();
  if (!wsEndpoint) return null;

  return {
    version: Number(data.version) || 1,
    wsEndpoint,
    timestamp: Number(data.timestamp) || Date.now(),
    lastIntentUrl: String(data.lastIntentUrl || '').trim() || null,
    activePage: normalizePageMeta(data.activePage),
  };
}

function readSession() {
  try {
    if (!fs.existsSync(SESSION_FILE)) return null;
    const raw = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    const data = normalizeSession(raw);
    if (!data) return null;
    if (Date.now() - data.timestamp >= SESSION_MAX_AGE_MS) return null;
    return data;
  } catch (e) {
    log('Failed to read session:', e.message);
    return null;
  }
}

function resolveWsEndpoint() {
  if (browserInstance?.wsEndpoint) {
    try {
      const endpoint = browserInstance.wsEndpoint();
      if (endpoint) return endpoint;
    } catch {
      // noop
    }
  }

  return readSession()?.wsEndpoint || null;
}

function writeSession(sessionOrWsEndpoint, updates = {}) {
  try {
    const previous = readSession() || {};
    const next = typeof sessionOrWsEndpoint === 'string'
      ? { ...previous, ...updates, wsEndpoint: sessionOrWsEndpoint }
      : { ...previous, ...(sessionOrWsEndpoint || {}) };

    const normalized = normalizeSession({
      version: SESSION_VERSION,
      timestamp: Date.now(),
      ...next,
    });

    if (!normalized) return;

    fs.writeFileSync(SESSION_FILE, JSON.stringify(normalized, null, 2));
  } catch (e) {
    log('Failed to write session:', e.message);
  }
}

function clearSession() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
    }
  } catch (e) {
    log('Failed to clear session:', e.message);
  }
}

export function saveAuthSession(authData) {
  try {
    const existing = readAuthSession() || {};
    const merged = { ...existing, ...authData, timestamp: Date.now() };
    fs.writeFileSync(AUTH_SESSION_FILE, JSON.stringify(merged, null, 2));
    log('Auth session saved');
  } catch (e) {
    log('Failed to save auth session:', e.message);
  }
}

export function readAuthSession() {
  try {
    if (fs.existsSync(AUTH_SESSION_FILE)) {
      const data = JSON.parse(fs.readFileSync(AUTH_SESSION_FILE, 'utf8'));
      if (Date.now() - data.timestamp < 86400000) {
        return data;
      }
    }
  } catch (e) {
    log('Failed to read auth session:', e.message);
  }
  return null;
}

export function clearAuthSession() {
  try {
    if (fs.existsSync(AUTH_SESSION_FILE)) {
      fs.unlinkSync(AUTH_SESSION_FILE);
      log('Auth session cleared');
    }
  } catch (e) {
    log('Failed to clear auth session:', e.message);
  }
}

export async function applyAuthSession(page, url) {
  const authData = readAuthSession();
  if (!authData) {
    log('No auth session found');
    return false;
  }

  try {
    if (authData.cookies && authData.cookies.length > 0) {
      await page.setCookie(...authData.cookies);
      log(`Applied ${authData.cookies.length} cookies`);
    }

    if (authData.localStorage && Object.keys(authData.localStorage).length > 0) {
      await page.evaluate((data) => {
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        });
      }, authData.localStorage);
      log('Applied localStorage data');
    }

    if (authData.sessionStorage && Object.keys(authData.sessionStorage).length > 0) {
      await page.evaluate((data) => {
        Object.entries(data).forEach(([key, value]) => {
          sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        });
      }, authData.sessionStorage);
      log('Applied sessionStorage data');
    }

    if (authData.headers) {
      await page.setExtraHTTPHeaders(authData.headers);
      log('Applied HTTP headers');
    }

    return true;
  } catch (e) {
    log('Failed to apply auth session:', e.message);
    return false;
  }
}

export async function getBrowser(options = {}) {
  if (browserInstance && browserInstance.isConnected()) {
    log('Reusing existing browser instance from process');
    return browserInstance;
  }

  const session = readSession();
  if (session?.wsEndpoint) {
    try {
      log('Attempting to connect to existing browser session');
      browserInstance = await puppeteer.connect({
        browserWSEndpoint: session.wsEndpoint,
      });
      log('Connected to existing browser');
      return browserInstance;
    } catch (e) {
      log('Failed to connect to existing browser:', e.message);
      clearSession();
    }
  }

  if (options.wsEndpoint || options.browserUrl) {
    log('Connecting to browser via provided endpoint');
    browserInstance = await puppeteer.connect({
      browserWSEndpoint: options.wsEndpoint,
      browserURL: options.browserUrl,
    });
    return browserInstance;
  }

  let userDataDir = options.userDataDir || options.profile;
  if (options.useDefaultProfile) {
    userDataDir = getDefaultChromeProfilePath();
    log(`Using default Chrome profile: ${userDataDir}`);
  }

  const {
    headless,
    args: extraArgs,
    viewport,
    useDefaultProfile,
    profile,
    browserUrl,
    wsEndpoint: _ws,
    userDataDir: _udd,
    ...restOptions
  } = options;

  const launchOptions = {
    headless: resolveHeadless(headless),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      ...(extraArgs || []),
    ],
    defaultViewport: viewport || {
      width: 1920,
      height: 1080,
    },
    ...(userDataDir && { userDataDir }),
    ...restOptions,
  };

  log('Launching new browser');
  browserInstance = await puppeteer.launch(launchOptions);
  const wsEndpoint = browserInstance.wsEndpoint();
  writeSession(wsEndpoint);
  log('Browser launched, session saved');

  return browserInstance;
}

function isIgnorablePageUrl(url) {
  return !url || url === 'about:blank' || url.startsWith('devtools://') || url.startsWith('chrome-extension://');
}

function urlsRoughlyMatch(currentUrl, preferUrl) {
  if (!currentUrl || !preferUrl) return false;
  if (currentUrl === preferUrl) return true;

  try {
    const current = new URL(currentUrl);
    const preferred = new URL(preferUrl);
    return current.origin === preferred.origin && current.pathname === preferred.pathname;
  } catch {
    return currentUrl.startsWith(preferUrl) || preferUrl.startsWith(currentUrl);
  }
}

async function readPageMeta(page) {
  try {
    return {
      url: page.url(),
      title: await page.title(),
      closed: page.isClosed(),
    };
  } catch (error) {
    return {
      url: '',
      title: '',
      closed: true,
      error: error.message,
    };
  }
}

async function listCandidatePages(browser) {
  const pages = await browser.pages();
  const candidates = [];

  for (const page of pages) {
    const meta = await readPageMeta(page);
    candidates.push({ page, ...meta });
  }

  return candidates;
}

function pickBestPage(candidates, { preferUrl, lastIntentUrl } = {}) {
  const ordered = [...candidates].reverse();
  const preferenceChain = [preferUrl, lastIntentUrl].filter(Boolean);

  for (const preferred of preferenceChain) {
    const matched = ordered.find((candidate) => !candidate.closed && urlsRoughlyMatch(candidate.url, preferred));
    if (matched) {
      return { candidate: matched, reason: `matched:${preferred}` };
    }
  }

  const nonBlank = ordered.find((candidate) => !candidate.closed && !isIgnorablePageUrl(candidate.url));
  if (nonBlank) {
    return { candidate: nonBlank, reason: 'last-usable-page' };
  }

  const fallback = ordered.find((candidate) => !candidate.closed);
  if (fallback) {
    return { candidate: fallback, reason: 'last-open-page' };
  }

  return { candidate: null, reason: 'new-page' };
}

export async function rememberPageSelection(page, { reason = 'session-reuse', intentUrl = null } = {}) {
  const wsEndpoint = resolveWsEndpoint();
  if (!wsEndpoint || !page || page.isClosed()) return null;

  const meta = await readPageMeta(page);
  const activePage = {
    url: meta.url || null,
    title: meta.title || '',
    reason,
    updatedAt: Date.now(),
  };

  writeSession({
    wsEndpoint,
    lastIntentUrl: intentUrl || meta.url || null,
    activePage,
  });

  page.__ckPageSelection = {
    selectedUrl: meta.url || null,
    selectedTitle: meta.title || '',
    reason,
    candidateCount: null,
  };

  return page.__ckPageSelection;
}

export async function healthCheckPage(page, { expectedUrl = null, allowAboutBlank = false } = {}) {
  const meta = await readPageMeta(page);
  const blank = meta.url === 'about:blank';
  const urlMatches = expectedUrl ? urlsRoughlyMatch(meta.url, expectedUrl) : true;
  const usable = !meta.closed && (allowAboutBlank || !isIgnorablePageUrl(meta.url));

  return {
    url: meta.url || null,
    title: meta.title || '',
    closed: meta.closed,
    blank,
    usable,
    urlMatches,
    expectedUrl: expectedUrl || null,
  };
}

export async function ensurePageReady(page, { expectedUrl = null, allowAboutBlank = false, action = 'use this page' } = {}) {
  const health = await healthCheckPage(page, { expectedUrl, allowAboutBlank });

  if (health.closed) {
    throw new Error(`Cannot ${action}: selected page is already closed.`);
  }

  if (!allowAboutBlank && health.blank) {
    throw new Error(`Cannot ${action}: selected page is about:blank. Navigate to the target URL first or provide --url.`);
  }

  if (expectedUrl && !health.urlMatches) {
    throw new Error(`Cannot ${action}: selected page URL ${health.url || '(empty)'} does not match expected target ${expectedUrl}.`);
  }

  if (!health.usable) {
    throw new Error(`Cannot ${action}: selected page is not usable for browser verification.`);
  }

  return health;
}

export async function getPage(browser, options = {}) {
  const session = readSession();
  const preferUrl = options.preferUrl || session?.lastIntentUrl || null;

  if (pageInstance && !pageInstance.isClosed()) {
    const existingHealth = await healthCheckPage(pageInstance, { expectedUrl: options.preferUrl, allowAboutBlank: true });
    if (!options.preferUrl || existingHealth.urlMatches || existingHealth.usable) {
      pageInstance.__ckPageSelection = {
        selectedUrl: existingHealth.url,
        selectedTitle: existingHealth.title,
        reason: 'process-cache',
        candidateCount: null,
      };
      return pageInstance;
    }
  }

  const candidates = await listCandidatePages(browser);
  const { candidate, reason } = pickBestPage(candidates, {
    preferUrl,
    lastIntentUrl: session?.activePage?.url || null,
  });

  if (candidate?.page) {
    pageInstance = candidate.page;
  } else {
    pageInstance = await browser.newPage();
  }

  const selectedMeta = await readPageMeta(pageInstance);
  pageInstance.__ckPageSelection = {
    selectedUrl: selectedMeta.url || null,
    selectedTitle: selectedMeta.title || '',
    reason,
    candidateCount: candidates.length,
  };

  return pageInstance;
}

export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    pageInstance = null;
    clearSession();
    log('Browser closed, session cleared');
  }
}

export async function disconnectBrowser() {
  if (browserInstance) {
    browserInstance.disconnect();
    browserInstance = null;
    pageInstance = null;
    log('Disconnected from browser (browser still running)');
  }
}

export function parseArgs(argv, options = {}) {
  const args = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = argv[i + 1];

      if (nextArg && !nextArg.startsWith('--')) {
        args[key] = nextArg;
        i++;
      } else {
        args[key] = true;
      }
    }
  }

  return args;
}

export function outputJSON(data) {
  console.log(JSON.stringify(data, null, 2));
}

export function outputError(error) {
  console.error(JSON.stringify({
    success: false,
    error: error.message,
    stack: error.stack,
  }, null, 2));
  process.exit(1);
}
