

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


export const fileSize = (size)=>{
    var cutoff, i, selectedSize, selectedUnit, unit, units, _i, _len;
    selectedSize = 0;
    selectedUnit = "b";
    if (size > 0) {
        units = ['TB', 'GB', 'MB', 'KB', 'b'];
        for (i = _i = 0, _len = units.length; _i < _len; i = ++_i) {
            unit = units[i];
            cutoff = Math.pow(1000, 4 - i) / 10;
            if (size >= cutoff) {
                selectedSize = size / Math.pow(1000, 4 - i);
                selectedUnit = unit;
                break;
            }
        }
        selectedSize = Math.round(10 * selectedSize) / 10;
    }

    return {selectedSize, selectedUnit};
}


export const grabTooBig = () =>{
    var tooBigs = [
        "onii-chan, y-your upload is t-too big...",
        "t-that just won't fit... i-it's too big...",
        "nnn, s-senpai, it's t-too big...",
        "y-you'll tear me in half with that upload s-senpai..."
    ];
    var num = Math.floor( Math.random() * tooBigs.length );
    var str = tooBigs[ num ];
    return str;
}

