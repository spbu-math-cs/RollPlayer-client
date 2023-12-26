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
  if (response.ok) {
    return responseData.result.toSorted((a, b) => a.id - b.id);
  } else {
    return getError('Could not get maps', response);
  }
}
