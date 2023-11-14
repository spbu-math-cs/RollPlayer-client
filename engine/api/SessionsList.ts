import {getError} from "@/engine/api/Utils";

export interface SessionInfo {
  sessionId: number,
}

export async function getSessions(userId: number) {
  const response = await fetch(`/api/${userId}/sessions`, {
    method: 'GET',
  });
  const responseData = await response.text();
  console.log(responseData)
  if (response.ok) {
    const sessions: SessionInfo[] = JSON.parse(responseData)
    return sessions;
  } else {
    return getError('Could not get sessions', response)
  }
}