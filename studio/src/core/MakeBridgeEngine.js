import Services from "../services/Services";
import RestEngine from "./RestEngine";

class MakeBridgeEngine {
  constructor() {
    this.proxyURL = `${Services.getConfig().proxy_URL}/proxy`;
    this.baseURL = "https://eu2.make.com";
    this.makeOrgId = "2409492";
    this.mainTeamId = "985269";
  }

  async listTeams(makeOrgId, baseURL, token, hash, appID) {
    try {
      const request = {
        url: `https://${baseURL}/api/v2/teams?organizationId=${makeOrgId}`,
        method: "GET",
        authType: "Token",
        token: token,
        headers: [{ key: "Content-Type", value: "application/json" }],
        input: {
          type: "JSON",
        },
        output: {
          type: "JSON",
        },
      };
      const response = await RestEngine.run(request, {}, hash, appID, true);
      return response.teams;
    } catch (error) {
      console.error("Error listing teams:", error.response?.data || error.message);
      throw error;
    }
  }

  async listOrgs(baseURL, token, hash, appID) {
    try {
      const request = {
        url: `https://${baseURL}/api/v2/organizations?zone=`,
        method: "GET",
        authType: "Token",
        token: token,
        headers: [{ key: "Content-Type", value: "application/json" }],
        input: {
          type: "JSON",
        },
        output: {
          type: "JSON",
        },
      };
      const response = await RestEngine.run(request, {}, hash, appID, true);
      return response.organizations;
    } catch (error) {
      console.error("Error listing teams:", error.response?.data || error.message);
      throw error;
    }
  }

  async createTeam(name, token, hash, appID) {
    try {
      const body = {
        name: name,
        organizationId: this.makeOrgId,
      };
      const request = {
        url: `https://${this.baseURL}/api/v2/teams`,
        method: "POST",
        authType: "Token",
        token: token,
        headers: [{ key: "Content-Type", value: "application/json" }],
        input: {
          type: "JSON",
          template: JSON.stringify(body),
        },
        output: {
          type: "JSON",
        },
      };
      const response = await RestEngine.run(request, {}, hash, appID, true);
      return response.teams;
    } catch (error) {
      console.error("Error creating team:", error.response?.data || error.message);
      throw error;
    }
  }

  async getTeam(teamId, token, hash, appID) {
    try {
      const request = {
        url: `https://${this.baseURL}/api/v2/teams/${teamId}`,
        method: "GET",
        authType: "Token",
        token: token,
        headers: [{ key: "Content-Type", value: "application/json" }],
        input: {
          type: "JSON",
        },
        output: {
          type: "JSON",
        },
      };
      const response = await RestEngine.run(request, {}, hash, appID, true);
      return response.team;
    } catch (error) {
      console.error("Error getting team:", error.response?.data || error.message);
      throw error;
    }
  }

  async listTemplates(baseURL, mainTeamId, token, hash, appID) {
    try {
      const request = {
        url: `https://${baseURL}/api/v2/templates/v2/team?teamId=${mainTeamId}&templateType=team&isOem=true`,
        method: "GET",
        authType: "Token",
        token: token,
        headers: [{ key: "Content-Type", value: "application/json" }],
        input: {
          type: "JSON",
        },
        output: {
          type: "JSON",
        }
      };
      const response = await RestEngine.run(request, {}, hash, appID, true);
      return response.templates;
    } catch (error) {
      console.error("Error listing templates:", error.response?.data || error.message);
      throw error;
    }
  }

  async getTemplateDetails(instanceableId, token, hash, appID) {
    try {
      const request = {
        url: `https://${this.baseURL}api/v2/templates/v2/team/${instanceableId}`,
        method: "GET",
        authType: "Token",
        token: token,
        headers: [{ key: "Content-Type", value: "application/json" }],
        input: {
          type: "JSON",
        },
        output: {
          type: "JSON",
        },
      };
      const response = await RestEngine.run(request, {}, hash, appID, true);
      return response.template;
    } catch (error) {
      console.error("Error getting template details:", error.response?.data || error.message);
      throw error;
    }
  }

  async initTemplateWizard(teamId, instanceableId, allowReusingComponents = false, allowCreatingComponents = false, redirectUri, token) {
    try {
      const body = {
        templateId: instanceableId,
        teamId: teamId,
        allowReusingComponents,
        allowCreatingComponents,
        redirectUri,
      };
      const request = {
        url: `https://${this.baseURL}/api/v2/instances/flow/init/template`,
        method: "POST",
        authType: "Token",
        token: token,
        headers: [{ key: "Content-Type", value: "application/json" }],
        input: {
          type: "JSON",
          template: JSON.stringify(body),
        },
        output: {
          type: "JSON",
        },
      };
      const response = await RestEngine.run(request, {}, "", "", true);
      return {
        flowId: response.flow.id,
        publicUrl: response.publicUrl,
      };
    } catch (error) {
      console.error("Error initializing template wizard:", error.response?.data || error.message);
      throw error;
    }
  }

  async getFlowStatus(flowId, token) {
    try {
      const request = {
        url: `https://${this.baseURL}/api/v2/instances/flow/${flowId}`,
        method: "GET",
        authType: "Token",
        token: token,
        headers: [{ key: "Content-Type", value: "application/json" }],
        input: {
          type: "JSON",
        },
        output: {
          type: "JSON",
        },
      };
      const response = await RestEngine.run(request, {}, "", "", true);
      const flow = response?.flow;
      return {
        connections: flow?.result?.connections,
        hook: flow?.result?.hooks && flow?.result.hooks[0],
        scenario: flow?.result?.scenarios && flow?.result.scenarios[0],
      };
    } catch (error) {
      console.error("Error initializing template wizard:", error.response?.data || error.message);
      throw error;
    }
  }
}

export default new MakeBridgeEngine();
