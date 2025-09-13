import Logger from "../core/Logger";
import JSONPath from "../core/JSONPath";
import RestEngine from "./RestEngine";
import Services from "../../services/Services";

/**
 * Bridge engine for interacting with the Make API.
 */
export default class MakeBridgeEngine {
  /**
   * @param {Object} conf - Configuration object.
   * @param {string} [conf.proxy] - Optional proxy URL.
   */
  constructor(conf) {
    this.proxyURL = conf.proxy || null;
    Logger.log(-12, "MakeBridgeEngine.constructor()", this.proxyURL);
  }

  /**
   * Executes the workflow based on the provided widget configuration.
   *
   * @param {string} appID - Application ID.
   * @param {string} hash - Hash value.
   * @param {Object} widget - Widget configuration.
   * @param {Object} viewModel - The view model data.
   * @param {*} parent - Parent reference.
   * @returns {Promise<null>}
   */
  async run(appID, hash, widget, viewModel, parent) {
    Logger.log(-12, "MakeBridgeEngine.run()", viewModel);
    console.log(parent);

    const userData = Services.getUserService().getUser();
    const { api, databinding } = widget.props || {};
    if (!api) {
      Logger.error("MakeBridgeEngine.run() > no API");
      return null;
    }

    const { instanceableId, token, baseURL, templateID } = api;
    const makeService = Services.getMakeService(hash);
    const appUserData = await makeService.getAppUserData();
    const flow = this.getFlowDataByTemplateId(appUserData, instanceableId);

    switch (api.makeAction) {
      case "init": {
        if (flow && flow.scenarios) {
          const result = await this.executeWorkflow(flow, viewModel, hash, appID, widget, token, baseURL);
          if (databinding?.default) {
            this.setDataBinding(viewModel, result, databinding);
          }
        } else {
          // Use scenarioTeamID if provided; if "new", create a new team
          let teamUsed = api.teamID;
          if (api.scenarioTeamID) {
            if (api.scenarioTeamID === "new") {
              // Create a new team (implementation needed)
              const name = userData.email || userData.id ? `${userData.email}-${userData.id}` : "new team user";
              const newTeam = await this.createTeam({ name: name, organizationId: api.orgID }, token, baseURL, hash, appID);
              teamUsed = newTeam?.team?.id;
              api.scenarioTeamID = teamUsed; // update for later reference
            } else {
              teamUsed = api.scenarioTeamID;
            }
          }
          const template = await this.getTemplateByTemplateId(templateID, token, baseURL, viewModel, hash, appID);
          const body = {
            teamId: teamUsed, // using scenarioTeamId here
            templateId: instanceableId,
            autoActivate: true,
            allowReusingComponents: true,
            scenario: {
              name: `${template?.template?.name?.en}-${userData.id || "user"}`,
            },
          };
          const result = await this.initWorkflow(body, viewModel, hash, appID, token, baseURL);
          if (result && result.publicUrl && result.flow?.id) {
            window.open(result.publicUrl, "_blank");
            await this.saveFlowId(result.flow.id, instanceableId, viewModel, hash, appID, token, baseURL);
            if (databinding?.default) {
              this.setDataBinding(viewModel, result, databinding);
            }
          }
        }
        break;
      }
      case "update": {
        // Expect flow exists and scenario id available
        if (flow && flow.scenarios && flow.scenarios[0]?.id) {
          const scenarioId = flow.scenarios[0].id;
          // Construct new parameters for update – for example, updated blueprint/scheduling
          const updateBody = {
            // ...populate fields to update
            name: `${api.updatedName || "Updated Scenario"}`,
            // Optionally update blueprint, scheduling, etc.
          };
          const result = await this.updateWorkflow(scenarioId, updateBody, viewModel, hash, appID, token, baseURL);
          if (databinding?.default) {
            this.setDataBinding(viewModel, result, databinding);
          }
        } else {
          Logger.error("Cannot update: No existing flow found");
        }
        break;
      }
      case "delete": {
        if (flow && flow.scenarios && flow.scenarios[0]?.id) {
          const scenarioId = flow.scenarios && flow.scenarios[0].id;
          await this.deleteWorkflow(scenarioId, viewModel, hash, appID, token, baseURL);
          const hookId = flow.hooks && flow.hooks[0]?.id;
          if (hookId) await this.deleteHook(hookId, viewModel, hash, appID, token, baseURL);

          const result = await this.removeFlowIdFromUserData(instanceableId, hash);
          if (databinding?.default) {
            this.setDataBinding(viewModel, result, databinding);
          }
        } else {
          Logger.error("Cannot delete: No existing flow found");
        }
        break;
      }
      default:
        Logger.warn("Unknown makeAction; defaulting to init");
        // Optionally default to init action
        break;
    }

    return null;
  }

