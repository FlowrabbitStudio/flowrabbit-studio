import AbstractService from "./AbstractService";

export class ModelService extends AbstractService {
  constructor() {
    super();
    this.errorAsJSON = true;
  }

  getPubSettings(orgName, appName, domain, password) {
    const url = domain ? `/rest/public/default/${appName}.json?domain=${domain}` : `/rest/public/${orgName}/${appName}.json`;
    if (password) {
      return this._getWidthHeader(url, "x-flowrabbit-pwd", password);
    } else {
      return this._get(url);
    }
  }
}
export default new ModelService();
