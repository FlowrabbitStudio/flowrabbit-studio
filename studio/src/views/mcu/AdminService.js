import AbstractService from "services/AbstractService";
import Logger from "common/Logger";

export default class AdminService extends AbstractService {
  constructor() {
    super();
    this.logger = new Logger("AdminService");
    this.logger.log(-1, "constructor", "exit");
  }

  getAllUsers() {
    this.logger.log(-1, "getAllUsers", "enter");
    return this._get("/rest/admin/users.json");
  }

  getUser(userID) {
    this.logger.log(-1, "getUser", "enter", userID);
    return this._get(`/rest/admin/users/${userID}.json`);
  }

  getTeamByApp(appID) {
    return this._get(`/rest/admin/team/${appID}.json`);
  }

  deleteUser(userID) {
    this.logger.log(-1, "deleteUser", "enter", userID);
    return this._delete(`/rest/admin/users/${userID}.json`);
  }

  getOverview() {
    return this._get("/rest/admin/overview.json");
  }

  getIndexes() {
    return this._get("/rest/admin/index/all.json");
  }

  updateIndexes() {
    return this._post("/rest/admin/index/update.json", {});
  }

  createOrg(org) {
    return this._post(`/rest/admin/organizations/`, org);
  }

  getOrg(id) {
    return this._get(`/rest/admin/organizations/${id}.json`);
  }

  getOrgTeam(orgID) {
    return this._get(`/rest/admin/organizations/${orgID}/team.json`);
  }

  addOrgTeamMember(orgID, email, permission) {
    return this._post(`/rest/admin/organizations/${orgID}/team/`, {
      email: email,
      permission: permission || 1,
    });
  }

  updateOrgTeamMember(orgID, userID, permission) {
    return this._post(
      `/rest/admin/organizations/${orgID}/team/${userID}.json`,
      { permission: permission }
    );
  }

  removeOrgTeamMember(orgID, userID) {
    return this._delete(
      `/rest/admin/organizations/${orgID}/team/${userID}.json`
    );
  }

  getAllOrgs() {
    return this._get("/rest/admin/organizations.json");
  }


  findOrgs(offset= 0, limit=30, sortBy='', order=1, queryKey, queryValue) {
    let query = ''
    let sort = ''
    if (queryKey && queryValue) {
      query = `&${queryKey}=${queryValue}`
    }
    if (sortBy) {
      sort =`&sortBy=${sortBy}&order=${order}`
    }
    return this._get(`/rest/admin/organizations/paging/all.json?offset=${offset}&limit=${limit}${sort}${query}`);
  }

  deleteOrg(orgID) {
    return this._delete(`/rest/admin/organizations/${orgID}.json`);
  }

  updateOrg(org) {
    return this._post(`/rest/admin/organizations/${org.id}.json`, org);
  }

  getPerformance() {
    return this._get("/rest/admin/performance.json");
  }

  getMetrics() {
    return this._get("/rest/admin/metrics.json");
  }

  getNotifications() {
    return this._get("/rest/admin/notification.json");
  }

  createNotifications(notification) {
    return this._post("/rest/admin/notification.json", notification);
  }

  updateNotifications(notification) {
    return this._post(
      `/rest/admin/notification/${notification.id}.json`,
      notification
    );
  }

  deleteNotifications(notification) {
    return this._delete(`/rest/admin/notification/${notification.id}.json`);
  }

  getAllApps() {
    return this._get(`/rest/admin/apps.json`);
  }

  deleteErrorLogs() {
    return this._delete(`/rest/admin/logs.json`);
  }

  getAllErrorLogs(from, to, type) {
    if (type) {
      return this._get(
        `/rest/admin/logs.json?from=${from}&to=${to}&type=${type}`
      );
    } else {
      return this._get(`/rest/admin/logs.json?from=${from}&to=${to}`);
    }
  }

  getAllAppEvents(from, to, type) {
    if (type) {
      return this._get(
        `/rest/admin/event.json?from=${from}&to=${to}&type=${type}`
      );
    } else {
      return this._get(`/rest/admin/event.json?from=${from}&to=${to}`);
    }
  }

  getAnalyticEvents(from, to, type) {
    if (type) {
      return this._get(
        `/rest/admin/analytics/all.json?from=${from}&to=${to}&type=${type}`
      );
    } else {
      return this._get(`/rest/admin/analytics/all.json?from=${from}&to=${to}`);
    }
  }

