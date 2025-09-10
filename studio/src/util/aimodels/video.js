const video = {
  id: "video",
  title: "Video AI",
  icon: "mdi mdi-video",
  logo: "ai-video",
  brands: [{ id: "fal", label: "Fal", logo: "ai-fal" }],
  models: [
    {
      id: "fal-runway",
      name: "Runway - Image2Video",
      url: "https://queue.fal.run/fal-ai/runway-gen3/turbo/image-to-video",
      headers: [{ key: "Content-Type", value: "application/json" }],
      type: "fal",
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "prompt",
          label: "Prompt",
          placeholder: "Describe the image you want to generate",
        },
        {
          type: "file",
          required: true,
          id: "image_url",
          label: "Image URL",
          helper: "Upload an image file (JPEG, WEBP, PNG only)",
        },
      ],
      advanced: [
        {
          options: [5, 10],
          default: 5,
          type: "DropDown",
          required: true,
          id: "duration",
          label: "Duration",
          helper:
            "The duration of the generated video in seconds Default value: 5",
        },
        {
          options: ["16:9", "9:16"],
          default: "16:9",
          type: "DropDown",
          required: true,
          id: "aspect_ratio",
          label: "Aspect Ratio",
          helper: "The aspect ratio of the generated video",
        },
        {
          type: "Number",
          id: "seed",
          label: "Seed",
          description:
            "The same seed and the same prompt given to the same version of the model will output the same video every time.",
        },
      ],
      method: "POST",
      authType: "Key",
      modelId: "fal-ai/runway-gen3/turbo/image-to-video",
      documentationAuthLink:
        "https://fal.ai/models/fal-ai/flux/dev/image-to-image/api",
      getTemplate: (vars) => {
        return {
          ...vars,
        };
      },
      output: {
        path: "data.video.url",
        type: "JSON",
      },
      secondjobcall: {
        url: "https://queue.fal.run/fal-ai/runway-gen3/requests/$REQUEST_ID",
        headers: [{ key: "Content-Type", value: "application/json" }],
        method: "GET",
        token: "",
        input: {
          type: "JSON",
        },
        output: {
          type: "JSON",
          path: "video.url",
        },
        authType: "Key",
      },
    },
    {
      id: "fal-luma",
      name: "Luma Dream - Text2Video",
      url: "https://queue.fal.run/fal-ai/runway-gen3/turbo/image-to-video",
      headers: [{ key: "Content-Type", value: "application/json" }],
      type: "fal",
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "prompt",
          label: "Prompt",
          placeholder: "Describe the image you want to generate",
        },
        {
          options: ["16:9", "9:16", "4:3", "3:4", "21:9", "9:21"],
          default: "16:9",
          type: "DropDown",
          required: true,
          id: "aspect_ratio",
          label: "Aspect Ratio",
          helper: "Aspect ratio for the generated image",
        },
      ],
      advanced: [
        {
          type: "CheckBox",
          id: "loop",
          label: "Loop",
          description:
            "Whether the video should loop (end of video is blended with the beginning)",
          default: false,
        },
      ],
      method: "POST",
      authType: "Key",
      modelId: "fal-ai/luma-dream-machine",
      documentationAuthLink:
        "https://fal.ai/models/fal-ai/flux/dev/image-to-image/api",
      getTemplate: (vars) => {
        return {
          ...vars,
        };
      },
      output: {
        path: "data.video.url",
        type: "JSON",
      },
    },
    {
      id: "fal-luma-image",
      name: "Luma Dream - Image2Video",
      url: "https://queue.fal.run/fal-ai/runway-gen3/turbo/image-to-video",
      headers: [{ key: "Content-Type", value: "application/json" }],
      type: "fal",
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "prompt",
          label: "Prompt",
          placeholder: "Describe the image you want to generate",
        },
        {
          type: "file",
          required: true,
          id: "image_url",
          label: "Image URL",
          helper: "Upload an image file (JPEG, WEBP, PNG only)",
        },
        {
          options: ["16:9", "9:16", "4:3", "3:4", "21:9", "9:21"],
          default: "16:9",
          type: "DropDown",
          required: true,
          id: "aspect_ratio",
          label: "Aspect Ratio",
          helper: "Aspect ratio for the generated image",
        },
      ],
      advanced: [
        {
          type: "CheckBox",
          id: "loop",
          label: "Loop",
          description:
            "Whether the video should loop (end of video is blended with the beginning)",
          default: false,
        },
      ],
      method: "POST",
      authType: "Key",
      modelId: "fal-ai/luma-dream-machine/image-to-video",
      documentationAuthLink:
        "https://fal.ai/models/fal-ai/flux/dev/image-to-image/api",
      getTemplate: (vars) => {
        return {
          ...vars,
        };
      },
      output: {
        path: "data.video.url",
        type: "JSON",
      },
    },
    {
      id: "fal-kling",
      name: "Kling - Image2Video",
      url: "https://queue.fal.run/fal-ai/runway-gen3/turbo/image-to-video",
      headers: [{ key: "Content-Type", value: "application/json" }],
      type: "fal",
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "prompt",
          label: "Prompt",
          placeholder: "Describe the image you want to generate",
        },
        {
          type: "file",
          required: true,
          id: "image_url",
          label: "Image URL",
          helper: "Upload an image file (JPEG, WEBP, PNG only)",
        },
        {
          options: ["16:9", "9:16", "1:1"],
          default: "16:9",
          type: "DropDown",
          required: true,
          id: "aspect_ratio",
          label: "Aspect Ratio",
          helper: "Aspect ratio for the generated image",
        },
      ],
      advanced: [
        {
          options: ["5", "10"],
          default: "5",
          type: "DropDown",
          required: true,
          id: "duration",
          label: "Duration",
          helper:
            "The duration of the generated video in seconds Default value: 5",
        },
      ],
      method: "POST",
      authType: "Key",
      modelId: "fal-ai/kling-video/v1/standard/text-to-video",
      documentationAuthLink:
        "https://fal.ai/models/fal-ai/flux/dev/image-to-image/api",
      getTemplate: (vars) => {
        return {
          ...vars,
        };
      },
      output: {
        path: "data.video.url",
        type: "JSON",
      },
    },
    {
      id: "fal-cogvideo",
      name: "CogVideo - Text2Video",
      url: "https://queue.fal.run/fal-ai/runway-gen3/turbo/image-to-video",
      headers: [{ key: "Content-Type", value: "application/json" }],
      type: "fal",
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "prompt",
          label: "Prompt",
          placeholder: "Describe the image you want to generate",
        },
        {
          options: [
            { value: "square_hd", label: "Square HD" },
            { value: "square", label: "Square" },
            { value: "portrait_4_3", label: "portrait_4_3" },
            { value: "portrait_16_9", label: "Portrait 16:9" },
            { value: "landscape_4_3", label: "Landscape 4:3" },
            { value: "landscape_16_9", label: "Landscape 16:9" },
          ],
          default: "square_hd",
          type: "DropDown",
          required: true,
          id: "video_size",
          label: "Video Size",
          helper: "The size of the generated video",
        },
      ],
      advanced: [
        {
          type: "TextArea",
          id: "negative_prompt",
          label: "Negative Prompt",
          helper: "Specify things to not see in the video",
        },
        {
          default: 7.5,
          min: 1,
          max: 20,
          type: "range",
          required: true,
          id: "guidance_scale",
          label: "Guidance Scale",
          helper:
            "The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related video to show you. Default value: 7",
          decimals: true,
        },
        {
          type: "Number",
          id: "num_inference_steps",
          label: "Inference Steps",
          description:
            "The number of inference steps to perform. Default value: 50",
          default: 50,
          min: 1,
          max: 50,
        },
        {
          type: "Number",
          id: "seed",
          label: "Seed",
          description:
            "The same seed and the same prompt given to the same version of the model will output the same video every time.",
        },
        {
          default: true,
          type: "CheckBox",
          id: "use_rife",
          label: "Use Rife",
          helper: "Use RIFE for video interpolation.",
        },
        {
          default: 16,
          min: 0,
          max: 48,
          type: "range",
          id: "export_fps",
          label: "Export FPS",
          helper: "The target FPS of the video",
        },
      ],
      method: "POST",
      authType: "Key",
      modelId: "fal-ai/cogvideox-5b",
      documentationAuthLink:
        "https://fal.ai/models/fal-ai/flux/dev/image-to-image/api",
      getTemplate: (vars) => {
        return {
          ...vars,
        };
      },
      output: {
        path: "data.video.url",
        type: "JSON",
      },
    },
    {
      id: "fal-cogvideo-image",
      name: "CogVideo - Image2Video",
      url: "https://queue.fal.run/fal-ai/runway-gen3/turbo/image-to-video",
      headers: [{ key: "Content-Type", value: "application/json" }],
      type: "fal",
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "prompt",
          label: "Prompt",
          placeholder: "Describe the image you want to generate",
        },
        {
          type: "file",
          required: true,
          id: "image_url",
          label: "Image URL",
          helper: "Upload an image file (JPEG, WEBP, PNG only)",
        },
        {
          options: [
            { value: "square_hd", label: "Square HD" },
            { value: "square", label: "Square" },
            { value: "portrait_4_3", label: "portrait_4_3" },
            { value: "portrait_16_9", label: "Portrait 16:9" },
            { value: "landscape_4_3", label: "Landscape 4:3" },
            { value: "landscape_16_9", label: "Landscape 16:9" },
          ],
          default: "square_hd",
          type: "DropDown",
          required: true,
          id: "video_size",
          label: "Video Size",
          helper: "The size of the generated video",
        },
      ],
      advanced: [
        {
          type: "TextArea",
          id: "negative_prompt",
          label: "Negative Prompt",
          helper: "Specify things to not see in the video",
        },
        {
          default: 7.5,
          min: 1,
          max: 20,
          type: "range",
          required: true,
          id: "guidance_scale",
          label: "Guidance Scale",
          helper:
            "The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related video to show you. Default value: 7",
          decimals: true,
        },
        {
          type: "Number",
          id: "num_inference_steps",
          label: "Inference Steps",
          description:
            "The number of inference steps to perform. Default value: 50",
          default: 50,
          min: 1,
          max: 50,
        },
        {
          type: "Number",
          id: "seed",
          label: "Seed",
          description:
            "The same seed and the same prompt given to the same version of the model will output the same video every time.",
        },
        {
          default: true,
          type: "CheckBox",
          id: "use_rife",
          label: "Use Rife",
          helper: "Use RIFE for video interpolation.",
        },
        {
          default: 16,
          min: 0,
          max: 48,
          type: "range",
          id: "export_fps",
          label: "Export FPS",
          helper: "The target FPS of the video",
        },
      ],
      method: "POST",
      authType: "Key",
      modelId: "fal-ai/cogvideox-5b/image-to-video",
      documentationAuthLink:
        "https://fal.ai/models/fal-ai/flux/dev/image-to-image/api",
      getTemplate: (vars) => {
        return {
          ...vars,
        };
      },
      output: {
        path: "data.video.url",
        type: "JSON",
      },
    },
    {
      id: "fal-mochi",
      name: "Mochi - Text2Video",
      url: "https://queue.fal.run/fal-ai/runway-gen3/turbo/image-to-video",
      headers: [{ key: "Content-Type", value: "application/json" }],
      type: "fal",
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "prompt",
          label: "Prompt",
          placeholder: "The prompt to generate a video from",
        },
      ],
      advanced: [
        {
          type: "Number",
          id: "seed",
          label: "Seed",
          description:
            "The same seed and the same prompt given to the same version of the model will output the same video every time.",
        },
      ],
      method: "POST",
      authType: "Key",
      modelId: "fal-ai/mochi-v1",
      documentationAuthLink:
        "https://fal.ai/models/fal-ai/flux/dev/image-to-image/api",
      getTemplate: (vars) => {
        return {
          ...vars,
        };
      },
      output: {
        path: "data.video.url",
        type: "JSON",
      },
    },
    {
      id: "fal-minimax",
      name: "Minimax - Text2Video",
      url: "https://queue.fal.run/fal-ai/runway-gen3/turbo/image-to-video",
      headers: [{ key: "Content-Type", value: "application/json" }],
      type: "fal",
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "prompt",
          label: "Prompt",
          placeholder: "The prompt to generate a video from",
        },
        {
          type: "CheckBox",
          id: "prompt_optimizer",
          label: "Prompt Optimizer",
          description:
            "Whether to use the model's prompt optimizer",
          default: true,
        },
      ],
      advanced: [
      ],
      method: "POST",
      authType: "Key",
      modelId: "fal-ai/minimax-video",
      documentationAuthLink:
        "https://fal.ai/models/fal-ai/flux/dev/image-to-image/api",
      getTemplate: (vars) => {
        return {
          ...vars,
        };
      },
      output: {
        path: "data.video.url",
        type: "JSON",
      },
    },
    {
      id: "fal-minimax-image",
      name: "Minimax - Image2Video",
      url: "https://queue.fal.run/fal-ai/runway-gen3/turbo/image-to-video",
      headers: [{ key: "Content-Type", value: "application/json" }],
      type: "fal",
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "prompt",
          label: "Prompt",
          placeholder: "The prompt to generate a video from",
        },
        {
          type: "file",
          required: true,
          id: "image_url",
          label: "Image URL",
          helper: "Upload an image file (JPEG, WEBP, PNG only)",
        },
        {
          type: "CheckBox",
          id: "prompt_optimizer",
          label: "Prompt Optimizer",
          description:
            "Whether to use the model's prompt optimizer",
          default: true,
        },
      ],
      advanced: [
      ],
      method: "POST",
      authType: "Key",
      modelId: "fal-ai/minimax-video/image-to-video",
      documentationAuthLink:
        "https://fal.ai/models/fal-ai/flux/dev/image-to-image/api",
      getTemplate: (vars) => {
        return {
          ...vars,
        };
      },
      output: {
        path: "data.video.url",
        type: "JSON",
      },
    }
  ],
};

export default video;
