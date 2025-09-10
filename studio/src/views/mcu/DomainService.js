import Logger from 'common/Logger'
import Services from "services/Services"

export default class DomainService {

    constructor () {
        this.logger = new Logger('DomainService')
        this.logger.log(-1, 'constructor', 'exit')
    }

    async updateDomainOrganization(orgID, host) {
        const domainUrl = Services.getConfig().domain_URL
        const headers = {}
        headers['Content-Type'] = 'application/json'
        headers['Accept'] = 'application/json'
        const request = {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: headers,                    
            redirect: 'follow',
            referrer: 'no-referrer',
            body: JSON.stringify({
                orgID: orgID,
                host: host
            })
        }
        const res = await fetch(domainUrl + '/domain/create-domain', request)
        return res
    }
}
