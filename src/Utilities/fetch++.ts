/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from 'Utilities/config'
import { getToken } from './pharaoh'

export class FetchError extends Error {
  constructor(msg: string, rsp: Response, json: any) {
    super(msg)
    this.response = rsp
    this.json = json
    Object.setPrototypeOf(this, FetchError.prototype) // https://stackoverflow.com/a/41429145/6444
  }

  response: Response
  json: any
}

async function go(url: RequestInfo, obj: any) {
  // cache setting for IE11
  const rsp = await fetch(url, { ...obj, cache: 'no-cache' })
  if (rsp.ok) {
    const contentType = ((rsp.headers.get('Content-Type') || '').split(';')[0] || '').trim()
    if (contentType === 'application/json') {
      return rsp.json()
    } else {
      return rsp
    }
  } else {
    let json = null
    try {
      json = await rsp.json()
    } catch {
      json = { error: true, reason: 'Unknown Error (no JSON response)' }
    }
    throw new FetchError(rsp.statusText, rsp, json)
  }
}

const makeHeaders = (label: config.Label | null = null, overrideHeaders?: Headers) => {
  const headers = new Headers()
  headers.set('Accept', 'application/json')
  headers.set('Content-Type', 'application/json')
  headers.set('X-Ra-Referrer', window.location.href) // https://developers.google.com/web/updates/2020/07/referrer-policy-new-chrome-default
  if (process.env.REACT_APP_BASENAME) {
    headers.set('X-Ra-Basename', process.env.REACT_APP_BASENAME)
  }
  if (window.location.pathname.startsWith('/shop')) {
    // ^^ strictly check is not sufficient due to REACT_APP_BASENAME
    // but this is a quick hack for COMAHC launch, prod sites never have BASENAME
    headers.set('X-Ra-Slug', localStorage.slug || window.location.pathname.split('/')[2])
  }
  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const labelOverride = localStorage.label || label

  if (labelOverride) {
    headers.set('X-Ra-White-Label', labelOverride)
  }
  if (overrideHeaders) {
    overrideHeaders.forEach((v, k) => (headers.set(k, v)))
  }
  return headers
}

async function get(path: string, label?: config.Label, headers?: Headers) {
  const defaultHeaders = makeHeaders(label, headers)
  return go(`${config.pharaoh(path)}${path}`, { headers: defaultHeaders })
}

async function delete_(path: string) {
  const headers = makeHeaders()
  return go(`${config.pharaoh(path)}${path}`, { headers: headers, method: 'DELETE' })
}

async function put(path: string, data: any = null, headers?: Headers) {
  const defaultHeaders = makeHeaders(null, headers)
  return go(`${config.pharaoh(path)}${path}`, {
    method: 'PUT',
    headers: defaultHeaders,
    body: JSON.stringify(data)
  })
}

async function upload(path: string, file: File, auth = true) {
  const formData = new FormData()
  formData.append('file', file)
  return post(path, formData, auth)
}

async function post(path: string, data: any = null, auth = true, label: config.Label | null = null, headers?: Headers) {
  const defaultHeaders = makeHeaders(label, headers)
  if (!auth) {
    defaultHeaders.delete('Authorization')
  }

  if (data instanceof FormData) {
    // pharaoh seems to default to formdata
    defaultHeaders.delete('Content-Type')
  } else if (data) {
    data = JSON.stringify(data)
  }

  return go(`${config.pharaoh(path)}${path}`, {
    method: 'POST',
    cache: 'no-cache',
    headers: defaultHeaders,
    body: data
  })
}

export async function stream(path: string, fileType: string) {
  return get(path)
    .then(res => {
      const reader = res.body.getReader()
      return new ReadableStream({
        start(controller) {
          return pump()
          function pump() {
            return reader.read().then(({ done, value }: { done: boolean, value: any }) => {
              if (done) {
                controller.close()
                return
              }
              controller.enqueue(value)
              return pump()
            })
          }
        }
      })
    })
    .then(stream => new Response(stream).blob())
    .then(blob => URL.createObjectURL(blob.slice(0, blob.size, fileType)))
}

export { get, put, post, delete_, upload }
