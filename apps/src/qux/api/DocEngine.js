import Logger from "../core/Logger";
import Services from "../../services/Services";
import RestUtil from "../../util/RestUtil";
class DocEngine {
  constructor() {
    this.nodeURL = Services.getConfig().node_URL;
    //this.nodeURL = "http://localhost:8088";
  }

  runParser(config, data, hash, appID) {
    Logger.log(-1, "DocEngine.run()", hash, appID);
    return this.parseDocuments(config, data, hash, appID);
  }
  async parseDocuments(config, data, hash, appID) {
    Logger.log(1, "DocEngine.parseDocuments()", "enter >");
    return new Promise(async (resolve, reject) => {
      const fileDataBinding = config.input?.fileDataBinding;
      const files = data[fileDataBinding];
      if (files) {
        const configData = {
          file: data[fileDataBinding],
          ...config,
        };
        const formData = await this.buildFormData(configData);
        const header = await RestUtil.createDefaultHeader(
          configData,
          hash,
          appID,
          data
        );
        fetch(`${Services.getConfig().node_URL}` + "/doc-to-text", {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: header,
          redirect: "follow",
          referrer: "no-referrer",
          body: formData,
        })
          .then((response) => {
            response.json().then((data) => resolve(data.text));
          })
          .catch((e) => {
            reject(e);
          });
      } else {
        resolve("");
      }
    });
  }

  runTextToDoc(configData, data, hash, appID) {
    Logger.log(-1, "DocEngine.run()", hash, appID);
    return this.parseTextToDoc(configData, data, hash, appID);
  }

  async parseTextToDoc(config, data, hash, appID) {
    Logger.log(1, "DocEngine.parseDocument()", "enter >");
    return new Promise(async (resolve, reject) => {
      const databinding = config.input?.databinding;
      const configData = {
        valuestr: data[databinding],
        ...config,
      };
      const formData = await this.buildFormData(configData);
      const header = await RestUtil.createDefaultHeader(
        configData,
        hash,
        appID,
        data
      );
      fetch(`${Services.getConfig().node_URL}` + "/text-to-doc", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: header,
        redirect: "follow",
        referrer: "no-referrer",
        body: formData,
      })
        .then((response) => response.blob())
        .then((blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          const format = configData.output.format;
          let urlWithDocxExtension;
          if (format === "docx") {
            urlWithDocxExtension = `${blobUrl}#output.docx`;
          }
          if (format === "csv") {
            urlWithDocxExtension = `${blobUrl}#output.csv`;
          } else if (format === "excel") {
            urlWithDocxExtension = `${blobUrl}#output.xlsx`;
          } else if (format === "pdf") {
            urlWithDocxExtension = `${blobUrl}#output.pdf`;
          }
          resolve(urlWithDocxExtension);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
  async buildFormData(configData) {
    const formData = new FormData();
    if (configData.input.type === "file") {
      const file = configData.file;
      formData.append("doc", file);
    } else if (configData.input.type === "url") {
      formData.append("url", configData.input.url);
    } else if (configData.input.type === "markdown") {
      const content =
        typeof configData.valuestr === "object"
          ? JSON.stringify(configData.valuestr)
          : configData.valuestr;
      formData.append("doc", content);
      formData.append("format", configData.output.format);
    }
    return formData;
  }

  handleOutput(resolve, reject, response) {
    if (response.ok) {
      response.json().then((data) => {
        resolve(data);
      });
      return;
    }
    reject(new Error(`Could not process the document: ${response.statusText}`));
  }
}
export default new DocEngine();
