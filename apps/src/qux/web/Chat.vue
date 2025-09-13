<template>
  <div :class="['qux-chat', cssClass]">
    <div class="qux-chat-wrapper" ref="wrapper">
      <div class="qux-chat-cntr">
        <div :class="'qux-chat-row ' + m.role" v-for="(m, i) in messages" :key="i" ref="rows">
          <div class="message-row">
            <div>
              <div v-if="m.role === 'assistant' && assistantAvatarStyle" class="message-avatar" :style="assistantAvatarStyle"></div>
            </div>
            <div class="message-container">
              <div class="qux-chat-bubble qux-richtext">
                <WaitingLabel v-if="m.isWaiting" />
                <div v-else>
                  <div v-if="m.audio">
                    <audio :src="m.audio" controls></audio>
                  </div>
                  <div v-else v-html="m.markdown"></div>
                  <div v-if="m.citations && m.citations.length" class="qux-chat-citations">
                    <ul>
                      <li v-for="(citation, index) in m.citations" :key="index">
                        <a :href="citation" target="_blank" rel="noopener noreferrer" class="citation-link">
                          <div class="citation-preview">
                            <span class="citation-index">[{{ index + 1 }}]</span>
                            <span class="citation-title">{{ citation }}</span>
                          </div>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div v-if="m.role === 'assistant' && !m.isWaiting && !m.init" class="message-actions">
                <span class="mdi mdi-content-copy" @click="copyMessage(m.content)" title="Copy"></span>
                <span v-if="isLastAssistantMessage(i)" class="mdi mdi-reload" @click="reloadMessage(m, i)" title="Reload"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="qux-chat-prompts" ref="promptsContainer" v-if="prompts && prompts.length">
      <div v-for="(prompt, index) in visiblePrompts" :key="index" class="qux-chat-prompt" @click="onPromptClick(prompt, index)">
        {{ prompt }}
      </div>
      <div v-if="hasOverflow" class="qux-chat-prompt overflow-toggle" @click="toggleOverflow">
        ...
        <div v-if="showOverflow" class="overflow-prompts">
          <div v-for="(prompt, index) in overflowPrompts" :key="'overflow-' + index" class="qux-chat-prompt" @click="onPromptClick(prompt, index)">
            {{ prompt }}
          </div>
        </div>
      </div>
    </div>
    <div class="qux-chat-input" ref="inputCntr">
      <div class="qux-textarea-container">
        <textarea
          class="qux-textarea"
          ref="textarea"
          @focus="onFocus"
          @blur="onBlur"
          @keypress.enter.stop="onSubmit"
          @keypress.stop="onChangePrompt"
          @input="onChangePrompt"
          :value="dataBindingOutputMessage"
        ></textarea>

        <!-- Recording and Send Icons -->
        <div class="icon-container">
          <!-- Microphone Icon -->
          <QIcon v-if="!showSendIcon && !isRecording" tooltip="Record" icon="Microphone" class="MatchWidgetTypeChatInputIcon" @click="onStartRecording" />
          <!-- Stop Icon -->
          <button v-else-if="!showSendIcon && isRecording" class="MatchWidgetTypeChatInputIcon stop-icon" @click="onStopRecording">Transcribe</button>
          <!-- Send Icon -->
          <QIcon v-if="showSendIcon" icon="Send" tooltip="Send" class="MatchWidgetTypeChatInputIcon send-icon" @click="onSubmit" />
        </div>
      </div>

      <!-- Animation for Recording -->
      <div v-if="isRecording" class="recording-animation">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <div class="icon-container">
        <!-- Cancel Icon -->
        <button v-if="isRecording" class="MatchWidgetTypeChatInputIcon cancel-icon" @click="onCancelRecording">Cancel Recording</button>
      </div>
      <!-- Optional: Display Recording Duration -->
      <div v-if="isRecording" class="recording-timer">
        {{ formattedDuration }}
      </div>

      <!-- Existing system prompts -->
      <div v-if="systemprompts && systemprompts.length" class="system-prompts">
        <div v-for="(prompt, index) in systemprompts" :key="'systemprompt-' + index" class="system-prompt">
          <div class="custom-select">
            <div class="select-icon-container" v-if="prompt.icon">
              <span :class="['mdi', prompt.icon]"></span>
            </div>
            <select :class="['prompt-select', prompt.icon && 'prompt-select-icon']" @change="(e, option) => onSelectSystemPrompt(e, option)">
              <option value="" disabled selected>
                {{ prompt.label }}
              </option>
              <option v-for="(option, idx) in prompt.options" :key="'option-' + idx" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <span class="custom-arrow mdi mdi-menu-down"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _Base from "./_Base.vue";
