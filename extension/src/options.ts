import { loadSettings, saveSettings } from './lib/settings'


interface ProbeBackendResponse {
  error?: string
  ok: boolean
  payload?: {
    ok: boolean
    openai_configured: boolean
  }
}


const form = document.querySelector<HTMLFormElement>('#options-form')
const backendUrlInput = document.querySelector<HTMLInputElement>('#options-backend-url')
const autoPromptInput = document.querySelector<HTMLInputElement>('#options-auto-prompt')
const resultLimitInput = document.querySelector<HTMLInputElement>('#options-result-limit')
const statusNode = document.querySelector<HTMLParagraphElement>('#options-status')
const testButton = document.querySelector<HTMLButtonElement>('#options-test')

void populateForm()

form?.addEventListener('submit', (event) => {
  event.preventDefault()
  void saveForm()
})

testButton?.addEventListener('click', () => {
  void testConnection()
})


async function populateForm() {
  if (!backendUrlInput || !autoPromptInput || !resultLimitInput) {
    return
  }
  const settings = await loadSettings()
  backendUrlInput.value = settings.backendBaseUrl
  autoPromptInput.checked = settings.autoPrompt
  resultLimitInput.value = String(settings.resultLimit)
}


async function saveForm() {
  if (!backendUrlInput || !autoPromptInput || !resultLimitInput || !statusNode) {
    return
  }
  const settings = await saveSettings({
    autoPrompt: autoPromptInput.checked,
    backendBaseUrl: backendUrlInput.value,
    resultLimit: Number(resultLimitInput.value),
  })
  backendUrlInput.value = settings.backendBaseUrl
  resultLimitInput.value = String(settings.resultLimit)
  statusNode.textContent = 'Saved browser companion settings.'
}


async function testConnection() {
  if (!backendUrlInput || !statusNode || !testButton) {
    return
  }
  testButton.disabled = true
  statusNode.textContent = 'Checking the local Recall backend…'
  try {
    const response = (await chrome.runtime.sendMessage({
      backendBaseUrl: backendUrlInput.value,
      type: 'probeBackend',
    })) as ProbeBackendResponse
    if (!response.ok || !response.payload) {
      statusNode.textContent = response.error ?? 'Could not reach the local backend.'
      return
    }
    statusNode.textContent = response.payload.openai_configured
      ? 'Backend connection is healthy.'
      : 'Backend connection is healthy. OpenAI remains optional and is currently not configured.'
  } finally {
    testButton.disabled = false
  }
}
