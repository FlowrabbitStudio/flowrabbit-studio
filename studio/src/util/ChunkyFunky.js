export function chunk(txt, maxChunkSize){

    const words = txt.split(" ");
    const result = [];
    let temp = '';

    for (let i=0; i < words.length; i++) {
        const word = words[i]
        if ((temp.length + word.length) > maxChunkSize) {
            result.push(temp);
            temp = '';
        } 
        temp += (temp.length ? ' ': '') + word
    }
    if (temp.length) {
        result.push(temp);
    }

    return result;
}

