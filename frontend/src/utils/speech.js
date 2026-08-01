// Web Speech API text-to-speech helper for reading diagnosis and advisory aloud
export const speakText = (text, lang = "en") => {
  if (!("speechSynthesis" in window)) {
    console.warn("Web Speech API is not supported in this browser.");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
  utterance.rate = 0.95; // slightly relaxed reading pace for clarity
  utterance.pitch = 1.0;

  // Try to pick a natural voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(v => v.lang.startsWith(lang === "hi" ? "hi" : "en"));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
};
