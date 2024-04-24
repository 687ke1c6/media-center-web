
export const postJson = <TResult>(url: Parameters<(typeof fetch)>[0], body: object) =>
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(r => r.json() as TResult);

export const getJson = <TResult>(url: Parameters<(typeof fetch)>[0]) =>
    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    }).then(r => r.json() as TResult);