import {User} from "@/context/AuthContext";

const API_BASE_ADDR = "http://127.0.0.1:9999"

export async function signInApi(login: string | null, email: string | null, password: string) {
  const userData = {login, email, password};
  const response = await fetch(`${API_BASE_ADDR}/api/login`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  const responseData = await response.json() as {'userId': number, 'message': string};
  if (!response.ok) {
    return responseData['userId'];
  } else {
    return `Error ${response.status}: ${response.statusText}, ${responseData['message']}`;
  }
}

export async function signUpApi(user: User) {
  const response = await fetch(`${API_BASE_ADDR}/api/register`, {
    method: 'POST',
    body: JSON.stringify(user),
  });
  const responseData = await response.json() as {'message': string};
  if (response.ok) {
    return parseInt(responseData['message'].split(" ")[1]); // message == "User $id registered successfully"
  } else {
    return `Error ${response.status}: ${response.statusText}, ${responseData['message']}`;
  }
}

export async function signOutApi(userId: number, sessionId: number | null) {
  const response = await fetch(`${API_BASE_ADDR}/api/logout`, {
    method: 'POST',
    body: JSON.stringify({userId, sessionId}),
  });
  const responseData = await response.json() as {'message': string};
  if (response.ok) {
    return 0;
  } else {
    return `Error ${response.status}: ${response.statusText}, ${responseData['message']}`;
  }
}

export async function editApi(userId: number, userData: User) {
  const response = await fetch(`${API_BASE_ADDR}api/logout/${userId}`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  const responseData = await response.json() as {'message': string};
  if (response.ok) {
    return 0;
  } else {
    return `Error ${response.status}: ${response.statusText}, ${responseData['message']}`;
  }
}