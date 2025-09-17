import AbstractService from './AbstractService'
import Logger from '../common/Logger'

export class ModelService extends AbstractService{

    constructor () {
        super()
        this.logger = new Logger('ModelService')
        this.changeListeners = {}
    }

    clearChangeListeners () {
        this.logger.log(1, 'clearChangeListeners', 'enter')
        this.changeListeners = {}
    }

    addChangeListener (topic, listener) {
        this.logger.log(-3, 'addChangeListener', 'enter', topic)
        if (!this.changeListeners[topic]) {
            this.changeListeners[topic] = []
        }
        this.changeListeners[topic].push(listener)
    }

    publishChange(topic, change) {
        this.logger.log(-3, 'publishChange', 'enter', topic, change)
        if (this.changeListeners[topic]) {
            const listeners = this.changeListeners[topic]
            listeners.forEach(l => {
                try {
                    l(change)
                } catch (e) {
                    this.logger.log(-3, 'publishChange', 'ERROR', e)
                }
            })
        }
    }

    createApp (model) {
        this.logger.log(1, 'createApp', 'enter', model)
        return this._post('rest/apps/', model)
    }

    createAppInOrg (model, orgID) {
        this.logger.log(1, 'createApp', 'enter', model)
        return this._post(`rest/apps?orgID=${orgID}`, model)
    }

    updateAppProps (id, change) {
        return this._post(`/rest/apps/props/${id}.json`, change)
    }

    saveApp (model) {
        this.logger.log(1, 'saveApp', 'enter', model)
        return this._post(`/rest/apps/${model.id}.json`, model)
    }

    copyApp (model, newName, orgID = "private") {
        this.logger.warn('copyApp', 'enter', model)
        return this._post(`/rest/apps/copy/${model.id}?orgID=${orgID}`, {"name" : newName})
    }

    updateApp (model, changes) {
        this.logger.log(4, 'updateApp', 'enter', changes)
        return this._post(`/rest/apps/${model.id}/update`, changes)
    }

    deleteApp (model) {
        this.logger.log(-1,'deleteApp', 'enter', model)
        return this._delete(`/rest/apps/${model.id}.json`)
    }

    findPublicSummaries () {
        return this._get('rest/apps/public?summary=true')
    }

    findMyAppSummaries () {
        return this._get('rest/apps/?summary=true')
    }

    findPublic () {
        return this._get('rest/apps/public')
    }

    findMyApps () {
        return this._get('rest/apps/')
    }

    findApp (id) {
        return this._get(`/rest/apps/${id}.json`)
    }

    findAppByHash (hash) {
        return this._get(`/rest/invitation/${hash}/app.json`)
    }

    checkAppUpdateByHash (hash) {
        return this._get(`/rest/invitation/${hash}/update.json`)
    }

    findImages(id) {
        return this._get(`/rest/images/${id}.json`)
    }

    getAnalytics(id) {
        return this._get(`/rest/apps/${id}/analytics.json`)
    }

    saveAnalytics(id, data) {
        return this._post(`/rest/apps/${id}/analytics.json`, data)
    }

    async addAppIntegrations(appId, integration) {
        const app = await this.findApp(appId)
        const integrations = app.integrations || [];
        integrations.push(integration)
        return this._post(`/rest/apps/${appId}/update`, {integrations: JSON.stringify(integrations)})
    }

   

    /**
     * Team
     */
    findTeam (id) {
        return this._get(`/rest/apps/${id}/team.json`)
    }

    findTeamSuggestions (id) {
        return this._get(`/rest/apps/${id}/suggestions/team.json`)
    }

    createTeam (id, user) {
        return this._post(`/rest/apps/${id}/team/`, user)
    }

    updateTeam (id, user) {
        return this._post(`/rest/apps/${id}/team/${user.id}.json`, user)
    }

    deleteTeam (id, user) {
        return this._delete(`/rest/apps/${id}/team/${user.id}.json`)
    }

    resetTeam(id) {
        return this._delete(`/rest/apps/invitation/${id}`)
    }

    /**
     * Events
     */
    saveEvent (id, hash, event) {
        return this._post(`/rest/invitation/${id}/${hash}/events.json`, event)
    }

    findEvents (id) {
        return this._get(`/rest/events/${id}.json?exclude=Animation`)
    }

    findEventsBatch (id) {
        return this._get(`/rest/events/${id}.json?exclude=Animation&batch=true`)
    }

    countEvents (id) {
        return this._get(`/rest/events/${id}/all/count.json`)
    }

    findEventsBySession (id, session) {
        return this._get(`/rest/events/${id}/${session}.json`)
    }

    deleteEventsBySession (id, session) {
        return this._delete(`/rest/events/${id}/${session}.json`)
    }

    /**
     * Mouse
     */
    findMouse (id) {
        return this._get(`/rest/mouse/${id}.json`)
    }