  /**
   * Sets the data binding value in the view model.
   *
   * @param {Object} viewModel - The view model data.
   * @param {*} value - The value to bind.
   * @param {Object} databinding - Databinding configuration.
   */
  setDataBinding(viewModel, value, databinding) {
    JSONPath.set(viewModel, databinding.default, value);
  }

  /**
   * Retrieves the API body from widget parameters.
   *
   * @param {Object} widget - Widget configuration.
   * @returns {Object|undefined} - API parameters or undefined.
   */
  buildMakeBody(widget) {
    return widget.props?.api?.params || undefined;
  }

  async updateWorkflow(scenarioId, body, viewModel, hash, appID, token, baseURL) {
    const request = {
      method: "PATCH",
      authHeader: "Authorization",
      authType: "Token",
      headers: [{ key: "Content-Type", value: "application/json" }],
      input: {
        type: "JSON",
        template: JSON.stringify(body),
      },
      isProxyEnabled: true,
      url: `https://${baseURL}/api/v2/scenarios/${scenarioId}`,
      token: token,
    };
    const data = this.extractDataBindings(viewModel, request);
    return await RestEngine.run(request, data, hash, appID, true);
  }

  async deleteWorkflow(scenarioId, viewModel, hash, appID, token, baseURL) {
    const request = {
      method: "DELETE",
      authHeader: "Authorization",
      authType: "Token",
      headers: [{ key: "Content-Type", value: "application/json" }],
      input: { type: "JSON" },
      output: {
        databinding: "",
        template: "",
        type: "JSON",
        hints: {},
      },
      isProxyEnabled: true,
      url: `https://${baseURL}/api/v2/scenarios/${scenarioId}`,
      token: token,
    };
    const data = this.extractDataBindings(viewModel, request);
    const result = await RestEngine.run(request, data, hash, appID, true);
    return result;
  }

  async deleteHook(hookId, viewModel, hash, appID, token, baseURL) {
    const request = {
      method: "DELETE",
      authHeader: "Authorization",
      authType: "Token",
      headers: [{ key: "Content-Type", value: "application/json" }],
      input: { type: "JSON" },
      output: {
        databinding: "",
        template: "",
        type: "JSON",
        hints: {},
      },
      isProxyEnabled: true,
      url: `https://${baseURL}/api/v2/hooks/${hookId}`,
      token: token,
    };
    const data = this.extractDataBindings(viewModel, request);
    const result = await RestEngine.run(request, data, hash, appID, true);
    return result;
  }

  async createTeam(teamData, token, baseURL, hash, appID) {
    const request = {
      method: "POST",
      authHeader: "Authorization",
      authType: "Token",
      headers: [{ key: "Content-Type", value: "application/json" }],
      input: {
        type: "JSON",
        template: JSON.stringify(teamData),
      },
      output: {
        databinding: "",
        template: "",
        type: "JSON",
        hints: {},
      },
      isProxyEnabled: true,
      url: `https://${baseURL}/api/v2/teams`,
      token: token,
    };
    return await RestEngine.run(request, {}, hash, appID, true);
  }

