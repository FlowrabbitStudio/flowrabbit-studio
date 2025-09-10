<template>
  <div class="MatcDialogTest">
    <div class="MatcDialogTestHeader">
      <label class="MatcDialogTestHeaderLabel">Test</label>
      <a class="MatcDialogTestButton" @click="run" :disabled="isDisabled">Run Test</a>
    </div>
    <div class="MatcToolbarTabs MatcToolbarTabsBig">
      <div>
        <a
          @click="testtab = 'params'"
          :class="{ MatcToolbarTabActive: testtab === 'params' }"
          >Test Parameters</a
        >
        <a
          @click="testtab = 'result'"
          :class="{ MatcToolbarTabActive: testtab === 'result' }"
          style="margin-left: 20px"
          >Results</a
        >
      </div>
    </div>
    <div v-show="testtab === 'params'">
      <div
        class="MatcToolbarResSettingsCntrScroll MatcTestParams MatcMarginTop"
      >
        <div
          class="MatcToolbarRestDataBindingRow"
          v-for="(type, key) in dataBindingKeyElements"
          :key="key"
        >
          <template v-if="type === 'file'">
            <FileButton
              class="MatcToolbarRestDataBindingFile"
              @change="onFileChange($event, key)"
              :label="getElementLabel(key)"
            />
          </template>
          <template v-else>
            <span class="MatcToolbarRestDataBindingRowLabel">{{ key }}</span>
            <input
              v-model="databingValues[key]"
              class="form-control"
              ref="dbInputs"
            />
          </template>
        </div>
        <div v-if="rest.input.type === 'FILE'">
          <FileButton
            class="MatcToolbarRestDataBindingFile"
            @change="onFileChange($event)"
            label="Select a file"
          />
        </div>
        <div class="MatcCenter" v-if="rest.input.type === 'AUDIO'">
          <button @click="toggleRecording" :disabled="error">
            <div v-if="isRecording" class="mdi mdi-stop-circle"></div>
            <div v-else class="mdi mdi-microphone"></div>
          </button>
          <hr />
          <div v-if="!this.aiModel.input.stream">
            <FileButton
              class="MatcToolbarRestDataBindingFile"
              @change="onAudioFileUpload($event)"
              label="Select an audio file"
            />
          </div>
        </div>
        <!-- Display audio player for old method -->
        <div
          class="MatcToolbarRestDataBindingRowAudio"
          v-if="audioUrl && !this.aiModel.input.stream"
        >
          <audio :src="audioUrl" controls></audio>
        </div>
        <!-- Display transcription for streaming method -->
        <div
          class="MatcToolbarRestDataBindingRowAudio"
          v-if="transcription && this.aiModel.input.stream"
        >
          <p>{{ transcription.text }}</p>
        </div>
        <div
          class="ParamsDataBindingContent"
          v-if="
            Object.keys(dataBindingKeyElements).length === 0 &&
            rest.input.type === 'JSON'
          "
        >
          You are not using variables. No need to specify any data.
        </div>
      </div>
    </div>
    <div v-show="testtab === 'result'">
      <div class="MatcToolbarResSettingsCntrScroll">
        <div v-show="loadingResult" class="spinner-container">
          <div class="spinner"></div>
        </div>
        <div v-if="testError && testError.length > 0">
          <div class="MatcAlertBoxXL MatcAlertBoxDanger MatcMarginTop">
            {{ testError }}
          </div>
          <pre
            v-if="testResult"
            :class="[
              'MatcToolbarRestDataBindingCntr MatcMarginBottom',
              { 'MatcAlertBoxXL MatcAlertBoxDanger MatcMarginTop': testError },
            ]"
            >{{ testResult }}</pre
          >
        </div>
        <div v-else>
          <div v-if="testResult">
            <div
              class="MatcToolbarRestDataBindingCntr"
              v-if="template.type === 'image'"
            >
              <img :src="testResult" />
            </div>
            <div
              class="MatcToolbarRestDataBindingCntr"
              v-if="isBase64Format"
            >
              <img :src="`data:image/png;base64, ${testResult}`" />
            </div>
            <div
              class="MatcToolbarRestDataBindingCntr"
              v-if="template.type === 'textToSpeech'"
            >
              <audio controls :src="testResult">
                Your browser does not support the audio element.
              </audio>
            </div>
            <div
              class="MatcToolbarRestDataBindingCntr"
              v-if="template.type === 'video'"
            >
              <video controls>
                <source :src="testResult" type="video/mp4" />
              </video>
            </div>
            <div class="MatcToolbarRestDataBindingCntr" v-if="isTextFormat">
              <span v-html="formattedOutput"></span>
            </div>
            <pre
              v-if="isJSONFormat"
              :class="[
                'MatcToolbarJSONRestDataBindingCntr MatcMarginBottom',
                { MatcError: testError },
              ]"
            >
              <JSONVisualizer :jsonData="testResult" :init="true"></JSONVisualizer>
            </pre>
            <div v-if="template.type === 'speechToText'">
              <div class="MatcToolbarSpeechRestDataBindingCntr">
                <div>
                  <strong>Transcription</strong>
                  <span>
                    (the transcription is stored in the path {output
                    variable}.text)</span
                  >
                </div>
              </div>
              <pre
                :class="[
                  'MatcToolbarJSONRestDataBindingCntr MatcMarginBottom',
                  { MatcError: testError },
                ]"
              >
                <JSONVisualizer :jsonData="testResult.text" :init="true"></JSONVisualizer>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
    <FlowrabbitInfo
      v-if="aiModel?.type === 'flowrabbit'"
      :credits="getFlowrabbitCredits"
    />
  </div>
