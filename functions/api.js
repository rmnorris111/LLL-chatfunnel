// src/index.js
import systemPrompt from '../limited_licence_chatbot_prompt.md';
import knowledgeBase from '../KnowledgeBase/knowledgeBase.js';

// Define a list of allowed origins.
const allowedOrigins = [
  'https://lll-chatfunnel.pages.dev',
  'https://ai.limitedlicencelawyer.co.nz',
  'https://limitedlicencelawyer.co.nz',
  // You can add your local development URL here if needed, e.g., 'http://127.0.0.1:8788'
];

// This is the specific handler for POST requests in Pages Functions.
export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  const isAllowed = allowedOrigins.includes(origin);
  const corsHeaders = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...(isAllowed && { 'Access-Control-Allow-Origin': origin }),
  };

  const apiKey = env.OPENAI_API_KEY;

  try {
    const { messages } = await request.json();

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const responseFromAI = await callOpenAI(messages, systemPrompt, knowledgeBase, apiKey);

    return new Response(JSON.stringify({ reply: responseFromAI }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

// Handle CORS preflight requests for the /api endpoint
export async function onRequestOptions({ request }) {
    const origin = request.headers.get('Origin');
    const isAllowed = allowedOrigins.includes(origin);
    const corsHeaders = {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...(isAllowed && { 'Access-Control-Allow-Origin': origin }),
    };

    return new Response(null, {
      headers: corsHeaders,
    });
}

/**
 * Calls the OpenAI API with the user's message history and the knowledge base.
 * @param {Array} messages - The chat history between the user and the AI.
 * @param {string} systemPrompt - The initial system prompt.
 * @param {string} knowledgeBase - The knowledge base content.
 * @param {string} apiKey - The OpenAI API key.
 * @returns {string} The AI's response message.
 */
async function callOpenAI(messages, systemPrompt, knowledgeBase, apiKey) {
  // Combine the knowledge base with the system prompt
  const fullSystemPrompt = `${systemPrompt}\n\nHere is the knowledge base you must use to answer questions:\n\n${knowledgeBase}`;

  const body = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: fullSystemPrompt },
      ...messages // Add the existing conversation history
    ],
    max_tokens: 1024,
    temperature: 0.2,
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.choices || data.choices.length === 0) {
      throw new Error("Invalid response structure from OpenAI API.");
  }

  return data.choices[0].message.content;
} 