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
  const bookCallButton = `<button class="action-btn" onclick="window.open('${CALENDLY_LINK}', '_blank')">Book Free Call</button>`;
  const startAppButton = `<button class="action-btn" onclick="window.open('${GAVEL_LINK}', '_blank')">Start Application Online</button>`;

  // New primary placeholders
  html = html.replace(/\[ACTION_BOOK_CALL\]/g, bookCallButton);
  html = html.replace(/\[ACTION_START_APP\]/g, startAppButton);

  // Old fallbacks just in case
  html = html.replace(/\[INSERT CALENDLY LINK\]/g, bookCallButton);
  html = html.replace(/\[INSERT GAVEL LINK\]/g, startAppButton);

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

function addActionButtons(placeholders) {
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'message bot'; // Align like a bot message

  const avatar = document.createElement('span');
  avatar.className = 'avatar';
  avatar.textContent = 'LL';
  actionsContainer.appendChild(avatar);
  
  const buttonWrapper = document.createElement('div');
  buttonWrapper.className = 'actions-wrapper'; // A wrapper for the buttons

  // allow for multiple buttons in the future
  placeholders.forEach(placeholder => {
    let button;
    if (placeholder === '[ACTION_BOOK_CALL]') {
        button = document.createElement('button');
        button.className = 'action-btn';
        button.textContent = 'Book Free Call';
        button.onclick = () => window.open(CALENDLY_LINK, '_blank');
    } else if (placeholder === '[ACTION_START_APP]') {
        button = document.createElement('button');
        button.className = 'action-btn';
        button.textContent = 'Start Application Online';
        button.onclick = () => window.open(GAVEL_LINK, '_blank');
    }
    if(button) buttonWrapper.appendChild(button);
  });
  
  actionsContainer.appendChild(buttonWrapper);
  chatMessages.appendChild(actionsContainer);
  chatMessages.scrollTop = chatMessages.scrollHeight;
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

  if (input) { // only add a user message if there is input
    addMessage(input, 'user');
    clearInput();
  }
  
  showTypingIndicator(true);

  try {
    const aiResponse = await getAIResponse();
    showTypingIndicator(false);

    const cleanResponse = aiResponse.trim();
    
    // Check if the response contains ONLY placeholders
    const placeholderRegex = /(\[ACTION_BOOK_CALL\]|\[ACTION_START_APP\])/g;
    const placeholders = cleanResponse.match(placeholderRegex);
    const nonPlaceholderText = cleanResponse.replace(placeholderRegex, '').trim();

    if (placeholders && !nonPlaceholderText) {
      // Response contains only one or more placeholders, render as standalone buttons
      addActionButtons(placeholders);
    } else {
      // Response contains text, render it inside a bubble (with inline button replacement)
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

function startConversation() {
  chatMessages.innerHTML = '';
  conversationHistory = []; // Clear history
  const initialMessage = "Hello! 👋 I can help you with limited licence applications - whether you're eligible, what the process involves, costs, and what documents you'll need. What's your situation?";
  addMessage(initialMessage, 'bot');
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