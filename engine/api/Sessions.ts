import {getError} from "@/engine/api/Utils";

export interface SessionInfo {
  id: number,
  mapId?: number,
  active?: boolean,
}

export async function getSessions(userId: number) {
  //const response = await fetch(`/api/${userId}/sessions`, {
  const response = await fetch(`/api/all/sessions`, {
    method: 'GET',
  });
  const responseData = await response.json() as {'result': SessionInfo[]};
  console.log(responseData)
  if (response.ok) {
    return responseData.result;
  } else {
    return getError('Could not get sessions', response);
  }
}

export async function createSession(mapId: number) {
  const response = await fetch(`/api/game/create?mapId=${mapId}`, {
    method: 'POST',
  });
  const responseData = await response.json() as {'result': SessionInfo, 'message': string};
  console.log(responseData)
  if (response.ok) {
    return responseData.result;
  } else {
    return getError(responseData.message, response);
  }
}
