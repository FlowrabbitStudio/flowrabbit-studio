import Vuex from "vuex";
import Services from "./services/Services.js";

export default new Vuex.Store({
  state: {
    user: {}
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    }
  },
  actions: {
    async setUser({ commit }, user) {
      await Services.getUserService().setUser(user);
      commit("SET_USER", user);
    },
    async updateUser({ commit, state }, data) {
      if (state.user && state.user.id) {
        const userUpdated = await Services.getUserService().save(
          state.user.id,
          data
        );
        commit("SET_USER", userUpdated);
      }
    },
    async loadUser({ commit }) {
      const user = await Services.getUserService().load();
      if (user && user.id && user.id !== -1) {
        const userdb = await Services.getUserService().loadById(user.id);
        commit("SET_USER", userdb);
      }
    }    
  },
});
