// utils/parseURL.js
export function parseURL(str) {
    const url = new URL(str);
    return {
      host: url.origin,
      path: url.pathname + url.search,
    };
  }
  