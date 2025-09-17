// utils/parseURL.js
export function parseURL(str) {
    console.info(`parseURL() > str: ${str}`);
    const url = new URL(str);
    return {
      host: url.origin,
      path: url.pathname + url.search,
    };
  }
  