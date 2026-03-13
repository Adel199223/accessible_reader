import { useEffect, useRef, useState } from 'react'

import type { RenderSentence } from '../lib/segment'

export interface VoiceChoice {
  id: string
  name: string
  label: string
}

interface UseSpeechOptions {
  sentences: RenderSentence[]
  preferredVoice: string
  rate: number
  initialSentenceIndex: number
  onSentenceChange: (sentenceIndex: number) => void
}

const defaultVoiceChoice: VoiceChoice = {
  id: 'default',
  label: 'Default voice',
  name: 'default',
}

const voicePreferences = [
  { id: 'ava', label: 'Ava Multilingual Natural', matcher: /ava.*multilingual.*natural/i },
  { id: 'andrew', label: 'Andrew Multilingual Natural', matcher: /andrew.*multilingual.*natural/i },
]

function resolvePreferredVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return voicePreferences
    .map((preference) => {
      const voice = voices.find((item) => preference.matcher.test(item.name))
      return voice ?? null
    })
    .filter((value): value is SpeechSynthesisVoice => value !== null)
}

export function curateVoices(voices: SpeechSynthesisVoice[]): VoiceChoice[] {
  const curated = resolvePreferredVoices(voices).map((voice, index) => ({
    id: voicePreferences[index].id,
    label: voicePreferences[index].label,
    name: voice.name,
  }))

  return [...curated, defaultVoiceChoice]
}

function fallbackBrowserVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return resolvePreferredVoices(voices)[0] ?? voices.find((voice) => voice.default) ?? voices[0] ?? null
}

export function pickBrowserVoice(
  voices: SpeechSynthesisVoice[],
  selectedName: string,
): SpeechSynthesisVoice | null {
  if (!selectedName || selectedName === 'default') {
    return fallbackBrowserVoice(voices)
  }
  return voices.find((voice) => voice.name === selectedName) ?? fallbackBrowserVoice(voices)
}

export function useSpeech({
  sentences,
  preferredVoice,
  rate,
  initialSentenceIndex,
  onSentenceChange,
}: UseSpeechOptions) {
  const synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null
  const sentenceSignature = sentences.map((sentence) => `${sentence.key}:${sentence.text}`).join('\u0001')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(initialSentenceIndex)
  const [voiceChoices, setVoiceChoices] = useState<VoiceChoice[]>([defaultVoiceChoice])
  const sentencesRef = useRef(sentences)
  const currentIndexRef = useRef(initialSentenceIndex)
  const lastResetRef = useRef<{
    initialSentenceIndex: number
    sentenceSignature: string
  } | null>(null)
  const rateRef = useRef(rate)
  const preferredVoiceRef = useRef(preferredVoice)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const onSentenceChangeRef = useRef(onSentenceChange)
  const cancelRef = useRef(false)

  useEffect(() => {
    sentencesRef.current = sentences
  }, [sentences])

  useEffect(() => {
    onSentenceChangeRef.current = onSentenceChange
  }, [onSentenceChange])

  useEffect(() => {
    preferredVoiceRef.current = preferredVoice
  }, [preferredVoice])

  useEffect(() => {
    rateRef.current = rate
  }, [rate])

  useEffect(() => {
    if (!synthesis) {
      return undefined
    }

    const syncVoices = () => {
      const loaded = synthesis.getVoices()
      voicesRef.current = loaded
      setVoiceChoices(curateVoices(loaded))
    }

    syncVoices()
    synthesis.addEventListener('voiceschanged', syncVoices)
    return () => {
      synthesis.removeEventListener('voiceschanged', syncVoices)
    }
  }, [synthesis])

  useEffect(() => {
    if (!synthesis) {
      return
    }
    const lastReset = lastResetRef.current
    const shouldReset =
      !lastReset ||
      lastReset.sentenceSignature !== sentenceSignature ||
      (lastReset.initialSentenceIndex !== initialSentenceIndex && currentIndexRef.current !== initialSentenceIndex)

    lastResetRef.current = {
      initialSentenceIndex,
      sentenceSignature,
    }

    if (!shouldReset) {
      return
    }

    cancelRef.current = true
    synthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
    updateSentenceIndex(initialSentenceIndex)
    cancelRef.current = false
  }, [initialSentenceIndex, sentenceSignature, synthesis])

  function updateSentenceIndex(nextIndex: number) {
    const changed = currentIndexRef.current !== nextIndex
    currentIndexRef.current = nextIndex
    setCurrentSentenceIndex(nextIndex)
    if (changed) {
      onSentenceChangeRef.current(nextIndex)
    }
  }

  function finishPlayback() {
    setIsSpeaking(false)
    setIsPaused(false)
  }

  function speakFrom(startIndex: number) {
    if (!synthesis || sentencesRef.current.length === 0) {
      return
    }

    const sentence = sentencesRef.current[startIndex]
    if (!sentence) {
      finishPlayback()
      return
    }

    updateSentenceIndex(startIndex)
    const utterance = new SpeechSynthesisUtterance(sentence.text)
    const chosenVoice = pickBrowserVoice(voicesRef.current, preferredVoiceRef.current)
    if (chosenVoice) {
      utterance.voice = chosenVoice
    }
    utterance.rate = rateRef.current
    utterance.onend = () => {
      if (cancelRef.current) {
        return
      }
      speakFrom(startIndex + 1)
    }
    utterance.onerror = () => {
      finishPlayback()
    }
    synthesis.speak(utterance)
  }

  function start(startIndex = currentIndexRef.current) {
    if (!synthesis || sentencesRef.current.length === 0) {
      return
    }
    cancelRef.current = false
    synthesis.cancel()
    setIsSpeaking(true)
    setIsPaused(false)
    speakFrom(Math.max(0, Math.min(startIndex, sentencesRef.current.length - 1)))
  }

  function stop() {
    if (!synthesis) {
      return
    }
    cancelRef.current = true
    synthesis.cancel()
    finishPlayback()
    cancelRef.current = false
  }

  function pause() {
    if (!synthesis || !isSpeaking) {
      return
    }
    synthesis.pause()
    setIsPaused(true)
  }

  function resume() {
    if (!synthesis || !isSpeaking) {
      return
    }
    synthesis.resume()
    setIsPaused(false)
  }

  function previous() {
    const nextIndex = Math.max(currentIndexRef.current - 1, 0)
    start(nextIndex)
  }

  function next() {
    const nextIndex = Math.min(currentIndexRef.current + 1, Math.max(sentencesRef.current.length - 1, 0))
    start(nextIndex)
  }

  function jumpTo(sentenceIndex: number) {
    updateSentenceIndex(sentenceIndex)
    if (isSpeaking) {
      start(sentenceIndex)
    }
  }

  return {
    isSupported: Boolean(synthesis),
    isSpeaking,
    isPaused,
    currentSentenceIndex,
    voiceChoices,
    start,
    stop,
    pause,
    resume,
    previous,
    next,
    jumpTo,
  }
}
