# Aegis AI: Offline Local Disease Prediction & Health Assistant

Aegis AI is a state-of-the-art, privacy-focused offline clinical prediction and health assistant system. Built on **FastAPI**, **SQLite**, and integrated with local small language models (like **Gemma:2b** or **Phi-3:mini**) running through **Ollama**, Aegis AI operates 100% offline with zero data leakage.

It empowers patients to analyze symptoms, review diagnostic possibilities, receive immediate precautions, and hold context-aware health conversations, all from a gorgeous, dark-themed responsive web dashboard.

---

## 🚀 Key Features

*   **100% Offline AI Inference**: Powered by local lightweight models (`gemma:2b`, `phi3:mini`) through Ollama. Works without an internet connection once set up.
*   **Privacy First**: No telemetry, cloud calls, or external data sharing. All computations occur locally on the user's laptop.
*   **Intuitive Symptom Intake**: Multi-select tags, dynamic autocomplete search, and hands-free **Voice Input** utilizing native Web Speech Recognition.
*   **Heartbeat Server Checker**: Seamlessly monitors local Ollama state (gathers server connection and model availability statuses, giving detailed guide alerts if offline).
*   **Active Clinical UI**: Premium responsive slate dark theme equipped with smooth animations, custom scrollbars, medical disclaimers, and interactive checklists.
*   **Dynamic Chatbot Assistant**: Converse with Aegis about your diagnosed disease, potential symptoms, or home care queries with full contextual awareness.
*   **Diagnostic History Log**: Saved results stored in a local SQLite database using SQLAlchemy, offering full browse, search, and delete (CRUD) capabilities.
*   **Auto-Generated Interactive Docs**: Comprehensive Swagger / OpenAPI documentation provided out-of-the-box.

---

## 📂 Project Structure

```text
project/
│
├── app/
│   ├── routes/
│   │   ├── predict.py      # Main Prediction POST and Ollama Status heartbeats
│   │   └── history.py      # SQLite CRUD history operations
│   │
│   ├── services/
│   │   └── ollama.py       # Asynchronous Ollama service (prompt engineering, JSON enforcement, fallbacks)
│   │
│   ├── static/
│   │   ├── css/
│   │   │   └── styles.css  # Premium responsive styling sheet (Dark mode first, waveforms, skeleton screens)
│   │   └── js/
│   │       └── main.js     # Frontend router, tags controller, Web Speech API, status checker
│   │
│   ├── templates/
│   │   └── index.html      # Beautiful Dashboard structure
│   │
│   ├── database.py         # SQLAlchemy connection & DB engines
│   ├── models.py           # SQLAlchemy tables (PredictionHistory)
│   ├── schemas.py          # Pydantic request/response validations
│   └── main.py             # FastAPI App bootstrap and file mounts
│
├── requirements.txt        # Backend dependencies
├── .env                    # System configurations (Base URL, models)
└── README.md               # User manual (this file)
```

---

## 🛠️ Step-by-Step Installation

### Prerequisites

1.  **Python 3.9+** installed.
2.  **Ollama** installed on your system. Download it from [ollama.com](https://ollama.com).

### Step 1: Install & Set Up Ollama

1.  Launch the **Ollama** app on your computer.
2.  Open your terminal or command prompt and download the target lightweight model (Gemma 2B is fast and runs efficiently even on 8GB RAM laptops):
    ```bash
    ollama pull gemma:2b
    ```
    *(Alternatively, you can pull `phi3:mini` or `tinyllama` if preferred).*

### Step 2: Set Up Python Virtual Environment

Navigate to the project root directory and run:

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

Create or open `.env` in the root folder and verify the settings:

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma:2b

# Database Configuration
DATABASE_URL=sqlite:///./app.db
```

---

## 🚀 Running the System

Start the backend server using **Uvicorn**:

```bash
uvicorn app.main:app --reload
```

Once started, open your web browser and navigate to:
👉 **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)**

For interactive backend Swagger API documentation:
👉 **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

## 🩺 Interactive API Testing Examples

### 1. Check Ollama Status Heartbeat
**cURL:**
```bash
curl -X GET "http://127.0.0.1:8000/api/status"
```
**Response (Ollama Online & Ready):**
```json
{
  "status": "online",
  "model": "gemma:2b",
  "message": "Ollama is connected and 'gemma:2b' model is ready!"
}
```

### 2. Predict Disease based on Symptoms
**cURL:**
```bash
curl -X POST "http://127.0.0.1:8000/api/predict" \
     -H "Content-Type: application/json" \
     -d '{"symptoms": ["fever", "cough", "headache"]}'
```
**Response:**
```json
{
  "possible_disease": "Influenza (Flu)",
  "confidence": "High",
  "precautions": [
    "Stay hydrated and drink warm fluids",
    "Get adequate rest and sleep",
    "Monitor body temperature and take fever relievers if necessary",
    "Consult a doctor if symptoms worsen or breathing becomes difficult"
  ],
  "explanation": "Fever, cough, and headache are standard hallmark signs of viral influenza. The rapid onset of these combined symptoms is highly characteristic of the common flu virus."
}
```

### 3. Ask Follow-up Chat Questions
**cURL:**
```bash
curl -X POST "http://127.0.0.1:8000/api/chat" \
     -H "Content-Type: application/json" \
     -d '{
       "messages": [
         {"role": "user", "content": "What should I eat if I have Flu?"}
       ],
       "context_disease": "Influenza (Flu)"
     }'
```
**Response:**
```json
{
  "reply": "When recovering from Flu (Influenza), it is highly beneficial to consume easy-to-digest, nutrient-rich foods. Focus on warm vegetable or chicken broths to restock sodium and stay hydrated. Bananas, rice, applesauce, and herbal tea with honey can soothe a sore throat and provide clean energy. Avoid heavy, greasy, or high-sugar items. Remember to consult a physician if you experience vomiting or severe dehydration."
}
```

---

## 🔒 Medical Disclaimer

Aegis AI is an educational assistant designed to demonstrate local LLM parsing of health symptoms. It **does not** provide real clinical diagnoses or official medical prescriptions. In case of emergency or severe symptoms, always consult a certified medical practitioner or head to the nearest clinic.
