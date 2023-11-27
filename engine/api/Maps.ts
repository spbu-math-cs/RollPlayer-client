import {getError} from "@/engine/api/Utils";

export interface MapInfo {
  id: number,
  filepath: string,
}

export async function getMaps() {
  const response = await fetch('/api/maps', {
    method: 'GET',
  });
  const responseData = await response.json() as {'result': MapInfo[]};
  console.log(responseData)
  if (response.ok) {
    return responseData.result;
  } else {
    return getError('Could not get maps', response);
  }
}