import Logger from "../core/Logger";
import showdown from "showdown";
import JSONPath from "../core/JSONPath";
import WaitingLabel from "./WaitingLabel";
import QIcon from "./QIcon.vue";

// WAV Encoding Functions
function encodeWAV(samples, sampleRate, numChannels) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, "RIFF");
  /* file length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, "WAVE");
  /* format chunk identifier */
  writeString(view, 12, "fmt ");
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * numChannels * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numChannels * 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, "data");
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  // Write the PCM samples
  floatTo16BitPCM(view, 44, samples);

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    s = s < 0 ? s * 0x8000 : s * 0x7fff;
    output.setInt16(offset, s, true);
  }
}

export default {
  name: "qChat",
  mixins: [_Base],
  data() {
    return {
      lastMessage: "",
      lastInputMessage: "",
      newMessage: "",
      markDownConverter: null,
      showOverflow: false,
      hasOverflow: false,
      visiblePrompts: [],
      overflowPrompts: [],
      dropdownPosition: {},
      systemprompts: [],
      isRecording: false,
      audioContext: null,
      microphone: null,
      scriptProcessor: null,
      recordedSamples: [],
      audioBlob: null,
      audioURL: null,
      recordingError: null,
      recordingStartTime: null,
      recordingTimer: null,
      recordingDuration: 0,
      MAX_RECORDING_DURATION: 300,
      dataBuffer: "",
      isCollectingCitations: false,
      citationsBuffer: "",
      citations: [],
      messagesMap: {},
    };
  },
  components: {
    WaitingLabel: WaitingLabel,
    QIcon: QIcon,
  },
  computed: {
    formattedDuration() {
      const minutes = Math.floor(this.recordingDuration / 60);
      const seconds = this.recordingDuration % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    },
    showSendIcon() {
      const hasTranscription = this.element && this.element.props && this.element.props.hasTranscription;
      return !hasTranscription || (this.dataBindingOutputMessage && this.dataBindingOutputMessage.trim().length > 0);
    },
    prompts() {
      if (this.element && this.element.props && this.element.props.prompts) {
        return this.element.props.prompts;
      }
      return [];
    },
    oldMessages() {
      try {
        if (this.element && this.element.props && this.element.props.databinding) {
          let path = this.element.props.databinding.default;
          if (path) {
            let value = JSONPath.get(this.viewModel, path);
            if (value) {
              if (typeof value === "string") return JSON.parse(value);
              else return value;
            }
            return [];
          }
        }
        return [];
      } catch (e) {
        console.log(e);
      }
      return [];
    },
    messages() {
      let input = this.dataBindingInputMessage;
      if (input && input !== this.lastMessage && input !== this.lastInputMessage) {
        this.addMessage(input);
      }
      let allMessages = this.oldMessages;
      return allMessages.map((m) => {
        const messageWithMarkdown = {
          ...m,
          markdown: this.getMarkDown(m.content),
          audio: m.audio || null,
        };
        return messageWithMarkdown;
      });
    },
    dataBindingOutputMessage() {
      if (this.element && this.element.props && this.element.props.databinding) {
        let path = this.element.props.databinding.output;
        if (path) {
          let value = JSONPath.get(this.viewModel, path);
          if (value && typeof value === "object") {
            return value?.text;
          }
          return value;
        }
      }
      return null;
    },
    dataBindingInputMessage() {
      if (this.element && this.element.props && this.element.props.databinding) {
        let path = this.element.props.databinding.input;
        if (path) {
          let value = JSONPath.get(this.viewModel, path);
          Logger.log(5, "qChat.dataBindingInput() > " + path, `"${value}"`);
          return value;
        }
      }
      return null;
    },
    assistantAvatarStyle() {
      const imageUrl = this.getAssistantImageUrl();
      if (imageUrl) {
        return {
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          marginRight: "10px",
        };
      }
      return null;
    },
  },
  methods: {
    isLastAssistantMessage(index) {
      // Check if the message is the last assistant message
      const lastIndex = this.messages.length - 1;
      return index === lastIndex && this.messages[index].role === "assistant";
    },
    setCitations(messageId, citations) {
      this.messagesMap[messageId] = { citations };
      console.log(`Citations received for message ${messageId}:`, citations);
    },
    onChangePrompt(e) {
      const value = e.currentTarget.value;
      this.onValueChange(value, "output");
    },
    onSelectSystemPrompt(e) {
      const system = e.currentTarget.options[0].text;
      const systemprompt = e.currentTarget.value;
      const systemdatabinding = this.element.props.databinding["system"];
      if (systemdatabinding) {
        let currentSystem = this.viewModel[systemdatabinding] || {};
        if (typeof currentSystem === "string") currentSystem = JSON.parse(currentSystem);
        currentSystem[system] = systemprompt;
        this.onValueChange(JSON.stringify(currentSystem), "system");
      }
    },
    onPromptClick(prompt, index) {
      const promptValue = this.element.props.promptsValues?.[index]?.trim() ? this.element.props.promptsValues[index] : prompt;
      this.onValueChange(promptValue, "output");
      this.onSubmit();
      this.showOverflow = false;
    },
    toggleOverflow() {
      this.showOverflow = !this.showOverflow;
      if (this.showOverflow) {
        this.calculateDropdownPosition();
      }
    },
    calculateDropdownPosition() {
      this.$nextTick(() => {
        const toggleElement = this.$refs.overflowToggle;
        if (toggleElement) {
          const rect = toggleElement.getBoundingClientRect();
          this.dropdownPosition = {
            position: "absolute",
            top: `${rect.bottom}px`,
            left: `${rect.left}px`,
            zIndex: 9999,
          };
        }
      });
    },
    getMarkDown(txt) {
      if (this.markDownConverter) {
        return this.markDownConverter.makeHtml(txt);
      }
      return txt;
    },
    stripHTML(s) {
      if (s == null || s == undefined) s = "";
      if (s.replace) {
        s = s.replace(/</g, "&lt;");
        s = s.replace(/>/g, "&gt;");
        s = s.replace(/<\/?[^>]+(>|$)/g, "");
        s = s.replace(/\n/g, "<br>");
        s = s.replace(/\$perc;/g, "%");
      }

      return s;
    },
    addMessage(input) {
      // Append the incoming input to the data buffer
      this.dataBuffer += input;

      // Define markers for citations
      const startMarker = "\n---CITATIONS_START---\n";
      const endMarker = "\n---CITATIONS_END---\n";

      while (this.dataBuffer.length > 0) {
        if (!this.isCollectingCitations) {
          // Search for the start marker
          const startIndex = this.dataBuffer.indexOf(startMarker);

          if (startIndex !== -1) {
            // Extract the text before the start marker
            const textBeforeCitations = this.dataBuffer.substring(0, startIndex);
            this._processAssistantMessage(textBeforeCitations);

            // Update the buffer to exclude the processed text and the start marker
            this.dataBuffer = this.dataBuffer.substring(startIndex + startMarker.length);
            this.isCollectingCitations = true; // Start collecting citations
            this.citationsBuffer = ""; // Reset citations buffer
          } else {
            // No start marker found, process the entire buffer as a message
            this._processAssistantMessage(this.dataBuffer);
            this.dataBuffer = ""; // Clear the buffer
            break; // Exit the loop as all data has been processed
          }
        }

        if (this.isCollectingCitations) {
          // Search for the end marker
          const endIndex = this.dataBuffer.indexOf(endMarker);

          if (endIndex !== -1) {
            // Extract the citations JSON string
            const citationsJson = this.dataBuffer.substring(0, endIndex);
            // Update the buffer to exclude the processed citations and the end marker
            this.dataBuffer = this.dataBuffer.substring(endIndex + endMarker.length);
            this.isCollectingCitations = false; // Stop collecting citations

            // Accumulate citations data
            this.citationsBuffer += citationsJson;

            // Parse the citations JSON and set it
            try {
              const parsedCitations = JSON.parse(this.citationsBuffer);
              // Set citations for the last assistant message
              this.setCitationsForLastMessage(parsedCitations);
              console.log("Received citations:", parsedCitations);
            } catch (error) {
              console.error("Failed to parse citations JSON:", error);
            }

            // Reset citations buffer
            this.citationsBuffer = "";
          } else {
            // End marker not found, accumulate the current buffer into citationsBuffer
            this.citationsBuffer += this.dataBuffer;
            this.dataBuffer = ""; // Clear the buffer and wait for more data
            break; // Exit the loop as we need more data to complete citations
          }
        }
      }

      // After processing, if not collecting citations and buffer has remaining data, process it
      if (!this.isCollectingCitations && this.dataBuffer.length > 0) {
        this._processAssistantMessage(this.dataBuffer);
        this.dataBuffer = ""; // Clear the buffer
      }
    },
    _processAssistantMessage(text) {
      let allMessages = this.oldMessages.filter((m) => !m.isWaiting);

      const last = allMessages[allMessages.length - 1];
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // Unique ID

      if (this.element && this.element.props.stream && last?.role === "assistant") {
        last.content = text;
        last.citations = [];
      } else {
        if (last?.content !== text) {
          allMessages.push({
            id: messageId,
            role: "assistant",
            content: text,
          });
        }
      }
      this.lastInputMessage = text;
      this.onValueChange(allMessages, "default");
      this.$nextTick(() => {
        this.scrolldown();
      });
    },
    setCitationsForLastMessage(citationsArray) {
      let allMessages = this.oldMessages;
      const lastMessageIndex = allMessages.length - 1;
      const lastMessage = allMessages[lastMessageIndex];

      if (lastMessage && lastMessage.role === "assistant") {
        // Store citations in the message object
        lastMessage.citations = citationsArray;

        // Replace [number] with links in the message content
        lastMessage.content = this.replaceCitationsInContent(lastMessage.content, citationsArray);

        // Update the markdown
        lastMessage.markdown = this.getMarkDown(lastMessage.content);

        // Replace the message object in the array to maintain reactivity
        allMessages.splice(lastMessageIndex, 1, lastMessage);

        this.onValueChange(allMessages, "default");
      }
    },
    /**
     * Replaces [number] in content with links to citations.
     * @param {String} content - The message content.
     * @param {Array} citationsArray - Array of citation strings.
     * @returns {String} - Updated content with links.
     */
    replaceCitationsInContent(content, citationsArray) {
      const citationRegex = /\[(\d+)\]/g;
      return content.replace(citationRegex, (match, p1) => {
        const index = parseInt(p1, 10) - 1; // Adjust for zero-based index
        if (citationsArray[index]) {
          return `<a href="${citationsArray[index]}" target="_blank" rel="noopener noreferrer">[${p1}]</a>`;
        } else {
          return match; // No citation found, leave as is
        }
      });
    },
    scrolldown() {
      const wrapper = this.$refs.wrapper;
      if (wrapper) {
        wrapper.scrollTop = wrapper.scrollHeight;
      }
    },
    onSubmit(e) {
      const value = e?.currentTarget?.value || this.dataBindingOutputMessage;
      let allMessages = this.oldMessages.filter((m) => !m.isWaiting);
      allMessages.push({
        role: "user",
        content: value,
      });
      allMessages.push({
        role: "assistant",
        isWaiting: true,
        content: "...",
      });
      this.lastMessage = value;
      this.onValueChange(value, "output");
      this.onValueChange(allMessages, "default");
      this.onClick();
      this.$nextTick(() => {
        this.scrolldown();
      });
      this.$nextTick(() => {
        this.onValueChange("", "output");
      });
    },
    getValue() {
      return this.dataBindingOutputMessage;
    },
    initMessages(element) {
      const allMessages = this.oldMessages;
      if (element.props.options && !(allMessages && allMessages.length > 0)) {
        const initMsg = element.props.options.map((o) => {
          return {
            content: o,
            role: "assistant",
            init: true,
          };
        });
        this.onValueChange(initMsg, "default");
      }
      this.scrolldown();
    },
    updateVisiblePrompts() {
      this.visiblePrompts = [];
      this.overflowPrompts = [];
      this.hasOverflow = false;

      this.$nextTick(() => {
        const container = this.$refs.promptsContainer;
        if (container) {
          const containerWidth = container.clientWidth;
          let totalWidth = 0;
          let overflowStarted = false;

          const tempElement = document.createElement("div");
          tempElement.className = "qux-chat-prompt";
          tempElement.style.visibility = "hidden";
          tempElement.style.position = "absolute";
          tempElement.style.whiteSpace = "nowrap";
          container.appendChild(tempElement);

          for (let i = 0; i < this.prompts.length; i++) {
            const prompt = this.prompts[i];
            tempElement.innerText = prompt;
            const promptWidth = tempElement.offsetWidth + 8; // Adding gap

            if (!overflowStarted && totalWidth + promptWidth <= containerWidth) {
              this.visiblePrompts.push(prompt);
              totalWidth += promptWidth;
            } else {
              overflowStarted = true;
              this.overflowPrompts.push(prompt);
              this.hasOverflow = true;
            }
          }

          container.removeChild(tempElement);
        } else {
          this.visiblePrompts = this.prompts;
        }
      });
    },
    copyMessage(content) {
      navigator.clipboard.writeText(content).then(
        () => {
          console.log("Message copied to clipboard");
        },
        (err) => {
          console.error("Could not copy text: ", err);
        }
      );
    },
    reloadMessage(message, index) {
      let allMessages = this.oldMessages;
      allMessages.splice(index, 1);

      allMessages.splice(index, 0, {
        role: "assistant",
        isWaiting: true,
        content: "...",
      });

      this.reloadingIndex = index;
      const userMessage = allMessages[index - 1];
      if (userMessage && userMessage.role === "user") {
        this.lastMessage = userMessage.content;
        this.onValueChange(this.lastMessage, "output");
        this.onValueChange(allMessages, "default");
        this.onClick();
      }
    },
    getAssistantImageUrl() {
      const image = this.element?.props?.assistantImage;
      if (!image) return null;

      if (this.hash) {
        return `/rest/images/${this.hash}/${image.url}`;
      } else if (this.jwtToken) {
        return `/rest/images/${image.url}?token=${this.jwtToken}`;
      } else {
        if (!this.isPublic) {
          this.logger.warn("setImage", "error > no token or hash");
        }
        return `/rest/images/${image.url}`;
      }
    },

    // Updated methods for WAV recording
    async onStartRecording() {
      if (this.isRecording) {
        Logger.warn("Already recording");
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.recordingError = "Media devices API not supported in this browser.";
        Logger.error(this.recordingError);
        alert(this.recordingError);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.microphone = this.audioContext.createMediaStreamSource(stream);
        this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

        this.recordedSamples = [];

        this.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          const inputBuffer = audioProcessingEvent.inputBuffer;
          const inputData = inputBuffer.getChannelData(0);
          // Clone the samples
          this.recordedSamples.push(new Float32Array(inputData));
        };

        this.microphone.connect(this.scriptProcessor);
        this.scriptProcessor.connect(this.audioContext.destination);

        this.isRecording = true;
        this.recordingStartTime = Date.now();
        this.recordingDuration = 0;

        Logger.log("Recording started");

        // Start the timer
        this.recordingTimer = setInterval(() => {
          this.recordingDuration = Math.floor((Date.now() - this.recordingStartTime) / 1000);

          if (this.recordingDuration >= this.MAX_RECORDING_DURATION) {
            this.onStopRecording();
            alert("Maximum recording duration reached.");
          }
        }, 1000);
      } catch (err) {
        if (err.name === "NotAllowedError") {
          this.recordingError = "Microphone access was denied. Please allow access to record audio.";
        } else {
          this.recordingError = "Could not start recording: " + err.message;
        }
        Logger.error(this.recordingError);
        alert(this.recordingError); // Inform the user
      }
    },

    onStopRecording() {
      if (!this.isRecording) {
        Logger.warn("Not currently recording");
        return;
      }

      // Stop audio processing
      if (this.scriptProcessor) {
        this.scriptProcessor.disconnect();
        this.scriptProcessor.onaudioprocess = null;
      }
      if (this.microphone) {
        this.microphone.disconnect();
      }
      if (this.audioContext) {
        this.audioContext.close();
      }

      this.isRecording = false;
      Logger.log("Recording stopped");

      // Stop the timer
      clearInterval(this.recordingTimer);

      // Process the recorded samples into WAV
      this.processRecording();
    },

    processRecording() {
      const sampleRate = this.audioContext.sampleRate;
      const numChannels = 1; // Mono

      // Merge all recorded samples into a single Float32Array
      let mergedBuffers = [];
      this.recordedSamples.forEach((buffer) => {
        mergedBuffers = mergedBuffers.concat(Array.from(buffer));
      });
      const mergedArray = new Float32Array(mergedBuffers);

      // Encode to WAV
      const wavBlob = encodeWAV(mergedArray, sampleRate, numChannels);

      // Create a URL for playback
      const wavURL = URL.createObjectURL(wavBlob);

      // Save the blob and URL
      this.audioBlob = wavBlob;
      this.audioURL = wavURL;

      // Use onValueChange and emit event
      this.onValueChange(this.audioURL, "file");
      this.$emit("qActionLine", this.element, {
        action: "transcription",
      });

      Logger.log("WAV recording processed");

      // Reset recorded samples and duration
      this.recordedSamples = [];
      this.recordingDuration = 0;
    },

    onCancelRecording() {
      if (this.isRecording) {
        // Stop recording without processing
        this.isRecording = false;

        // Stop audio processing
        if (this.scriptProcessor) {
          this.scriptProcessor.disconnect();
          this.scriptProcessor.onaudioprocess = null;
        }
        if (this.microphone) {
          this.microphone.disconnect();
        }
        if (this.audioContext) {
          this.audioContext.close();
        }

        // Stop the timer
        clearInterval(this.recordingTimer);

        // Reset recording data
        this.recordedSamples = [];
        this.recordingDuration = 0;
        Logger.log("Recording canceled");
      }
    },
  },
  watch: {
    prompts() {
      this.updateVisiblePrompts();
    },
  },
  mounted() {
    Logger.log(-5, "qChat.mounted() enter");
    this.initMessages(this.element);
    if (this.element.props.format === "markup" || this.element.props.markup) {
      this.markDownConverter = new showdown.Converter();
      this.markDownConverter.setOption('tables', true);
    }
    this.updateVisiblePrompts();
    if (this.element && this.element.props && this.element.props.systemprompts) {
      this.systemprompts = this.element.props.systemprompts;
    }
    document.addEventListener("click", this.handleClickOutside);
    window.addEventListener("resize", this.updateVisiblePrompts);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateVisiblePrompts);
    document.removeEventListener("click", this.handleClickOutside);
    // Clean up timer if component is destroyed while recording
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
    }
    // Ensure audio context is closed
    if (this.audioContext) {
      this.audioContext.close();
    }
  },
};
</script>

<style lang="scss">
@import "../scss/qux-chat.scss";
.qux-chat-citations {
  padding: 15px;
  margin-top: 10px;

  h3 {
    margin-bottom: 10px;
    font-size: 1.4em;
    color: #333;
    font-weight: bold;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 10px;
      font-size: 0.9em;
      color: #555;

      .citation-link {
        text-decoration: none;
        color: inherit;
        display: flex;
        align-items: center;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 10px;
        background-color: #fff;
        transition: box-shadow 0.3s ease;
      }

      .citation-link:hover {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }

      .citation-preview {
        display: flex;
        gap: 5px;
      }

      .citation-index {
        font-weight: bold;
        color: #0073e6;
      }

      .citation-title {
        font-size: 0.9em;
        color: #333;
      }
    }
  }
}
</style>
