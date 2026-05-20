import os
import json
import httpx
import logging
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
        self.model = os.getenv("OLLAMA_MODEL", "gemma:2b")
        self.timeout = 60.0  # 1 minute timeout for slow CPU inferences

    async def check_connection(self) -> bool:
        """Check if local Ollama server is running."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/tags", timeout=3.0)
                return response.status_code == 200
        except Exception:
            return False

    async def check_model_downloaded(self) -> bool:
        """Check if the configured model is downloaded locally in Ollama."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/tags", timeout=3.0)
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    # Check both exact matches and prefix matches (e.g., 'gemma:2b' vs 'gemma:latest')
                    model_names = [m.get("name") for m in models]
                    for name in model_names:
                        if self.model in name or name in self.model:
                            return True
        except Exception:
            pass
        return False

    async def predict_disease(self, symptoms: List[str]) -> Dict[str, Any]:
        """Send symptoms to Ollama local LLM and return structured prediction."""
        symptoms_str = ", ".join(symptoms)
        
        # System instructions & output guidelines
        system_prompt = (
            "You are a lightweight medical assistant AI designed to help users identify potential health concerns.\n"
            "Analyze the patient's symptoms carefully and predict the most likely disease or health condition.\n"
            "IMPORTANT: You must return your response as a valid, parsable JSON object EXACTLY in the format below:\n"
            "{\n"
            '  "possible_disease": "Name of the disease",\n'
            '  "confidence": "High" or "Medium" or "Low",\n'
            '  "precautions": ["Precaution 1", "Precaution 2", "Precaution 3"],\n'
            '  "explanation": "A concise explanation of the potential disease, its symptoms overlap, and why this prediction is made."\n'
            "}\n"
            "Do not include any pre-text, post-text, markdown backticks, or explanation outside of the JSON block."
        )

        user_prompt = f"Patient symptoms: {symptoms_str}. Predict possible disease and explain with precautions."

        # Full prompt combined for models that don't support chat roles well
        full_prompt = f"{system_prompt}\n\nUser: {user_prompt}\n\nResponse:"

        payload = {
            "model": self.model,
            "prompt": full_prompt,
            "stream": False,
            "format": "json",  # Force Ollama to return structured JSON
            "options": {
                "temperature": 0.2, # Lower temperature for more analytical/factual answers
                "top_p": 0.9,
                "seed": 42
            }
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                    timeout=self.timeout
                )
                
                if response.status_code != 200:
                    raise Exception(f"Ollama returned status code {response.status_code}: {response.text}")
                
                result = response.json()
                raw_response = result.get("response", "").strip()
                
                # Parse JSON response
                try:
                    parsed_json = json.loads(raw_response)
                    # Validate keys presence
                    required_keys = ["possible_disease", "confidence", "precautions", "explanation"]
                    for key in required_keys:
                        if key not in parsed_json:
                            if key == "precautions":
                                parsed_json[key] = ["Consult a doctor", "Rest and hydrate"]
                            else:
                                parsed_json[key] = "Unknown"
                    return parsed_json
                except json.JSONDecodeError:
                    # Fallback if Ollama format constraint failed for some reason
                    logger.warning(f"Failed to parse Ollama JSON. Raw response: {raw_response}")
                    return self._fallback_parse(raw_response)
                    
        except httpx.ConnectError:
            raise ConnectionError(
                f"Could not connect to Ollama server at {self.base_url}. "
                "Please make sure the Ollama application is running on your computer."
            )
        except Exception as e:
            logger.error(f"Error calling Ollama API: {str(e)}")
            raise e

    def _fallback_parse(self, text: str) -> Dict[str, Any]:
        """Fallback simple parser to extract content if the JSON output is malformed."""
        # Simple default template
        prediction = {
            "possible_disease": "Inconclusive / General Malaise",
            "confidence": "Low",
            "precautions": ["Consult a medical professional", "Rest", "Drink warm fluids"],
            "explanation": "The AI assistant could not structure the prediction properly, but recommended seeking immediate professional medical advice."
        }
        
        # Try to find something that looks like JSON inside the text
        try:
            start = text.find("{")
            end = text.rfind("}") + 1
            if 0 <= start < end:
                sub_text = text[start:end]
                data = json.loads(sub_text)
                for key in ["possible_disease", "confidence", "precautions", "explanation"]:
                    if key in data:
                        prediction[key] = data[key]
                return prediction
        except Exception:
            pass

        # Text parsing heuristics
        if "disease" in text.lower():
            # Try to grab whatever comes after possible_disease or similar
            lines = text.split("\n")
            for line in lines:
                if ":" in line:
                    key, val = line.split(":", 1)
                    key = key.strip().lower()
                    if "disease" in key:
                        prediction["possible_disease"] = val.strip().strip('"').strip("'")
                    elif "confidence" in key:
                        prediction["confidence"] = val.strip().strip('"').strip("'")
                    elif "explanation" in key:
                        prediction["explanation"] = val.strip().strip('"').strip("'")
            
            # Simple precautions extraction
            if "precaution" in text.lower():
                prediction["precautions"] = ["Consult a healthcare provider", "Monitor symptoms closely"]
                
        return prediction

    async def chat_response(self, messages: List[Dict[str, str]], context_disease: str = "") -> str:
        """
        Send conversational message history to the local Ollama LLM and return AI response.
        Enriches the conversation by injecting clinical diagnosis context if available.
        """
        system_instruction = (
            "You are Aegis, a helpful, friendly, and professional medical assistant AI running offline.\n"
            "Answer the user's healthcare and wellness questions clearly, concisely, and accurately.\n"
        )
        if context_disease:
            system_instruction += f"Context: The patient was just diagnosed with '{context_disease}' using our system. Keep your answers relevant to this condition if the user is asking about it, but answer any other general health questions they ask.\n"
        
        system_instruction += (
            "IMPORTANT: If giving health tips, always include a brief friendly advice to consult a physician.\n"
            "Keep the response short, supportive, and formatted in clean paragraphs."
        )

        # Assemble conversation history into a unified prompt for the small local LLM
        formatted_prompt = f"{system_instruction}\n\n"
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "user":
                formatted_prompt += f"User: {content}\n"
            elif role == "assistant":
                formatted_prompt += f"Assistant: {content}\n"
            else:
                formatted_prompt += f"System: {content}\n"
        
        formatted_prompt += "Assistant:"

        payload = {
            "model": self.model,
            "prompt": formatted_prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
            }
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                    timeout=self.timeout
                )
                if response.status_code == 200:
                    return response.json().get("response", "").strip()
                else:
                    return f"Sorry, the local model server returned an error (status {response.status_code})."
        except Exception as e:
            logger.error(f"Error in Ollama chat response: {str(e)}")
            return "I am currently offline or having trouble communicating with my local Ollama database."

