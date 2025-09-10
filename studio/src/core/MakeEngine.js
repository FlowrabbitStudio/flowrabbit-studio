import Services from "../services/Services";
import RestEngine from "./RestEngine";

class MakeEngine {
  constructor() {
    // Adjust as needed; if you still need a baseURL default, keep it here.
    this.proxyURL = `${Services.getConfig().proxy_URL}/proxy`;
  }

  /**
   * 1) Get Organizations
   *    Equivalent of loadOrgs()
   */
  async getOrganizations(baseURL, token, hash, appID) {
    const request = {
      url: `https://${baseURL}/api/v2/organizations`,
      method: "GET",
      authType: "Token",
      token: token,
      headers: [{ key: "Content-Type", value: "application/json" }],
      input: { type: "JSON" },
      output: { type: "JSON" },
    };

    const response = await RestEngine.run(request, {}, hash, appID, true);
    return response.organizations; // from { organizations: [...] }
  }

  /**
   * 2) Get Teams
   *    Equivalent of loadTeam()
   */
  async getTeams(baseURL, orgID, token, hash, appID) {
    const request = {
      url: `https://${baseURL}/api/v2/teams?organizationId=${orgID}`,
      method: "GET",
      authType: "Token",
      token: token,
      headers: [{ key: "Content-Type", value: "application/json" }],
      input: { type: "JSON" },
      output: { type: "JSON" },
    };

    const response = await RestEngine.run(request, {}, hash, appID, true);
    return response.teams; // from { teams: [...] }
  }

  /**
   * 3) Get Hooks
   *    Equivalent of loadHooks()
   */
  async getHooks(baseURL, orgID, teamID, token, hash, appID) {
    const request = {
      url: `https://${baseURL}/api/v2/hooks?organizationId=${orgID}&teamId=${teamID}`,
      method: "GET",
      authType: "Token",
      token: token,
      headers: [{ key: "Content-Type", value: "application/json" }],
      input: { type: "JSON" },
      output: { type: "JSON" },
    };

    const response = await RestEngine.run(request, {}, hash, appID, true);
    return response.hooks; // from { hooks: [...] }
  }

  /**
   * 4) Get Hook by ID
   *    Equivalent of loadSelectedHook()
   */
  async getHookById(baseURL, hookID, token, hash, appID) {
    const request = {
      url: `https://${baseURL}/api/v2/hooks/${hookID}`,
      method: "GET",
      authType: "Token",
      token: token,
      headers: [{ key: "Content-Type", value: "application/json" }],
      input: { type: "JSON" },
      output: { type: "JSON" },
    };

    const response = await RestEngine.run(request, {}, hash, appID, true);

    const scenarioId = response.hook.scenarioId;
    const scenarioInterface = await this.loadHookScenarioInterface(baseURL, scenarioId, token, hash, appID);

    return {...response.hook, interface: scenarioInterface};
  }

  async loadHookScenarioInterface(baseURL, scenarioId, token, hash, appID) {
    const request = {
      url: `https://${baseURL}/api/v2/scenarios/${scenarioId}/interface`,
      method: "GET",
      authType: "Token",
      token: token,
      headers: [{ key: "Content-Type", value: "application/json" }],
      input: { type: "JSON" },
      output: { type: "JSON" },
    };

    const scenarioInterface = await RestEngine.run(request, {}, hash, appID, true);
    return scenarioInterface.interface?.input || {};
  }

    /**
   * 5) Get Data Structures
   *    Equivalent of loadHookScenario()
   *    (if you actually use this endpoint).
   */
    async getDataStructureById(baseURL, dataStructureId, token, hash, appID) {
      // url: `https://${baseURL}/api/v2/data-structures/${dataStructureId}`,
      const request = {
        url: `https://${baseURL}/api/v2/imt-forms/data-structures/${dataStructureId}/partial-update`,
        method: "GET",
        authType: "Token",
        token: token,
        headers: [{ key: "Content-Type", value: "application/json" }],
        input: { type: "JSON" },
        output: { type: "JSON" },
      };
  
      const response = await RestEngine.run(request, {}, hash, appID, true);
      //return response.dataStructure;
      return response?.values?.spec || [];
    }

  /**
   * 5) Get Data Structures
   *    Equivalent of loadHookScenario()
   *    (if you actually use this endpoint).
   */
  async getDataStructures(baseURL, teamID, token, hash, appID) {
    const request = {
      url: `https://${baseURL}/api/v2/data-structures?teamId=${teamID}`,
      method: "GET",
      authType: "Token",
      token: token,
      headers: [{ key: "Content-Type", value: "application/json" }],
      input: { type: "JSON" },
      output: { type: "JSON" },
    };

    const response = await RestEngine.run(request, {}, hash, appID, true);
    return response.dataStructures; // from { dataStructures: [...] }
  }

  /**
   * 6) Run Hook (POST)
   *    Equivalent of run(data)
   */
  async runHook(hookURL, data, isProxyEnabled, template, token, hash, appID) {
    try {
      const request = {
        method: "POST",
        authType: "Bearer", // If you use Bearer in your ‘run’
        headers: [],
        output: {
          databinding: "API",
          template: "",
          type: "TEXT",
          rawAsFallBack: true,
          hints: {},
        },
        input: {
          type: "JSON",
          fileDataBinding: "",
          template: template || "{}",
        },
        isProxyEnabled: isProxyEnabled,
        url: hookURL,
      };

      let response = await RestEngine.run(request, data, hash, appID, false);

      // Attempt to parse JSON if it is valid JSON
      try {
        response = JSON.parse(response);
      } catch (parseErr) {
        // If it isn't JSON, we just return the raw text
      }
      return { data: response };
    } catch (err) {
      console.error("Error running hook:", err);
      return { error: "Something went wrong with the data" };
    }
  }
}

export default new MakeEngine();
