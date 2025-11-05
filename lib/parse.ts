// lib/parse.ts - Parse Server Initialization
import Parse from "parse";

// Initialize Parse SDK (client-side only)
if (typeof window !== 'undefined') {
  const appId = process.env.NEXT_PUBLIC_PARSE_APP_ID;
  const jsKey = process.env.NEXT_PUBLIC_PARSE_JS_KEY;
  const serverURL = process.env.NEXT_PUBLIC_PARSE_SERVER_URL;

  if (!appId || !jsKey || !serverURL) {
    console.error('Parse configuration missing:', { appId: !!appId, jsKey: !!jsKey, serverURL: !!serverURL });
    throw new Error('Parse environment variables are not configured');
  }

  Parse.initialize(appId, jsKey);
  Parse.serverURL = serverURL;
  
  console.log('Parse initialized with server:', serverURL);
}

export default Parse;
