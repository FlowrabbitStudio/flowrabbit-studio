import Logger from '../common/Logger'
import AbstractService from './AbstractService'

class PreviewService extends AbstractService {

  constructor () {
    super()
    this.logger = new Logger('PreviewService')
  }

  delete (appID, image) {
    return this._delete("/rest/store/previews/" + appID+ "/" + image)
  }

  upload (appID, formData, progressHandler) {
    this.logger.log(-1, "upload", "enter");
    const url = '/rest/store/previews/' + appID;
    return new Promise((resolve, reject) => {
    	// now post a new XHR request
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);

      if (progressHandler) {
        xhr.onprogress = progressHandler
      }

      if (this.token) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
      } else {
        this.logger.error("_sendSingleFile", "No token");
      }
      xhr.onload = function () {
          if (xhr.status === 200) {
            resolve(JSON.parse(this.response));
          } else {
            reject(this.response);
          }
      };
      xhr.send(formData);
    })
  }
}



export default new PreviewService()