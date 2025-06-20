// script.js - Limited Licence Lawyer Chatbot

// --- CONFIGURATION ---
// Replace this with your deployed Cloudflare Worker URL
const WORKER_URL = 'https://limited-licence-chatbot.rion-norris.workers.dev'; 
const CALENDLY_LINK = 'https://calendly.com/rionnorris/15min';
const GAVEL_LINK = 'https://thedisputelawyer.gavel.io/start/playground2/Limited%20Licence%20Application%20Lawyer%20Review';

const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const typingIndicator = document.getElementById('typing-indicator');
const progressBar = document.querySelector('.progress');
const conversionOptions = document.getElementById('conversion-options');
const startApplicationBtn = document.getElementById('start-application');
const bookConsultationBtn = document.getElementById('book-consultation');

// Conversation state
let conversationHistory = [];

// --- REMOVED PREDEFINED FUNNEL ---
// The conversation is now dynamic and handled by the AI.

function addMessage(text, sender = 'bot') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  const avatar = document.createElement('span');
  avatar.className = 'avatar';
  avatar.textContent = sender === 'bot' ? 'LL' : 'You';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  let html = marked.parse(text);
  html = html.replace(/\[CALENDLY_LINK\]/g, CALENDLY_LINK);
  html = html.replace(/\[GAVEL_LINK\]/g, GAVEL_LINK);
  bubble.innerHTML = html;
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(bubble);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Add message to history for the AI
  if (sender !== 'options') {
    const role = sender === 'bot' ? 'assistant' : 'user';
    conversationHistory.push({ role, content: text });
  }
}

function addOptions(options) {
  const optionsDiv = document.createElement('div');
  optionsDiv.className = 'options';
  options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.onclick = () => handleUserInput(option);
    optionsDiv.appendChild(btn);
  });
  chatMessages.appendChild(optionsDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator(show = true) {
  typingIndicator.style.display = show ? 'flex' : 'none';
}

function updateProgress(percent) {
  progressBar.style.width = percent + '%';
}

function clearInput() {
  chatInput.value = '';
}

async function handleUserInput(input) {
  // Remove any existing options
  const lastOptions = chatMessages.querySelector('.options');
  if (lastOptions) lastOptions.remove();

  addMessage(input, 'user');
  clearInput();
  showTypingIndicator(true);

  try {
    const aiResponse = await getAIResponse();
    showTypingIndicator(false);

    // The AI might return structured data for options/links
    // This is a simple implementation; a more robust one would parse JSON
    if (aiResponse.includes("start my application online")) {
        addMessage("It sounds like you're ready to proceed. You can start your application online here, or book a free call if you have more questions.", 'bot');
        showConversionOptions();
    } else {
        addMessage(aiResponse, 'bot');
    }

  } catch (error) {
    showTypingIndicator(false);
    addMessage("Sorry, I'm having a little trouble connecting. Please try again in a moment.", 'bot');
    console.error("Error fetching AI response:", error);
  }
}

// This function is now the core of the chatbot logic
async function getAIResponse() {
    const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: conversationHistory }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to get AI response.");
    }

    const data = await response.json();
    return data.reply;
}

function showConversionOptions() {
  conversionOptions.style.display = 'flex';
}

function startConversation() {
  chatMessages.innerHTML = '';
  conversationHistory = []; // Clear history
  showTypingIndicator(true);
  
  // Start the conversation with an initial prompt to the AI
  // The user won't see this, but it kicks off the AI's first message.
  conversationHistory.push({ role: 'user', content: "G'day" });
  
  getAIResponse().then(initialMessage => {
    showTypingIndicator(false);
    addMessage(initialMessage, 'bot');
  }).catch(error => {
    showTypingIndicator(false);
    addMessage("Welcome! I seem to be having a small issue starting up. Please refresh the page.", 'bot');
    console.error(error);
  });
}

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const input = chatInput.value.trim();
  if (!input) return;
  handleUserInput(input);
});

startApplicationBtn.onclick = () => {
  window.open(GAVEL_LINK, '_blank');
};
bookConsultationBtn.onclick = () => {
  window.open(CALENDLY_LINK, '_blank');
};

// On load
startConversation(); 