  async getTemplateByTemplateId(templateID, token, baseUrl, viewModel, hash, appID) {
    const request = {
      method: "GET",
      authHeader: "Authorization",
      authType: "Token",
      headers: [{ key: "Content-Type", value: "application/json" }],
      output: {
        databinding: "",
        template: "",
        type: "JSON",
        hints: {},
      },
      input: {
        type: "JSON",
        fileDataBinding: "",
      },
      isProxyEnabled: true,
      url: `https://${baseUrl}/api/v2/templates/v2/team/${templateID}`,
      token: token,
    };

    const data = this.extractDataBindings(viewModel, request);
    return await RestEngine.run(request, data, hash, appID, true);
  }

  /**
   * Executes the workflow using the provided flow configuration.
   *
   * @param {Object} flow - Flow configuration.
   * @param {Object} viewModel - The view model data.
   * @param {string} hash - Hash value.
   * @param {string} appID - Application ID.
   * @param {Object} widget - Widget configuration.
   * @param {string} token - Authentication token.
   * @returns {Promise<*>} - Result of the workflow execution.
   */
  async executeWorkflow(flow, viewModel, hash, appID, widget, token, baseURL) {
    let uri = flow?.hooks && flow?.hooks[0]?.uri;
    if (!uri) {
      const scenarioId = flow?.scenarios && flow?.scenarios[0]?.id;
      if (scenarioId) uri = `https://${baseURL}/api/v2/scenarios/${scenarioId}/run`;
    }

    if (uri) {
      const body = this.buildMakeBody(widget);

      const request = {
        method: "POST", // Assuming webhook expects POST
        authHeader: "Authorization",
        authType: "Token",
        headers: [{ key: "Content-Type", value: "application/json" }],
        output: {
          databinding: "",
          template: "",
          type: "JSON",
          hints: {},
        },
        input: {
          type: "JSON",
          fileDataBinding: "",
          template: body ? JSON.stringify(body) : undefined,
        },
        isProxyEnabled: true,
        url: uri,
        token: token,
      };

      const data = this.extractDataBindings(viewModel, request);
      return await RestEngine.run(request, data, hash, appID, true);
    }
    return;
  }

  /**
   * Extracts required data bindings from the view model based on the request configuration.
   *
   * @param {Object} viewModel - The view model data.
   * @param {Object} request - Request configuration.
   * @returns {Object} - Extracted data bindings.
   */
  extractDataBindings(viewModel, request) {
    const requiredBindings = RestEngine.getNeededDataBings(request);
    const data = {};
    requiredBindings.forEach((path) => {
      data[path] = JSONPath.get(viewModel, path);
    });
    return data;
  }

  /**
   * Retrieves flow data based on template ID from the app user data.
   *
   * @param {Object} data - App user data.
   * @param {string} instanceableId - Template ID.
   * @returns {Object|null} - Flow data or null if not found.
   */
  getFlowDataByTemplateId(data, instanceableId) {
    return data?.makeFlows?.[instanceableId] || null;
  }

