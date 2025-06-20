# Limited Licence Lawyer Chatbot - Development Prompt

## Project Overview
Create a full-stack AI-powered chatbot landing page for a New Zealand limited licence lawyer practice. The chatbot serves as both the landing page and sales funnel, qualifying leads and converting them to either online applications or consultation bookings.

## Technical Stack Requirements

### Frontend
- **Framework**: Vanilla HTML/CSS/JavaScript (for Cloudflare Pages compatibility)
- **Styling**: Modern CSS with gradients, glassmorphism effects, animations
- **Responsive**: Mobile-first design
- **Performance**: Optimized for Cloudflare edge deployment

### Backend/AI Integration
- **Primary AI**: Cloudflare Workers AI (Llama 2 or Mistral)
- **Fallback AI**: OpenAI GPT-4o API for complex legal queries
- **Knowledge Base**: Cloudflare KV storage or D1 database
- **Hosting**: Cloudflare Pages + Workers

### Key Features to Implement

## 1. Landing Page Design
```
Hero Section:
- Headline: "Get Back on the Road"
- Subtitle: "Limited licence applications made simple with fixed-fee legal help"
- Stats: "$899 Fixed Fee + GST", "NZ Wide Service", "No Appointments"
- Background: Purple gradient with animated effects
```

## 2. Chat Interface
```
Layout:
- Full-screen chat interface below hero
- Bot avatar: "LL" (Limited Licence)
- User avatar: "You"
- Typing indicators and smooth animations
- Progress bar showing conversation advancement
- Purple/blue color scheme matching legal branding
```

## 3. Conversation Flow Logic

### Initial Qualification
1. **Opening**: "G'day! 👋 I'm here to help you get back on the road. Have you lost your licence or are you at risk of losing it?"
2. **Options**: ["Lost my licence", "At risk of losing it", "Just have questions"]

### Primary Flow - Lost Licence
```javascript
Trigger: "lost my licence" → 
Response: "What was the reason for losing your licence?"
Options: ["Demerit points", "Court disqualification", "Other reason", "Not sure"]

Trigger: "demerit points" →
Response: "You may be eligible for a limited licence. Do you need to drive for work or essential purposes?"
Options: ["Yes, for work", "Yes, for essential needs", "Both work and essential", "Not sure what qualifies"]

Trigger: "work" OR "essential" →
Response: "Excellent! My fixed fee service is $899 + GST and covers everything you need. Would you like to know what's included?"
Options: ["Yes, what's included?", "How does the process work?", "What are my chances?", "Can I afford it?"]

Trigger: "what's included" →
Response: "For $899 + GST, I'll prepare your complete application, review everything, and guide you through the process. Ready to get started?"
Options: ["Yes, let's do it!", "I need more info first", "What about court fees?", "How long does it take?"]

Trigger: "yes let's do it" →
Show conversion options (see below)
```

## 4. Conversion Options
When qualified, display two prominent options:

```html
Option 1 (Primary): Start Application Online
- Icon: 📝
- Description: "Begin your limited licence application right now. Quick, secure, and convenient."
- Action: Redirect to application form

Option 2: Book Free 15-Minute Consultation  
- Icon: 📞
- Description: "Speak with Rion directly to discuss your specific situation and get expert advice."
- Action: Open Calendly in new tab
```

## 5. Knowledge Base Structure

### Core Legal Information
```json
{
  "eligibility_criteria": {
    "demerit_points": "Can apply if suspended for 56+ days, need work/essential driving",
    "court_disqualification": "Complex cases, depends on offence type and circumstances",
    "work_purposes": "Employment, business operations, essential medical appointments",
    "essential_purposes": "Medical appointments, caring for dependents, education"
  },
  "pricing": {
    "fixed_fee": "$899 + GST",
    "includes": ["Application preparation", "Document review", "Court guidance"],
    "court_fees": "Additional $100-200 depending on case type"
  },
  "process": {
    "timeline": "2-4 weeks typical",
    "steps": ["Application prep", "Police negotiation", "Court hearing"],
    "success_rate": "High for eligible cases"
  }
}
```

