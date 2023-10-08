export async function signInApi(username: string, password: string) {
  const userData = {name: username, password}
  const response = await fetch('/api/signin', {
    method: 'POST',
    body: JSON.stringify(userData)
  })
  if (response.ok) {
    return response.json();
  } else {
    throw response.statusText
  }
}

export async function signUpApi(user: Object) {
  const response = await fetch('/api/signup', {
    method: 'POST',
    body: JSON.stringify(user)
  })

}

export async function signOutApi(user: Object) {
  const response = await fetch('/api/signout', {
    method: 'POST',
    body: JSON.stringify(user)
  })
}