  async saveFlowId(flowId, instanceableId, viewModel, hash, appID, token, baseUrl) {
    const makeService = Services.getMakeService(hash);
    let appUserData = await makeService.getAppUserData();

    // Save the initial flowId
    appUserData.makeFlows = appUserData.makeFlows || {};
    appUserData.makeFlows[instanceableId] = { flowId };
    await makeService.updateAppUserData(appUserData);

    // Polling logic until flow result is available...
    let isPolling = true;
    const onVisibilityChange = () => {
      if (typeof document !== "undefined") {
        isPolling = document.visibilityState === "visible";
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    let result = null;
    while (!(result && result.flow?.result)) {
      if (isPolling) {
        result = await this.getFlowStatus(flowId, viewModel, hash, appID, token, baseUrl);
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    }

    // Update the stored flow data with the full result
    appUserData = await makeService.getAppUserData(); // refresh in case it changed
    appUserData.makeFlows[instanceableId] = {
      flowId,
      ...result.flow.result,
    };
    await makeService.updateAppUserData(appUserData);

    const scenarioId = result.flow.result?.scenarios[0]?.id;
    await this.activateScenario(scenarioId, token, baseUrl, viewModel, hash, appID);
  }

  // Helper to update stored flow data (used after an update)
  async updateFlowIdInUserData(instanceableId, newFlowData, hash) {
    const makeService = Services.getMakeService(hash);
    const appUserData = await makeService.getAppUserData();
    if (!appUserData.makeFlows) {
      appUserData.makeFlows = {};
    }
    appUserData.makeFlows[instanceableId] = newFlowData;
    await makeService.updateAppUserData(appUserData);
  }

  // Helper to remove stored flow data (used after deletion)
  async removeFlowIdFromUserData(instanceableId, hash) {
    const makeService = Services.getMakeService(hash);
    const appUserData = await makeService.getAppUserData();
    if (appUserData.makeFlows && appUserData.makeFlows[instanceableId]) {
      delete appUserData.makeFlows[instanceableId];
      await makeService.updateAppUserData(appUserData);
    }
  }

  async activateScenario(scenarioId, token, baseUrl, viewModel, hash, appID) {
    const request = {
      method: "POST",
      authHeader: "Authorization",
      authType: "Token",
      headers: [{ key: "Content-Type", value: "application/json" }],
      output: {
        databinding: "",
        template: "",
        type: "JSON",
        hints: {},
      },
      input: {
        type: "JSON",
        fileDataBinding: "",
      },
      isProxyEnabled: true,
      url: `https://${baseUrl}/api/v2/scenarios/${scenarioId}/start`,
      token: token,
    };

    const data = this.extractDataBindings(viewModel, request);
    return await RestEngine.run(request, data, hash, appID, true);
  }

  /**
   * Retrieves the status of the flow.
   *
   * @param {string} flowId - The flow ID.
   * @param {Object} viewModel - The view model data.
   * @param {string} hash - Hash value.
   * @param {string} appID - Application ID.
   * @param {string} token - Authentication token.
   * @param {string} baseUrl - Base URL for API calls.
   * @returns {Promise<*>} - Flow status result.
   */
  async getFlowStatus(flowId, viewModel, hash, appID, token, baseUrl) {
    const request = {
      method: "GET",
      authHeader: "Authorization",
      authType: "Token",
      headers: [{ key: "Content-Type", value: "application/json" }],
      output: {
        databinding: "",
        template: "",
        type: "JSON",
        hints: {},
      },
      input: {
        type: "JSON",
        fileDataBinding: "",
      },
      isProxyEnabled: true,
      url: `https://${baseUrl}/api/v2/instances/flow/${flowId}`,
      token: token,
    };

    const data = this.extractDataBindings(viewModel, request);
    return await RestEngine.run(request, data, hash, appID, true);
  }

  /**
   * Initiates a new workflow.
   *
   * @param {Object} body - Request body.
   * @param {Object} viewModel - The view model data.
   * @param {string} hash - Hash value.
   * @param {string} appID - Application ID.
   * @param {string} token - Authentication token.
   * @param {string} baseUrl - Base URL for API calls.
   * @returns {Promise<*>} - Result of the workflow initiation.
   */
  async initWorkflow(body, viewModel, hash, appID, token, baseUrl) {
    const request = {
      method: "POST",
      authHeader: "Authorization",
      authType: "Token",
      headers: [{ key: "Content-Type", value: "application/json" }],
      output: {
        databinding: "",
        template: "",
        type: "JSON",
        hints: {},
      },
      input: {
        type: "JSON",
        fileDataBinding: "",
        template: JSON.stringify(body),
      },
      isProxyEnabled: true,
      url: `https://${baseUrl}/api/v2/instances/flow/init/template`,
      token: token,
    };

    const data = this.extractDataBindings(viewModel, request);
    return await RestEngine.run(request, data, hash, appID, true);
  }
}
