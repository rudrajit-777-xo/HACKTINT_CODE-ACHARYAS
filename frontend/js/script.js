document.addEventListener("DOMContentLoaded", function () {
    const chatbotContainer = document.getElementById("chatbot-container");
    const closeBtn = document.getElementById("close-btn");
    const sendBtn = document.getElementById("send-btn");
    const chatBotInput = document.getElementById("chatbot-input");
    const chatbotIcon = document.getElementById("chatbot-icon");

    chatbotIcon.addEventListener("click", () => {
        chatbotContainer.classList.remove("hidden");
        chatbotIcon.style.display = "none";
        // Clear previous messages
        document.getElementById('chatbot-messages').innerHTML = "";
        // Always initialize context
        initializeConversationHistory();
    });

    closeBtn.addEventListener("click", () => {
        chatbotContainer.classList.add("hidden");
        chatbotIcon.style.display = "flex";
    });

    sendBtn.addEventListener("click", sendMessage);

    chatBotInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    initializeConversationHistory();
});

function initializeConversationHistory() {
    conversationHistory = [
        {
            role: "user",
            parts: [{
                text: `
You are ACCUCAMPUS, an AI assistant for TINT campus.
You are an expert on all TINT clubs, campus events, and student life.
Always answer questions with up-to-date, accurate, and helpful information about TINT clubs, their activities, joining process, and campus resources.

Here are the details of the clubs and their events:

TINT PHOTOGRAPHY CLUB:
TINT Photography Club is the official photography club of Techno International New Town. The club nurtures creativity and helps students express their ideas through photography. It was founded with the support of the college leadership and brings together students from all departments who share a passion for photography. The club was inaugurated in March 2019 during the cultural fest.

Objectives:
- Provide a platform for photographic activities, idea exchange, and experience sharing.
- Enable students to discover, develop, and deploy creative skills through events, photo walks, and workshops.
- Encourage holistic development and help manifest the artist within.

Activities:
- Photo exhibitions and competitions (e.g., DRISTI)
- Photo story sessions with photographers
- Event photography for college events
- Intra-club and intra-college competitions on various themes
- Webinars and workshops
- Annual exhibition with the Art Club

Membership:
- Requires a No-Objection Certificate from the Head of Department
- Open to students with a genuine interest in photography
- Membership is confirmed after document verification and review of submitted photos
- Members are expected to attend meetings and participate in club activities

Advisory Committee and Faculty:
- Includes college leadership and faculty from various departments
- Convenor: Prof.(Dr). Anindita Ray (BSH)
- Co-convenor: Prof. (Dr). Ammlan Ghosh (MCA)
- Additional faculty and staff members

Facebook Page: https://www.facebook.com/tintphotoclub

TINT TALKIES (Film Club):
TINT Talkies is the official film club of Techno International New Town, inaugurated in July 2019. The club brings together students and film enthusiasts to appreciate and discuss films as an art form. The club was launched with the support of college leadership and notable film personalities.

Activities:
- Film screenings and discussions
- Panel discussions on film and technology
- Opportunities to learn from industry professionals

Membership:
- Open to students interested in film appreciation and discussion

Advisory Committee and Faculty:
- Includes college leadership and faculty from various departments
- Convenor: Prof. (Dr). Anwesha Dutta Ain (BSH)
- Co-convenor: Prof.(Dr). Kakali Ghosh (BSH)
- Additional faculty and staff members

Registration: https://forms.gle/tPhhpnudRUJQX3QH8
Facebook Page: https://www.facebook.com/TINT.Film.Club.TINT.Talkies/

TINT ART CLUB - AESTHETICA:
AESTHETICA is the official Art club of TINT, established to foster a passion for visual arts. The club provides a platform for creativity, self-expression, and understanding of art concepts. It supports students seeking a creative break alongside academics.

Activities:
- Drawing, sketching, and painting sessions
- Seminars, competitions, workshops, and group projects
- Outings to museums and art galleries

Membership:
- Open to students with a serious interest in art
- Requires a No-Objection Certificate from the Head of Department
- Members are expected to attend meetings and participate in club activities

Advisory Committee and Faculty:
- Includes college leadership and faculty from various departments
- Convenor: Prof. (Dr.) Papiya Debnath (BSH)
- Additional faculty and staff members

Facebook Page: https://www.facebook.com/TINT.Art.Club.Aesthetica

TINT CODING CLUB:
The Coding Club is a community of students passionate about coding and technology. The club organizes weekly coding challenges, hackathons, and peer-to-peer learning sessions.

TINT GOOGLE DEVELOPER STUDENT CLUB:
This club is a community of students interested in technology and innovation. Activities include tech talks, study jams, and open source contribution drives.

If you don't know an answer, politely say so.
                `
            }]
        }
    ];
}

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