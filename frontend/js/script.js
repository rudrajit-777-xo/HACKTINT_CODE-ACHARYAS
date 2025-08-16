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

function sendMessage(message = null, showUserMessage = true) {
    const inputField = document.getElementById("chatbot-input");
    const userMessage = message !== null ? message : inputField.value.trim();

    if (userMessage) {
        if (showUserMessage) {
            appendMessage("user", userMessage);
        }
        if (message === null) inputField.value = ""; // clear after sending if from input

        // Add user message to conversation history
        conversationHistory.push({ role: "user", parts: [{ text: userMessage }] });

        getBotResponse();
    }
}

function appendMessage(sender, message) {
    const messageContainer = document.getElementById("chatbot-messages");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);

    if (sender === "bot") {
        // Format the message (see next step)
        messageElement.innerHTML = formatBotMessage(message);
    } else {
        messageElement.textContent = message;
    }

    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

async function getBotResponse() {
    const API_KEY = "AIzaSyDh2XX3MnJbd3l33LpBzScB2StqktKwvIs";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: conversationHistory,
            }),
        });

        const data = await response.json();

        if (!data.candidates || !data.candidates.length) {
            throw new Error("No response from Gemini API");
        }

        const botMessage = data.candidates[0].content.parts[0].text;

        // Add bot reply to conversation history
        conversationHistory.push({ role: "model", parts: [{ text: botMessage }] });

        appendMessage("bot", botMessage);
    } catch (error) {
        console.error("Error:", error);
        appendMessage("bot", "Sorry, I'm having trouble responding. Please try again.");
    }
}

function formatBotMessage(message) {
    // Basic Markdown-like formatting
    let formatted = message
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // **bold**
        .replace(/\*(.*?)\*/g, '<i>$1</i>')     // *italic*
        .replace(/`(.*?)`/g, '<code>$1</code>') // `code`
        .replace(/\n/g, '<br>');                // new lines

    // Add emojis/icons for certain keywords (customize as needed)
    formatted = formatted
        .replace(/club/gi, '🎯 club')
        .replace(/question/gi, '❓ question')
        .replace(/recommend/gi, '⭐ recommend')
        .replace(/survey/gi, '📝 survey');

    return formatted;
}

let conversationHistory = [];

const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTTszgbktK85t4BMUzj8aG6hjGtbTjpB5MRFRGw1Fjjox0yBjndM3Smc7mVXX3iaOcTsdFM6KYINqHs/pub?gid=0&single=true&output=csv"; // Replace with your sheet's CSV link
    const studentId = "24187001185"; // Hardcoded Student ID
    const subjectsList = ["DSA", "Economics", "Mathematics", "Analog & Digital", "Computer Organisation"];

    fetch(sheetUrl)
      .then(res => res.text())
      .then(data => {
        const rows = data.split("\n").map(row => row.split(","));
        let present = 0, total = 0;
        let subjects = {};

        subjectsList.forEach(s => subjects[s] = { present: 0, total: 0 });

        rows.slice(1).forEach(row => {
          const [date, id, name, subject, status] = row.map(r => r.trim());
          if (id === studentId && subjects[subject]) {
            subjects[subject].total++;
            if (status.toLowerCase() === "present") {
              subjects[subject].present++;
              present++;
            }
            total++;
          }
        });

        // Overall attendance
        const overallPercent = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
        document.getElementById("overallPercent").innerText = overallPercent + "%";

        // Subject-wise attendance
        const subjectsDiv = document.getElementById("subjects");
        subjectsList.forEach(sub => {
          const stats = subjects[sub];
          const percent = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : 0;

          const subjectElem = document.createElement("div");
          subjectElem.classList.add("subject");
          subjectElem.innerHTML = `
            <p>${sub}: ${percent}%</p>
            <div class="progress-bar">
              <div class="progress" style="width: ${percent}%;"></div>
            </div>
          `;
          subjectsDiv.appendChild(subjectElem);
        });
      });