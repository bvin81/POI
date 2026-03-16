// Hangalapú bevitel (Web Speech API - Chrome-ban működik)
const Speech = {

  isSupported() {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  },

  listen(onResult, onError) {
    if (!this.isSupported()) {
      onError('A hang input nem támogatott ebben a böngészőben. Használj Chrome-ot!');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'hu-HU';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event) => {
      onError('Hiba: ' + event.error);
    };

    recognition.start();
  }

};
