import llms from "./aimodels/llms";
import image from "./aimodels/image";
import speechToText from "./aimodels/speechToText";
import textToSpeech from "./aimodels/textToSpeech";
import video from "./aimodels/video";

export function getDomains() {
  return [
    { value: "api.openai.com", label: "OpenAI", icon: "ai-openai", brand: "openai" },
    { value: "api.airtable.com", label: "Airtable", icon: "ai-airtable", brand: "airtable" },
    { value: "api.rows.com", label: "Rows.com", icon: "ai-rows", brand: "rows" },
    { value: "openrouter.ai", label: "Open Router", icon: "ai-openrouter", brand: "openrouter" },
    { value: "api.replicate.com", label: "Replicate", icon: "ai-replicate", brand: "replicate" },
    { value: "api.deepgram.com", label: "Deepgram", icon: "ai-deepgram", brand: "deepgram" },
    { value: "*.make.com", label: "Make.com", icon: "ai-make", brand: "make" },
    { value: "api.bfl.ml", label: "Black Forest Labs", icon: "ai-blackforestlabs", brand: "blackforestlabs" },
    { value: "api.ideogram.ai", label: "Ideogram", icon: "ai-ideogram", brand: "ideogram" },
    { value: "*.fal.run", label: "Fal", icon: "ai-fal", brand: "fal" },
    { value: "api.runware.ai", label: "Runway", icon: "ai-runway", brand: "runway" },
    { value: "api.segmind.com", label: "Segmind", icon: "ai-segmind", brand: "segmind" },
    { value: "*.ionos.com", label: "IONOS AI", icon: "ai-ionos", brand: "ionos" },
    { value: "*.openai.azure.com", label: "Azure", icon: "ai-azure", brand: "azure" },
    { value: "api.elevenlabs.io", label: "ElevenLabs", icon: "ai-elevenlabs", brand: "elevenlabs" },
    { value: "api.anthropic.com", label: "Claude", icon: "ai-claude", brand: "claude" },
    { value: "api.perplexity.ai", label: "Perplexity", icon: "ai-perplexity", brand: "perplexity" },
  ];
}

export function getAllTypes() {
  return ['llm', 'image', 'video', 'speechToText', 'textToSpeech'];
}

export function getAllBrandsByType() {
  const brandsByType = {};
  brandsByType["llm"] = llms.brands;
  brandsByType["image"] = image.brands;
  brandsByType["video"] = video.brands;
  brandsByType["speechToText"] = speechToText.brands;
  brandsByType["textToSpeech"] = textToSpeech.brands;
  return brandsByType;
}

export function getAllBrands() {
  const temp = [];
  Object.values(getAllBrandsByType()).forEach((brands) => {
    for (const b of brands) {
      if (!temp[b.id]) {
        temp[b.id] = b;
      }
    }
  });
  return Object.values(temp);
}


export function getAllModelsByTypeAndBrand() {
  const modelsByTypeAndBrand = {
    llm: {},
    image: {},
    video: {},
    speechToText: {},
    textToSpeech: {},
  };
  llms.models.forEach((m) => {
    if (!modelsByTypeAndBrand["llm"][m.type]) {
      modelsByTypeAndBrand["llm"][m.type] = [];
    }
    modelsByTypeAndBrand["llm"][m.type].push(m);
  });
  image.models.forEach((m) => {
    if (!modelsByTypeAndBrand["image"][m.type]) {
      modelsByTypeAndBrand["image"][m.type] = [];
    }
    modelsByTypeAndBrand["image"][m.type].push(m);
  });
  video.models.forEach((m) => {
    if (!modelsByTypeAndBrand["video"][m.type]) {
      modelsByTypeAndBrand["video"][m.type] = [];
    }
    modelsByTypeAndBrand["video"][m.type].push(m);
  });
  speechToText.models.forEach((m) => {
    if (!modelsByTypeAndBrand["speechToText"][m.type]) {
      modelsByTypeAndBrand["speechToText"][m.type] = [];
    }
    modelsByTypeAndBrand["speechToText"][m.type].push(m);
  });
  textToSpeech.models.forEach((m) => {
    if (!modelsByTypeAndBrand["textToSpeech"][m.type]) {
      modelsByTypeAndBrand["textToSpeech"][m.type] = [];
    }
    modelsByTypeAndBrand["textToSpeech"][m.type].push(m);
  });

  return modelsByTypeAndBrand;
}

export function getDefaultSecrets() {
  const result = [];

  const domainsByBrand = {};
  getDomains().forEach((d) => {
    domainsByBrand[d.brand] = d.value;
  });
  const all = getAllModelsByTypeAndBrand();
  Object.keys(all).forEach((type) => {
    Object.keys(all[type]).forEach((brand) => {
      all[type][brand].forEach((model) => {

        result.push({
          name: model.id,
          label: model.id,
          value: "",
          domain: domainsByBrand[brand] || "",
          type: type,
          brand: brand,
          pricing: 0,
          pricingQuantity: 0,
          status: true,
        });
      });
    });
  });

  return result;
}
