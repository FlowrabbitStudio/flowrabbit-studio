export function getEmailCounts(emails, exclude=[]) {
    let result = {}
    emails.forEach(mail => {
        if (mail) {
            let parts = mail.split('@')
            if (parts.length === 2) {
                let domain = parts[1].toLowerCase()
                if (exclude.indexOf(domain) === -1) {
                    if (!result[domain]) {
                        result[domain] = 0
                    }
                    result[domain] += 1
                }
            }
        }
    });
    return Object.keys(result)
        .map(key => {return {domain: key, value: result[key]}})
        .sort((a,b) => b.value - a.value)
}

export function printDate (ms) {
    var date = new Date(ms);
    return date.toLocaleDateString();
}