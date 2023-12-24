import {User, UserEdit} from "@/context/AuthContext";
import {getError} from "@/engine/api/Utils";

interface UserInfo {
  token: string,
  id: number,
  login?: string,
  email?: string,
  passwordHash?: number,
  avatarID?: number | null,
}

export async function signInApi(login: string | null, email: string | null, password: string) {
  const userData: {'login'?: string, 'email'?: string, 'password': string} = {password};
  if (login !== null) {
    userData['login'] = login;
  }
  if (email !== null) {
    userData['email'] = email;
  }
  const loginResponse = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  const loginResponseData = await loginResponse.json() as {'result': string, 'message': string};
  if (!loginResponse.ok) {
    return getError(loginResponseData.message, loginResponse);
  }
  const token = loginResponseData.result
  const response = await fetch('/api/user', {
    method: 'GET',
    headers: [['Authorization', `Bearer ${token}`]],
  })
  const responseData = await response.json() as {'result': UserInfo, 'message': string};
  if (response.ok) {
    const info = responseData.result;
    info.token = token
    if (info.login === undefined) {
      info.login = "";
      console.error("got user without login during sign in");
    }
    if (info.email === undefined) {
      info.email = "";
      console.error("got user without e-mail during sign in");
    }
    if (info.avatarID === undefined) {
      info.avatarID = null;
      console.error("got user without avatar id during sign in");
    }
    return {
      'token': info.token,
      'userId': info.id,
      'login': info.login,
      'email': info.email,
      'avatarId': info.avatarID,
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
    return signInApi(info.login, info.email, user.password);
  } else {
    return getError(responseData.message, response);
  }
}

export async function signOutApi(token: string) {
  const response = await fetch('/api/logout', {
    method: 'POST',
    headers: [['Authorization', `Bearer ${token}`]],
  });
  const responseData = await response.json() as {'message': string};
  if (response.ok) {
    return 0;
  } else {
    return getError(responseData.message, response);
  }
}

export async function editApi(userData: UserEdit) {
  const response = await fetch('/api/user/edit/', {
    method: 'POST',
    headers: [['Authorization', `Bearer ${userData.token}`]],
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
    if (info.avatarID === undefined) {
      info.avatarID = null;
      console.error("got user without avatar id during edit");
    }
    return {
      'token': userData.token,
      'userId': info.id,
      'login': info.login,
      'email': info.email,
      'avatarId': info.avatarID,
    };
  } else {
    return getError(responseData.message, response);
  }
}

export async function getAvatar(avatarId: number) {
  const response = await fetch(`/api/pictures/${avatarId}`, {
    method: 'GET',
  });
  const responseData = await response.blob();
  if (response.ok) {
    return responseData;
  } else {
    return getError((await response.json() as {'message': string}).message, response);
  }
}

export async function postAvatar(image: Blob | null, token: string, password: string) {
  let newAvatarId = null;
  if (image !== null) {
    const response = await fetch('/api/pictures', {
      method: 'POST',
      body: image,
    });
    const responseData = await response.json() as {'result': {'id': string}, 'message': string};
    if (!response.ok) {
      return getError(responseData.message, response);
    }
    newAvatarId = parseInt(responseData.result.id);
  }
  const editResponse = await editApi({
    token: token,
    password: password,
    avatarId: newAvatarId,
  });
  if (typeof editResponse === 'string') {
    return editResponse;
  } else {
    return newAvatarId;
  }
}