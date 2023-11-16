import {getError} from "@/engine/api/Utils";

const API_BASE_ADDR = "http://127.0.0.1:9999";

export interface SessionInfo {
  sessionId: number,
}

export async function getSessions(userId: number) {
  const response = await fetch(`${API_BASE_ADDR}/api/sessions`, {
    method: 'GET',
  });
  const responseData = await response.text();
  // console.log(responseData)
  if (response.ok) {
    const sessions: SessionInfo[] = JSON.parse(responseData)
    return sessions;
  } else {
    return getError('Could not get sessions', response)
  }
}