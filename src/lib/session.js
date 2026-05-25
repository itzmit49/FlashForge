export function getSessionId() {
  if (typeof window === 'undefined') return null;
  
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("sessionId", sessionId);
  }
  
  return sessionId;
}