</template>

<script>
import FileButton from "common/FileButton";
import JSONVisualizer from "./JSONVisualizer.vue";
import FlowrabbitInfo from "./AIRestModelInfo.vue";
import RestEngine from "core/RestEngine";
import DocEngine from "../../../core/DocEngine";
import Services from "../../../services/Services";
import AudioEngine from "../../../core/AudioEngine";

export default {
  components: {
    FileButton,
    JSONVisualizer,
    FlowrabbitInfo,
  },
  props: [
    "aiModel",
    "testtab",
    "databingValues",
    "audioUrl",
    "testError",
    "testResult",
    "template",
    "formatType",
    "organizations",
    "rest",
    "loadingResult",
    "hash",
    "model",
  ],
  data: function () {
    return {
      isRecording: false,
      error: false,
      errorMessage: "",
      transcription: "",
      nodeURL: Services.getConfig().node_URL || "http://localhost:8088",
      mediaRecorder: null,
      audioChunks: []
    };
  },
  methods: {
    run() {
      this.$emit("run");
    },
    isDisabled() {
      return this.rest.input.type === "AUDIO" && this.rest.input.stream 
    },  
    onFileChange(file, key) {
      this.$emit("onDataBingingFileChange", { key: key, file: file });
    },
    onAudioFileUpload(file) {
      if (file) {
        const audioUrl = URL.createObjectURL(file);
        this.$emit("onChangeAudioUrl", audioUrl);
        this.$emit("fileChange", {
          key: this.rest.input.fileDataBinding,
          file,
        });
      }
    },
    toggleRecording() {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    },
    async startRecording() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.$emit(
          "handleError",
          "Audio recording is not supported in your browser."
        );
        return;
      }

      if (this.aiModel.input.stream) {
        // Streaming method
        try {
          this.transcription = ""; // Clear previous transcription
          // Start live transcription using DocEngine
          await AudioEngine.runLiveTranscriber(
            this.rest,
            this.databingValues,
            this.hash,
            this.model.id,
            (transcript) => {
              this.transcription += transcript + " ";
            }
          );

          this.isRecording = true;
          this.error = false;
          this.errorMessage = "";
        } catch (err) {
          this.$emit(
            "handleError",
            "Could not start audio recording: " + err.message
          );
        }
      } else {
        // Old method
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.setupRecorderEvents();
            this.mediaRecorder.start();
            this.isRecording = true;
            this.error = false;
            this.errorMessage = "";
          })
          .catch((err) => {
            if (
              err.name === "NotAllowedError" ||
              err.name === "PermissionDeniedError"
            ) {
              this.$emit(
                "handleError",
                "Audio recording permission was denied. Please enable microphone access in your browser settings."
              );
            } else {
              this.$emit(
                "handleError",
                "Could not start audio recording: " + err.message
              );
            }
          });
      }
    },
    stopRecording() {
      if (this.aiModel.input.stream) {
        DocEngine.stopAudioCapture();
        this.isRecording = false;
      } else {
        if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
          this.mediaRecorder.stop();
          this.isRecording = false;
        }
      }
    },
    setupRecorderEvents() {
      this.mediaRecorder.ondataavailable = (e) => {
        this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
        this.audioUrl = URL.createObjectURL(audioBlob);
        console.debug("audioUrl", this.audioUrl);

        // Use Web Audio API to get duration
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          const arrayBuffer = fileReader.result;
          const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();

          audioContext.decodeAudioData(
            arrayBuffer,
            (audioBuffer) => {
              const duration = audioBuffer.duration;
              console.log("Audio Duration:", duration);

              this.$emit("onChangeAudioUrl", this.audioUrl);
              this.$emit("fileChange", {
                key: this.rest.input.fileDataBinding,
                file: this.audioUrl,
                duration: duration,
              });

              // Clean up
              audioContext.close();
            },
            (error) => {
              console.error("Error decoding audio data:", error);
              // Handle error as needed
            }
          );
        };
        fileReader.readAsArrayBuffer(audioBlob);
      };
    },
    getElementLabel(key) {
      const element =
        this.aiModel.elements.find((el) => `\${${el.id}}` === key) ||
        this.aiModel.advanced.find((el) => `\${${el.id}}` === key);
      return element ? element.label : key;
    },
  },
  computed: {
    isJSONFormat() {
      return this.template.type === "llms" && this.formatType === "JSON";
    },
    isTextFormat() {
      return (this.template.type === "llms" || this.template.type === "ionos") && this.formatType === "Text";
    },
    isBase64Format() {
      return this.formatType === "base64";
    },
    dataBindingKeyElements() {
      return RestEngine.getNeededDataBingsAI(this.rest, this.aiModel);
    },
    formattedOutput() {
      if (!this.testResult || typeof this.testResult !== "string") return "";
      let formatted = this.testResult.replace(/(?:\r\n|\r|\n)/g, "<br>");
      formatted = formatted.replace(/(important)/gi, "<strong>$1</strong>");
      return formatted;
    },
    getFlowrabbitCredits() {
      let count = 0;
      this.organizations.forEach((org) => {
        const model = this.aiModel?.model;
        if (model && org.apiCalls && org.apiCalls[model]) {
          count +=
            org.apiCalls[model].maxApiCalls -
            org.apiCalls[model].currentApiCalls;
        }
      });
      return count;
    },
  },
};
</script>
