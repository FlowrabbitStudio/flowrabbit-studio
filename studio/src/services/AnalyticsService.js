class AnalyticsService {

    constructor () {
        this.serverURL = ""
    }

    log(screen, org='', type='view', version='a') {
        let event = {
            screen: screen,
            org: org,
            type: type,
            version:version,
            domain: 'flowrabbit.ai',
            localCreated:new Date().toISOString
        }
        fetch(this.serverURL + '/rest/analytics', {
            method: 'post',
            credentials: "same-origin",
            body: JSON.stringify(event)
        })
    }

}
export default new AnalyticsService()