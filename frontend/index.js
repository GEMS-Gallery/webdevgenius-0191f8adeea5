import { backend } from 'declarations/backend';
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

let authClient;
let agent;

async function initAuth() {
  try {
    authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
      handleAuthenticated();
    }
  } catch (error) {
    console.error("Error initializing auth:", error);
  }
}

async function handleAuthenticated() {
  try {
    const identity = await authClient.getIdentity();
    agent = new HttpAgent({ identity });
    await loadChatHistory();
  } catch (error) {
    console.error("Error handling authentication:", error);
  }
}

function attachEventListeners() {
  document.getElementById('loginButton').addEventListener('click', async () => {
    try {
      await authClient.login({
        identityProvider: "https://identity.ic0.app/#authorize",
        onSuccess: handleAuthenticated
      });
    } catch (error) {
      console.error("Error during login:", error);
    }
  });

  document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
      await authClient.logout();
      location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  });

  document.getElementById('sendButton').addEventListener('click', sendMessage);
  document.getElementById('addFileButton').addEventListener('click', addFile);
  document.getElementById('editFileButton').addEventListener('click', editFile);
  document.getElementById('newFileButton').addEventListener('click', createNewFile);
  document.getElementById('searchButton').addEventListener('click', performSearch);
  document.getElementById('clearButton').addEventListener('click', clearMemory);
  document.getElementById('resetButton').addEventListener('click', resetAll);
  document.getElementById('undoButton').addEventListener('click', undoEdit);
  document.getElementById('changeModelButton').addEventListener('click', changeModel);
}

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

async function sendMessage() {
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
}

async function addFile() {
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
}

async function editFile() {
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
}

async function createNewFile() {
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
}

async function performSearch() {
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
}

async function clearMemory() {
  if (confirm("Are you sure you want to clear all memory?")) {
    try {
      await backend.clearMemory();
      alert("Memory cleared successfully!");
    } catch (error) {
      console.error("Error clearing memory:", error);
      alert(`Error clearing memory: ${error.message}`);
    }
  }
}

async function resetAll() {
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
}

async function undoEdit() {
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
}

async function changeModel() {
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
}

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  attachEventListeners();
});