    findMouseBySession (id, session) {
        return this._get(`/rest/mouse/${id}/${session}.json`)
    }

    saveMouse (id, hash, events) {
        return this._post(`/rest/invitation/${id}/${hash}/mouse.json`, events)
    }

    deleteMouseBySession (id, session) {
        return this._delete(`/rest/mouse/${id}/${session}.json`)
    }


    /**
     * Annotations
     */
    findSessionAnnotations (id) {
        if (!id) {
            this.logger.error('findSessionAnnotations', 'error', 'no id passed')
            this.logger.sendError(new Error())
        }
        return this._get(`/rest/annotations/apps/${id}/session.json`)
    }

    findTagAnnotations (id) {
        return this._get(`/rest/annotations/apps/${id}/tags.json`)
    }

    deleteAnnotation (id, annotationId) {
        return this._delete(`/rest/annotations/apps/${id}/${annotationId}.json`)
    }

    saveAnnotation (id, annotation) {
        return this._post(`/rest/annotations/apps/${id}`, annotation)
    }

    updateAnnotation (id, annotation) {
        return this._post(`/rest/annotations/apps/${id}/${annotation.id}.json`, annotation)
    }

    /**
     * Inivitations
     */
    findInvitation (id) {
        return this._get(`/rest/invitation/${id}.json`)
    }

    /**
     * Test
     */
    findTest (id) {
        return this._get(`/rest/test/${id}.json`)
    }

    findTestByHash (app, hash) {
        return this._get(`/rest/invitation/${app.id}/${hash}/test.json`)
    }

    saveTestSettings (id, test) {
        return this._post(`/rest/test/${id}.json`, test)
    }


    /**
     * Examples
     */
    findPublicMouse (id) {
        return this._get(`/examples/mouse/${id}.json`)
    }

    findPublicMouseBySession (appId, sessionId) {
        return this._get(`/examples/mouse/${appId}/${sessionId}.json`)
    }

    findPublicTagAnnotations (id) {
        return this._get(`/examples/annotations/apps/${id}/tags.json`)
    }

    /**
     * Publication Settins
     */
    findPubSettings(id) {
        return this._get(`/rest/apps/${id}/public.json`)
    }

    updatePubSettings (id, settings) {
        return this._post(`/rest/apps/${id}/public.json`, settings)
    }

    /**
     * Secrets
     */
    findSecrets(id) {
        return this._get(`/rest/apps/${id}/secrets.json`)
    }

    findFlowRabbitSecrets() {
        return this._get(`/rest/public/secrets.json`)
    }


    findSecretsByHash(id, hash) {
        return this._get(`/rest/invitation/${id}/${hash}/secrets.json`)
    }

    updateSecrets (id, data) {
        return this._post(`/rest/apps/${id}/secrets.json`, data)
    }

    /**
     * Organizations
     */
    findUserOrganizations (userID) {
        console.error('DEPRECATED: findUserOrganizations() use OrgService')
        return this._get(`/rest/user/${userID}/organizations.json`)
    }
    findOrganization (orgID) {
        console.error('DEPRECATED: findOrganization() use OrgService')
        return this._get(`/rest/organizations/${orgID}.json`)
    }
    findAppsByOrganization (orgID) {
        console.error('DEPRECATED: findAppsByOrganization() use OrgService')
        return this._get(`/rest/organizations/${orgID}/apps.json`)
    }
    findAppsSummaryByOrganization (orgID) {
        console.error('DEPRECATED: findAppsSummaryByOrganization() use OrgService')
        return this._get(`/rest/organizations/${orgID}/apps.json?summary=true`)
    }
    findTeamUsersByOrganization (orgID) {
        console.error('DEPRECATED: findTeamUsersByOrganization() use OrgService')
        return this._get(`/rest/organizations/${orgID}/team.json`)
    }
    inviteUserToOrganization(orgID, data) {
        console.error('DEPRECATED: inviteUserToOrganization() use OrgService')
        return this._post(`/rest/organizations/${orgID}/team/`, data);
    }
    updateOrganizationUser(orgID, userID, data) {
        console.error('DEPRECATED: updateOrganizationUser() use OrgService')
        return this._post(`/rest/organizations/${orgID}/team/${userID}.json`, data);
    }
    /**
     * Folders
     */
    updateFolders(orgID, folders) {
        console.error('DEPRECATED: updateFolders() use OrgService')
        return this._post(`/rest/organizations/${orgID}/folders.json`, folders);
    }
    
    /**
     * Data
     */
    findDataByApp(appID) {
        return this._get(`/rest/apps/${appID}/data.json`)
    }

    updateDataByApp(appID, data) {
        return this._post(`/rest/apps/${appID}/data.json`, data)
    }


}
export default new ModelService()