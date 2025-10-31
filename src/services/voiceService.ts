// src/services/voiceService.ts
import eventBus from '@/lib/eventBus';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://chintuvignu17-projectkisan.hf.space';

class VoiceService {
  private languageCode: string = 'en';
  private currentAudio: HTMLAudioElement | null = null;
  private speechQueue: string[] = [];
  private isSpeaking: boolean = false;
  private currentAudioUrl: string | null = null;

  init() {
    eventBus.on('speak', this.handleSpeak);
  }

  setLanguage(code: string) {
    this.languageCode = code;
  }

  private handleSpeak = async (event: CustomEvent<string>) => {
    const textToSpeak = event.detail;

    console.log('VoiceService: Queuing speech for:', textToSpeak.substring(0, 50) + '...');

    // Add to queue
    this.speechQueue.push(textToSpeak);

    // If not currently speaking, start processing the queue
    if (!this.isSpeaking) {
      this.processQueue();
    }
  };

  private async processQueue() {
    if (this.speechQueue.length === 0 || this.isSpeaking) {
      return;
    }

    this.isSpeaking = true;
    const textToSpeak = this.speechQueue.shift()!;

    console.log('VoiceService: Processing speech for:', textToSpeak.substring(0, 50) + '...');

    try {
      // Stop any currently playing audio
      this.stopCurrentSpeech();

      // Use backend TTS with Vertex AI for better language support
      const audioBlob = await this.generateSpeech(textToSpeak, this.languageCode);

      if (audioBlob) {
        this.currentAudioUrl = URL.createObjectURL(audioBlob);
        this.currentAudio = new Audio(this.currentAudioUrl);

        this.currentAudio.onended = () => {
          console.log('VoiceService: Speech ended');
          this.cleanup();
          this.isSpeaking = false;
          // Process next item in queue
          setTimeout(() => this.processQueue(), 100);
        };

        this.currentAudio.onerror = (error) => {
          console.error('VoiceService: Audio playback error:', error);
          this.cleanup();
          this.isSpeaking = false;
          // Process next item in queue
          setTimeout(() => this.processQueue(), 100);
        };

        console.log('VoiceService: Playing audio for:', textToSpeak.substring(0, 50) + '...');
        await this.currentAudio.play();
      } else {
        console.warn('VoiceService: Failed to generate speech audio');
        this.isSpeaking = false;
        // Process next item in queue
        setTimeout(() => this.processQueue(), 100);
      }
    } catch (error) {
      console.error('VoiceService: Error in processQueue:', error);
      // Fallback to browser TTS if backend fails
      this.fallbackToBrowserTTS(textToSpeak);
    }
  }

