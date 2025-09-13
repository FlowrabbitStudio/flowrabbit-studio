const speechToText = {
  id: "speechToText",
  title: "Speech to Text",
  logo: "ai-speech-text",
  brands: [{ id: "deepgram", label: "Deepgram", logo: "ai-deepgram" }],
  models: [
    {
      id: "deepgram-nova-2",
      name: "Deepgram Nova 2",
      url: "https://api.deepgram.com/v1/listen",
      type: "deepgram",
      headers: [],
      elements: [
        {
          type: "DropDown",
          id: "model",
          label: "AI Model",
          options: [
            {
              value: "nova-2-general",
              label: "Base General - Optimized for everyday audio processing",
            },
            {
              value: "nova-2-meeting",
              label:
                "Meeting - Optimized for conference room settings, with multiple speakers and a single microphone",
            },
            {
              value: "nova-2-phonecall",
              label:
                "Phonecall - Optimized for low-bandwidth audio phone calls",
            },
            {
              value: "nova-2-voicemail",
              label:
                "Voicemail - Optimized for low-bandwidth audio clips with a single speaker, derived from the phonecall model",
            },
            {
              value: "nova-2-finance",
              label:
                "Finance - Optimized for multiple speakers with varying audio quality, focused on finance vocabulary",
            },
            {
              value: "nova-2-conversationalai",
              label:
                "Conversational AI - Optimized for human-to-bot interactions like IVR or voice assistants",
            },
            {
              value: "nova-2-video",
              label: "Video - Optimized for audio sourced from videos",
            },
            {
              value: "nova-2-medical",
              label:
                "Medical - Optimized for audio with medical-specific vocabulary",
            },
            {
              value: "nova-2-drivethru",
              label: "Drivethru - Optimized for audio sources from drivethrus",
            },
            {
              value: "nova-2-automotive",
              label:
                "Automotive - Optimized for automotive-specific vocabulary",
            },
            {
              value: "nova-2-atc",
              label: "ATC - Optimized for audio from air traffic control",
            },
          ],
          default: "nova-2-general",
          helper: 'The AI model used to process submitted audio'
        },
        {
          type: "CheckBox",
          id: "detect_language",
          label: "Language Detection",
          default: false,
        },
        {
          type: "Input",
          id: "keywords",
          label: "Keywords",
          helper: "Keywords to prioritize in transcription",
        },
      ],
      advanced: [
        {
          type: "Input",
          id: "custom_topic",
          label: "Custom Topic",
          helper: "Custom topic to detect within the input audio",
        },
        {
          type: "flex",
          content: [
            {
              type: "CheckBox",
              id: "filler_words",
              label: "Include Filler Words",
              default: false,
            },
            {
              type: "CheckBox",
              id: "intents",
              label: "Intent Recognition",
              default: false,
            },
          ],
        },
        {
          type: "flex",
          content: [
            {
              type: "CheckBox",
              id: "diarize",
              label: "Recognize Speaker Changes",
              default: false,
            },
            {
              type: "CheckBox",
              id: "sentiment",
              label: "Sentiment Analysis",
              default: false,
            },
          ],
        },
        {
          type: "flex",
          content: [
            {
              type: "CheckBox",
              id: "topics",
              label: "Detect Topics",
              default: false,
            },
            {
              type: "CheckBox",
              id: "utterances",
              label: "Segment Speech",
              default: false,
            },
          ],
        },

        {
          type: "Input",
          id: "redact",
          label: "Redact Sensitive Information",
          helper: "Specify information types to redact",
        },
        {
          type: "Input",
          id: "search",
          label: "Search Terms",
          helper: "Terms to search for in the audio",
        },
        {
          type: "Input",
          id: "replace",
          label: "Search and Replace",
          helper: "Terms to search and replace in the audio",
        },

        {
          type: "Input",
          id: "tag",
          label: "Request Tag",
          helper: "Tag associated with the request",
        },
        {
          type: "Number",
          id: "utt_split",
          label: "Utterance Split Length",
          helper: "Time in seconds to split utterances",
          default: 0.8,
        },
        {
          type: "DropDown",
          id: "version",
          label: "Model Version",
          options: ["latest", "v1"],
          default: "latest",
        },
      ],
      model: "nova-2",
      method: "POST",
      authType: "",
      documentationAuthLink: "https://api.deepgram.com/documentation",
      getTemplate: (vars) => {
        return {
          model: vars.model,
          language: vars.language,
        };
      },
      input: {
        type: "AUDIO"
      },
      output: {
        path: "results",
        type: "JSON",
      },
    },
    {
      id: "deepgram-nova-2-stream",
      name: "Deepgram Nova 2 Stream",
      url: "https://api.deepgram.com/v1/listen",
      type: "deepgram",
      headers: [],
      elements: [
        {
          id: "dependentGroup1",
          type: "DependentGroup",
          items: [
            {
              type: "DropDown",
              id: "model",
              label: "AI Model",
              options: [
                {
                  value: "nova-2-general",
                  label:
                    "Base General - Optimized for everyday audio processing",
                },
                {
                  value: "nova-2-meeting",
                  label:
                    "Meeting - Optimized for conference room settings, with multiple speakers and a single microphone",
                },
                {
                  value: "nova-2-phonecall",
                  label:
                    "Phonecall - Optimized for low-bandwidth audio phone calls",
                },
                {
                  value: "nova-2-voicemail",
                  label:
                    "Voicemail - Optimized for low-bandwidth audio clips with a single speaker, derived from the phonecall model",
                },
                {
                  value: "nova-2-finance",
                  label:
                    "Finance - Optimized for multiple speakers with varying audio quality, focused on finance vocabulary",
                },
                {
                  value: "nova-2-conversationalai",
                  label:
                    "Conversational AI - Optimized for human-to-bot interactions like IVR or voice assistants",
                },
                {
                  value: "nova-2-video",
                  label: "Video - Optimized for audio sourced from videos",
                },
                {
                  value: "nova-2-medical",
                  label:
                    "Medical - Optimized for audio with medical-specific vocabulary",
                },
                {
                  value: "nova-2-drivethru",
                  label:
                    "Drivethru - Optimized for audio sources from drivethrus",
                },
                {
                  value: "nova-2-automotive",
                  label:
                    "Automotive - Optimized for automotive-specific vocabulary",
                },
                {
                  value: "nova-2-atc",
                  label: "ATC - Optimized for audio from air traffic control",
                },
              ],
              default: "nova-2-general",
              helper: 'The AI model used to process submitted audio'
            },
            {
              id: "language",
              type: "DropDown",
              label: "Language",
              dependentOn: "model",
              getOptions: function (dependentSelections) {
                const country = dependentSelections["model"];
                if (country === "nova-2-general") {
                  return [
                    { value: "bg", label: "Bulgarian" },
                    { value: "ca", label: "Catalan" },
                    {
                      value: "zh,zh-CN,zh-Hans",
                      label: "Chinese (Mandarin, Simplified)",
                    },
                    {
                      value: "zh-TW,zh-Hant",
                      label: "Chinese (Mandarin, Traditional)",
                    },
                    {
                      value: "zh-HK",
                      label: "Chinese (Cantonese, Traditional)",
                    },
                    { value: "cs", label: "Czech" },
                    { value: "da,da-DK", label: "Danish" },
                    { value: "nl", label: "Dutch" },
                    {
                      value: "en,en-US,en-AU,en-GB,en-NZ,en-IN",
                      label: "English",
                    },
                    { value: "et", label: "Estonian" },
                    { value: "fi", label: "Finnish" },
                    { value: "nl-BE", label: "Flemish" },
                    { value: "fr,fr-CA", label: "French" },
                    { value: "de", label: "German" },
                    { value: "de-CH", label: "German (Switzerland)" },
                    { value: "el", label: "Greek" },
                    { value: "hi", label: "Hindi" },
                    { value: "hu", label: "Hungarian" },
                    { value: "id", label: "Indonesian" },
                    { value: "it", label: "Italian" },
                    { value: "ja", label: "Japanese" },
                    { value: "ko,ko-KR", label: "Korean" },
                    { value: "lv", label: "Latvian" },
                    { value: "lt", label: "Lithuanian" },
                    { value: "ms", label: "Malay" },
                    {
                      value: "multi",
                      label: "Multilingual (Spanish + English)",
                    },
                    { value: "no", label: "Norwegian" },
                    { value: "pl", label: "Polish" },
                    { value: "pt,pt-BR", label: "Portuguese" },
                    { value: "ro", label: "Romanian" },
                    { value: "ru", label: "Russian" },
                    { value: "sk", label: "Slovak" },
                    { value: "es", label: "Spanish" },
                    { value: "sv", label: "Swedish" },
                    { value: "th", label: "Thai" },
                    { value: "tr", label: "Turkish" },
                    { value: "uk", label: "Ukrainian" },
                    { value: "vi", label: "Vietnamese" },
                  ];
                }
                return [{ value: "en", label: "English (Default)" }, { value: "en-US", label: "English (United States)" }];
              },
              default: "en",
              helper:
                "The primary language spoken in the audio (English by default).",
            },
          ],
          getValue: function (a) {
            return a;
          },
        },
      ],
      advanced: [
        {
          id: "dictation",
          type: "CheckBox",
          label: "Dictation",
          default: false,
          helper: "Automatically format spoken commands for punctuation.",
        },
        {
          id: "diarize",
          type: "CheckBox",
          label: "Diarize",
          default: false,
          helper: "Enable speaker change detection.",
        },
        {
          id: "diarize_version",
          type: "Input",
          label: "Diarization Version",
          placeholder: "Version of diarization",
          helper: "Version of the diarization feature to use.",
        },
        {
          id: "encoding",
          type: "Input",
          label: "Encoding",
          placeholder: "Encoding format",
          helper: "Expected encoding format of the audio.",
        },
        {
          id: "endpointing",
          type: "CheckBox",
          label: "Endpointing",
          default: false,
          helper: "Control how long Deepgram waits for speech pauses.",
        },
        {
          id: "extra",
          type: "Input",
          label: "Extra",
          placeholder: "Extra parameter",
          helper: "Add additional query string parameters.",
        },
        {
          id: "filler_words",
          type: "CheckBox",
          label: "Filler Words",
          default: false,
          helper: "Include filler words like 'uh' and 'um' in the transcript.",
        },
        {
          id: "interim_results",
          type: "CheckBox",
          label: "Interim Results",
          default: false,
          helper: "Provide ongoing transcription updates.",
        },
        {
          id: "keywords",
          type: "Input",
          label: "Keywords",
          placeholder: "Keywords to recognize",
          helper: "List of specialized terms for the model to focus on.",
        },
        {
          id: "multichannel",
          type: "CheckBox",
          label: "Multichannel",
          default: false,
          helper: "Transcribe each audio channel independently.",
        },
        {
          id: "numerals",
          type: "CheckBox",
          label: "Numerals",
          default: false,
          helper: "Convert numbers from words to numerals.",
        },
        {
          id: "profanity_filter",
          type: "CheckBox",
          label: "Profanity Filter",
          default: false,
          helper: "Filter out profanity from the transcript.",
        },
        {
          id: "punctuate",
          type: "CheckBox",
          label: "Punctuate",
          default: true,
          helper: "Automatically punctuate the transcript.",
        },
        {
          id: "redact",
          type: "Input",
          label: "Redact",
          placeholder: "Sensitive terms",
          helper: "Redact sensitive information from the transcript.",
        },
        {
          id: "replace",
          type: "Input",
          label: "Replace",
          placeholder: "Terms to replace",
          helper: "Replace specific terms in the audio.",
        },
        {
          id: "sample_rate",
          type: "Number",
          label: "Sample Rate",
          placeholder: "Sample rate (Hz)",
          helper: "Sample rate of the audio (required with encoding).",
        },
        {
          id: "search",
          type: "Input",
          label: "Search",
          placeholder: "Search terms",
          helper: "Terms or phrases to search for in the audio.",
        },
        {
          id: "smart_format",
          type: "CheckBox",
          label: "Smart Format",
          default: false,
          helper:
            "Enable additional formatting to improve transcript readability.",
        },
        {
          id: "tag",
          type: "Input",
          label: "Tag",
          placeholder: "Request tag",
          helper: "Associate a tag with the transcription request.",
        },
        {
          id: "utterance_end_ms",
          type: "Input",
          label: "Utterance End Timeout",
          placeholder: "Time in ms",
          helper: "Time in ms to wait before sending an utterance end event.",
        },
        {
          id: "vad_events",
          type: "CheckBox",
          label: "VAD Events",
          default: false,
          helper: "Receive voice activity detection events.",
        },
        {
          id: "version",
          type: "Input",
          label: "Model Version",
          placeholder: "Version of the model",
          helper: "Specify the version of the model to use.",
        },
      ],
      model: "nova-2",
      method: "POST",
      authType: "",
      documentationAuthLink: "https://api.deepgram.com/documentation",
      getTemplate: (vars) => {
        return {
          model: vars.model,
          language: vars.language,
        };
      },
      input: {
        type: "AUDIO",
        stream: true
      },
      output: {
        path: "results",
        type: "JSON",
      },
    },
    {
      id: "deepgram-whisper",
      name: "Deepgram Whisper",
      url: "https://api.deepgram.com/v1/listen?model=whisper",
      type: "deepgram",
      headers: [],
      elements: [
        {
          type: "DropDown",
          id: "model",
          label: "AI Model",
          options: [
            "whisper",
            "whisper-tiny",
            "whisper-base",
            "whisper-small",
            "whisper-medium",
            "whisper-large",
          ],
          default: "whisper",
        },
        {
          type: "CheckBox",
          id: "detect_language",
          label: "Language Detection",
          default: false,
        },
        {
          type: "Input",
          id: "keywords",
          label: "Keywords",
          helper: "Keywords to prioritize in transcription",
        },
      ],
      advanced: [
        {
          type: "Input",
          id: "custom_topic",
          label: "Custom Topic",
          helper: "Custom topic to detect within the input audio",
        },
        {
          type: "flex",
          content: [
            {
              type: "CheckBox",
              id: "filler_words",
              label: "Include Filler Words",
              default: false,
            },
            {
              type: "CheckBox",
              id: "intents",
              label: "Intent Recognition",
              default: false,
            },
          ],
        },
        {
          type: "flex",
          content: [
            {
              type: "CheckBox",
              id: "diarize",
              label: "Recognize Speaker Changes",
              default: false,
            },
            {
              type: "CheckBox",
              id: "sentiment",
              label: "Sentiment Analysis",
              default: false,
            },
          ],
        },
        {
          type: "flex",
          content: [
            {
              type: "CheckBox",
              id: "topics",
              label: "Detect Topics",
              default: false,
            },
            {
              type: "CheckBox",
              id: "utterances",
              label: "Segment Speech",
              default: false,
            },
          ],
        },

        {
          type: "Input",
          id: "redact",
          label: "Redact Sensitive Information",
          helper: "Specify information types to redact",
        },
        {
          type: "Input",
          id: "search",
          label: "Search Terms",
          helper: "Terms to search for in the audio",
        },
        {
          type: "Input",
          id: "replace",
          label: "Search and Replace",
          helper: "Terms to search and replace in the audio",
        },

        {
          type: "Input",
          id: "tag",
          label: "Request Tag",
          helper: "Tag associated with the request",
        },
        {
          type: "Number",
          id: "utt_split",
          label: "Utterance Split Length",
          helper: "Time in seconds to split utterances",
          default: 0.8,
        },
        {
          type: "DropDown",
          id: "version",
          label: "Model Version",
          options: ["latest", "v1"],
          default: "latest",
        },
      ],
      model: "nova-2",
      method: "POST",
      authType: "",
      documentationAuthLink: "https://api.deepgram.com/documentation",
      getTemplate: (vars) => {
        return {
          model: vars.model,
          language: vars.language,
        };
      },
      input: {
        type: "AUDIO",
      },
      output: {
        path: "results",
        type: "JSON",
      },
    },
  ],
};

export default speechToText;
