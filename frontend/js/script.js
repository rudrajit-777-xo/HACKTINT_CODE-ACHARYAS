document.addEventListener("DOMContentLoaded", function () {
    const chatbotContainer = document.getElementById("chatbot-container");
    const closeBtn = document.getElementById("close-btn");
    const sendBtn = document.getElementById("send-btn");
    const chatBotInput = document.getElementById("chatbot-input");
    const chatbotIcon = document.getElementById("chatbot-icon");

    chatbotIcon.addEventListener("click", () => {
        chatbotContainer.classList.remove("hidden");
        chatbotIcon.style.display = "none";
    });

    closeBtn.addEventListener("click", () => {
        chatbotContainer.classList.add("hidden");
        chatbotIcon.style.display = "flex";
    });

    sendBtn.addEventListener("click", sendMessage);

    chatBotInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});

function sendMessage() {
    const inputField = document.getElementById("chatbot-input");
    const userMessage = inputField.value.trim();

    if (userMessage) {
        appendMessage("user", userMessage);
        inputField.value = ""; // clear after sending
        getBotResponse(userMessage);
    }
}

function appendMessage(sender, message) {
    const messageContainer = document.getElementById("chatbot-messages");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

async function getBotResponse(userMessage) {
    const API_KEY = "AIzaSyDh2XX3MnJbd3l33LpBzScB2StqktKwvIs";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }],
            }),
        });

        const data = await response.json();

        if (!data.candidates || !data.candidates.length) {
            throw new Error("No response from Gemini API");
        }

        const botMessage = data.candidates[0].content.parts[0].text;
        appendMessage("bot", botMessage);
    } catch (error) {
        console.error("Error:", error);
        appendMessage("bot", "Sorry, I'm having trouble responding. Please try again.");
    }
}
