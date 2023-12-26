export function getError(message: string, response: Response) {
  return `Error ${response.status}: ${response.statusText}, ${message}`;
}