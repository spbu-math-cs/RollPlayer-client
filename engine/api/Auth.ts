import {User} from "@/context/AuthContext";
import {getError} from "@/engine/api/Utils";

const API_BASE_ADDR = "http://127.0.0.1:9999";

interface UserInfo {
  id: number,
  login?: string,
  email?: string,
  passwordHash?: number,
}

export async function signInApi(login: string | null, email: string | null, password: string) {
  const userData = {login, email, password};
  const response = await fetch(`${API_BASE_ADDR}/api/login`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  const responseData = await response.json() as {'userInfo': string, 'message': string};
  if (response.ok) {
    const info: UserInfo = JSON.parse(responseData.userInfo);
    return {
      'userId': info.id,
      'login': info.login,
      'email': info.email,
    };
  } else {
    return getError(responseData.message, response);
  }
}

export async function signUpApi(user: User) {
  const response = await fetch(`${API_BASE_ADDR}/api/register`, {
    method: 'POST',
    body: JSON.stringify(user),
  });
  const responseData = await response.json() as {'userInfo': string, 'message': string};
  if (response.ok) {
    const info: UserInfo = JSON.parse(responseData.userInfo);
    return {
      'userId': info.id,
      'login': info.login,
      'email': info.email,
    };
  } else {
    return getError(responseData.message, response);
  }
}

export async function signOutApi(userId: number) {
  const response = await fetch(`${API_BASE_ADDR}/api/logout`, {
    method: 'POST',
    body: JSON.stringify({userId}),
  });
  const responseData = await response.json() as {'message': string};
  if (response.ok) {
    return 0;
  } else {
    return getError(responseData.message, response);
  }
}

export async function editApi(userId: number, userData: User) {
  const response = await fetch(`${API_BASE_ADDR}api/logout/${userId}`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  const responseData = await response.json() as {'userInfo': string, 'message': string};
  if (response.ok) {
    const info: UserInfo = JSON.parse(responseData.userInfo);
    return {
      'userId': info.id,
      'login': info.login,
      'email': info.email,
    };
  } else {
    return getError(responseData.message, response);
  }
}