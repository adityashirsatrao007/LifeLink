import { NextRequest, NextResponse } from 'next/server';
import Parse from 'parse/node';

// Initialize Parse for server-side usage once
let initialized = false;
function initParse() {
  if (initialized) return;
  const appId = process.env.NEXT_PUBLIC_PARSE_APP_ID as string;
  const jsKey = process.env.NEXT_PUBLIC_PARSE_JS_KEY as string;
  const serverURL = process.env.NEXT_PUBLIC_PARSE_SERVER_URL as string;

  if (!appId || !jsKey || !serverURL) {
    throw new Error('Parse server env vars missing on server (APP_ID/JS_KEY/SERVER_URL)');
  }
  Parse.initialize(appId, jsKey);
  (Parse as any).serverURL = serverURL;
  initialized = true;
}

async function retry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const delays = [0, 500, 1500, 3000];
  let lastErr: any;
  for (let i = 0; i < delays.length; i++) {
    if (delays[i]) await new Promise(r => setTimeout(r, delays[i]));
    try { return await fn(); } catch (e: any) {
      lastErr = e;
      const msg = (e && e.message) || String(e);
      if (!/Bad Gateway|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN/i.test(msg)) break;
    }
  }
  throw lastErr;
}

export async function POST(req: NextRequest) {
  try {
    initParse();
    const body = await req.json();
    const { username, password } = body || {};
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const user = await retry(() => Parse.User.logIn(username, password), 'login');
    const sessionToken = user.getSessionToken();
    const userType = user.get('userType') || null;

    return NextResponse.json({
      ok: true,
      sessionToken,
      user: {
        objectId: user.id,
        username: user.get('username'),
        email: user.get('email') || null,
      },
      userType,
    });
  } catch (error: any) {
    const status = typeof error?.code === 'number' && error.code >= 100 && error.code < 600 ? 502 : 500;
    const message = error?.message || 'Login failed';
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
