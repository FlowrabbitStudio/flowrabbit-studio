<template>
  <div>
    <div v-if="loading" class="spinner-container">
      <div class="spinner"></div>
    </div>
    <div v-if="errorMessage">
      <div class="MatcAlertBox MatcAlertBoxInfo">
        {{ errorMessage }}
        <a class="MatcLinkButton MatcLinkInfoButton" @click="getVoices"
          >Reload</a
        >
      </div>
    </div>
    <div v-if="voices.length > 0" class="eleven-labs-voices">
      <div>
        <div class="MatcFlex MatcGapM MatcEnd">          
          <input
            type="text"
            v-model="searchQuery"
            @input="applyFilters"
            placeholder="Search by name or category"
            class="search-input"
          />
        </div>
        <hr />
        <div class="filters">
          <select
            v-model="selectedGender"
            @change="applyFilters"
            class="filter-select"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select
            v-model="selectedUseCase"
            @change="applyFilters"
            class="filter-select"
          >
            <option value="">All Use Cases</option>
            <option v-for="useCase in useCases" :key="useCase" :value="useCase">
              {{ useCase }}
            </option>
          </select>
          <select
            v-model="selectedAccent"
            @change="applyFilters"
            class="filter-select"
          >
            <option value="">All Accents</option>
            <option v-for="accent in accents" :key="accent" :value="accent">
              {{ accent }}
            </option>
          </select>
        </div>

        <div class="voice-list">
          <div
            v-for="voice in filteredVoices"
            :key="voice.voice_id"
            :ref="`voice-${voice.voice_id}`"
            class="voice-item"
          >
            <label class="voice-label">
              <input
                type="radio"
                :value="voice.voice_id"
                v-model="selectedVoiceId"
                @change="onVoiceChange"
              />
              {{ voice.name }}
              <span
                >({{ voice.labels.gender }}, {{ voice.labels["use case"] }},
                {{ voice.labels["accent"] }})</span
              >
            </label>
            <button
              @click="togglePlayPause(voice.voice_id)"
              class="play-pause-button"
            >
              <span
                v-if="isPlaying(voice.voice_id)"
                class="mdi mdi-pause"
              ></span>
              <span v-else class="mdi mdi-play"></span>
            </button>
            <audio
              :src="voice.preview_url"
              :ref="`audio-${voice.voice_id}`"
            ></audio>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "../../../style/scss/elevenlabsvoices.scss";
</style>

<script>
import _Tooltip from "common/_Tooltip";
import RestEngine from "core/RestEngine";

export default {
  name: "ElevenLabsVoiceFilter",
  mixins: [_Tooltip],
  props: [
    "item",
    "onChange",
    "rest",
    "aiModel",
    "databingValues",
    "modelId",
    "hash",
  ],
  data() {
    return {
      voices: [],
      searchQuery: "",
      selectedGender: "",
      selectedUseCase: "",
      selectedAccent: "",
      selectedVoiceId: null,
      filteredVoices: [],
      playingVoiceId: null,
      loading: false,
      errorMessage: "",
    };
  },
  computed: {
    useCases() {
      const useCaseSet = new Set();
      this.voices.forEach((voice) => {
        if (voice && voice.labels["use case"])
          useCaseSet.add(voice.labels["use case"]);
      });
      return Array.from(useCaseSet);
    },
    accents() {
      const accentSet = new Set();
      this.voices.forEach((voice) => {
        if (voice && voice.labels["accent"]) accentSet.add(voice.labels.accent);
      });
      return Array.from(accentSet);
    },
  },
  methods: {
    applyFilters() {
      this.filteredVoices = this.voices.filter((voice) => {
        return (
          (!this.selectedGender ||
            voice.labels.gender === this.selectedGender) &&
          (!this.selectedUseCase ||
            voice.labels["use case"] === this.selectedUseCase) &&
          (!this.selectedAccent ||
            voice.labels.accent === this.selectedAccent) &&
          (voice.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            Object.values(voice.labels).some((label) =>
              label.toLowerCase().includes(this.searchQuery.toLowerCase())
            ))
        );
      });
    },
    onVoiceChange() {
      this.rest.url = this.aiModel?.url + this.selectedVoiceId;
      this.onChange(this.item, this.selectedVoiceId);
    },
    togglePlayPause(voiceId) {
      const audioElement = this.$refs[`audio-${voiceId}`][0];
      if (this.playingVoiceId === voiceId) {
        audioElement.pause();
        this.playingVoiceId = null;
      } else {
        if (this.playingVoiceId) {
          const currentAudioElement =
            this.$refs[`audio-${this.playingVoiceId}`][0];
          currentAudioElement.pause();
        }
        audioElement.play();
        this.playingVoiceId = voiceId;
      }
    },
    isPlaying(voiceId) {
      return this.playingVoiceId === voiceId;
    },
    scrollToSelectedVoice() {
      this.$nextTick(() => {
        const selectedVoiceElement =
          this.$refs[`voice-${this.selectedVoiceId}`];
        if (selectedVoiceElement && selectedVoiceElement[0]) {
          selectedVoiceElement[0].scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      });
    },
    async getVoices() {
      if (this.rest && this.rest.token) {
        try {
          this.loading = true;
          this.errorMessage = "";
          const url = "https://api.elevenlabs.io/v1/voices";
          const request = {
            url: url,
            authHeader: "xi-api-key",
            method: "GET",
            headers: [{ key: "Content-Type", value: "application/json" }],
            token: this.rest.token,
            input: {
              type: "JSON",
            },
            output: {
              type: "JSON",
            },
          };
          const res = await RestEngine.run(
            request,
            this.databingValues,
            this.hash,
            this.modelId
          );
          this.voices = res.voices; // Assuming `res.data` contains the voice data
          this.applyFilters(); // Apply filters once voices are loaded
          this.loading = false;
        } catch (e) {
          console.error(e);
          this.errorMessage = "Error getting the voices";
          this.loading = false;
        }
      }
    },
  },
  async mounted() {
    if (this.rest && this.rest.token) {
      await this.getVoices();
      if (this.$refs.helper) {
        this.addTooltip(this.$refs.helper, "Select the voice");
      }
      if (this.item && this.item.value) {
        this.selectedVoiceId = this.item.value;
        this.scrollToSelectedVoice();
      }
    } else {
      this.errorMessage =
        "To get all voices, enter your Eleven Labs API KEY in the Authorization Tab";
    }
  },
};
</script>
