import image from './image'
import textToSpeech from './textToSpeech'
import speechToText from './speechToText'
import llms from './llms'
import video from './video'
import ionos from './ionos'

export default class AIModelsUtil {
  static aiTypes = {
    image: "image",
    textToSpeech: "textToSpeech",
    speechToText: "speechToText",
    llms: "llms",
    video: 'video',
    ionos: "ionos"
  };

  static aiTypesOptions = {
    image: {id: "image", label: "Image"},
    textToSpeech: {id: "textToSpeech", label: "Text To Speech"},
    speechToText: {id: "speechToText", label: "Speech To Text"},
    llms: {id: "llms", label: "LLMs"},
    video: {id: "video", label: "Video"},
    ionos: {id: "ionos", label: "Ionos AI"},
  }

  static textToSpeech = textToSpeech;
  static image = image;
  static video = video;
  static llms = llms;
  static speechToText = speechToText;
  static ionos = ionos;

  static imageStyles = [
    "None",
    "Realistic",
    "Artistic",
    "Cartoon",
    "Anime",
    "Sketch",
    "Avantgarde",
    "Popart",
    "Impressionist",
    "Pointillist",
    "Cubist",
    "Surreal",
    "Expressionist",
    "Minimalist",
  ];
  static imageTypes = [
    "None",
    "Photo",
    "Illustration",
    "Painting",
    "Digital art",
    "Icon",
    "Logo",
    "Emblem",
    "Symbol",
  ];
  static imagePrompts = [
    "An astronaut floating in space",
    "A robot walking on Mars",
    "A beautiful landscape painting",
    "A cat sleeping on a chair",
  ];
}
