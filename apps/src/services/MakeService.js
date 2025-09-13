import AbstractService from "./AbstractService";

export class MakeService extends AbstractService {
  constructor() {
    super();
    this.errorAsJSON = true;
  }
  
  updateAppUserData(data) {
    return this._post(`/rest/data/user/app.json`, data)
  }
  getAppUserData() {
    return this._get(`/rest/data/user/app.json`)
  }
}
export default new MakeService();