  deleteAnalyticEvents() {
    this._delete("/rest/admin/analytics/all.json");
  }

  getAnalyticEventSummary(from, to, orgID, timespan = "day") {
    return this._get(
      `/rest/admin/analytics/summary/${timespan}.json?from=${from}&to=${to}&org=${orgID}`
    );
  }

  getRequests() {
    return this._get("/rest/admin/requests.json");
  }

  getTeamByAppId(appId) {
    return this._get(`/rest/admin/team/${appId}.json`);
  }

  backupUsers() {
    return this._get("/rest/backup/user.json");
  }

  restoreBackup(appID) {
    this.logger.log(-1, "restoreBackup", "enter", appID);
    return this._get(`/rest/restore/${appID}.json`);
  }

  updateUser(userId, update) {
    return this._post("/rest/admin/users/" + userId, update);
  }

  getAllPublications() {
    return this._get("/rest/admin/publications.json");
  }

  getAllSecrets() {
    return this._get("/rest/admin/secrets.json");
  }

  createSecret(secret) {
    return this._post("/rest/admin/secrets/", secret);
  }

  deleteSecret(id) {
    return this._delete("/rest/admin/secrets/" + id + ".json");
  }

  updateSecret(secret) {
    return this._post("/rest/admin/secrets/" + secret.id + ".json", secret);
  }

  /**** Purchase ****/

  findPurchaseApps(model) {
    this.logger.log(1, "createApp", "enter", model);
    return this._get("/rest/admin/purchases.json", model);
  }

  getPurchase(purchaseId) {
    this.logger.log(1, "getPurchase", "eFnter", purchaseId);
    return this._get(`/rest/admin/purchases/${purchaseId}.json`);
  }

  updatePurchase(purchaseId) {
    this.logger.log(1, "updatePurchase", "enter", purchaseId);
    return this._post(`/rest/admin/purchases/${purchaseId}.json`);
  }

  deletePurchase(purchaseId) {
    this.logger.log(1, "deletePurchase", "enter", purchaseId);
    return this._delete(`/rest/admin/purchases/${purchaseId}.json`);
  }



  findPrepaidBudget(offset= 0, limit=30, sortBy='', order=1, queryKey, queryValue) {
    let query = ''
    let sort = ''
    if (queryKey && queryValue) {
      query = `&${queryKey}=${queryValue}`
    }
    if (sortBy) {
      sort =`&sortBy=${sortBy}&order=${order}`
    }
    return this._get(`/rest/admin/prepaid.json?offset=${offset}&limit=${limit}${sort}${query}`);
  }

  getPrepaidBudget(prepaidBudgetID) {
    return this._get(`/rest/admin/prepaid/${prepaidBudgetID}.json`);
  }

  updatePrepaidBudget(prepaidBudgetID, update) {
    return this._post(`/rest/admin/prepaid/${prepaidBudgetID}.json`, update);
  }



  findPromoCodes() {
    return this._get(`/rest/admin/promo.json`);
  }

  createPromoCode(promo) {
    return this._post(`/rest/admin/promo/`, promo);
  }

  updatePromoCode(promo) {
    return this._post(`/rest/admin/promo/${promo.id}.json`, promo);
  }

  deletePromoCode(id) {
    return this._delete(`/rest/admin/promo/${id}.json`);
  }



  findPlans() {
    return this._get(`/rest/admin/plan.json`);
  }

  createPlan(promo) {
    return this._post(`/rest/admin/plan/`, promo);
  }

  updatePlan(plan) {
    return this._post(`/rest/admin/plan/${plan.id}.json`, plan);
  }

  deletePlan(id) {
    return this._delete(`/rest/admin/plan/${id}.json`);
  }

  getLog(lines = 1000) {
    return this._get(`/rest/admin/log/last.json?lines=${lines}`);
  }


  /**
   * Ai Models
   */

  createAiModel(model) {
    return this._post(`/rest/admin/ai/model/`, model);
  }

  updateAiModel(model) {
    return this._post(`/rest/admin/ai/model/${model.id}.json`, model);
  }

  deleteAiModel(id) {
    return this._delete(`/rest/admin/ai/model/${id}.json`);
  }

  findAllAiModels() {
    return this._get(`/rest/admin/ai/model/all.json`);
  }



  // deletePurchase(prepaidBudgetID) {
  //   return this._delete(`/rest/admin/prepaid/${prepaidBudgetID}.json`);
  // }

}
