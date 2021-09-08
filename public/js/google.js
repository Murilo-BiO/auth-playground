const state = {
  instance: null,
  loaded: false
}

export const loadGoogleIdentityService = async () => {
  if (state.loaded)
    return state.instance

  const onLoadHandler = (res, rej) => () => {
    if (!window.google || state.loaded)
      return rej({ google: window.google, state })

    state.instance = window.google
    state.loaded = true
    res(state.instance)
  }

  return await new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = onLoadHandler(resolve, reject)
    script.async = true
    script.id = 'google-identity-service-script'
    document.body.appendChild(script)
  })
}
