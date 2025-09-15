import { azureOpenAI } from "./llm/azureOpenAi.js";
import {
  openrouter_meta_llama_3_2_3b_instruct_free,
  openrouter_pixtral_12b_free,
  openrouter_gemini_flash,
  openrouter_mythomax_l2_13b,
  openrouter_mythomax_l2_13b_free,
  openrouter_antrophic_claude,
  openrouter_gemini_pro,
  openrouter_gpt_mini,
  openrouter_llama,
} from "./llm/openrouter.js";
import { mistral_meta_mistral_7b_instruct_free } from "./llm/mistral.js";
import { antrophic_35_sonnet, antrophic_3_opus, antrophic_3_sonnet } from "./llm/antrophic.js";
//import { gemini_vertex_ai } from "./llm/gemini.js";
import {
  openai_01_mini,
  openai_01_preview,
  openai_chat_4_turbo,
  openai_chat_gpt_4o,
  openai_chat_gpt_4o_mini,
  openai_chat_gpt_4o_mini_search_preview,
  openai_chat_gpt_4o_search_preview,
  openai_chat_40_mini,
  openai_chat_4_1_nano,
  openai_chat_5_nano,
  openai_chat_5_mini,
  openai_chat_5
} from "./llm/openai.js";
import {
  perplexity_llama_3_70b_instruct,
  perplexity_llama_3_8b_instruct,
  perplexity_llama_small_online,
  perplexity_llama_sonar_large_online,
  perplexity_mixtral_8x7b_instruct,
} from "./llm/perplexity.js";

const llms = {
  id: "llms",
  title: "Text AI",
  icon: "mdi mdi-chat",
  logo: "ai-text",
  brands: [
    { id: "azure", label: "Azure", logo: "ai-azure" },
    { id: "claude", label: "Claude", logo: "ai-claude" },
    // { id: "gemini", label: "Gemini", logo: "ai-gemini" },
    { id: "openai", label: "OpenAI", logo: "ai-openai" },
    { id: "openrouter", label: "Open Router", logo: "ai-openrouter" },
    { id: "perplexity", label: "Perplexity", logo: "ai-perplexity" },
  ],
  models: [
    azureOpenAI,
    openrouter_meta_llama_3_2_3b_instruct_free,
    openrouter_pixtral_12b_free,
    openrouter_gemini_flash,
    openrouter_mythomax_l2_13b,
    openrouter_mythomax_l2_13b_free,
    mistral_meta_mistral_7b_instruct_free,
    antrophic_35_sonnet,
    antrophic_3_opus,
    antrophic_3_sonnet,
   // gemini_vertex_ai,

    openai_chat_5_nano,
    openai_chat_5,
    openai_chat_5_mini,
    openai_chat_4_1_nano,
    openai_chat_40_mini,

    openai_01_mini,
    openai_01_preview,
    openai_chat_4_turbo,
    openai_chat_gpt_4o,
    openai_chat_gpt_4o_mini,
    openai_chat_gpt_4o_mini_search_preview,
    openai_chat_gpt_4o_search_preview,

    openrouter_antrophic_claude,
    openrouter_gemini_pro,
    openrouter_gpt_mini,
    openrouter_llama,

    perplexity_llama_3_70b_instruct,
    perplexity_llama_3_8b_instruct,
    perplexity_llama_small_online,
    perplexity_llama_sonar_large_online,
    perplexity_mixtral_8x7b_instruct,
  ],
};

export default llms;
