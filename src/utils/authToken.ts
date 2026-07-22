let sitToken: string | null = null

export function setSitToken(token: string) {
  sitToken = token
}

export function getSitToken() {
  return sitToken
}

export function clearSitToken() {
  sitToken = null
}
