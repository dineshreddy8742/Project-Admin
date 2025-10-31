import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7860';

export const analyzeImage = async (imageFile: File) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await axios.post(`${API_BASE_URL}/api/artisan/analyze-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

export const textToSpeech = async (text: string, language: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/artisan/tts`, { text, lang: language }, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('Error converting text to speech:', error);
    throw error;
  }
};

export const translateText = async (text: string, targetLanguage: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/artisan/translate`, { text, target: targetLanguage });
    return response.data.translation;
  } catch (error) {
    console.error('Error translating text:', error);
    throw error;
  }
};

export const speechToText = async (audioFile: File) => {
  const formData = new FormData();
  formData.append('audio', audioFile);

  try {
    const response = await axios.post(`${API_BASE_URL}/api/artisan/stt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.transcript;
  } catch (error) {
    console.error('Error converting speech to text:', error);
    throw error;
  }
};