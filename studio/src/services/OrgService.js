import AbstractService from './AbstractService'
import Logger from '../common/Logger'

export class OrgService extends AbstractService{

    constructor () {
        super()
        this.logger = new Logger('OrgService')
    }

    whoami (orgID) {
        return this._get(`/rest/organizations/${orgID}/whoami.json`)
    }

    findPublishedAppsInOrg (orgID) {
        return this._get(`/rest/organizations/${orgID}/published/apps.json`)
    }
    /**
     * Organizations
     */
    findUserOrganizations (userID) {
        return this._get(`/rest/user/${userID}/organizations.json`)
    }
    findOrganization (orgID) {
        return this._get(`/rest/organizations/${orgID}.json`)
    }
    findAppsByOrganization (orgID) {
        return this._get(`/rest/organizations/${orgID}/apps.json`)
    }
    findAppsSummaryByOrganization (orgID) {
        return this._get(`/rest/organizations/${orgID}/apps.json?summary=true`)
    }
    findTeamUsersByOrganization (orgID) {
        return this._get(`/rest/organizations/${orgID}/team.json`)
    }
    inviteUserToOrganization(orgID, data) {
        return this._post(`/rest/organizations/${orgID}/team/`, data);
    }
    updateOrganizationUser(orgID, userID, data) {
        return this._post(`/rest/organizations/${orgID}/team/${userID}.json`, data);
    }
    deleteOrganizationUser (orgID, userID) {
        return this._delete(`/rest/organizations/${orgID}/team/${userID}.json`)
    }
    updateOrganizationName(orgID, userID, data) {
        return this._post(`/rest/organizations/${orgID}.json`, data);
    }
    /**
     * Folders
     */
    updateFolders(orgID, folders) {
        return this._post(`/rest/organizations/${orgID}/folders.json`, folders);
    }
}
export default new OrgService()