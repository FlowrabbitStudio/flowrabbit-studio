<template>
  <div class="qux"></div>
</template>
<script>
import Logger from "../core/Logger";
import OpenAIEngine from "../api/OpenAIEngine";
import JSONPath from "../core/JSONPath";
import * as ExportUtil from "../core/ExportUtil";
import AIModelsUtil from "./utils/AIModelsUtil";
import RestUtil from "../../util/RestUtil";
import { mapActions } from "vuex";
import { reactive } from "vue";
import Services from "../../services/Services";
import RestEngine from "../api/RestEngine";
import FTPEngine from "../api/FTPEngine";
import DocEngine from "../api/DocEngine";
import VideoEngine from "../api/VideoEngine";
import AudioEngine from "../api/AudioEngine";
import StreamEngine from "../api/StreamEngine";
import { mapState } from "vuex";

export default {
  name: "Logic",
  computed: {
    ...mapState(["user"]),
  },
  methods: {
    ...mapActions([""]),
    async initLoadRest() {
      Logger.log(2, "Logic.initLoadRest()", "enter");

      if (this.doNotExecuteScripts) {
        Logger.log(2, "Logic.initLoadRest()", "do not run");
        return;
      }
      const widgets = this.getLoadRests();
      for (let i = 0; i < widgets.length; i++) {
        const widget = widgets[i];
        this.executeRest(widget);
      }
      Logger.log(2, "Logic.initLoadRest() > exit", this.dataBindingValues);
    },

    getLoadRests() {
      return Object.values(this.model.widgets).filter((w) => w.type === "Rest" && w.props.trigger === "load");
    },

    async initRepeatRest() {
      Logger.log(2, "Logic.initRepeatRest", "enter");

      if (this.doNotExecuteScripts) {
        Logger.log(2, "Logic.initRepeatRest", "exit > Do not run");
        return;
      }
      this._repeatRestIntervals = [];
      const widgets = this.getRepeatRests();
      for (let i = 0; i < widgets.length; i++) {
        const widget = widgets[i];
        const id = setInterval(() => {
          this.executeRest(widget);
        }, widget.props.delay * 1000);
        this._repeatRestIntervals.push(id);
      }
      Logger.log(2, "Logic.initRepeatRest", "exit", this.dataBindingValues);
    },

    getRepeatRests() {
      return Object.values(this.model.widgets).filter((w) => w.type === "Rest" && w.props.trigger === "repeat");
    },

    cleanUpRepeatRests() {
      Logger.log(-2, "Logic.cleanUpRepeatRests", "enter");
      if (this._repeatRestIntervals) {
        this._repeatRestIntervals.forEach((id) => {
          clearInterval(id);
        });
      }
    },
    async executeDownload(widget, line) {
      Logger.log(-1, "Luisa.executeDownload() > enter", widget, line);

      let fileSource = widget.props?.srcfile;
      if (!fileSource && widget.props?.databinding?.default) {
        const bindingPath = widget.props.databinding.default;
        fileSource = JSONPath.get(this.modelValue, bindingPath);
      }

      if (!fileSource) {
        Logger.warn("Luisa.executeDownload", "No valid file or base64 source found");
        return false;
      }
      const openInNewTab = !!widget.props?.opentab; 

      try {
        const isBase64DataURL = (str) =>
          typeof str === "string" && str.startsWith("data:");

        if (openInNewTab) {
          /**
           * OPEN IN NEW TAB
           *  - If the fileSource is a normal URL, window.open it directly.
           *  - If it's a base64 data URI, also just open with `window.open`.
           */
          Logger.log(-1, "Luisa.executeDownload() > Opening in new tab", fileSource);
          window.open(fileSource, "_blank");
        } else {
          /**
           * FORCE DOWNLOAD
           *  - If it's base64, convert to Blob first
           *  - Otherwise fetch as Blob from a remote URL
           */
          Logger.log(-1, "Luisa.executeDownload() > Downloading file", fileSource);

          let blob;
          if (isBase64DataURL(fileSource)) {
            blob = this.dataURLToBlob(fileSource);
          } else {
            const response = await fetch(fileSource);
            if (!response.ok) {
              throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }
            blob = await response.blob();
          }

          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = widget.props?.fileName || "downloaded_file";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        }

        this.$emit("qViewModelChange", this.modelValue);
        this.executeOutGoingLines(widget, true);
        return true;
      } catch (e) {
        Logger.error("Luisa.executeDownload", "Error during download/open logic", e);
        console.error(e);
        return false;
      } finally {
        this.onLoadingEnd();
      }
    },
    executeCopyClipboard(widget, line) {
      Logger.log(-1, "Luisa.executeCopyClipboard() > enter", widget, line);

      let text = widget.props?.text;
      if (!text && widget.props?.databinding?.default) {
        const bindingPath = widget.props.databinding.default;
        text = JSONPath.get(this.modelValue, bindingPath);
      }

      if (!text) {
        Logger.warn("Luisa.executeCopyClipboard", "No valid text found");
        return false;
      }

      try {
        // Create a temporary textarea element
        const tempTextarea = document.createElement("textarea");
        tempTextarea.value = text;
        tempTextarea.style.position = "absolute";
        tempTextarea.style.left = "-9999px"; // Hide off-screen
        document.body.appendChild(tempTextarea);

        // Select the text and copy it
        tempTextarea.select();
        document.execCommand("copy");

        // Remove the temporary element
        document.body.removeChild(tempTextarea);

        this.$emit("qViewModelChange", this.modelValue);
        this.executeOutGoingLines(widget, true);
        return true;
      } catch (e) {
        Logger.error("Luisa.executeCopyClipboard", "Error during clipboard copy", e);
        console.error(e);
        return false;
      } finally {
        this.onLoadingEnd();
      }
    },
    /**
     * Utility method to convert a base64 data URL into a Blob
     */
    dataURLToBlob(dataURL) {
      const [meta, base64Data] = dataURL.split(",");
      const mimeMatch = meta.match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";

      const byteChars = atob(base64Data);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mime });
    },

    executeLocalStorage(widget, line) {
      Logger.log(-1, "Luisa.executeLocalStorage() > enter", widget, line);

      const rest = widget.props.rest;
      if (!rest || !rest.action) {
        Logger.warn("Luisa.executeLocalStorage", "No valid action found", rest);
        return false;
      }

      const storageKey = `${this.model.id}-${this.user.id}`;
      let result = "";

      try {
        if (rest.action === "GET") {
          result = localStorage.getItem(storageKey);
          if (result === null) {
            Logger.warn("Luisa.executeLocalStorage", `No data found for key: ${storageKey}`);
            result = "No data found";
          }

          if (rest.output.databinding) {
            JSONPath.set(this.modelValue, rest.output.databinding, result);
          }
        } else if (rest.action === "SET") {
          if (rest.input.databinding) {
            let value = JSONPath.get(this.modelValue, rest.input.databinding);

            if (value === undefined) {
              Logger.warn("Luisa.executeLocalStorage", `No value found for input binding: ${rest.input.databinding}`);
              return false;
            }

            if (typeof value === "object") {
              value = JSON.stringify(value);
            }

            localStorage.setItem(storageKey, value);
            Logger.log(-1, `Data successfully set in localStorage for key: ${storageKey}`);
          } else {
            Logger.warn("Luisa.executeLocalStorage", "No input binding defined for SET action");
            return false;
          }
        } else {
          Logger.warn("Luisa.executeLocalStorage", "Unsupported action:", rest.action);
          return false;
        }

        this.$emit("qViewModelChange", this.modelValue);
        this.executeOutGoingLines(widget, true);

        return true;
      } catch (e) {
        Logger.error("Luisa.executeLocalStorage", "Error occurred during execution", e);
        console.error(e);
        return false;
      }
    },

    async executeOpenAIAssistant(widget, line) {
      Logger.log(-1, "Luisa.executeOpenAIAssistant() > enter", widget, line);

      const rest = widget.props.rest;
      try {
        const message = JSONPath.get(this.modelValue, rest.input.databinding);
        const stream = rest.output.stream;
        const result = await OpenAIEngine.query(this.model.id, this.hash, rest.token, rest.assistant, message, rest.version, stream);
        if (stream) {
          await this.processAssistantStream(result, rest, widget);
          return true;
        }
        if (result !== undefined) {
          if (rest.output.databinding) {
            JSONPath.set(this.modelValue, rest.output.databinding, result);
          }

          this.$emit("qViewModelChange", this.modelValue);
          this.executeOutGoingLines(widget, true);
          return true;
        }
      } catch (e) {
        console.error(e);
        Logger.error("Luisa.executeOpenAIAssistant", "error", e);
        this.onLoadingEnd()
      }
      return false;
    },
    async processAssistantStream(stream, rest, widget) {
      const reader = stream.getReader();
      let result = "";
      for (;;) {
        // A common idiom for a loop that reads until done
        const { done, value } = await reader.read();
        if (done) break;

        if (value && typeof value === "string") {
          result += value || "";
          if (rest.output.databinding) {
            JSONPath.set(this.modelValue, rest.output.databinding, result);
          }
        } else {
          console.error("Unexpected value type:", value);
          this.onLoadingEnd()
          throw new Error("Stream value is not of type ArrayBuffer or ArrayBufferView");
        }
      }
      this.executeOutGoingLines(widget, true);
      return true;
    },
    async executePromptBuilder(widget) {
      Logger.log(-1, "Luisa.executePromptBuilder() > enter", widget);
      const rest = widget.props.rest;
      try {
        const prompt = rest.prompt;
        const requiredDataBindings = RestUtil.getDataBindingVariables(prompt);
        const data = {};
        requiredDataBindings.forEach((path) => {
          let value = JSONPath.get(this.modelValue, path);
          data[path] = value;
        });

        const result = RestUtil.fillSimpleString(prompt, data);
        if (result !== undefined) {
          if (rest.output.databinding) {
            JSONPath.set(this.modelValue, rest.output.databinding, result);
          }

          this.$emit("qViewModelChange", this.modelValue);
          this.executeOutGoingLines(widget, true);
          return true;
        }
      } catch (e) {
        console.error(e);
        Logger.error("Luisa.executePromptBuilder", "error", e);
      }
      return false;
    },

    async executeLogic(widget, line, type) {
      Logger.log(1, "Luisa.executeLogic() > enter", widget, line);

      let lines = ExportUtil.getLines(widget, this.model);

      if (type === "or") {
        let nextLine = null;
        if (widget.props && widget.props.isRandom) {
          const random = Math.random();
          const pos = Math.floor(random * lines.length);
          Logger.log(0, "Luisa.executeLogic", "enter >  do AB:" + widget.id + " >> " + random + " >> " + pos);
          nextLine = lines[pos];
        } else {
          nextLine = this.getRuleMatchingLine(lines);
        }

        if (nextLine) {
          this.executeLine(nextLine);
        } else {
          Logger.log(5, "Luisa.executeLogic() > NO RULE matching", lines);
        }
      } else if (type === "and") {
        if (lines && lines.length > 0) {
          lines.forEach((line) => {
            const nextLine = this.getRuleMatchingLine([line]);
            if (nextLine) {
              this.executeLine(nextLine);
            }
          });
        } else {
          Logger.log(5, "Luisa.executeLogic() > NO RULES matching", lines);
        }
      }
    },

    async executeRest(widget) {
      Logger.log(2, "Luisa.executeRest() > enter", widget.props.rest);

      const rest = widget.props.rest;

      /**
       * get all the data we need from the viewModel and pass
       * it as a simple flat map, e.g. {'user.name': 'peter'}
       */
      const requiredDataBindings = RestEngine.getNeededDataBings(rest);
      const data = {};
      requiredDataBindings.forEach((path) => {
        let value = JSONPath.get(this.modelValue, path);
        data[path] = value;
      });

      /**
       * Call rest
       */
      const success = await this.runRestEngine(rest, data);
   
      /**
       * End loading indication
       */
       this.onLoadingEnd()

      /**
       * Find next line to execute
       */
      // FIXME: use executeOutGoingLines()?
      const lines = ExportUtil.getLines(widget, this.model);
      const nextLine = this.getRuleMatchingLine(lines, success);
      if (nextLine) {
        this.executeLine(nextLine);
      } else {
        Logger.log(5, "Luisa.executeRest() > NO RULE matching", lines);
      }
    },

    async executeDocParser(widget) {
      Logger.log(-22, "Luisa.executeDocParser() > enter", widget.props.config);

      const config = widget.props.rest;

      /**
       * get all the data we need from the viewModel and pass
       * it as a simple flat map, e.g. {'user.name': 'peter'}
       */
      const data = {};
      if (config.input?.fileDataBinding) {
        const fileDataBinding = config.input?.fileDataBinding;
        let value = JSONPath.get(this.modelValue, fileDataBinding);
        data[fileDataBinding] = value;
        config.input.file = value;
      } else if (config.input?.databinding) {
        const databinding = config.input?.databinding;
        let value = JSONPath.get(this.modelValue, databinding);
        data[databinding] = value;
      }

      /**
       * Call rest
       */
      const success = await this.runDocEngine(config, data);

      /**
       * End loading indication
       */
      this.onLoadingEnd()

      /**
       * Find next line to execute
       */
      const lines = ExportUtil.getLines(widget, this.model);
      const nextLine = this.getRuleMatchingLine(lines, success);
      if (nextLine) {
        this.executeLine(nextLine);
      } else {
        Logger.log(5, "Luisa.executePdfParser() > NO RULE matching", lines);
      }
    },

    async executeFTP(widget) {
      Logger.log(-22, "Luisa.executeFTP() > enter", widget.props.rest);

      const config = widget.props.config;

      /**
       * get all the data we need from the viewModel and pass
       * it as a simple flat map, e.g. {'user.name': 'peter'}
       */
      const requiredDataBindings = RestEngine.getNeededDataBings(config);
      const data = {};
      requiredDataBindings.forEach((path) => {
        let value = JSONPath.get(this.modelValue, path);
        data[path] = value;
      });

      /**
       * Call rest
       */
      const success = await this.runFTPEngine(config, data);


      /**
       * End loading indication
       */
       this.onLoadingEnd()

      /**
       * Find next line to execute
       */
      const lines = ExportUtil.getLines(widget, this.model);
      const nextLine = this.getRuleMatchingLine(lines, success);
      if (nextLine) {
        this.executeLine(nextLine);
      } else {
        Logger.log(5, "Luisa.executeRest() > NO RULE matching", lines);
      }
    },

    // eslint-disable-next-line no-unused-vars
    async executeAIRest(widget, line, mediaValue) {
      Logger.log(-22, "Luisa.executeAIRest() > enter", widget.props.rest);

      const rest = widget.props.rest;
      /**
       * get all the data we need from the viewModel and pass
       * it as a simple flat map, e.g. {'user.name': 'peter'}
       */
      const requiredDataBindings = RestEngine.getNeededDataBings(rest);
      const data = {};
      requiredDataBindings.forEach((path) => {
        let value = JSONPath.get(this.modelValue, path);
        data[path] = value;
      });

      const fromWidget = this.model.widgets[line.from];
      if (fromWidget && fromWidget.type === "Chat") {
        const messages = fromWidget.props.databinding?.default;
        if (messages) {
          const context = JSONPath.get(this.modelValue, messages);
          if (context) {
            rest.input.template = AIModelsUtil.injectContext(rest.input.template, context);
          }
        }
      }

      const success = await this.runAIRestEngine(rest, data, mediaValue);

      /**
       * End loading indication
       */
      this.onLoadingEnd()

      /**
       * Find next line to execute
       */
      const lines = ExportUtil.getLines(widget, this.model);
      const nextLine = this.getRuleMatchingLine(lines, success);
      if (nextLine) {
        this.executeLine(nextLine);
      } else {
        Logger.log(5, "Luisa.executeRest() > NO RULE matching", lines);
      }
    },

    executeOutGoingLines(widget, success) {
      /**
       * End loading indication. executeLine() might
       * turn it on again. As this happens in the same
       * rendering frame it hopefully does not flicker
       */
      this.onLoadingEnd()

      const lines = ExportUtil.getLines(widget, this.model);
      const nextLine = this.getRuleMatchingLine(lines, success);
      if (nextLine) {
        this.executeLine(nextLine);
      } else {
        Logger.log(5, "Luisa.executeRest() > NO RULE matching", lines);
      }
    },

    async runRestEngine(rest, data) {
      Logger.log(-5, "Luisa.runRestEngine()", "enter");
      try {
        let result = await RestEngine.run(rest, data, this.hash, this.model.id, this.isAppStore);
        Logger.log(1, "Luisa.executeRest()", `set data "${rest.output.databinding}`, result);
        if (rest.output.path) {
          Logger.log(1, "Luisa.executeRest()", "path", rest.output.path);
          result = JSONPath.get(result, rest.output.path);
        }
        if (rest.output.databinding) {
          JSONPath.set(this.modelValue, rest.output.databinding, result);
        }

        this.$emit("qViewModelChange", this.modelValue);
        return true;
      } catch (e) {
        Logger.error("Luisa.executeRest", "error", e);
        if (rest.output.databinding) {
          JSONPath.set(this.modelValue, rest.output.databinding, "Error");
        }
      }
      return false;
    },

    async runFTPEngine(config, data) {
      Logger.log(-1, "Luisa.runFTPEngine()", "enter");
      try {
        let result = await FTPEngine.runUpload(config, data, this.hash, this.model.id);
        if (config.output.databinding) {
          JSONPath.set(this.modelValue, config.output.databinding, result);
        }
        return true;
      } catch (e) {
        Logger.error("Luisa.executeRest", "error", e);
        if (config.output.databinding) {
          JSONPath.set(this.modelValue, config.output.databinding, "Error");
        }
      }
      return false;
    },

    async runDocEngine(config, data) {
      Logger.log(-1, "Luisa.runPdfEngine()", "enter");
      try {
        if (config.input.type === "file") {
          let result = await DocEngine.runParser(config, data, this.hash, this.model.id);
          if (config.output.databinding) {
            JSONPath.set(this.modelValue, config.output.databinding, result);
          }
          return true;
        } else if (config.input.type === "markdown") {
          let result = await DocEngine.runTextToDoc(config, data, this.hash, this.model.id);
          if (config.output.databinding) {
            JSONPath.set(this.modelValue, config.output.databinding, result);
          }
          return true;
        }
      } catch (e) {
        Logger.error("Luisa.executeRest", "error", e);
        if (config.output.databinding) {
          JSONPath.set(this.modelValue, config.output.databinding, "Error");
        }
      }
      return false;
    },
    async runAIRestEngine(rest, data, mediaValue) {
      Logger.log(-1, "Luisa.runAIRestEngine()", "enter");
      const userToken = Services.getUserService().getToken();
      rest.userToken = userToken;
      try {
        if (rest.output && rest.output.loading) {
          JSONPath.set(this.modelValue, rest.output.loading, true);
        }
        if (rest.modelType === "video") {
          let result = await VideoEngine.processVideoRequest(rest, data, this.hash, this.model.id, this.isAppStore);
          if (rest.output.path) {
            Logger.log(1, "Luisa.executeRest()", "path", rest.output.path);
            result = JSONPath.get(result, rest.output.path);
          }
          if (rest.output.databinding) {
            JSONPath.set(this.modelValue, rest.output.databinding, result);
          }
          return true;
        }
        if (rest.input.type === "AUDIO") {
          const model = this.getModel(rest.modelId, rest.modelType);
          if (model.input.stream && mediaValue) {
            let result = reactive({});
            await AudioEngine.runLiveTranscriber(rest, data, this.hash, this.model.id, mediaValue, this.isAppStore, (live) => {
              if (rest.output.databinding) {
                result = JSONPath.deepMerge(result, live);
                JSONPath.set(this.modelValue, rest.output.databinding, result);
              }
            });
            return true;
          } else {
            let result = await AudioEngine.runTranscriber(rest, data, this.hash, this.model.id, this.isAppStore);
            if (rest.output.databinding) {
              JSONPath.set(this.modelValue, rest.output.databinding, result);
            }
            return true;
          }
        }
        if (rest.vars.stream) {
          const stream = await StreamEngine.runAndProcessStream(rest, data, this.hash, this.model.id, this.isAppStore);
          if (rest.output.streampath) {
            this.loadingResult = false;
            await this.processStream(stream, rest);
            return true;
          }
          return false;
        }
        if (rest.imageProps) {
          this.processPromptImage(rest);
        }
        if (rest.vars.json && rest.output.formatJSON) {
          this.processPromptJSON(rest);
        }
        rest.isProxyEnabled = true;
        let result = await RestEngine.run(rest, data, this.hash, this.model.id, this.isAppStore);
        Logger.log(1, "Luisa.executeRest()", `set data "${rest.output.databinding}`, result);
        if (rest.secondjobcall) {
          const req = rest.secondjobcall;
          req.token = rest.token;
          req.isFlowrabbitSecret = rest.isFlowrabbitSecret;
          req.aiModelId = rest.aiModelId;
          req.modelType = rest.modelType;
          req.disableCredits = true;
          result = await RestEngine.runAPILoop(result, req, data, this.hash, this.model.id, rest.type, this.isAppStore);
        } else if (rest.output.path) {
          Logger.log(1, "Luisa.executeRest()", "path", rest.output.path);
          result = JSONPath.get(result, rest.output.path);
          if (rest.vars.json) {
            try {
              result = JSON.parse(result);
            } catch (e) {
              Logger.error("Luisa.executeRest", "error", e);
            }
          }
        }
        if (rest.output.databinding) {
          JSONPath.set(this.modelValue, rest.output.databinding, result);
        }
        if (rest.output && rest.output.error) {
          JSONPath.set(this.modelValue, rest.output.error, false);
        }
        return true;
      } catch (e) {
        Logger.error("Luisa.executeRest", "error", e);
        // add better ondition
        if (e.status === 405) {
          this.$emit("showCreditsModal");
        }
        if (rest.output && rest.output.error) {
          JSONPath.set(this.modelValue, rest.output.error, true);
        } else if (rest.output.databinding) {
          JSONPath.set(this.modelValue, rest.output.databinding, "Error");
        }
      } finally {
        if (rest.output && rest.output.loading) {
          JSONPath.set(this.modelValue, rest.output.loading, false);
        }
      }
      return false;
    },
    async processStream(stream, rest) {
      const reader = stream.getReader();
      let data = "";
      for (;;) {
        // A common idiom for a loop that reads until done
        const { done, value } = await reader.read();
        if (done) break;

        if (value && typeof value === "string") {
          data += value || "";
          JSONPath.set(this.modelValue, rest.output.databinding, data);
        } else {
          console.error("Unexpected value type:", value);
          throw new Error("Stream value is not of type ArrayBuffer or ArrayBufferView");
        }
      }
    },
    processPromptImage(rest) {
      let imagePrompt = "";
      if (rest.imageProps.type) {
        imagePrompt += `. Image Type: ${rest.imageProps.type}. `;
      }
      if (rest.imageProps.style) {
        imagePrompt += `Image Style: ${rest.imageProps.style}.-`;
      }
      const prompt = (rest.vars.prompt += imagePrompt);
      const model = this.getModel(rest.modelId, rest.modelType);
      const template = model.getTemplate({ ...rest.vars, prompt: prompt });
      try {
        rest.input.template = JSON.stringify(template);
      } catch (e) {
        console.error("Could not parse");
      }
    },
    processPromptJSON(rest) {
      let jsonPrompt = "";
      if (rest.output.formatJSON) {
        jsonPrompt += `. The JSON formatting must be like this one: ${rest.output.formatJSON}. `;
      }
      const prompt = (rest.vars.prompt += jsonPrompt);
      const model = this.getModel(rest.modelId, rest.modelType);
      const template = model.getTemplate({ ...rest.vars, prompt: prompt });
      try {
        rest.input.template = JSON.stringify(template);
      } catch (e) {
        console.error("Could not parse");
      }
    },
    getModel(value, type) {
      const util = AIModelsUtil;
      const models = util[type].models;
      const val = models.find((f) => f.id === value);
      return val;
    },
    getRuleMatchingLine(lines, restSuccess) {
      let matchedLine;
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.rule) {
          Logger.log(4, "Luisa.getRuleMatchingLine() > check", i, line.rule);
          if (line.rule.type === "widget") {
            Logger.error("Luisa.getRuleMatchingLine() > widget rules not supported in low code");
          }
          if (line.rule.type === "databinding") {
            matchedLine = this.checkDataBindingRule(line);
          }
          if (line.rule.type === "rest") {
            if (line.rule.restResponseStatus === "4xx" && !restSuccess) {
              matchedLine = line;
            }
            if (line.rule.restResponseStatus === "200" && restSuccess) {
              matchedLine = line;
            }
          }
          if (matchedLine) {
            break;
          }
        } else {
          /**
           * The *FIRST* line without a condition will be
           */
          if (!matchedLine) {
            matchedLine = line;
          }
        }
      }
      return matchedLine;
    },
    checkDataBindingRule(line) {
      Logger.log(4, "Luisa.checkDataBindingRule() > enter", line.rule.databinding);
      const rule = line.rule;
      const value = JSONPath.get(this.modelValue, rule.databinding);
      const result = this.isValueMatchingRule(value, true, rule);
      if (result) {
        Logger.log(-1, "Luisa.checkDataBindingRule() > match!", line);
        return line;
      }
    },

    isValueMatchingRule(value, valid, rule) {
      Logger.log(-44, "Luisa.isValueMatchingRule() > enter > " + rule.value + " " + rule.operator + " >" + value + "< / " + valid);

      const operator = rule.operator;
      /**
       * Special handling for checkbox group.
       * We should have an "in" operation
       */

      value = this.fixValueType(value);
      const ruleValue = this.fixValueType(rule.value);
      var result = false;
      switch (operator) {
        case "contains":
          if (value.toLowerCase && rule.value.toLowerCase) {
            var lowerValue = value.toLowerCase();
            var lowerRule = rule.value.toLowerCase();
            result = lowerValue.indexOf(lowerRule) >= 0;
          } else {
            result = false;
          }
          break;

        case "isValid":
          result = valid;
          break;

        case "==":
          result = value == ruleValue;
          break;

        case "!=":
          if (rule.value === null || rule.value === undefined) {
            result = value !== null && value !== undefined && value !== "";
          } else {
            result = value != ruleValue;
          }
          break;

        case ">":
          if (!value) {
            value = 0;
          }
          result = value * 1 > ruleValue * 1;
          break;

        case "<":
          if (!value) {
            value = 0;
          }
          result = value * 1 < ruleValue * 1;
          break;

        case ">=":
          if (!value) {
            value = 0;
          }
          result = value * 1 >= ruleValue * 1;
          break;

        case "<=":
          if (!value) {
            value = 0;
          }
          result = value * 1 <= ruleValue * 1;
          break;

        default:
          Logger.warn("Luisa.isValueMatchingRule() Not supported operator");
      }
      return result;
    },

    fixValueType(value) {
      if (value && Array.isArray(value) && value.length > 0) {
        value = value[0];
        return value;
      }

      if (value == "true") {
        return true;
      }
      if (value == "false") {
        return false;
      }
      if (value == undefined) {
        return false;
      }
      return value;
    },
  },
};
</script>