## 6. AI Integration Architecture

### Cloudflare Workers AI Setup
```javascript
// Primary AI for simple queries
const simpleQueries = [
  "what is limited licence",
  "how much does it cost", 
  "how long does it take",
  "what are my chances"
];

// Use Workers AI (Llama 2) for these
if (isSimpleQuery(userMessage)) {
  response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
    messages: [
      { role: 'system', content: knowledgeBaseContext },
      { role: 'user', content: userMessage }
    ]
  });
}
```

### OpenAI Fallback for Complex Cases
```javascript
// Complex legal scenarios
const complexQueries = [
  "drink driving case",
  "repeat offender", 
  "specific court orders",
  "unusual circumstances"
];

// Use GPT-4o for complex legal advice
if (isComplexQuery(userMessage)) {
  response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: 'system', content: legalExpertPrompt },
      { role: 'user', content: userMessage }
    ]
  });
}
```

## 7. File Structure
```
project/
├── index.html (main landing page)
├── style.css (all styling)
├── script.js (frontend chat logic)
├── functions/
│   ├── chat-handler.js (Cloudflare Worker)
│   ├── knowledge-base.js (KB queries)
│   └── ai-router.js (AI model selection)
├── data/
│   ├── knowledge-base.json
│   └── conversation-flows.json
└── wrangler.toml (Cloudflare config)
```

## 8. Environment Variables Needed
```
OPENAI_API_KEY=your_openai_key
CALENDLY_LINK=https://calendly.com/your-link
APPLICATION_FORM_URL=https://your-app-form.com
```

## 9. Key Implementation Requirements

### Performance
- Load time < 2 seconds
- Smooth animations (60fps)
- Responsive design (mobile-first)
- Offline fallback for basic info

### Legal Compliance
- Clear disclaimers about legal advice
- Privacy policy compliance
- Secure data handling
- Professional tone throughout

### Conversion Optimization
- Progress indicators
- Clear call-to-actions
- Social proof elements
- Trust signals (lawyer credentials)

### Analytics Integration
- Conversation tracking
- Conversion funnel analysis
- User journey mapping
- A/B testing capability

## 10. Deployment Instructions

### Cloudflare Pages Setup
1. Connect GitHub repository
2. Build command: `npm run build`
3. Deploy to custom domain: `limitedlicencelawyer.co.nz`

### Cloudflare Workers
1. Deploy chat handler to Workers
2. Configure KV namespace for knowledge base
3. Set up API routes for AI integration

### Domain Configuration
1. Point DNS to Cloudflare
2. Configure SSL certificates
3. Set up redirects and caching rules

## 11. Success Metrics
- Conversion rate: >15% (qualified leads to action)
- User engagement: >3 messages average
- Load time: <2 seconds globally
- Uptime: >99.9%

## 12. Sample Knowledge Base Queries

### Common Questions & Responses
```
Q: "What is a limited licence?"
A: "A limited licence allows you to drive for specific purposes (work, essential needs) while your full licence is suspended or you're disqualified. It's designed to help you maintain employment and handle essential life activities."

Q: "How much does your service cost?"
A: "My fixed fee is $899 + GST, which covers everything: application preparation, document review, and guidance through the court process. Court fees are additional ($100-200 depending on your case)."

Q: "What are my chances of getting approved?"
A: "For eligible cases (work/essential driving needs, proper circumstances), success rates are high. I'll assess your specific situation and give you an honest evaluation during our consultation."
```

## 13. Error Handling & Fallbacks
- Graceful degradation if AI APIs are down
- Fallback to static FAQ responses
- Clear error messages for users
- Automatic retry logic for failed requests

## Implementation Notes
- Prioritize legal accuracy over conversational flair
- Maintain professional tone throughout
- Include proper legal disclaimers
- Ensure mobile responsiveness
- Optimize for New Zealand users (timezone, language)
- Test conversation flows thoroughly
- Implement proper rate limiting
- Add spam protection

This chatbot should feel like talking to a knowledgeable legal assistant while efficiently qualifying leads and converting them to paid services.