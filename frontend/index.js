import { backend } from 'declarations/backend';
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

let authClient;
let agent;

async function initAuth() {
  authClient = await AuthClient.create();
  if (await authClient.isAuthenticated()) {
    handleAuthenticated();
  }
}

async function handleAuthenticated() {
  const identity = await authClient.getIdentity();
  agent = new HttpAgent({ identity });
  await loadChatHistory();
}

document.getElementById('loginButton').onclick = async () => {
  authClient.login({
    identityProvider: "https://identity.ic0.app/#authorize",
    onSuccess: handleAuthenticated
  });
};

document.getElementById('logoutButton').onclick = async () => {
  await authClient.logout();
  location.reload();
};

let chatHistory = [];

async function loadChatHistory() {
  try {
    chatHistory = await backend.getChatHistory();
    displayChatHistory();
  } catch (error) {
    console.error("Error loading chat history:", error);
  }
}

function displayChatHistory() {
  const chatContainer = document.getElementById('chatContainer');
  chatContainer.innerHTML = '';
  chatHistory.forEach(message => {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.role}`;
    messageElement.textContent = `${message.role}: ${message.content}`;
    chatContainer.appendChild(messageElement);
  });
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

document.getElementById('sendButton').onclick = async () => {
  const input = document.getElementById('userInput');
  const message = input.value.trim();
  if (message) {
    try {
      await backend.addMessage('user', message);
      input.value = '';
      await loadChatHistory();
      // Here you would typically send the message to an AI model and get a response
      // For demonstration, we'll just echo the user's message
      await backend.addMessage('assistant', `Echo: ${message}`);
      await loadChatHistory();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
};

document.getElementById('addFileButton').onclick = async () => {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        await backend.addFile(file.name, e.target.result);
        alert(`File ${file.name} added successfully!`);
      } catch (error) {
        console.error("Error adding file:", error);
        alert(`Error adding file: ${error.message}`);
      }
    };
    reader.readAsText(file);
  }
};

document.getElementById('editFileButton').onclick = async () => {
  const filepath = prompt("Enter the filepath to edit:");
  if (filepath) {
    try {
      const result = await backend.getFileContent(filepath);
      if (result.ok) {
        const newContent = prompt("Enter new content:", result.ok.content);
        if (newContent !== null) {
          await backend.editFile(filepath, newContent);
          alert(`File ${filepath} edited successfully!`);
        }
      } else {
        alert(`Error: ${result.err}`);
      }
    } catch (error) {
      console.error("Error editing file:", error);
      alert(`Error editing file: ${error.message}`);
    }
  }
};

document.getElementById('newFileButton').onclick = async () => {
  const filepath = prompt("Enter the filepath for the new file:");
  if (filepath) {
    const content = prompt("Enter initial content:");
    if (content !== null) {
      try {
        await backend.createNewFile(filepath, content);
        alert(`File ${filepath} created successfully!`);
      } catch (error) {
        console.error("Error creating file:", error);
        alert(`Error creating file: ${error.message}`);
      }
    }
  }
};

document.getElementById('searchButton').onclick = async () => {
  const query = prompt("Enter search query:");
  if (query) {
    try {
      // In a real application, you would perform the search here
      // For demonstration, we'll just store a dummy result
      const dummyResults = [
        { title: "Result 1", body: "This is the first result" },
        { title: "Result 2", body: "This is the second result" }
      ];
      await backend.storeSearch(query, dummyResults);
      alert(`Search results for "${query}" stored successfully!`);
    } catch (error) {
      console.error("Error performing search:", error);
      alert(`Error performing search: ${error.message}`);
    }
  }
};

document.getElementById('clearButton').onclick = async () => {
  if (confirm("Are you sure you want to clear all memory?")) {
    try {
      await backend.clearMemory();
      alert("Memory cleared successfully!");
    } catch (error) {
      console.error("Error clearing memory:", error);
      alert(`Error clearing memory: ${error.message}`);
    }
  }
};

document.getElementById('resetButton').onclick = async () => {
  if (confirm("Are you sure you want to reset everything?")) {
    try {
      await backend.resetAll();
      alert("Reset successful!");
      await loadChatHistory();
    } catch (error) {
      console.error("Error resetting:", error);
      alert(`Error resetting: ${error.message}`);
    }
  }
};

document.getElementById('undoButton').onclick = async () => {
  const filepath = prompt("Enter the filepath to undo last edit:");
  if (filepath) {
    try {
      const result = await backend.undoEdit(filepath);
      if (result.ok) {
        alert(`Undo successful for ${filepath}`);
      } else {
        alert(`Error: ${result.err}`);
      }
    } catch (error) {
      console.error("Error undoing edit:", error);
      alert(`Error undoing edit: ${error.message}`);
    }
  }
};

document.getElementById('changeModelButton').onclick = async () => {
  const newModel = prompt("Enter the new model name:");
  if (newModel) {
    try {
      await backend.changeModel(newModel);
      alert(`Model changed to: ${newModel}`);
    } catch (error) {
      console.error("Error changing model:", error);
      alert(`Error changing model: ${error.message}`);
    }
  }
};

window.onload = initAuth;