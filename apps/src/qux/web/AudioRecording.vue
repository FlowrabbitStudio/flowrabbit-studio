<template>
  <button
    ref="button"
    :class="['qux-audio-recording', cssClass, { 'qux-active': isRecording }]"
    @click.stop="toggleRecording"
    :disabled="error"
  >
    <div v-if="!isRecording" :class="'mdi ' + icon" />
    <div
      v-if="isRecording && element.props.animation"
      :class="['waveform-container']"
    >
      <svg viewBox="0 0 100 100" class="waveform" :width="svgWidth" :height="svgHeight">
        <rect
          v-for="(barHeight, index) in barHeights"
          :key="index"
          :x="barXPositions[index]"
          :y="90 - barHeight"
          :width="barWidth"
          :height="barHeight"
          rx="2"
        />
      </svg>
    </div>
    <div v-if="isRecording && !element.props.animation" :class="'mdi ' + stopIcon" />
  </button>
</template>

<style scoped>
.qux-audio-recording {
  position: relative;
  border: none;
  cursor: pointer;
}

.qux-audio-recording .mdi {
  transition: opacity 0.3s ease;
}

.waveform-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.qux-audio-recording.qux-active .waveform-container {
  opacity: 1;
}

.waveform {
  transform: scale(0.8);
}


.waveform rect {
  fill: currentColor;
  transition: height 0.1s ease, y 0.1s ease;
}
</style>

<script>
import _Base from "./_Base.vue";

export default {
  name: "qAudioRecording",
  mixins: [_Base],
  data() {
    return {
      mediaRecorder: null,
      audioChunks: [],
      audioUrl: "",
      isRecording: false,
      error: false,
      errorMessage: "",
      barHeights: Array(12).fill(0),
      animationId: null,
      audioContext: null,
      analyser: null,
      source: null,
      silenceThreshold: 0.01,
    };
  },
  computed: {
    icon() {
      console.log(this.cssClass);
      return this.element?.style.icon || "";
    },
    stopIcon() {
      return this.element?.style.stopIcon || "";
    },
    barWidth() {
      const spacing = 2; // Percentage spacing between bars
      const totalSpacing = spacing * (this.barHeights.length - 1);
      return (80 - totalSpacing) / this.barHeights.length;
    },
    barXPositions() {
      const positions = [];
      const spacing = 2; // Same as above
      for (let i = 0; i < this.barHeights.length; i++) {
        positions.push(i * (this.barWidth + spacing));
      }
      return positions;
    },
    svgWidth() {
      return Math.round(this.element.w)
    },
    svgHeight() {
      return Math.round(this.element.h)
    }
  },
  methods: {
    async startRecording(e) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.handleError("Audio recording is not supported in your browser.");
        return;
      }

      try {
        // Get the media stream
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        if (this.element.props.stream) {
          this.isRecording = true;
          this.mediaRecorder = new MediaRecorder(this.stream, {
            mimeType: "audio/webm",
          });

          this.onStream({ event: e, media: this.mediaRecorder });
        } else {
          this.mediaRecorder = new MediaRecorder(this.stream);
          this.audioChunks = [];
          this.setupRecorderEvents();
          this.mediaRecorder.start();
          this.isRecording = true;
          this.error = false;
          this.errorMessage = "";
        }
        if (this.element.props.animation) {
          this.startVoiceActivityDetection();
        }
        console.log("startRecording called, isRecording:", this.isRecording);
      } catch (err) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          this.handleError(
            "Audio recording permission was denied. Please enable microphone access in your browser settings."
          );
        } else {
          this.handleError("Could not start audio recording: " + err.message);
        }
      }
    },
    async stopRecording() {
      if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
        this.mediaRecorder.stop();
      }

      if (this.stream && this.stream.getTracks) {
        this.stream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      this.isRecording = false;
      this.mediaRecorder = null;
      this.stream = null;
      if (this.element.props.animation) {
        this.stopVoiceActivityDetection();
      }
    },
    toggleRecording() {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
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
        this.onValueChange(this.audioUrl);
        this.onClick();
      };
    },

    handleError(message) {
      this.error = true;
      this.errorMessage = message;
    },
    startVoiceActivityDetection() {
      if (!this.element.props.animation) {
        return;
      }
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);
      this.analyser.fftSize = 2048;

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const animate = () => {
        this.analyser.getByteFrequencyData(dataArray);

        const newHeights = [];
        const barCount = this.barHeights.length;

        for (let i = 0; i < barCount; i++) {
          const exponent = 2;
          const logIndex = Math.floor(
            Math.pow((barCount - i - 1) / barCount, exponent) *
              (bufferLength - 1)
          );

          const value = dataArray[logIndex];
          const barHeight = (value / 255) * 100; // Scale to percentage of SVG height
          newHeights.push(barHeight);
        }

        this.barHeights = newHeights;
        this.animationId = requestAnimationFrame(animate);
      };
      this.animationId = requestAnimationFrame(animate);
    },
    stopVoiceActivityDetection() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }

      this.barHeights = Array(this.barHeights.length).fill(0);

      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
    },
  },
};
</script>
