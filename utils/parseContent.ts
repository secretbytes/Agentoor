export function isJsonString(str: string) {
    try {
      const result = JSON.parse(str);
      return typeof result === 'object' && result !== null;
    } catch (e) {
      return false;
    }
  }
  
  export function parseMessageContent(content: string) {
    if (isJsonString(content)) {
      return JSON.parse(content);
    }
    return null;
  }
  
  