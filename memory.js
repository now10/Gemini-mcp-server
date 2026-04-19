const conversations = {};

export function getHistory(sessionId) {
  return conversations[sessionId] || [];
}

export function saveMessage(sessionId, message) {
  if (!conversations[sessionId]) {
    conversations[sessionId] = [];
  }

  conversations[sessionId].push(message);
}
