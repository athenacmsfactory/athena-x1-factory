const userInput = document.getElementById('user-input');
const skillsList = document.getElementById('skills-list');
const chatForm = document.getElementById('chat-form');
const chatMessages = document.getElementById('chat-messages');

const fetchSkills = async () => {
  try {
    const response = await fetch('http://localhost:3001/skills');
    const skills = await response.json();
    skillsList.innerHTML = skills.map(skill => `
      <div class="status-card">
        <div class="status-label">${skill.name}</div>
        <div class="status-value" style="font-size: 0.8rem; font-weight: 400; color: var(--text-dim);">${skill.description}</div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load skills:', error);
  }
};

fetchSkills();

const appendMessage = (content, role, metadata = null) => {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${role}`;
  let html = content.replace(/\n/g, '<br>');
  
  if (metadata) {
    html += `<div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.3rem;">
      Brain: <span style="color: var(--accent-secondary);">${metadata.model}</span> (${metadata.provider})
    </div>`;
  }
  
  msgDiv.innerHTML = html;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;

  // Add User message
  appendMessage(text, 'user');
  userInput.value = '';

  // Add Agent thinking state (simplified)
  const thinkingId = 'thinking-' + Date.now();
  const thinkingDiv = document.createElement('div');
  thinkingDiv.className = 'message agent';
  thinkingDiv.id = thinkingId;
  thinkingDiv.innerHTML = '<span class="status-value" style="color: var(--accent-secondary);">Thinking...</span>';
  chatMessages.appendChild(thinkingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await fetch('http://localhost:3001/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    
    if (response.status === 429) {
      const data = await response.json();
      const msgArea = document.getElementById(thinkingId);
      msgArea.innerHTML = `<span style="color: #ffbd2e; font-weight: bold;">⚠️ WATERFALL EXHAUSTED</span><br>
        <span style="font-size: 0.8rem;">All free models are currently offline or at quota. Please add a Gemini/Groq key to .env to continue.</span>`;
      return;
    }
    
    if (!response.ok) throw new Error('Engine Timeout');
    
    const data = await response.json();
    
    // Replace thinking state with actual message & metadata
    const msgArea = document.getElementById(thinkingId);
    msgArea.innerHTML = data.text.replace(/\n/g, '<br>');
    msgArea.innerHTML += `<div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.3rem;">
      Brain: <span style="color: var(--accent-secondary);">${data.model}</span> (${data.provider})
    </div>`;
  } catch (error) {
    const msgArea = document.getElementById(thinkingId);
    msgArea.innerHTML = `<span style="color: #ff5f56;">Error: ${error.message}</span>`;
  }
});
