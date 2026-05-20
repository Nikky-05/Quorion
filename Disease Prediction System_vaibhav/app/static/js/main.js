// AI Disease Prediction System - Main Frontend Controller
document.addEventListener("DOMContentLoaded", () => {
    
    // --- STATE MANAGEMENT ---
    let selectedSymptoms = [];
    let ollamaOnline = false;
    let predictedDiseaseContext = ""; // Saves the last predicted disease to context-aware chatbot prompts
    let activeChatMessages = [
        {
            role: "assistant",
            content: "Hello! I am Aegis, your local offline AI health companion. You can ask me follow-up questions about symptoms, healthy routines, home remedies, or when you should see a doctor."
        }
    ];

    // --- PREDEFINED COMMON SYMPTOMS ---
    const commonSymptoms = [
        "Fever", "Cough", "Headache", "Sore throat", "Fatigue", 
        "Body aches", "Runny nose", "Shortness of breath", "Nausea", 
        "Vomiting", "Diarrhea", "Dizziness", "Loss of taste", 
        "Loss of smell", "Skin rash", "Chest pain", "Joint pain",
        "Abdominal pain", "Chills", "Sneezing", "Sweating"
    ];

    // --- UI ELEMENTS ---
    const themeToggleBtn = document.getElementById("theme-toggle");
    const statusPill = document.getElementById("ollama-status");
    const connectionErrorCard = document.getElementById("connection-error");
    const errorMessageSpan = document.getElementById("error-message");
    const errorTroubleUl = document.getElementById("error-trouble");
    
    const searchInput = document.getElementById("symptom-search");
    const voiceBtn = document.getElementById("voice-btn");
    const recordingOverlay = document.getElementById("recording-overlay");
    const suggestionsDropdown = document.getElementById("suggestions");
    const tagsBox = document.getElementById("tags-box");
    const predefinedGrid = document.getElementById("predefined-grid");
    
    const clearAllBtn = document.getElementById("clear-all-btn");
    const predictBtn = document.getElementById("predict-btn");
    
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");
    
    // Prediction Views
    const resultPlaceholder = document.getElementById("result-placeholder");
    const loadingView = document.getElementById("loading-view");
    const resultView = document.getElementById("result-view");
    const resultDisease = document.getElementById("result-disease");
    const resultConfidence = document.getElementById("result-confidence");
    const resultExplanation = document.getElementById("result-explanation");
    const resultPrecautions = document.getElementById("result-precautions");
    
    // Chat Views
    const chatMessagesContainer = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const chatSendBtn = document.getElementById("chat-send-btn");
    
    // History Views
    const historyList = document.getElementById("history-list");
    const clearHistoryBtn = document.getElementById("clear-history-btn");

    // --- INITIALIZATION ---
    initTheme();
    renderPredefinedSymptoms();
    checkOllamaStatus();
    loadPredictionHistory();

    // Check status every 15 seconds to monitor local Ollama server heartbeat
    setInterval(checkOllamaStatus, 15000);

    // --- THEME CONTROL (Dark / Light) ---
    function initTheme() {
        const savedTheme = localStorage.getItem("theme") || "dark";
        document.documentElement.setAttribute("data-theme", savedTheme);
        updateThemeIcon(savedTheme);
        
        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (theme === "dark") {
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    }

    // --- RENDER DYNAMIC SYMPTOM BADGES ---
    function renderPredefinedSymptoms() {
        predefinedGrid.innerHTML = "";
        commonSymptoms.forEach(symptom => {
            const badge = document.createElement("div");
            badge.className = "predefined-badge";
            badge.textContent = symptom;
            badge.dataset.symptom = symptom.toLowerCase();
            
            badge.addEventListener("click", () => {
                toggleSymptom(symptom.toLowerCase());
            });
            
            predefinedGrid.appendChild(badge);
        });
    }

    // --- ADD / REMOVE SYMPTOM TAGS ---
    function toggleSymptom(symptom) {
        symptom = symptom.trim().toLowerCase();
        if (!symptom) return;

        if (selectedSymptoms.includes(symptom)) {
            selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
        } else {
            selectedSymptoms.push(symptom);
        }

        updateSymptomUI();
    }

    function removeSymptom(symptom) {
        selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
        updateSymptomUI();
    }

    function updateSymptomUI() {
        // 1. Clear tags box
        tagsBox.innerHTML = "";

        if (selectedSymptoms.length === 0) {
            tagsBox.innerHTML = '<span class="empty-tag-placeholder">No symptoms selected yet. Choose from below or type above.</span>';
            predictBtn.disabled = true;
        } else {
            selectedSymptoms.forEach(symptom => {
                const tag = document.createElement("span");
                tag.className = "symptom-tag";
                tag.innerHTML = `
                    ${capitalize(symptom)}
                    <button class="remove-btn" data-symptom="${symptom}">&times;</button>
                `;
                
                tag.querySelector(".remove-btn").addEventListener("click", (e) => {
                    const symToRemove = e.target.dataset.symptom;
                    removeSymptom(symToRemove);
                });
                
                tagsBox.appendChild(tag);
            });
            
            // Enable prediction button if Ollama is online
            if (ollamaOnline) {
                predictBtn.disabled = false;
            }
        }

        // 2. Sync Predefined badges selection state
        const badges = predefinedGrid.querySelectorAll(".predefined-badge");
        badges.forEach(badge => {
            const sym = badge.dataset.symptom;
            if (selectedSymptoms.includes(sym)) {
                badge.classList.add("selected");
            } else {
                badge.classList.remove("selected");
            }
        });
    }

    // --- AUTOCOMPLETE SEARCH INPUT ---
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        suggestionsDropdown.innerHTML = "";

        if (!query) {
            suggestionsDropdown.style.display = "none";
            return;
        }

        // Filter symptoms matching search query (excluding already selected ones)
        const matches = commonSymptoms.filter(symptom => 
            symptom.toLowerCase().includes(query) && 
            !selectedSymptoms.includes(symptom.toLowerCase())
        );

        if (matches.length === 0) {
            // Allow typing custom symptoms that aren't in common list
            const customItem = document.createElement("div");
            customItem.className = "suggestion-item";
            customItem.innerHTML = `Add custom symptom: <strong>"${e.target.value}"</strong>`;
            customItem.addEventListener("click", () => {
                toggleSymptom(e.target.value);
                searchInput.value = "";
                suggestionsDropdown.style.display = "none";
            });
            suggestionsDropdown.appendChild(customItem);
        } else {
            matches.forEach(match => {
                const item = document.createElement("div");
                item.className = "suggestion-item";
                item.textContent = match;
                item.addEventListener("click", () => {
                    toggleSymptom(match.toLowerCase());
                    searchInput.value = "";
                    suggestionsDropdown.style.display = "none";
                });
                suggestionsDropdown.appendChild(item);
            });
        }
        
        suggestionsDropdown.style.display = "block";
    });

    // Close suggestion list if clicked outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !suggestionsDropdown.contains(e.target)) {
            suggestionsDropdown.style.display = "none";
        }
    });

    // Handle Enter key on input to directly add symptom
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const val = searchInput.value.trim();
            if (val) {
                toggleSymptom(val);
                searchInput.value = "";
                suggestionsDropdown.style.display = "none";
            }
        }
    });

    // --- VOICE SPEECH RECOGNITION (OFFLINE) ---
    let recognition = null;
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            voiceBtn.classList.add("recording");
            recordingOverlay.style.display = "flex";
        };

        recognition.onend = () => {
            voiceBtn.classList.remove("recording");
            recordingOverlay.style.display = "none";
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            alert("Voice capture error: " + event.error);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log("Voice Input Received:", transcript);
            
            // Map spoken words to symptoms
            // Simple split & heuristic search
            const words = transcript.split(/[\s,]+/);
            let foundSymptom = false;
            
            // 1. Check direct matches of multi-word or single word common symptoms
            commonSymptoms.forEach(symptom => {
                const symLower = symptom.toLowerCase();
                if (transcript.includes(symLower)) {
                    toggleSymptom(symLower);
                    foundSymptom = true;
                }
            });

            // 2. If nothing directly matched, check individual words to see if they might be a custom symptom
            if (!foundSymptom) {
                words.forEach(word => {
                    if (word.length > 3 && !["have", "with", "feeling", "pain", "some"].includes(word)) {
                        toggleSymptom(word);
                    }
                });
            }
        };
    }

    voiceBtn.addEventListener("click", () => {
        if (!recognition) {
            alert("Your browser does not support local Speech Recognition. Please use Chrome, Edge, or Safari.");
            return;
        }
        
        if (voiceBtn.classList.contains("recording")) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    // --- CLEAR BUTTONS ---
    clearAllBtn.addEventListener("click", () => {
        selectedSymptoms = [];
        updateSymptomUI();
    });

    // --- BACKEND STATUS & HEARTBEAT CHECK ---
    async function checkOllamaStatus() {
        try {
            const res = await fetch("/api/status");
            const data = await res.json();
            
            const dot = statusPill.querySelector(".status-dot");
            const text = statusPill.querySelector(".status-text");

            if (data.status === "online") {
                ollamaOnline = true;
                dot.className = "status-dot online";
                text.textContent = `Ollama: ${data.model}`;
                connectionErrorCard.style.display = "none";
                
                // Enable predict if tags are present
                if (selectedSymptoms.length > 0) {
                    predictBtn.disabled = false;
                }
            } else if (data.status === "missing_model") {
                ollamaOnline = false;
                dot.className = "status-dot missing";
                text.textContent = "Model Missing";
                predictBtn.disabled = true;
                
                // Show custom troubleshooting
                errorMessageSpan.textContent = data.message;
                errorTroubleUl.innerHTML = data.troubleshooting.map(t => `<li>${t}</li>`).join("");
                connectionErrorCard.style.display = "block";
            } else {
                ollamaOnline = false;
                dot.className = "status-dot offline";
                text.textContent = "Ollama Offline";
                predictBtn.disabled = true;

                errorMessageSpan.textContent = data.message;
                errorTroubleUl.innerHTML = data.troubleshooting.map(t => `<li>${t}</li>`).join("");
                connectionErrorCard.style.display = "block";
            }
        } catch (err) {
            ollamaOnline = false;
            const dot = statusPill.querySelector(".status-dot");
            const text = statusPill.querySelector(".status-text");
            dot.className = "status-dot offline";
            text.textContent = "Server Error";
            predictBtn.disabled = true;
        }
    }

    // --- TAB CONTROLLER ---
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabId = btn.dataset.tab;
            
            tabButtons.forEach(b => b.classList.remove("active"));
            tabPanes.forEach(p => p.classList.remove("active"));
            
            btn.classList.add("active");
            document.getElementById(tabId).classList.add("active");
        });
    });

    // --- PREDICT DISEASE REQUEST ---
    predictBtn.addEventListener("click", async () => {
        if (selectedSymptoms.length === 0 || !ollamaOnline) return;

        // 1. Switch to result tab and show skeleton loading screen
        switchTab("result-tab");
        resultPlaceholder.style.display = "none";
        resultView.style.display = "none";
        loadingView.style.display = "flex";

        try {
            const response = await fetch("/api/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ symptoms: selectedSymptoms })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Prediction request failed.");
            }

            const prediction = await response.json();
            
            // Store predicted disease globally to enrich chat prompts
            predictedDiseaseContext = prediction.possible_disease;

            // Render outputs
            renderPredictionResults(prediction);
            
            // Add automated greeting context to chat helper
            injectSystemAlertInChat(`Patient diagnosed with: ${prediction.possible_disease} (${prediction.confidence} Confidence). Ask follow-up care questions.`);

            // Refresh SQL Local history
            loadPredictionHistory();

        } catch (err) {
            console.error("Prediction failed:", err);
            alert("Failed to analyze symptoms: " + err.message);
            
            // Restore placeholder
            loadingView.style.display = "none";
            resultPlaceholder.style.display = "flex";
        }
    });

    // --- CHAT WITH OFFLINE ASSISTANT ---
    chatSendBtn.addEventListener("click", sendChatMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendChatMessage();
    });

    async function sendChatMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Add user message bubble
        appendChatBubble("user", text);
        chatInput.value = "";

        // Push to local messages state array
        activeChatMessages.push({ role: "user", content: text });

        // 2. Add dynamic "typing..." typing indicator bubble
        const typingBubble = appendChatBubble("assistant", '<i class="fa-solid fa-ellipsis fa-fade"></i> Aegis is thinking...');

        try {
            // Query local chat endpoint
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: activeChatMessages,
                    context_disease: predictedDiseaseContext
                })
            });

            if (!res.ok) {
                throw new Error("Chat assistant response failed.");
            }

            const data = await res.json();
            
            // Remove typing bubble and append real assistant reply
            typingBubble.remove();
            appendChatBubble("assistant", data.reply);
            
            // Save reply to history context
            activeChatMessages.push({ role: "assistant", content: data.reply });

        } catch (err) {
            typingBubble.remove();
            appendChatBubble("assistant", "Sorry, I had trouble processing that request locally. Make sure Ollama server is responsive.");
        }
    }

    function switchTab(tabId) {
        tabButtons.forEach(b => {
            if (b.dataset.tab === tabId) b.classList.add("active");
            else b.classList.remove("active");
        });
        tabPanes.forEach(p => {
            if (p.id === tabId) p.classList.add("active");
            else p.classList.remove("active");
        });
    }

    function renderPredictionResults(data) {
        // Hide loader, show results
        loadingView.style.display = "none";
        resultView.style.display = "flex";

        resultDisease.textContent = data.possible_disease;
        
        // Confidence badge styling
        resultConfidence.textContent = `${data.confidence} Confidence`;
        resultConfidence.className = `confidence-badge ${data.confidence.toLowerCase()}`;

        // Set explanation
        resultExplanation.textContent = data.explanation;

        // Render precautions grid
        resultPrecautions.innerHTML = "";
        if (data.precautions && data.precautions.length > 0) {
            data.precautions.forEach(prec => {
                const item = document.createElement("div");
                item.className = "precaution-item";
                item.innerHTML = `
                    <span class="precaution-checkbox"><i class="fa-solid fa-circle-check"></i></span>
                    <span>${prec}</span>
                `;
                resultPrecautions.appendChild(item);
            });
        } else {
            resultPrecautions.innerHTML = `
                <div class="precaution-item">
                    <span class="precaution-checkbox"><i class="fa-solid fa-circle-check"></i></span>
                    <span>Consult a health practitioner for specific guidelines.</span>
                </div>
            `;
        }
    }

    function appendChatBubble(role, content) {
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${role}`;
        bubble.innerHTML = content;
        
        chatMessagesContainer.appendChild(bubble);
        
        // Scroll to the bottom of chat
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        
        return bubble;
    }

    function injectSystemAlertInChat(message) {
        const bubble = document.createElement("div");
        bubble.className = "chat-bubble system-alert";
        bubble.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${message}`;
        
        chatMessagesContainer.appendChild(bubble);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    // --- DATABASE SEARCH HISTORY CRUD ---
    async function loadPredictionHistory() {
        try {
            const res = await fetch("/api/history");
            if (!res.ok) throw new Error("Could not pull local logs.");
            
            const history = await res.json();
            historyList.innerHTML = "";

            if (history.length === 0) {
                historyList.innerHTML = '<div class="empty-history-placeholder"><i class="fa-solid fa-folder-open" style="font-size: 24px; margin-bottom: 8px;"></i><br>No diagnosis history recorded yet.</div>';
                return;
            }

            history.forEach(item => {
                const card = document.createElement("div");
                card.className = "history-item";
                
                // Tags serialization helper
                const tagListHtml = item.symptoms.map(s => `<span class="history-item-tag">${capitalize(s)}</span>`).join("");

                card.innerHTML = `
                    <div class="history-item-header">
                        <span class="history-item-disease">${item.possible_disease}</span>
                        <span class="history-item-date">${item.created_at}</span>
                    </div>
                    <div class="history-item-tags">
                        ${tagListHtml}
                    </div>
                    <div class="history-item-footer">
                        <span class="history-item-confidence confidence-badge ${item.confidence.toLowerCase()}" style="padding: 2px 8px; font-size: 10px;">
                            ${item.confidence}
                        </span>
                        <button class="history-delete-btn" data-id="${item.id}" title="Delete record">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                `;

                // Add delete listener
                card.querySelector(".history-delete-btn").addEventListener("click", async (e) => {
                    const idToDelete = e.currentTarget.dataset.id;
                    if (confirm("Are you sure you want to delete this diagnosis log?")) {
                        await deleteHistoryItem(idToDelete);
                    }
                });

                historyList.appendChild(card);
            });

        } catch (err) {
            historyList.innerHTML = `<div class="empty-history-placeholder" style="color: var(--danger);">Error loading history: ${err.message}</div>`;
        }
    }

    async function deleteHistoryItem(id) {
        try {
            const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete request failed.");
            loadPredictionHistory();
        } catch (err) {
            alert("Failed to delete log: " + err.message);
        }
    }

    clearHistoryBtn.addEventListener("click", async () => {
        if (confirm("WARNING: This will permanently delete all local prediction logs in the SQLite database. Continue?")) {
            try {
                const res = await fetch("/api/history", { method: "DELETE" });
                if (!res.ok) throw new Error("Failed to clear database table.");
                loadPredictionHistory();
            } catch (err) {
                alert("Failed to clear database logs: " + err.message);
            }
        }
    });

    // --- HELPER FUNCTIONS ---
    function capitalize(str) {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
});