  private stopCurrentSpeech() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
    this.isSpeaking = false;
  }

  private cleanup() {
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
    this.currentAudio = null;
  }

  private async generateSpeech(text: string, language: string): Promise<Blob | null> {
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('language', language);

      const response = await axios.post(`${API_URL}/api/tts/speak`, formData, {
        responseType: 'blob',
        timeout: 30000, // 30 second timeout
      });

      if (response.data && response.data.size > 0) {
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error('VoiceService: Error generating speech:', error);
      // Check if it's a network error or 500 error
      if (error.response && error.response.status === 500) {
        console.error('VoiceService: TTS API returned 500 error');
      } else if (error.request) {
        console.error('VoiceService: Network error - no response received');
      } else {
        console.error('VoiceService: Request setup error');
      }
      // Return null to trigger the fallback to browser TTS
      return null;
    }
  }

  private fallbackToBrowserTTS(text: string) {
    console.log('VoiceService: Falling back to browser TTS');

    // Simple browser TTS fallback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.languageCode === 'en' ? 'en-US' : this.languageCode + '-' + this.languageCode.toUpperCase();

      utterance.onend = () => {
        console.log('VoiceService: Browser TTS ended');
        this.isSpeaking = false;
        eventBus.dispatch('speech-ended');
        // Process next item in queue
        setTimeout(() => this.processQueue(), 100);
      };

      utterance.onerror = (error) => {
        console.error('VoiceService: Browser TTS error:', error);
        this.isSpeaking = false;
        eventBus.dispatch('speech-ended');
        // Process next item in queue
        setTimeout(() => this.processQueue(), 100);
      };

      speechSynthesis.speak(utterance);
    } else {
      console.warn('VoiceService: No TTS available');
      this.isSpeaking = false;
      eventBus.dispatch('speech-ended');
      // Process next item in queue
      setTimeout(() => this.processQueue(), 100);
    }
  }







  private transliterateMalayalamToEnglish(text: string): string {
    // Malayalam to English transliteration
    const consonantMap: { [key: string]: string } = {
      'ക': 'k', 'ഖ': 'kh', 'ഗ': 'g', 'ഘ': 'gh', 'ങ': 'ng',
      'ച': 'ch', 'ഛ': 'chh', 'ജ': 'j', 'ഝ': 'jh', 'ഞ': 'ny',
      'ട': 't', 'ഠ': 'th', 'ഡ': 'd', 'ഢ': 'dh', 'ണ': 'n',
      'ത': 'th', 'ഥ': 'th', 'ദ': 'd', 'ധ': 'dh', 'ന': 'n',
      'പ': 'p', 'ഫ': 'ph', 'ബ': 'b', 'ഭ': 'bh', 'മ': 'm',
      'യ': 'y', 'ര': 'r', 'ല': 'l', 'വ': 'v', 'ള': 'l',
      'ശ': 'sh', 'ഷ': 'sh', 'സ': 's', 'ഹ': 'h'
    };

    const vowelSignMap: { [key: string]: string } = {
      'ാ': 'a', 'ി': 'i', 'ീ': 'ee', 'ു': 'u', 'ൂ': 'oo',
      'െ': 'e', 'േ': 'ay', 'ൈ': 'ai', 'ൊ': 'o', 'ോ': 'oa', 'ൌ': 'au', '്': ''
    };

    const independentVowelMap: { [key: string]: string } = {
      'അ': 'a', 'ആ': 'aa', 'ഇ': 'i', 'ഈ': 'ee', 'ഉ': 'u', 'ഊ': 'oo',
      'എ': 'e', 'ഏ': 'ay', 'ഐ': 'ai', 'ഒ': 'o', 'ഓ': 'oa', 'ഔ': 'au'
    };

    let result = '';
    let i = 0;

    while (i < text.length) {
      const char = text[i];
      const nextChar = text[i + 1] || '';

      if (independentVowelMap[char]) {
        result += independentVowelMap[char];
        i++;
        continue;
      }

      if (consonantMap[char]) {
        let syllable = consonantMap[char];
        if (vowelSignMap[nextChar]) {
          if (nextChar === '്') {
            syllable = consonantMap[char];
          } else {
            syllable += vowelSignMap[nextChar];
          }
          i += 2;
        } else {
          syllable += 'a';
          i++;
        }
        result += syllable;
        continue;
      }

      if (char === ' ' || char === '\n' || char === '\t') {
        result += ' ';
        i++;
        continue;
      }

      if (char === '.' || char === '?' || char === '!') {
        result += '.';
        i++;
        continue;
      }

      if (/\d/.test(char)) {
        const numberWords: { [key: string]: string } = {
          '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
          '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'
        };
        result += numberWords[char] || char;
        i++;
        continue;
      }

      i++;
    }

    return result.replace(/\s+/g, ' ').trim();
  }

  private transliterateUrduToEnglish(text: string): string {
    // Urdu to English transliteration (Arabic script)
    const consonantMap: { [key: string]: string } = {
      'ب': 'b', 'پ': 'p', 'ت': 't', 'ٹ': 't', 'ث': 's', 'ج': 'j',
      'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ڈ': 'd', 'ذ': 'z',
      'ر': 'r', 'ڑ': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh',
      'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
      'ف': 'f', 'ق': 'q', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm',
      'ن': 'n', 'و': 'v', 'ہ': 'h', 'ء': '', 'ی': 'y', 'ے': 'ay'
    };

    const vowelMap: { [key: string]: string } = {
      'ا': 'a', 'آ': 'aa', 'أ': 'a', 'إ': 'i', 'ئ': 'i',
      'ِ': 'i', 'ُ': 'u', 'َ': 'a', 'ّ': '', 'ْ': ''
    };

    let result = '';
    let i = 0;

    while (i < text.length) {
      const char = text[i];
      const nextChar = text[i + 1] || '';

      if (consonantMap[char]) {
        result += consonantMap[char];
        i++;
        continue;
      }

      if (vowelMap[char]) {
        result += vowelMap[char];
        i++;
        continue;
      }

      if (char === ' ' || char === '\n' || char === '\t') {
        result += ' ';
        i++;
        continue;
      }

      if (char === '.' || char === '?' || char === '!') {
        result += '.';
        i++;
        continue;
      }

      if (/\d/.test(char)) {
        const numberWords: { [key: string]: string } = {
          '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
          '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'
        };
        result += numberWords[char] || char;
        i++;
        continue;
      }

      i++;
    }

    return result.replace(/\s+/g, ' ').trim();
  }

  private transliterateTeluguToEnglish(text: string): string {
    // Telugu to English transliteration with proper syllable handling
    const consonantMap: { [key: string]: string } = {
      'క': 'k', 'ఖ': 'kh', 'గ': 'g', 'ఘ': 'gh', 'ఙ': 'ng',
      'చ': 'ch', 'ఛ': 'chh', 'జ': 'j', 'ఝ': 'jh', 'ఞ': 'ny',
      'ట': 't', 'ఠ': 'th', 'డ': 'd', 'ఢ': 'dh', 'ణ': 'n',
      'త': 't', 'థ': 'th', 'ద': 'd', 'ధ': 'dh', 'న': 'n',
      'ప': 'p', 'ఫ': 'ph', 'బ': 'b', 'భ': 'bh', 'మ': 'm',
      'య': 'y', 'ర': 'r', 'ల': 'l', 'వ': 'v', 'ళ': 'l',
      'శ': 'sh', 'ష': 'sh', 'స': 's', 'హ': 'h'
    };

    const vowelSignMap: { [key: string]: string } = {
      'ా': 'a', 'ి': 'i', 'ీ': 'ee', 'ు': 'u', 'ూ': 'oo',
      'ృ': 'ru', 'ౄ': 'roo', 'ె': 'e', 'ే': 'ay', 'ై': 'ai',
      'ొ': 'o', 'ో': 'o', 'ౌ': 'au', '్': ''
    };

    const independentVowelMap: { [key: string]: string } = {
      'అ': 'a', 'ఆ': 'aa', 'ఇ': 'i', 'ఈ': 'ee', 'ఉ': 'u', 'ఊ': 'oo',
      'ఋ': 'ru', 'ౠ': 'roo', 'ఌ': 'lu', 'ౡ': 'loo',
      'ఎ': 'e', 'ఏ': 'ay', 'ఐ': 'ai', 'ఒ': 'o', 'ఓ': 'o', 'ఔ': 'au'
    };

    let result = '';
    let i = 0;

    while (i < text.length) {
      const char = text[i];
      const nextChar = text[i + 1] || '';

      // Handle independent vowels
      if (independentVowelMap[char]) {
        result += independentVowelMap[char];
        i++;
        continue;
      }

      // Handle consonants
      if (consonantMap[char]) {
        let syllable = consonantMap[char];

        // Check for vowel sign
        if (vowelSignMap[nextChar]) {
          if (nextChar === '్') {
            // Virama - no vowel, just consonant
            syllable = consonantMap[char];
          } else {
            // Consonant with vowel sign
            syllable += vowelSignMap[nextChar];
          }
          i += 2;
        } else {
          // Consonant with implicit 'a' vowel
          syllable += 'a';
          i++;
        }

        result += syllable;
        continue;
      }

      // Handle spaces and punctuation
      if (char === ' ' || char === '\n' || char === '\t') {
        result += ' ';
        i++;
        continue;
      }

      if (char === '।' || char === '॥' || char === '.' || char === '?' || char === '!') {
        result += '.';
        i++;
        continue;
      }

      // Handle numbers
      if (/\d/.test(char)) {
        const numberWords: { [key: string]: string } = {
          '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
          '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'
        };
        result += numberWords[char] || char;
        i++;
        continue;
      }

      // Skip unknown characters
      i++;
    }

    // Clean up and return
    return result.replace(/\s+/g, ' ').trim();
  }

  private fallbackToEnglishSpeech(text: string) {
    // Fallback to English speech if native language fails
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => {
      eventBus.dispatch('speech-ended');
    };

    if ('speechSynthesis' in window) {
      speechSynthesis.speak(utterance);
    }
  }

  public speak(text: string) {
    // Directly call handleSpeak instead of dispatching an event to avoid infinite loops
    this.handleSpeak(new CustomEvent('speak', { detail: text }));
  }
}

export const voiceService = new VoiceService();
