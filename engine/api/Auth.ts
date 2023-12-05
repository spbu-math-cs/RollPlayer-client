import {User} from "@/context/AuthContext";
import {getError} from "@/engine/api/Utils";

interface UserInfo {
  id: number,
  login?: string,
  email?: string,
  passwordHash?: number,
}

export async function signInApi(login: string | null, email: string | null, password: string) {
  const userData: {'login'?: string, 'email'?: string, 'password': string} = {password};
  if (login !== null) {
    userData['login'] = login;
  }
  if (email !== null) {
    userData['email'] = email;
  }
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  const responseData = await response.json() as {'result': UserInfo, 'message': string};
  if (response.ok) {
    const info = responseData.result;
    if (info.login === undefined) {
      info.login = "";
      console.error("got user without login during sign in");
    }
    if (info.email === undefined) {
      info.email = "";
      console.error("got user without e-mail during sign in");
    }
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
  const response = await fetch('/api/register', {
    method: 'POST',
    body: JSON.stringify(user),
  });
  const responseData = await response.json() as {'result': UserInfo, 'message': string};
  if (response.ok) {
    const info = responseData.result;
    if (info.login === undefined) {
      info.login = "";
      console.error("got user without login during sign up");
    }
    if (info.email === undefined) {
      info.email = "";
      console.error("got user without e-mail during sign up");
    }
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
  const response = await fetch('/api/logout', {
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
  const response = await fetch(`/api/edit/${userId}`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  const responseData = await response.json() as {'result': UserInfo, 'message': string};
  if (response.ok) {
    const info = responseData.result;
    if (info.login === undefined) {
      info.login = "";
      console.error("got user without login during edit");
    }
    if (info.email === undefined) {
      info.email = "";
      console.error("got user without e-mail during edit");
    }
    return {
      'userId': info.id,
      'login': info.login,
      'email': info.email,
    };
  } else {
    return getError(responseData.message, response);
  }
}