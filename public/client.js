const socket = io();
const messages = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');

let username = localStorage.getItem('chatUsername'); // Try to get existing username

function askUsername() {
    return new Promise((resolve) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            width: 300px;
            text-align: center;
        `;

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter your name';
        input.style.cssText = `
            width: 100%;
            padding: 8px;
            margin: 10px 0;
            border: 1px solid #3C3B6E;
            border-radius: 4px;
        `;

        const button = document.createElement('button');
        button.textContent = 'Save';
        button.style.cssText = `
            background: #B22234;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 4px;
            cursor: pointer;
        `;

        modal.appendChild(document.createTextNode('Please enter your name'));
        modal.appendChild(input);
        modal.appendChild(button);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        function handleSave() {
            const name = input.value.trim();
            if (name) {
                localStorage.setItem('chatUsername', name);
                document.body.removeChild(overlay);
                resolve(name);
            } else {
                input.style.border = '1px solid red';
            }
        }

        button.addEventListener('click', handleSave);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSave();
        });
    });
}

function addMessage(msg) {
    const item = document.createElement('div');
    item.textContent = msg;
    item.style.padding = '8px';
    item.style.marginBottom = '8px';
    item.style.backgroundColor = '#f0f0f0';
    item.style.borderRadius = '4px';
    item.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
}

// Handle chat history
socket.on('chat history', (history) => {
    messages.innerHTML = ''; // Clear any existing messages
    history.forEach(msg => addMessage(msg));
    // Add connection message at the end
    const item = document.createElement('div');
    item.textContent = '--- Connected to chat ---';
    item.style.textAlign = 'center';
    item.style.color = '#666';
    item.style.padding = '8px';
    messages.appendChild(item);
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (input.value) {
        if (!username) {
            username = await askUsername();
        }
        const message = `${username}: ${input.value}`;
        socket.emit('chat message', message);
        input.value = '';
    }
});

socket.on('chat message', (msg) => {
    addMessage(msg);
});

// Moved connection notification to after history
socket.on('connect', () => {
    // Connection message will be added after history is loaded
});

// Clear the messages container
document.getElementById('messages').innerHTML = '';
