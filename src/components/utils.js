export const querySearch = (search = window.location.search) => {
    if (!search) return {}
    const queryString = search[0] === '?' ? search.substring(1) : search
    const query = {}
    queryString
        .split('&')
        .forEach(queryStr => {
            const [key, value] = queryStr.split('=')
            /* istanbul ignore else */
            if (key) query[decodeURIComponent(key)] = decodeURIComponent(value)
        })

    return query
}

export const queryStringify = query => {
    const queryString = Object.keys(query)
        .map(key => `${key}=${encodeURIComponent(query[key] || '')}`)
        .join('&')
    return queryString
}
