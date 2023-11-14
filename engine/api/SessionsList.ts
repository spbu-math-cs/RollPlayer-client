export interface SessionInfo {
  sessionId: number,
}

export async function getSessions(userId: number) {
  const response = await fetch(`/api/${userId}/sessions`, {
    method: 'POST',
    body: JSON.stringify(userId),
  });
  const responseData = await response.json() as {'sessions': string, 'message': string};
  if (response.ok) {
    const sessions: SessionInfo[] = JSON.parse(responseData.sessions)
    return sessions;
  } else {
    return getError(responseData.message, response)
  }
}