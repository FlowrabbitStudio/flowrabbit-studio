const textToSpeech = {
  id: "textToSpeech",
  title: "Text to Speech",
  icon: "mdi mdi-music",
  logo: "ai-text-speech",
  brands: [
    { id: "replicate", label: "Replicate", logo: "ai-replicate" },
    { id: "deepgram", label: "Deepgram", logo: "ai-deepgram" },
    { id: "elevenlabs", label: "ElevenLabs", logo: "ai-elevenlabs" },
  ],
  models: [
    {
      id: "replicate-suno-bark",
      name: "Suno Bark",
      url: "https://api.replicate.com/v1/predictions",
      type: "replicate",
      headers: [{ key: "Content-Type", value: "application/json" }],
      elements: [
        {
          options: [
            "de_speaker_0",
            "en_speaker_0",
            "es_speaker_0",
            "fr_speaker_0",
          ],
          default: "announcer",
          type: "DropDown",
          label: "History Prompt",
          id: "history_prompt",
          helper: "History choice for audio cloning, choose from the list",
        },
        {
          type: "TextArea",
          required: true,
          id: "prompt",
          label: "Prompt",
          placeholder: "An astronaut",
        },
      ],
      advanced: [
        {
          default: 0.7,
          min: 0,
          max: 1,
          type: "range",
          required: true,
          id: "text_temp",
          label: "Text Temperature",
          helper:
            "Generation temperature (1.0 more diverse, 0.0 more conservative)",
        },
        {
          default: 0.7,
          min: 0,
          max: 1,
          type: "range",
          required: true,
          id: "waveform_temp",
          label: "Waveform Temperature",
          helper:
            "Generation temperature (1.0 more diverse, 0.0 more conservative)",
        },
      ],
      method: "POST",
      authType: "Bearer",
      documentationAuthLink:
        "https://replicate.com/docs/reference/http#authentication",
      getTemplate: (vars) => {
        return {
          version:
            "b76242b40d67c76ab6742e987628a2a9ac019e11d56ab96c4e91ce03b79b2787",
          input: {
            ...vars,
          },
        };
      },
      output: {
        path: "id",
        type: "JSON",
      },
      secondjobcall: {
        url: "https://api.replicate.com/v1/predictions/",
        headers: [{ key: "Content-Type", value: "application/json" }],
        method: "GET",
        token: "",
        input: {
          type: "JSON",
        },
        output: {
          type: "JSON",
          databinding: "",
          template: "",
          hints: {},
          path: "output.audio_out",
        },
        authType: "Bearer",
      },
    },
    {
      id: "elevenlabs-speech",
      name: "V1",
      url: "https://api.elevenlabs.io/v1/text-to-speech/",
      type: "elevenlabs",
      headers: [{ key: "Content-Type", value: "application/json" }],
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "prompt",
          label: "Prompt",
          placeholder: "An astronaut",
        },
      ],
      advanced: [
      ],
      method: "POST",
      documentationAuthLink:
        "https://replicate.com/docs/reference/http#authentication",
      getTemplate: (vars) => {
        return {
          text: vars.prompt,
          model_id: "eleven_monolingual_v1",
        };
      },
      output: {
        path: "",
        type: "FILE",
      },
      authHeader: "xi-api-key",
    },
    {
      id: "replicate-musicgen",
      name: "Meta MusicGen",
      url: "https://api.replicate.com/v1/predictions",
      type: "replicate",
      headers: [{ key: "Content-Type", value: "application/json" }],
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "prompt",
          label: "Prompt",
          placeholder: "Describe the music you want to generate",
          helper: "A description of the music you want to generate.",
        },
        {
          type: "Combo",
          id: "input_audio",
          label: "Input Audio",
          placeholder: "Enter audio file URL",
          helper: "An audio file that will influence the generated music.",
        },
      ],
      advanced: [
        {
          default: "stereo-melody-large",
          type: "DropDown",
          required: true,
          id: "model_version",
          label: "Model Version",
          options: ["stereo-melody-large", "stereo-large", "melody-large", "large"],
          helper: "Model to use for generation.",
        },
        {
          default: 8,
          min: 1,
          type: "Number",
          required: false,
          id: "duration",
          label: "Duration",
          helper: "Duration of the generated audio in seconds.",
        },
        {
          type: "Number",
          id: "seed",
          label: "Seed",
          helper: "Seed for random number generator. If None or -1, a random seed will be used.",
        },
        {
          default: 250,
          min: 1,
          type: "Number",
          required: false,
          id: "top_k",
          label: "Top K",
          helper: "Reduces sampling to the k most likely tokens.",
        },
        {
          default: 0,
          min: 0.0,
          max: 1.0,
          type: "range",
          required: false,
          id: "top_p",
          label: "Top P",
          helper: "Reduces sampling to tokens with cumulative probability of p.",
          decimals: true,
        },
        {
          default: 1,
          min: 0.0,
          max: 2.0,
          type: "range",
          required: false,
          id: "temperature",
          label: "Temperature",
          helper: "Controls the 'conservativeness' of the sampling process.",
          decimals: true,
        },
        {
          default: false,
          type: "CheckBox",
          required: false,
          id: "continuation",
          label: "Continuation",
          helper: "If `True`, generated music will continue from `input_audio`.",
        },
        {
          default: "wav",
          type: "DropDown",
          required: false,
          id: "output_format",
          label: "Output Format",
          options: ["wav", "mp3"],
          helper: "Output format for generated audio.",
        },
        {
          type: "Number",
          required: false,
          id: "continuation_end",
          label: "Continuation End",
          helper: "End time of the audio file to use for continuation.",
        },
        {
          default: 0,
          type: "Number",
          required: false,
          id: "continuation_start",
          label: "Continuation Start",
          helper: "Start time of the audio file to use for continuation.",
        },
        {
          default: false,
          type: "CheckBox",
          required: false,
          id: "multi_band_diffusion",
          label: "Multi Band Diffusion",
          helper: "If `True`, the EnCodec tokens will be decoded with MultiBand Diffusion.",
        },
        {
          default: "loudness",
          type: "DropDown",
          required: false,
          id: "normalization_strategy",
          label: "Normalization Strategy",
          options: ["loudness", "clip", "peak", "rms"],
          helper: "Strategy for normalizing audio.",
        },
        {
          default: 3,
          min: 1,
          max: 10,
          type: "Number",
          required: false,
          id: "classifier_free_guidance",
          label: "Classifier Free Guidance",
          helper: "Increases the influence of inputs on the output.",
        },
      ],
      method: "POST",
      authType: "Bearer",
      documentationAuthLink: "https://replicate.com/docs",
      getTemplate: (vars) => ({
        "version": "671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
        input: {
          ...vars
        },
      }),
      output: {
        path: "id",
        type: "JSON",
      },
      secondjobcall: {
        url: "https://api.replicate.com/v1/predictions/",
        headers: [{ key: "Content-Type", value: "application/json" }],
        method: "GET",
        token: "",
        input: {
          type: "JSON",
        },
        output: {
          type: "JSON",
          path: "output",
        },
        authType: "Bearer",
      },
    }
  ],
};
export default textToSpeech;
