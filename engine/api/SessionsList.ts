export interface SessionInfo {
  sessionId: number,
}

export async function getSessions(userId: number) {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(userId),
  });
  const responseData = await response.json() as {'sessions': SessionInfo[], 'message': string};
  if (response.ok) {
    return responseData.sessions;
  } else {
    return getError(responseData.message, response)
  }
}