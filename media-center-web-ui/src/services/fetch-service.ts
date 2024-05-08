const postJsonInit = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

export const postJson = <TResult>(...args: Parameters<(typeof fetch)>) =>
  (body: object) =>
    fetch(args[0], {
      ...postJsonInit,
      ...args[1],
      body: JSON.stringify(body)
    }).then(r => r.json() as TResult);

export const postJsonOnly = (url: Parameters<(typeof fetch)>[0], body: object) =>
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(r => !r.ok && (() => { throw Error(r.status.toString()) })());

export const getJson = <TResult>(url: Parameters<(typeof fetch)>[0]) =>
  fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  }).then(r => r.json() as TResult);