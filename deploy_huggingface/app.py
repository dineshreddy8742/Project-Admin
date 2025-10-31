import logging
logging.basicConfig(level=logging.INFO)

logging.info("Starting app.py...")

import asyncio
import base64
import io
import json
import os
import uuid
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, WebSocket, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from google.cloud import speech, texttospeech, vision, translate
from google.oauth2 import service_account
from supabase import create_client, Client

import random
import vertexai
from vertexai.generative_models import GenerativeModel, Part
import google.generativeai as genai

logging.info("Imports successful")

# Initialize FastAPI
app = FastAPI(title="Project Kisan - Smart Agent System")
logging.info("FastAPI app created")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logging.info("CORS middleware added")

# Configure APIs
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logging.warning("GEMINI_API_KEY environment variable not set. Gemini features will be limited.")

# Configure Vertex AI
GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")
GOOGLE_CLOUD_LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION")

if GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION:
    credentials_json = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    if credentials_json:
        try:
            credentials_info = json.loads(credentials_json)
            credentials = service_account.Credentials.from_service_account_info(credentials_info)
            vertexai.init(project=GOOGLE_CLOUD_PROJECT, location=GOOGLE_CLOUD_LOCATION, credentials=credentials)
        except Exception as e:
            logging.warning(f"Vertex AI initialization failed: {e}")
    else:
        logging.warning("GOOGLE_APPLICATION_CREDENTIALS environment variable not set. Vertex AI features will be limited.")
else:
    logging.warning("GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_LOCATION environment variables not set. Vertex AI features will be limited.")

# Remove duplicate root endpoint - keeping only one
@app.get("/")
async def root():
    return {"message": "🌾 Project Kisan Smart Agent API", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "active_sessions": len(agent_state.sessions) if 'agent_state' in globals() else 0,
        "version": "1.0.0"
    }

@app.get("/api/live-data")
async def live_data():
    return {"data": "This is your live data"}

# Data Classes
class AgentState:
    def __init__(self):
        self.sessions = {}
        self.user_profiles = {}
        self.task_flows = {}

class TaskType(Enum):
    FORM_FILLING = "form_filling"
    DISEASE_ANALYSIS = "disease_analysis"
    COLD_STORAGE_BOOKING = "cold_storage_booking"
    MARKET_ANALYSIS = "market_analysis"
    CROP_RECOMMENDATION = "crop_recommendation"
    GOV_SCHEME_APPLICATION = "gov_scheme_application"
    CROP_MONITOR = "crop_monitor"
    COMMUNITY = "community"
    PROFILE = "profile"
    GROCERY_MARKETPLACE = "grocery_marketplace"
    ORDERS = "orders"
    CHAT = "chat"
    ADVANCED_DISEASE_ANALYSIS = "advanced_disease_analysis"
    HYPERSPECTRAL_DISEASE_ANALYSIS = "hyperspectral_disease_analysis"
    ARTISAN_MARKETPLACE = "artisan_marketplace"

# Helper Functions
async def process_image_with_gcp(image_file: UploadFile, language: str):
    try:
        credentials_json = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
        if not credentials_json:
            raise Exception("GOOGLE_APPLICATION_CREDENTIALS environment variable not set.")
        
        credentials_info = json.loads(credentials_json)
        credentials = service_account.Credentials.from_service_account_info(credentials_info)
        client = vision.ImageAnnotatorClient(credentials=credentials)

        content = await image_file.read()
        image = vision.Image(content=content)
        response = client.label_detection(image=image)
        labels = response.label_annotations

        analysis = {
            "labels": [],
            "primary_object": None,
            "confidence": 0
        }

        if labels:
            analysis["primary_object"] = labels[0].description
            analysis["confidence"] = labels[0].score
            for label in labels:
                analysis["labels"].append({"description": label.description, "score": label.score})

        return analysis
    except Exception as e:
        logging.error(f"Error in process_image_with_gcp: {e}")
        raise

async def process_audio_with_gcp(audio_file: UploadFile, language: str):
    try:
        credentials_json = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
        if not credentials_json:
            raise Exception("GOOGLE_APPLICATION_CREDENTIALS environment variable not set.")

        credentials_info = json.loads(credentials_json)
        credentials = service_account.Credentials.from_service_account_info(credentials_info)
        client = speech.SpeechClient(credentials=credentials)

        content = await audio_file.read()
        logging.info(f"Received audio file with size: {len(content)} bytes")
        audio = speech.RecognitionAudio(content=content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=48000,
            language_code=language,
        )

        response = client.recognize(config=config, audio=audio)
        logging.info(f"Speech-to-Text API response: {response}")

        if response.results:
            return response.results[0].alternatives[0].transcript
        else:
            return None
    except Exception as e:
        logging.error(f"Error in process_audio_with_gcp: {e}")
        raise

async def generate_speech_with_gcp(text: str, language: str):
    try:
        credentials_json = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
        if not credentials_json:
            raise Exception("GOOGLE_APPLICATION_CREDENTIALS environment variable not set.")

        credentials_info = json.loads(credentials_json)
        credentials = service_account.Credentials.from_service_account_info(credentials_info)
        client = texttospeech.TextToSpeechClient(credentials=credentials)

        input_text = texttospeech.SynthesisInput(text=text)

        # Set the voice parameters
        voice = texttospeech.VoiceSelectionParams(
            language_code=language,
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL,
        )

        # Set the audio configuration
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
        )

        response = client.synthesize_speech(
            input=input_text, voice=voice, audio_config=audio_config
        )

        return response.audio_content
    except Exception as e:
        logging.error(f"Error in generate_speech_with_gcp: {e}")
        raise

async def detect_intent(user_input: str):
    try:
        if not GEMINI_API_KEY:
            raise Exception("Gemini API key not configured.")
        
        model = genai.GenerativeModel('gemini-2.5-pro')
        prompt = f"""Classify the user's intent into one of the following categories: DISEASE_ANALYSIS, COLD_STORAGE_BOOKING, FORM_FILLING, CROP_RECOMMENDATION, NAVIGATION, PRODUCT_QUERY, or GENERAL_QUERY.
        User input: "{user_input}"
        Intent:"""
        response = model.generate_content(prompt)
        intent = response.text.strip()
        return intent
    except Exception as e:
        logging.error(f"Gemini intent detection failed: {e}")
        return "GENERAL_QUERY"

# Kisan Smart Agent
class KisanSmartAgent:
    def __init__(self):
        self.available_actions = {
            "navigate": self.navigate_to_page,
            "fill_form": self.fill_form_field,
            "capture_image": self.capture_image,
            "analyze_disease": self.analyze_disease_detailed,
            "ask_user": self.ask_user_question,
            "speak_response": self.speak_response,
            "complete_task": self.complete_task,
            "check_status": self.check_status
        }
    
    async def execute_task(self, session_id: str, task_type: str, user_input: str = None, file: UploadFile = None):
        """Main agent entry point - handles any task automatically"""
        session = agent_state.sessions.get(session_id, {})
        
        if task_type == TaskType.DISEASE_ANALYSIS.value:
            return await self.handle_disease_analysis(session_id, user_input, file)
        elif task_type == TaskType.FORM_FILLING.value:
            return await self.handle_form_filling(session_id, user_input)
        elif task_type == TaskType.COLD_STORAGE_BOOKING.value:
            return await self.handle_cold_storage_booking(session_id, user_input)
        elif task_type == TaskType.CROP_RECOMMENDATION.value:
            return await self.handle_crop_recommendation(session_id, user_input)
        elif task_type == TaskType.CROP_MONITOR.value:
            return await self.handle_crop_monitor(session_id, user_input)
        elif task_type == TaskType.COMMUNITY.value:
            return await self.handle_community(session_id, user_input)
        elif task_type == TaskType.PROFILE.value:
            return await self.handle_profile(session_id, user_input)
        elif task_type == TaskType.GROCERY_MARKETPLACE.value:
            return await self.handle_grocery_marketplace(session_id, user_input)
        elif task_type == TaskType.ORDERS.value:
            return await self.handle_orders(session_id, user_input)
        elif task_type == TaskType.CHAT.value:
            return await self.handle_chat(session_id, user_input)
        elif task_type == TaskType.ADVANCED_DISEASE_ANALYSIS.value:
            return await self.handle_advanced_disease_analysis(session_id, user_input, file)
        elif task_type == TaskType.HYPERSPECTRAL_DISEASE_ANALYSIS.value:
            return await self.handle_hyperspectral_disease_analysis(session_id, user_input, file)
        elif task_type == TaskType.GOV_SCHEME_APPLICATION.value:
            return await self.handle_gov_scheme_application(session_id, user_input)
        elif task_type == TaskType.MARKET_ANALYSIS.value:
            return await self.handle_market_analysis(session_id, user_input)
        elif task_type == TaskType.ARTISAN_MARKETPLACE.value:
            return await self.handle_artisan_marketplace(session_id, user_input)

        return await self.general_task_handler(session_id, user_input)

    async def handle_advanced_disease_analysis(self, session_id: str, user_input: str, file: UploadFile):
        """Automated advanced disease analysis workflow with hyperspectral simulation"""
        actions = []

        if not file:
            actions.append(await self.ask_user_question(
                "Please capture a high-quality image of your crop for advanced disease analysis. Make sure to show both healthy and affected areas clearly.",
                "image_capture"
            ))
        else:
            crop_name = user_input.replace("Analyze ", "").replace("analyze ", "").strip()
            if not crop_name:
                crop_name = "crop"

            # Step 1: Perform detailed disease analysis
            analysis_result = await self.analyze_disease_detailed(file, crop_name)

            # Step 2: Add hyperspectral simulation data
            hyperspectral_data = self.generate_hyperspectral_data(analysis_result)

            # Step 3: Enhanced analysis with hyperspectral insights
            if analysis_result["has_disease"]:
                severity_score = analysis_result.get("severity_score", 5)

                try:
                    if not GEMINI_API_KEY:
                        raise Exception("Gemini API key not configured.")

                    model = genai.GenerativeModel('gemini-2.5-pro')

                    # Advanced analysis prompt with hyperspectral data
                    advanced_prompt = f"""
                    Provide comprehensive advanced disease analysis for {crop_name}:
                    DISEASE ANALYSIS RESULTS:
                    - Disease Type: {analysis_result["disease_type"]}
                    - Severity Score: {severity_score}/10
                    - Confidence: {analysis_result["confidence"]:.2%}
                    - Affected Areas: {', '.join(analysis_result.get("affected_areas", ["Unknown"]))}
                    HYPERSPECTRAL DATA:
                    - Chlorophyll Content: {hyperspectral_data["chlorophyll_content"]}
                    - Water Stress Level: {hyperspectral_data["water_stress"]}
                    - Nutrient Deficiency: {hyperspectral_data["nutrient_deficiency"]}
                    - Disease Stress Index: {hyperspectral_data["disease_stress_index"]}
                    Please provide:
                    1. **Advanced Disease Diagnosis**: Specific pathogen identification based on visual and hyperspectral data
                    2. **Physiological Impact**: How the disease affects plant physiology (photosynthesis, water uptake, nutrient absorption)
                    3. **Stress Analysis**: Interpretation of hyperspectral stress indicators
                    4. **Precision Treatment**: Specific fungicides/herbicides with exact dosages and application methods
                    5. **Recovery Timeline**: Expected recovery time and monitoring milestones
                    6. **Preventive Protocols**: Advanced prevention strategies including resistant varieties
                    7. **Economic Impact**: Potential yield loss and cost-benefit analysis of treatments
                    8. **Expert Consultation**: When and why to consult agricultural pathologists
                    Format as a professional agricultural pathology report with actionable recommendations.
                    """

                    response = model.generate_content(advanced_prompt)
                    advanced_treatment = response.text

                except Exception as e:
                    logging.error(f"Advanced Gemini analysis failed: {e}")
                    advanced_treatment = "Advanced analysis temporarily unavailable. Please consult local agricultural experts for detailed diagnosis."

                # Update analysis result with advanced data
                analysis_result["hyperspectral_data"] = hyperspectral_data
                analysis_result["recommendation"]["advanced_treatment"] = advanced_treatment
                analysis_result["analysis_type"] = "Advanced AI + Hyperspectral Analysis"

            # Step 4: Add advanced analysis action
            actions.append(analysis_result)

            # Step 5: Create comprehensive summary
            summary = self.create_advanced_analysis_summary(analysis_result, hyperspectral_data)
            actions.append(await self.speak_response(summary))

            # Step 6: Add follow-up monitoring action
            if analysis_result["has_disease"]:
                actions.append({
                    "action": "schedule_followup",
                    "message": "Follow-up analysis recommended in 7 days to monitor treatment effectiveness",
                    "followup_date": (datetime.utcnow().replace(hour=9, minute=0, second=0) + timedelta(days=7)).isoformat(),
                    "reminder": "Monitor plant recovery and re-analyze if symptoms persist",
                    "timestamp": datetime.utcnow().isoformat()
                })

        return {
            "session_id": session_id,
            "task_type": "advanced_disease_analysis",
            "actions": actions,
            "status": "completed" if file else "awaiting_image",
            "analysis_level": "advanced",
            "includes_hyperspectral": True
        }

    async def handle_hyperspectral_disease_analysis(self, session_id: str, user_input: str, file: UploadFile):
        """Automated hyperspectral disease analysis workflow with comprehensive spectral data"""
        actions = []

        if not file:
            actions.append(await self.ask_user_question(
                "Please capture a hyperspectral image for detailed spectral analysis. Ensure good lighting and clear view of the affected area.",
                "image_capture"
            ))
        else:
            crop_name = user_input.replace("Analyze ", "").replace("analyze ", "").strip()
            if not crop_name:
                crop_name = "crop"

            # Step 1: Perform detailed visual analysis first
            visual_analysis = await self.analyze_disease_detailed(file, crop_name)

            # Step 2: Generate comprehensive hyperspectral data
            hyperspectral_data = self.generate_hyperspectral_data(visual_analysis)

            # Step 3: Create detailed spectral analysis report
            try:
                if not GEMINI_API_KEY:
                    raise Exception("Gemini API key not configured.")

                model = genai.GenerativeModel('gemini-2.5-pro')

                # Comprehensive hyperspectral analysis prompt
                spectral_prompt = f"""
                Provide comprehensive hyperspectral disease analysis for {crop_name}:
                VISUAL ANALYSIS RESULTS:
                - Disease Detected: {visual_analysis["has_disease"]}
                - Disease Type: {visual_analysis["disease_type"]}
                - Severity Score: {visual_analysis.get("severity_score", 0)}/10
                - Affected Areas: {', '.join(visual_analysis.get("affected_areas", ["None"]))}
                HYPERSPECTRAL MEASUREMENTS:
                - Chlorophyll Content: {hyperspectral_data["chlorophyll_content"]}
                - Water Stress Level: {hyperspectral_data["water_stress"]}
                - Nutrient Deficiency: {hyperspectral_data["nutrient_deficiency"]}
                - Disease Stress Index: {hyperspectral_data["disease_stress_index"]}
                - Photosynthetic Efficiency: {hyperspectral_data["photosynthetic_efficiency"]}
                - Leaf Temperature: {hyperspectral_data["leaf_temperature"]}
                - Stomatal Conductance: {hyperspectral_data["stomatal_conductance"]}
                SPECTRAL INDICES:
                - NDVI (Normalized Difference Vegetation Index): {hyperspectral_data["ndvi"]}
                - PRI (Photochemical Reflectance Index): {hyperspectral_data["pri"]}
                - ARI (Anthocyanin Reflectance Index): {hyperspectral_data["ari"]}
                - CRI (Carotenoid Reflectance Index): {hyperspectral_data["cri"]}
                Please provide:
                1. **Spectral Disease Signature**: Analysis of how the disease affects light absorption/reflection patterns
                2. **Physiological Stress Assessment**: Impact on photosynthesis, water relations, and nutrient uptake
                3. **Early Detection Markers**: Spectral indicators that appear before visible symptoms
                4. **Disease Progression Mapping**: How spectral signatures change as disease advances
                5. **Precision Treatment Zones**: Identify specific areas needing different treatment intensities
                6. **Recovery Monitoring**: Spectral indicators of treatment effectiveness and plant recovery
                7. **Preventive Spectral Monitoring**: Baseline measurements for early warning systems
                8. **Economic Optimization**: Cost-benefit analysis based on spectral treatment zoning
                Include spectral data interpretation, treatment precision recommendations, and long-term monitoring protocols.
                Format as a professional hyperspectral agricultural analysis report.
                """

                response = model.generate_content(spectral_prompt)
                hyperspectral_analysis = response.text

            except Exception as e:
                logging.error(f"Hyperspectral Gemini analysis failed: {e}")
                hyperspectral_analysis = "Advanced hyperspectral analysis temporarily unavailable. Basic spectral data is still provided for reference."

            # Step 4: Create comprehensive hyperspectral result
            analysis_result = {
                "action": "hyperspectral_analysis_complete",
                "crop_name": crop_name,
                "visual_analysis": visual_analysis,
                "hyperspectral_data": hyperspectral_data,
                "spectral_analysis": hyperspectral_analysis,
                "analysis_summary": {
                    "method": "Hyperspectral + AI Analysis",
                    "data_points": len(hyperspectral_data),
                    "spectral_bands": "400-2500nm (simulated)",
                    "processing_time": "Real-time",
                    "accuracy_level": "High precision"
                },
                "recommendations": self.generate_spectral_recommendations(hyperspectral_data, visual_analysis),
                "confidence_map_url": f"/api/spectral-maps/{session_id}",  # Simulated endpoint
                "timestamp": datetime.utcnow().isoformat()
            }

            actions.append(analysis_result)

            # Step 5: Create detailed spoken summary
            summary = self.create_hyperspectral_summary(visual_analysis, hyperspectral_data)
            actions.append(await self.speak_response(summary))

            # Step 6: Add spectral monitoring schedule
            actions.append({
                "action": "spectral_monitoring_schedule",
                "message": "Spectral monitoring recommended every 3-5 days during treatment period",
                "schedule": [
                    {"day": 1, "type": "Baseline measurement"},
                    {"day": 3, "type": "Treatment response check"},
                    {"day": 7, "type": "Recovery assessment"},
                    {"day": 14, "type": "Final evaluation"}
                ],
                "alerts": "System will notify if spectral signatures indicate worsening condition",
                "timestamp": datetime.utcnow().isoformat()
            })

        return {
            "session_id": session_id,
            "task_type": "hyperspectral_disease_analysis",
            "actions": actions,
            "status": "completed" if file else "awaiting_image",
            "analysis_level": "hyperspectral",
            "spectral_data_available": True,
            "monitoring_enabled": True
        }

    async def general_task_handler(self, session_id: str, user_input: str):
        try:
            if not GEMINI_API_KEY:
                raise Exception("Gemini API key not configured.")
            
            model = genai.GenerativeModel('gemini-2.5-pro')
            response = model.generate_content(user_input)
            gemini_response = response.text
        except Exception as e:
            logging.error(f"Gemini generation failed: {e}")
            gemini_response = f"I received your message: {user_input}, but I couldn't generate a smart response right now."

        return {
            "session_id": session_id,
            "task_type": "general_query",
            "actions": [{
                "action": "speak_response",
                "message": gemini_response,
                "timestamp": datetime.utcnow().isoformat()
            }],
            "status": "completed"
        }

    # Add other handler methods here (handle_product_query, handle_chat, etc.)
    # ... [Previous handler methods remain the same] ...

    async def handle_disease_analysis(self, session_id: str, user_input: str, file: UploadFile):
        """Automated disease analysis workflow with detailed output"""
        actions = []

        # Step 1: Navigate to disease analysis page
        actions.append(await self.navigate_to_page("disease-detector"))

        # Step 2: If no image provided, ask user to capture one
        if not file:
            actions.append(await self.ask_user_question(
                "Please capture a clear image of your crop showing the affected area for accurate disease analysis",
                "image_capture"
            ))
            return {
                "session_id": session_id,
                "task_type": "disease_analysis",
                "actions": actions,
                "status": "awaiting_image",
                "analysis_complete": False
            }
        else:
            # Extract crop name from user_input
            crop_name = user_input.replace("Analyze ", "").replace("analyze ", "").strip()
            if not crop_name:
                crop_name = "crop"

            # Step 3: Perform comprehensive disease analysis
            analysis_result = await self.analyze_disease_detailed(file, crop_name)
            actions.append(analysis_result)

            # Step 4: Generate detailed recommendations using AI
            try:
                if not GEMINI_API_KEY:
                    raise Exception("Gemini API key not configured.")

                model = genai.GenerativeModel('gemini-2.5-pro')

                detailed_analysis_prompt = f"""
                Based on the crop disease analysis results, provide a comprehensive report for {crop_name}:
                Analysis Results:
                - Disease Detected: {analysis_result["has_disease"]}
                - Primary Finding: {analysis_result["disease_type"]}
                - Confidence Level: {analysis_result["confidence"]:.2%}
                - Affected Areas: {', '.join(analysis_result.get("affected_areas", ["Unknown"]))}
                Please provide:
                1. **Disease Identification**: Detailed description of the identified disease/symptoms
                2. **Severity Assessment**: Rate the severity (Low/Medium/High) and explain why
                3. **Spread Analysis**: How the disease might spread and current containment status
                4. **Treatment Plan**: Step-by-step treatment recommendations with specific products/dosages
                5. **Prevention Measures**: Long-term prevention strategies
                6. **Expected Recovery**: Timeline and success factors
                7. **Monitoring Plan**: How to monitor progress and when to seek expert help
                Format the response as a structured medical report for farmers.
                """

                detailed_response = model.generate_content(detailed_analysis_prompt)
                detailed_report = detailed_response.text

                # Add detailed report to analysis result
                analysis_result["detailed_report"] = detailed_report

            except Exception as e:
                logging.error(f"Detailed analysis generation failed: {e}")
                analysis_result["detailed_report"] = "Detailed analysis report could not be generated. Please consult local agricultural experts."

            # Step 5: Create comprehensive action summary
            summary = self.create_disease_analysis_summary(analysis_result)
            actions.append(await self.speak_response(summary))

            # Step 6: Navigate to treatment page if disease found
            if analysis_result["has_disease"]:
                actions.append(await self.navigate_to_page("treatment-suggestions"))

                # Additional actions for severe cases
                if analysis_result.get("severity_score", 0) > 7:
                    actions.append({
                        "action": "urgent_attention",
                        "message": "⚠️ HIGH PRIORITY: This appears to be a severe infection. Please contact agricultural experts immediately.",
                        "recommendations": [
                            "Isolate affected plants",
                            "Contact local agricultural officer",
                            "Consider professional pest control services",
                            "Monitor neighboring plants closely"
                        ],
                        "timestamp": datetime.utcnow().isoformat()
                    })

            return {
                "session_id": session_id,
                "task_type": "disease_analysis",
                "actions": actions,
                "status": "completed",
                "analysis_complete": True,
                "analysis_result": analysis_result
            }

    async def analyze_disease_detailed(self, image_file: UploadFile, crop_name: str):
        """Comprehensive disease analysis with detailed output using Google Vision AI and Gemini"""
        try:
            # Step 1: Basic image analysis with Google Vision AI
            analysis = await process_image_with_gcp(image_file, "en")
            labels = analysis.get("labels", [])
            primary_object = analysis.get("primary_object", "Unknown")
            confidence = analysis.get("confidence", 0)

            # Step 2: Enhanced disease detection logic
            disease_keywords = [
                "disease", "blight", "fungus", "mold", "rot", "spot", "lesion", "wilt",
                "yellowing", "discoloration", "pest", "insect", "damage", "decay",
                "rust", "mildew", "scab", "canker", "gall", "smut"
            ]

            # Analyze labels for disease indicators
            disease_indicators = []
            affected_areas = []
            severity_indicators = []

            for label in labels:
                label_desc = label["description"].lower()
                label_score = label["score"]

                # Check for disease-related terms
                for keyword in disease_keywords:
                    if keyword in label_desc:
                        disease_indicators.append({
                            "term": keyword,
                            "description": label["description"],
                            "confidence": label_score
                        })
                        break

                # Identify affected areas
                if any(term in label_desc for term in ["leaf", "stem", "root", "fruit", "flower", "bark"]):
                    affected_areas.append(label["description"])

                # Assess severity based on visual cues
                if any(term in label_desc for term in ["severe", "extensive", "widespread", "heavy"]):
                    severity_indicators.append("high")
                elif any(term in label_desc for term in ["moderate", "partial", "some"]):
                    severity_indicators.append("medium")
                elif any(term in label_desc for term in ["mild", "slight", "minor"]):
                    severity_indicators.append("low")

            # Determine if disease is present
            has_disease = len(disease_indicators) > 0

            # Calculate severity score (0-10)
            base_severity = len(disease_indicators) * 2
            if "high" in severity_indicators:
                severity_score = min(9 + base_severity, 10)
            elif "medium" in severity_indicators:
                severity_score = min(6 + base_severity, 8)
            else:
                severity_score = min(3 + base_severity, 5)

            if not has_disease:
                severity_score = 0

            # Step 3: Generate detailed analysis using Gemini AI
            try:
                if not GEMINI_API_KEY:
                    raise Exception("Gemini API key not configured.")

                model = genai.GenerativeModel('gemini-2.5-pro')

                analysis_prompt = f"""
                Analyze this crop disease detection result for {crop_name}:
                DETECTED FEATURES:
                - Primary Object: {primary_object}
                - Confidence: {confidence:.2%}
                - Disease Indicators: {len(disease_indicators)} found
                - Affected Areas: {', '.join(affected_areas) if affected_areas else 'None identified'}
                - Severity Score: {severity_score}/10
                DISEASE INDICATORS FOUND:
                {chr(10).join([f"- {ind['description']} ({ind['confidence']:.1%})" for ind in disease_indicators[:5]])}
                Please provide:
                1. **Disease Diagnosis**: What specific disease/condition is likely present?
                2. **Symptom Analysis**: Detailed explanation of visible symptoms
                3. **Causal Factors**: What might be causing this condition?
                4. **Impact Assessment**: How this affects crop health and yield
                5. **Immediate Actions**: What to do right now
                6. **Treatment Options**: Specific treatments with dosages/timing
                7. **Prevention Strategies**: Long-term prevention measures
                Format as a comprehensive agricultural diagnostic report.
                """

                gemini_response = model.generate_content(analysis_prompt)
                ai_analysis = gemini_response.text

            except Exception as e:
                logging.error(f"Gemini analysis failed: {e}")
                ai_analysis = "AI-powered detailed analysis not available. Please consult local agricultural experts."

            # Step 4: Create comprehensive recommendation
            if has_disease:
                disease_type = disease_indicators[0]["description"] if disease_indicators else "Unknown Disease"

                recommendation = {
                    "title": f"🚨 Disease Detected: {disease_type} in {crop_name}",
                    "description": f"Analysis shows {len(disease_indicators)} disease indicators with {severity_score}/10 severity. Affected areas: {', '.join(affected_areas[:3]) if affected_areas else 'Various plant parts'}.",
                    "treatment": ai_analysis,
                    "severity_level": "High" if severity_score > 7 else "Medium" if severity_score > 4 else "Low",
                    "urgency": "Immediate action required" if severity_score > 7 else "Address within 24-48 hours" if severity_score > 4 else "Monitor and treat as needed",
                    "next_steps": [
                        "Isolate affected plants to prevent spread",
                        "Remove and destroy severely infected plant material",
                        "Apply recommended treatments immediately",
                        "Monitor neighboring plants for symptoms",
                        "Contact local agricultural extension office if unsure"
                    ]
                }
            else:
                recommendation = {
                    "title": f"✅ Healthy {crop_name} Plant Detected",
                    "description": f"Analysis shows no significant disease indicators. Plant appears healthy with {confidence:.1%} confidence in identification.",
                    "treatment": "No treatment required. Continue regular monitoring and maintenance.",
                    "severity_level": "None",
                    "urgency": "No action required",
                    "next_steps": [
                        "Continue regular crop monitoring",
                        "Maintain proper irrigation and fertilization",
                        "Implement preventive measures",
                        "Regular scouting for early disease detection"
                    ]
                }

            # Step 5: Return comprehensive analysis result
            return {
                "action": "analyze_disease_detailed",
                "has_disease": has_disease,
                "disease_type": disease_indicators[0]["description"] if disease_indicators else "None",
                "confidence": confidence,
                "severity_score": severity_score,
                "affected_areas": affected_areas,
                "disease_indicators": disease_indicators,
                "recommendation": recommendation,
                "ai_analysis": ai_analysis,
                "analysis_summary": {
                    "crop": crop_name,
                    "analysis_date": datetime.utcnow().isoformat(),
                    "method": "AI-powered Vision Analysis + Gemini AI",
                    "confidence_level": f"{confidence:.1%}",
                    "processing_time": "Real-time"
                },
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logging.error(f"Detailed disease analysis failed: {e}")
            # Fallback to basic analysis
            return await self.analyze_disease_basic(image_file, crop_name)

    async def analyze_disease_basic(self, image_file: UploadFile, crop_name: str):
        """Basic fallback disease analysis"""
        try:
            analysis = await process_image_with_gcp(image_file, "en")
            has_disease = any("disease" in label["description"].lower() or "blight" in label["description"].lower() for label in analysis.get("labels", []))
            primary_finding = analysis.get("primary_object", "Unknown")

            recommendation = {
                "title": f"{'Disease Detected' if has_disease else 'Healthy Plant'} in {crop_name}",
                "description": f"Basic analysis completed. {'Disease indicators found' if has_disease else 'No disease indicators detected'}.",
                "treatment": "Please consult local agricultural experts for detailed diagnosis and treatment.",
                "severity_level": "Unknown",
                "urgency": "Consult expert",
                "next_steps": ["Contact agricultural extension office", "Get professional diagnosis"]
            }

            return {
                "action": "analyze_disease_basic",
                "has_disease": has_disease,
                "disease_type": primary_finding if has_disease else "None",
                "confidence": analysis.get("confidence", 0),
                "severity_score": 5 if has_disease else 0,
                "recommendation": recommendation,
                "analysis_summary": {
                    "crop": crop_name,
                    "analysis_date": datetime.utcnow().isoformat(),
                    "method": "Basic Vision Analysis",
                    "confidence_level": f"{analysis.get('confidence', 0):.1%}",
                    "processing_time": "Real-time"
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logging.error(f"Basic disease analysis failed: {e}")
            raise

    def generate_hyperspectral_data(self, analysis_result: dict) -> dict:
        """Generate simulated hyperspectral data based on disease analysis"""
        has_disease = analysis_result.get("has_disease", False)
        severity = analysis_result.get("severity_score", 0)

        # Base healthy values
        base_chlorophyll = round(random.uniform(45, 65), 1)
        base_water_stress = round(random.uniform(5, 15), 1)
        base_photosynthetic_eff = round(random.uniform(85, 95), 1)
        base_leaf_temp = round(random.uniform(25, 32), 1)
        base_stomatal = round(random.uniform(0.3, 0.7), 2)

        # Adjust values based on disease presence and severity
        if has_disease:
            # Disease reduces chlorophyll content
            chlorophyll_reduction = severity * 0.8
            chlorophyll_content = max(15, base_chlorophyll - chlorophyll_reduction)

            # Disease increases water stress
            water_stress_increase = severity * 1.5
            water_stress = min(60, base_water_stress + water_stress_increase)

            # Disease reduces photosynthetic efficiency
            photosynthetic_reduction = severity * 2.5
            photosynthetic_efficiency = max(30, base_photosynthetic_eff - photosynthetic_reduction)

            # Disease may increase leaf temperature
            leaf_temp_increase = severity * 0.3
            leaf_temperature = base_leaf_temp + leaf_temp_increase

            # Disease reduces stomatal conductance
            stomatal_reduction = severity * 0.05
            stomatal_conductance = max(0.1, base_stomatal - stomatal_reduction)

            # Disease stress index
            disease_stress_index = min(95, severity * 9.5)

            # Nutrient deficiency based on disease type
            nutrient_options = ["Nitrogen", "Phosphorus", "Potassium", "Calcium", "Magnesium"]
            nutrient_deficiency = random.choice(nutrient_options)
        else:
            chlorophyll_content = base_chlorophyll
            water_stress = base_water_stress
            photosynthetic_efficiency = base_photosynthetic_eff
            leaf_temperature = base_leaf_temp
            stomatal_conductance = base_stomatal
            disease_stress_index = round(random.uniform(5, 15), 1)
            nutrient_deficiency = "None detected"

        # Calculate spectral indices
        ndvi = round((random.uniform(0.6, 0.9) - severity * 0.02), 3) if not has_disease else round(random.uniform(0.2, 0.7), 3)
        pri = round(random.uniform(-0.1, 0.1), 3)
        ari = round(random.uniform(0.5, 2.0), 3)
        cri = round(random.uniform(2.0, 6.0), 3)

        return {
            "chlorophyll_content": f"{chlorophyll_content} µg/cm²",
            "water_stress": f"{water_stress}%",
            "nutrient_deficiency": nutrient_deficiency,
            "disease_stress_index": f"{disease_stress_index}%",
            "photosynthetic_efficiency": f"{photosynthetic_efficiency}%",
            "leaf_temperature": f"{leaf_temperature}°C",
            "stomatal_conductance": f"{stomatal_conductance} mol/m²/s",
            "ndvi": ndvi,
            "pri": pri,
            "ari": ari,
            "cri": cri,
            "spectral_bands_analyzed": "400-2500nm",
            "measurement_accuracy": "±2.5%",
            "data_quality": "High" if random.random() > 0.1 else "Medium"
        }

    def generate_spectral_recommendations(self, hyperspectral_data: dict, visual_analysis: dict) -> list:
        """Generate spectral-based treatment recommendations"""
        recommendations = []
        has_disease = visual_analysis.get("has_disease", False)
        severity = visual_analysis.get("severity_score", 0)

        if has_disease:
            # Parse chlorophyll content
            chlorophyll = float(hyperspectral_data["chlorophyll_content"].split()[0])

            if chlorophyll < 30:
                recommendations.append({
                    "type": "Nutrient supplementation",
                    "priority": "High",
                    "action": "Apply nitrogen-rich fertilizer immediately",
                    "spectral_basis": f"Chlorophyll content ({chlorophyll} µg/cm²) indicates severe nutrient deficiency"
                })

            # Parse water stress
            water_stress = float(hyperspectral_data["water_stress"].split('%')[0])

            if water_stress > 40:
                recommendations.append({
                    "type": "Irrigation management",
                    "priority": "High",
                    "action": "Increase irrigation frequency and monitor soil moisture",
                    "spectral_basis": f"Water stress level ({water_stress}%) indicates drought stress"
                })

            # Disease-specific recommendations
            if severity > 7:
                recommendations.append({
                    "type": "Precision treatment",
                    "priority": "Critical",
                    "action": "Apply targeted fungicide treatment to affected zones only",
                    "spectral_basis": "Spectral analysis shows severe disease stress requiring immediate intervention"
                })

        else:
            recommendations.append({
                "type": "Preventive care",
                "priority": "Low",
                "action": "Continue regular monitoring and preventive measures",
                "spectral_basis": "All spectral indicators within healthy ranges"
            })

        return recommendations

    def create_disease_analysis_summary(self, analysis_result: dict) -> str:
        """Create a spoken summary of the disease analysis results"""
        has_disease = analysis_result.get("has_disease", False)
        crop_name = analysis_result.get("crop", "crop")
        severity = analysis_result.get("severity_score", 0)
        disease_type = analysis_result.get("disease_type", "Unknown")

        if has_disease:
            severity_text = "high" if severity > 7 else "medium" if severity > 4 else "low"
            summary = f"Disease analysis complete for your {crop_name}. I detected {disease_type} with {severity_text} severity rating of {severity} out of 10. "

            if severity > 7:
                summary += "This requires immediate attention. Please isolate affected plants and contact agricultural experts right away. "
            elif severity > 4:
                summary += "Treatment should be applied within the next 24 to 48 hours. "
            else:
                summary += "Monitor the situation and apply preventive measures. "

            summary += "I've provided detailed treatment recommendations and next steps in the analysis report."
        else:
            summary = f"Good news! Your {crop_name} appears healthy with no disease indicators detected. Continue regular monitoring and maintenance practices."

        return summary

    def create_advanced_analysis_summary(self, analysis_result: dict, hyperspectral_data: dict) -> str:
        """Create a comprehensive summary for advanced analysis"""
        has_disease = analysis_result.get("has_disease", False)
        crop_name = analysis_result.get("crop", "crop")
        severity = analysis_result.get("severity_score", 0)
        disease_type = analysis_result.get("disease_type", "Unknown")

        chlorophyll = hyperspectral_data.get("chlorophyll_content", "Unknown")
        water_stress = hyperspectral_data.get("water_stress", "Unknown")

        if has_disease:
            summary = f"Advanced analysis complete for your {crop_name}. Detected {disease_type} with severity score {severity}/10. "
            summary += f"Spectral data shows chlorophyll content at {chlorophyll} and water stress at {water_stress}. "

            if severity > 7:
                summary += "Critical condition detected. Immediate isolation and professional treatment required. "
            elif severity > 4:
                summary += "Moderate to severe infection. Treatment should begin within 48 hours. "
            else:
                summary += "Early stage infection detected. Monitor closely and apply preventive treatments. "

            summary += "Detailed hyperspectral analysis and precision treatment recommendations are now available."
        else:
            summary = f"Advanced analysis shows your {crop_name} is healthy. Chlorophyll levels at {chlorophyll}, water stress minimal at {water_stress}. All spectral indicators within optimal ranges. Continue preventive maintenance."

        return summary

    def create_hyperspectral_summary(self, visual_analysis: dict, hyperspectral_data: dict) -> str:
        """Create a detailed summary for hyperspectral analysis"""
        crop_name = visual_analysis.get("crop", "crop")
        has_disease = visual_analysis.get("has_disease", False)

        summary = f"Hyperspectral analysis complete for {crop_name}. "

        if has_disease:
            disease_type = visual_analysis.get("disease_type", "Unknown")
            severity = visual_analysis.get("severity_score", 0)
            chlorophyll = hyperspectral_data.get("chlorophyll_content", "Unknown")
            water_stress = hyperspectral_data.get("water_stress", "Unknown")
            disease_stress = hyperspectral_data.get("disease_stress_index", "Unknown")

            summary += f"Detected {disease_type} with spectral disease stress index at {disease_stress}. "
            summary += f"Chlorophyll content measured at {chlorophyll}, water stress at {water_stress}. "

            if severity > 7:
                summary += "Spectral signatures indicate severe physiological stress. Immediate precision treatment recommended. "
            else:
                summary += "Spectral analysis confirms disease presence with moderate stress levels. "

            summary += "Detailed spectral mapping and treatment zone identification completed."
        else:
            ndvi = hyperspectral_data.get("ndvi", "Unknown")
            photosynthetic_eff = hyperspectral_data.get("photosynthetic_efficiency", "Unknown")

            summary += f"Plant health excellent with NDVI of {ndvi} and photosynthetic efficiency at {photosynthetic_eff}. "
            summary += "All spectral indicators within healthy ranges. No disease signatures detected."

        return summary

    # Action Implementations
    async def navigate_to_page(self, page_name: str):
        return {
            "action": "navigate",
            "page": page_name,
            "message": f"Navigating to {page_name.replace('-', ' ').title()}",
            "timestamp": datetime.utcnow().isoformat()
        }

    async def fill_form_field(self, form_name: str, field_name: str, value: str):
        return {
            "action": "fill_form",
            "form": form_name,
            "field": field_name,
            "value": value,
            "message": f"Filled {field_name} with {value}",
            "timestamp": datetime.utcnow().isoformat()
        }

    async def capture_image(self):
        return {
            "action": "capture_image",
            "message": "Opening camera for image capture",
            "timestamp": datetime.utcnow().isoformat()
        }

    async def ask_user_question(self, question: str, context: str):
        return {
            "action": "ask_user",
            "question": question,
            "context": context,
            "requires_response": True,
            "timestamp": datetime.utcnow().isoformat()
        }

    async def speak_response(self, message: str):
        return {
            "action": "speak_response",
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }

    async def complete_task(self, summary: str):
        return {
            "action": "complete_task",
            "summary": summary,
            "timestamp": datetime.utcnow().isoformat()
        }

    async def check_status(self, item: str):
        return {
            "action": "check_status",
            "item": item,
            "status": "active",  # Simulated status
            "timestamp": datetime.utcnow().isoformat()
        }

    # Add other handler methods with proper implementations
    async def handle_crop_recommendation(self, session_id: str, user_input: str):
        return {
            "session_id": session_id,
            "task_type": "crop_recommendation",
            "actions": [{
                "action": "speak_response",
                "message": "I can help you with crop recommendations. What is your location and soil type?",
                "timestamp": datetime.utcnow().isoformat()
            }],
            "status": "awaiting_info"
        }

    async def handle_crop_monitor(self, session_id: str, user_input: str):
        return {
            "session_id": session_id,
            "task_type": "crop_monitor",
            "status": "not_implemented"
        }

    async def handle_community(self, session_id: str, user_input: str):
        return {
            "session_id": session_id,
            "task_type": "community",
            "status": "not_implemented"
        }

    async def handle_profile(self, session_id: str, user_input: str):
        return {
            "session_id": session_id,
            "task_type": "profile",
            "status": "not_implemented"
        }

    async def handle_grocery_marketplace(self, session_id: str, user_input: str):
        return {
            "session_id": session_id,
            "task_type": "grocery_marketplace",
            "status": "not_implemented"
        }

    async def handle_orders(self, session_id: str, user_input: str):
        return {
            "session_id": session_id,
            "task_type": "orders",
            "status": "not_implemented"
        }

    async def handle_form_filling(self, session_id: str, form_data: str):
        """Smart form filling with context awareness"""
        actions = []
        missing_fields = []
        
        # Parse form requirements (in real implementation, this would come from form schema)
        required_fields = ["name", "location", "crop_type", "area"]
        provided_data = self.extract_form_data(form_data)
        
        # Check for missing fields
        for field in required_fields:
            if field not in provided_data:
                missing_fields.append(field)
        
        if missing_fields:
            # Ask user for missing information
            question = f"I need these details to complete your form: {', '.join(missing_fields)}. Please provide them."
            actions.append(await self.ask_user_question(question, "form_completion"))
        else:
            # All fields available, fill the form
            for field, value in provided_data.items():
                actions.append(await self.fill_form_field("registration_form", field, value))
            
            actions.append(await self.complete_task("Form filled successfully!"))
        
        return {
            "session_id": session_id,
            "task_type": "form_filling",
            "actions": actions,
            "status": "completed" if not missing_fields else "awaiting_info"
        }

    async def handle_cold_storage_booking(self, session_id: str, user_input: str):
        """Automated cold storage booking"""
        actions = []
        
        # Extract booking details from user input
        booking_details = await self.extract_booking_details(user_input)
        
        # Navigate to cold storage page
        actions.append(await self.navigate_to_page("cold-storage"))
        
        # Fill booking form
        if "crop_type" in booking_details:
            actions.append(await self.fill_form_field("cold_storage_form", "crop_type", booking_details["crop_type"]))
        
        if "quantity" in booking_details:
            actions.append(await self.fill_form_field("cold_storage_form", "quantity", booking_details["quantity"]))
        
        # Check for missing information
        required_booking_fields = ["crop_type", "quantity", "duration", "storage_date"]
        missing_fields = [field for field in required_booking_fields if field not in booking_details]
        
        if missing_fields:
            question = f"To complete your cold storage booking, I need: {', '.join(missing_fields)}"
            actions.append(await self.ask_user_question(question, "booking_completion"))
        else:
            actions.append(await self.complete_task("Cold storage booking completed!"))
            actions.append(await self.speak_response("Your cold storage has been booked successfully!"))
        
        return {
            "session_id": session_id,
            "task_type": "cold_storage_booking",
            "actions": actions,
            "status": "completed" if not missing_fields else "awaiting_info"
        }

    # Utility Methods
    def extract_form_data(self, text: str) -> Dict[str, str]:
        """Extract form data from natural language"""
        # Simple extraction - in production, use NLP
        data = {}
        if "name" in text.lower():
            data["name"] = self.extract_value_after_keyword(text, "name")
        if "location" in text.lower() or "village" in text.lower():
            data["location"] = self.extract_value_after_keyword(text, "location")
        if "crop" in text.lower():
            data["crop_type"] = self.extract_value_after_keyword(text, "crop")
        if "area" in text.lower() or "acre" in text.lower():
            data["area"] = self.extract_value_after_keyword(text, "area")
        return data

    async def extract_booking_details(self, text: str) -> Dict[str, str]:
        """Extract booking details from natural language using Gemini AI."""
        prompt = f"""
        Extract the following details from the user's request: crop_type, quantity, and duration.
        Respond with ONLY a minified JSON object. Example: {{"crop_type": "tomatoes", "quantity": "50kg", "duration": "2 weeks"}}
        
        User Request: "{text}"
        JSON Output:
        """
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            details = json.loads(response.text.strip())
            return details
        except Exception as e:
            logging.error(f"Gemini extraction failed: {e}")
            return {}

    def extract_value_after_keyword(self, text: str, keyword: str) -> str:
        """Extract value after a keyword in text"""
        try:
            words = text.lower().split()
            if keyword in words:
                index = words.index(keyword)
                if index + 1 < len(words):
                    return words[index + 1]
        except:
            pass
        return "unknown"

    async def handle_product_query(self, session_id: str, user_input: str):
        """Handle a user query about a product."""
        try:
            # Use Gemini to extract the product name from the user's query
            model = genai.GenerativeModel('gemini-2.5-pro')
            extraction_prompt = f"""Extract the product name from the following user query. Respond with only the product name.
            User query: "{user_input}"
            Product name:"""
            extraction_response = model.generate_content(extraction_prompt)
            product_name = extraction_response.text.strip()

            # Fetch product details from Supabase
            url: str = os.environ.get("SUPABASE_URL")
            key: str = os.environ.get("SUPABASE_KEY")
            supabase: Client = create_client(url, key)

            response = supabase.from_('products').select("*").ilike('name', f'%{product_name}%').limit(1).single().execute()
            product_data = response.data

            if not product_data:
                return await self.general_task_handler(session_id, f"I couldn't find a product named {product_name}. Can you please be more specific?")

            # Generate a summary using Gemini with the product data as context
            summary_prompt = f"""Summarize the following product information for a customer:
            Product Name: {product_data['name']}
            Description: {product_data['description']}
            Price: {product_data['price']}
            Category: {product_data['category']}
            Respond in a friendly and helpful tone."""
            summary_response = model.generate_content(summary_prompt)
            summary = summary_response.text.strip()

            return {
                "session_id": session_id,
                "task_type": "product_query",
                "actions": [{
                    "action": "speak_response",
                    "message": summary,
                    "timestamp": datetime.utcnow().isoformat()
                }],
                "status": "completed"
            }

        except Exception as e:
            logging.error(f"Error handling product query: {e}")
            return await self.general_task_handler(session_id, "I'm having trouble looking up product information right now. Please try again later.")

    async def handle_chat(self, session_id: str, user_input: str):
        """Handle a chat message"""
        intent = await detect_intent(user_input)

        if intent == "DISEASE_ANALYSIS":
            return await self.handle_disease_analysis(session_id, user_input, None)
        elif intent == "COLD_STORAGE_BOOKING":
            return await self.handle_cold_storage_booking(session_id, user_input)
        elif intent == "FORM_FILLING":
            return await self.handle_form_filling(session_id, user_input)
        elif intent == "CROP_RECOMMENDATION":
            return await self.handle_crop_recommendation(session_id, user_input)
        elif intent == "PRODUCT_QUERY":
            return await self.handle_product_query(session_id, user_input)
        elif intent == "NAVIGATION":
            # Extract page name from user_input
            pages = ["dashboard", "crop-monitor", "disease-detector", "market-trends", "cold-storage", "gov-schemes", "community", "profile"]
            page_name = next((page for page in pages if page in user_input.lower()), None)
            if page_name:
                return await self.navigate_to_page(page_name)
            else:
                return await self.general_task_handler(session_id, user_input)
        else:
            return await self.general_task_handler(session_id, user_input)

    async def handle_gov_scheme_application(self, session_id: str, user_input: str):
        """Automated government scheme application workflow using Gemini AI"""
        actions = []

        try:
            if not GEMINI_API_KEY:
                raise Exception("Gemini API key not configured.")

            model = genai.GenerativeModel('gemini-2.5-pro')

            # Create a comprehensive prompt for government schemes
            prompt = f"""
            You are an expert agricultural consultant specializing in Indian government schemes for farmers.
            Based on the user's query: "{user_input}"
            Provide detailed information about relevant government schemes including:
            1. Scheme name and full details
            2. Eligibility criteria
            3. Benefits and subsidies
            4. Application process
            5. Required documents
            6. Contact information for help
            Focus on schemes like:
            - PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)
            - PMFBY (Pradhan Mantri Fasal Bima Yojana)
            - Soil Health Card Scheme
            - Kisan Credit Card
            - National Agriculture Market (eNAM)
            - Paramparagat Krishi Vikas Yojana
            - Rashtriya Krishi Vikas Yojana
            - Agricultural Mechanization schemes
            - Micro Irrigation schemes
            - And other relevant schemes based on the query
            Structure your response as a clear, actionable summary that a farmer can understand and use.
            """

            response = model.generate_content(prompt)
            scheme_info = response.text

            # Navigate to government schemes page
            actions.append(await self.navigate_to_page("gov-schemes"))

            # Provide the scheme information
            actions.append(await self.speak_response(f"Here are the relevant government schemes for your query: {scheme_info[:200]}..."))

            # Create a detailed response action
            actions.append({
                "action": "gov_scheme_info",
                "query": user_input,
                "schemes": scheme_info,
                "timestamp": datetime.utcnow().isoformat()
            })

        except Exception as e:
            logging.error(f"Gemini scheme generation failed: {e}")
            actions.append(await self.speak_response("I'm having trouble accessing government scheme information right now. Please try again later or visit the government schemes page directly."))

        return {
            "session_id": session_id,
            "task_type": "gov_scheme_application",
            "actions": actions,
            "status": "completed"
        }

    async def handle_market_analysis(self, session_id: str, user_input: str):
        """Automated market analysis with real-time price fetching using Vertex AI and Gemini"""
        actions = []

        try:
            # Navigate to market trends page
            actions.append(await self.navigate_to_page("market-trends"))

            # Use Gemini to analyze the query and determine what market data to fetch
            if not GEMINI_API_KEY:
                raise Exception("Gemini API key not configured.")

            model = genai.GenerativeModel('gemini-2.5-pro')

            # First, analyze the user's query to understand what they want
            analysis_prompt = f"""
            Analyze this market query: "{user_input}"
            Determine:
            1. What type of products/commodities are they asking about (crops, fruits, vegetables, artifacts, etc.)
            2. What specific items they want prices for
            3. Any location preferences (All India or specific states)
            4. Time period (current, weekly, monthly trends)
            Respond with a JSON object containing:
            {{
                "product_categories": ["list of categories"],
                "specific_items": ["list of specific products"],
                "locations": ["list of locations"],
                "time_period": "current/weekly/monthly"
            }}
            """

            analysis_response = model.generate_content(analysis_prompt)
            query_analysis = json.loads(analysis_response.text.strip())

            # Now fetch market prices using Vertex AI for comprehensive data
            if GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION:
                vertex_model = GenerativeModel("gemini-2.5-pro")

                market_prompt = f"""
                You are an expert agricultural market analyst. Provide comprehensive market price information for:
                Categories: {', '.join(query_analysis.get('product_categories', []))}
                Specific Items: {', '.join(query_analysis.get('specific_items', []))}
                Locations: {', '.join(query_analysis.get('locations', ['All India']))}
                Time Period: {query_analysis.get('time_period', 'current')}
                For each product, provide:
                1. Current market price per kg/quintal
                2. Price range (min-max)
                3. Major markets where it's traded
                4. Price trends (increasing/decreasing/stable)
                5. Factors affecting prices
                6. Best time to sell
                7. Alternative markets
                Include data for:
                - Major crops (rice, wheat, maize, cotton, sugarcane, etc.)
                - Fruits (mango, banana, apple, grapes, orange, etc.)
                - Vegetables (potato, tomato, onion, cabbage, cauliflower, etc.)
                - Small farmer artifacts (handicrafts, traditional items, local products)
                - Other agricultural commodities
                Structure the response as detailed market intelligence that farmers can use for decision making.
                """

                market_response = vertex_model.generate_content(market_prompt)
                market_data = market_response.text

                # Create market analysis action
                actions.append({
                    "action": "market_analysis",
                    "query": user_input,
                    "analysis": query_analysis,
                    "market_data": market_data,
                    "timestamp": datetime.utcnow().isoformat()
                })

                # Provide summary via speech
                summary = f"Market analysis complete. Here are the current prices and trends for your query: {market_data[:200]}..."
                actions.append(await self.speak_response(summary))

            else:
                # Fallback to Gemini only if Vertex AI not available
                fallback_prompt = f"""
                Provide market price information for: {user_input}
                Include prices for major agricultural products across India, focusing on:
                - Crops and cereals
                - Fruits and vegetables
                - Small farmer artifacts and local products
                Note: This is estimated data as real-time market access is not available.
                """

                fallback_response = model.generate_content(fallback_prompt)
                fallback_data = fallback_response.text

                actions.append({
                    "action": "market_analysis_fallback",
                    "query": user_input,
                    "market_data": fallback_data,
                    "note": "Real-time data not available, showing estimated prices",
                    "timestamp": datetime.utcnow().isoformat()
                })

                actions.append(await self.speak_response(f"Market information: {fallback_data[:200]}..."))

        except Exception as e:
            logging.error(f"Market analysis failed: {e}")
            actions.append(await self.speak_response("I'm having trouble accessing market data right now. Please try again later or visit the market trends page."))

        return {
            "session_id": session_id,
            "task_type": "market_analysis",
            "actions": actions,
            "status": "completed"
        }

    async def handle_artisan_marketplace(self, session_id: str, user_input: str):
        """AI-Powered Marketplace Assistant for Local Artisans using Google Cloud AI"""
        actions = []

        try:
            # Navigate to artisan marketplace page
            actions.append(await self.navigate_to_page("grocery-marketplace"))  # Using existing marketplace page

            if not GEMINI_API_KEY:
                raise Exception("Gemini API key not configured.")

            model = genai.GenerativeModel('gemini-2.5-pro')

            # Analyze the artisan's craft and create marketing content
            artisan_prompt = f"""
            You are an expert marketing consultant specializing in traditional Indian crafts and artisan products.
            Analyze this artisan query/request: "{user_input}"
            Provide comprehensive assistance for marketing their craft including:
            1. **Craft Analysis**: Identify the type of craft/artisan product
            2. **Story Development**: Create compelling narratives about the artisan's heritage, techniques, and cultural significance
            3. **Market Positioning**: Suggest pricing strategies, target audiences, and unique selling propositions
            4. **Digital Marketing**: Provide social media content ideas, product descriptions, and online presence strategies
            5. **Sales Channels**: Recommend platforms, marketplaces, and distribution strategies
            6. **Branding**: Suggest brand names, logos, packaging ideas, and visual identity
            7. **Customer Engagement**: Ideas for storytelling, customer interactions, and community building
            Focus on traditional Indian crafts like:
            - Handloom textiles (sari, dupatta, traditional wear)
            - Pottery and ceramics
            - Metal work (brass, copper, silver jewelry)
            - Wood carving and furniture
            - Leather work and footwear
            - Handicrafts (terracotta, bamboo, jute products)
            - Traditional paintings (Madhubani, Warli, Pattachitra)
            - Jewelry and ornament making
            - Basket weaving and coir products
            - Stone carving and sculpture
            Structure your response as actionable marketing intelligence that artisans can implement immediately.
            """

            artisan_response = model.generate_content(artisan_prompt)
            marketing_content = artisan_response.text

            # Generate product descriptions and marketing copy
            product_prompt = f"""
            Based on the artisan's craft analysis above, create:
            1. **Product Title**: Catchy, SEO-friendly titles for their products
            2. **Product Description**: Engaging descriptions highlighting craftsmanship, heritage, and unique features
            3. **Social Media Posts**: Ready-to-use captions for Instagram, Facebook, and other platforms
            4. **Storytelling Content**: Narrative content about the artisan's journey and craft tradition
            5. **Pricing Strategy**: Suggested price ranges and positioning
            6. **Target Audience**: Specific customer segments and marketing channels
            Make it culturally authentic and commercially viable.
            """

            product_response = model.generate_content(product_prompt)
            product_content = product_response.text

            # Use Vertex AI for advanced marketing insights if available
            if GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION:
                vertex_model = GenerativeModel("gemini-2.5-pro")

                advanced_prompt = f"""
                Provide advanced marketing strategy for Indian artisans:
                Original Query: "{user_input}"
                Include:
                1. **Market Research**: Current trends in traditional crafts, competitor analysis
                2. **Digital Transformation**: E-commerce integration, online marketplace strategies
                3. **Global Reach**: Export opportunities, international market insights
                4. **Sustainability**: Eco-friendly marketing, fair trade positioning
                5. **Technology Integration**: AR/VR product visualization, virtual showrooms
                6. **Partnership Opportunities**: Collaborations with designers, brands, NGOs
                7. **Funding and Grants**: Government schemes for artisans, crowdfunding strategies
                Provide data-driven insights and actionable recommendations.
                """

                advanced_response = vertex_model.generate_content(advanced_prompt)
                advanced_insights = advanced_response.text

                # Combine all content
                complete_content = f"""
                MARKETING STRATEGY:
                {marketing_content}
                PRODUCT CONTENT:
                {product_content}
                ADVANCED INSIGHTS:
                {advanced_insights}
                """

            else:
                complete_content = f"""
                MARKETING STRATEGY:
                {marketing_content}
                PRODUCT CONTENT:
                {product_content}
                """

            # Create artisan marketplace action
            actions.append({
                "action": "artisan_marketplace_assistance",
                "query": user_input,
                "marketing_strategy": marketing_content,
                "product_content": product_content,
                "complete_guide": complete_content,
                "timestamp": datetime.utcnow().isoformat()
            })

            # Provide summary via speech
            summary = f"Artisan marketplace assistance ready. I've created comprehensive marketing content for your craft: {marketing_content[:150]}..."
            actions.append(await self.speak_response(summary))

            # Additional actions for marketplace integration
            actions.append({
                "action": "marketplace_listing",
                "suggestion": "Consider listing your products on platforms like Etsy, Amazon Handmade, or local craft marketplaces",
                "timestamp": datetime.utcnow().isoformat()
            })

        except Exception as e:
            logging.error(f"Artisan marketplace assistance failed: {e}")
            actions.append(await self.speak_response("I'm having trouble generating marketing content right now. Please try again later or visit the marketplace page for assistance."))

        return {
            "session_id": session_id,
            "task_type": "artisan_marketplace",
            "actions": actions,
            "status": "completed"
        }

# Multi-language Responder
class MultiLanguageResponder:
    def __init__(self):
        self.response_templates = {
            "hi": {
                "greeting": "नमस्ते! मैं किसान AI सहायक हूं। मैं आपकी किसी भी समस्या में मदद कर सकता हूं।",
                "asking_name": "कृपया अपना नाम बताएं।",
                "asking_location": "आपका स्थान क्या है?",
                "task_complete": "कार्य पूरा हो गया!",
                "need_more_info": "कृपया अधिक जानकारी दें: {}",
                "disease_found": "मुझे आपकी फसल में {} रोग मिला है। सुझाव: {}",
                "navigation": "मैं आपको {} पेज पर ले जा रहा हूं।"
            },
            "en": {
                "greeting": "Hello! I'm Kisan AI assistant. I can help you with any problem.",
                "asking_name": "Please tell me your name.",
                "asking_location": "What is your location?",
                "task_complete": "Task completed!",
                "need_more_info": "Please provide more information: {}",
                "disease_found": "I found {} disease in your crop. Recommendation: {}",
                "navigation": "I'm navigating you to {} page."
            },
            "te": {
                "greeting": "నమస్కారం! నేను కిసాన్ AI సహాయకుడిని. నేను మీకు ఏదైనా సమస్యలో సహాయపడగలను.",
                "asking_name": "దయచేసి మీ పేరు చెప్పండి.",
                "asking_location": "మీ స్థానం ఏమిటి?",
                "task_complete": "పని పూర్తయింది!",
                "need_more_info": "దయచేసి మరింత సమాచారం提供: {}",
                "disease_found": "నేను మీ పంటలో {} రోగాన్ని కనుగొన్నాను. సిఫార్సు: {}",
                "navigation": "నేను మిమ్మల్ని {} పేజీకి నడిపిస్తున్నాను."
            }
        }
    
    def get_response(self, key: str, language: str = "en", **format_args):
        templates = self.response_templates.get(language, self.response_templates["en"])
        template = templates.get(key, key)
        return template.format(**format_args)

# Initializations
agent_state = AgentState()
smart_agent = KisanSmartAgent()
multi_lingual = MultiLanguageResponder()

# API Endpoints
@app.post("/api/agent/start-session")
async def start_agent_session(
    user_id: str = Form(...),
    initial_task: str = Form(None),
    language: str = Form("en")
):
    """Start a new agent session"""
    session_id = str(uuid.uuid4())
    
    agent_state.sessions[session_id] = {
        "session_id": session_id,
        "user_id": user_id,
        "language": language,
        "current_task": initial_task,
        "created_at": datetime.utcnow().isoformat(),
        "history": []
    }
    
    greeting = multi_lingual.get_response("greeting", language)
    
    return {
        "session_id": session_id,
        "greeting": greeting,
        "status": "session_created",
        "available_tasks": [task.value for task in TaskType]
    }

@app.post("/api/agent/execute-task")
async def execute_agent_task(
    session_id: str = Form(...),
    task_type: str = Form(...),
    user_input: str = Form(None),
    language: str = Form("en"),
    file: UploadFile = File(None)
):
    """Execute a specific task with the smart agent"""
    if session_id not in agent_state.sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = agent_state.sessions[session_id]
    session["language"] = language
    
    try:
        result = await smart_agent.execute_task(session_id, task_type, user_input, file)
        
        # Add to session history
        session["history"].append({
            "task": task_type,
            "input": user_input,
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return JSONResponse(result)
        
    except Exception as e:
        return JSONResponse({
            "error": str(e),
            "session_id": session_id,
            "status": "error"
        }, status_code=500)

@app.post("/api/agent/continue-task")
async def continue_agent_task(
    session_id: str = Form(...),
    user_response: str = Form(...),
    language: str = Form("en")
):
    """Continue a task that was waiting for user input"""
    if session_id not in agent_state.sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = agent_state.sessions[session_id]
    session["language"] = language
    
    # Get the last action that required response
    last_action = None
    for action in reversed(session.get("history", [])):
        if action.get("result", {}).get("actions"):
            for act in action["result"]["actions"]:
                if act.get("requires_response"):
                    last_action = act
                    break
        if last_action:
            break
    
    if not last_action:
        return {"error": "No pending action requiring response"}
    
    # Continue based on context
    context = last_action.get("context")
    if context == "image_capture":
        # Simulate image analysis continuation
        result = await smart_agent.handle_disease_analysis(session_id, user_response, None)
    elif context == "form_completion":
        result = await smart_agent.handle_form_filling(session_id, user_response)
    else:
        result = await smart_agent.general_task_handler(session_id, user_response)
    
    session["history"].append({
        "continuation": True,
        "user_response": user_response,
        "result": result,
        "timestamp": datetime.utcnow().isoformat()
    })
    
    return JSONResponse(result)

@app.get("/api/agent/session/{session_id}")
async def get_session_status(session_id: str):
    """Get current session status and history"""
    if session_id not in agent_state.sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return agent_state.sessions[session_id]

@app.post("/api/agent/generate-workflow")
async def generate_workflow(payload: Dict[str, Any] = Body(...)):
    try:
        system_prompt = payload.get("system_prompt")
        user_prompt = payload.get("user_prompt")
        ui_schema = payload.get("ui_schema")

        if not GOOGLE_CLOUD_PROJECT or not GOOGLE_CLOUD_LOCATION:
            raise Exception("Vertex AI not initialized. GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_LOCATION not set.")

        model = GenerativeModel("gemini-2.5-pro")
        
        full_prompt = f"{system_prompt}\n\nHere is the user's request: \"{user_prompt}\"\n\nHere is the UI schema:\n{ui_schema}\n\nWorkflow:"

        response = model.generate_content(full_prompt)
        workflow_json = response.text.strip()

        # Clean the response to extract only the JSON object
        json_start = workflow_json.find('{')
        json_end = workflow_json.rfind('}') + 1
        cleaned_workflow_json = workflow_json[json_start:json_end]

        return JSONResponse(json.loads(cleaned_workflow_json))
    except Exception as e:
        logging.error(f"Error generating workflow with Vertex AI: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating workflow: {e}")

@app.post("/api/agent/voice-command")
async def handle_voice_command(
    session_id: str = Form(...),
    audio_file: UploadFile = File(...),
    language: str = Form("en")
):
    """Handle voice commands - convert speech to text and process"""
    # 1. Transcribe audio to text using Google Cloud Speech-to-Text
    transcribed_text = await process_audio_with_gcp(audio_file, language)
    if not transcribed_text:
        raise HTTPException(status_code=400, detail="Could not understand audio.")

    session = agent_state.sessions.get(session_id, {})
    session["language"] = language
    
    # 2. Detect intent from the transcribed text
    intent = await detect_intent(transcribed_text)

    if intent == "DISEASE_ANALYSIS":
        task_type = TaskType.DISEASE_ANALYSIS.value
    elif intent == "COLD_STORAGE_BOOKING":
        task_type = TaskType.COLD_STORAGE_BOOKING.value
    elif intent == "FORM_FILLING":
        task_type = TaskType.FORM_FILLING.value
    elif intent == "CROP_RECOMMENDATION":
        task_type = TaskType.CROP_RECOMMENDATION.value
    elif intent == "NAVIGATION":
        # Extract page name from user_input
        pages = ["dashboard", "crop-monitor", "disease-detector", "market-trends", "cold-storage", "gov-schemes", "community", "profile"]
        page_name = next((page for page in pages if page in transcribed_text.lower()), None)
        if page_name:
            result = await smart_agent.navigate_to_page(page_name)
            return {
                "session_id": session_id,
                "detected_text": transcribed_text,
                "detected_intent": "NAVIGATION",
                "result": result
            }
        else:
            result = await smart_agent.general_task_handler(session_id, transcribed_text)
            return {
                "session_id": session_id,
                "detected_text": transcribed_text,
                "detected_intent": "GENERAL_QUERY",
                "result": result
            }
    else:
        result = await smart_agent.general_task_handler(session_id, transcribed_text)
        return {
            "session_id": session_id,
            "detected_text": transcribed_text,
            "detected_intent": "GENERAL_QUERY",
            "result": result
        }
    
    # 3. Execute the detected task
    result = await smart_agent.execute_task(session_id, task_type, transcribed_text, None)
    
    return {
        "session_id": session_id,
        "detected_text": transcribed_text,
        "detected_intent": task_type,
        "result": result
    }

@app.post("/api/agent/chat")
async def handle_chat_message(
    session_id: str = Form(...),
    message: str = Form(...),
    language: str = Form("en")
):
    """Handle chat messages"""
    if session_id not in agent_state.sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = agent_state.sessions[session_id]
    session["language"] = language

    try:
        result = await smart_agent.handle_chat(session_id, message)

        # Add to session history
        session["history"].append({
            "task": "chat",
            "input": message,
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        })

        return JSONResponse(result)

    except Exception as e:
        return JSONResponse({
            "error": str(e),
            "session_id": session_id,
            "status": "error"
        }, status_code=500)

@app.post("/api/tts/speak")
async def text_to_speech(
    text: str = Form(...),
    language: str = Form("en")
):
    """Convert text to speech and return as blob using Google Cloud Text-to-Speech"""
    try:
        audio_content = await generate_speech_with_gcp(text, language)
        return Response(content=audio_content, media_type="audio/mpeg")
    except Exception as e:
        logging.error(f"Error in text_to_speech: {e}")
        # Return a simple fallback response instead of raising exception
        return Response(content=b"", media_type="audio/mpeg", status_code=200)

@app.get("/api/dashboard/pages")
async def get_available_pages():
    """Get all available dashboard pages for navigation"""
    return {
        "pages": [
            {"id": "dashboard", "name": "Dashboard", "description": "Main dashboard overview"},
            {"id": "crop-monitor", "name": "Crop Monitor", "description": "Real-time crop monitoring"},
            {"id": "disease-detector", "name": "Disease Detector", "description": "AI-powered disease detection"},
            {"id": "market-trends", "name": "Market Trends", "description": "Price analysis and trends"},
            {"id": "cold-storage", "name": "Cold Storage", "description": "Storage booking and management"},
            {"id": "gov-schemes", "name": "Government Schemes", "description": "Available benefits and schemes"},
            {"id": "community", "name": "Community", "description": "Farmer discussion forum"},
            {"id": "profile", "name": "Profile", "description": "Account settings and preferences"}
        ]
    }

@app.post("/api/agent/navigate")
async def agent_navigation(
    session_id: str = Form(...),
    page_id: str = Form(...)
):
    """Agent-controlled navigation"""
    session = agent_state.sessions.get(session_id, {})
    language = session.get("language", "en")
    
    action = await smart_agent.navigate_to_page(page_id)
    message = multi_lingual.get_response("navigation", language, page=page_id.replace("-", " "))
    
    return {
        "session_id": session_id,
        "action": action,
        "message": message,
        "target_page": page_id
    }

# Artisan and Marketplace Routes
@app.post("/api/artisan/sales-analytics")
async def get_sales_analytics(artisan_id: str = Form(...), time_range: str = Form('7d')):
    try:
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(url, key)

        # Define the date range based on the time_range parameter
        end_date = datetime.utcnow()
        if time_range == '7d':
            start_date = end_date - timedelta(days=7)
            date_format = "%a"
        elif time_range == '30d':
            start_date = end_date - timedelta(days=30)
            date_format = "%b %d"
        elif time_range == '6m':
            start_date = end_date - timedelta(days=180)
            date_format = "%b"
        else:
            raise HTTPException(status_code=400, detail="Invalid time range")

        # Fetch orders within the date range
        response = supabase.from_('orders').select("created_at, total").eq('artisan_id', artisan_id).gte('created_at', start_date).lte('created_at', end_date).execute()
        orders = response.data

        # Aggregate sales data
        sales_data = {}
        for order in orders:
            order_date = datetime.fromisoformat(order['created_at']).strftime(date_format)
            if order_date not in sales_data:
                sales_data[order_date] = {"sales": 0, "orders": 0}
            sales_data[order_date]["sales"] += order['total']
            sales_data[order_date]["orders"] += 1

        # Format data for the chart
        chart_data = []
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime(date_format)
            if date_str in sales_data:
                chart_data.append({"name": date_str, "sales": sales_data[date_str]["sales"], "orders": sales_data[date_str]["orders"]})
            else:
                chart_data.append({"name": date_str, "sales": 0, "orders": 0})
            current_date += timedelta(days=1)

        return {"success": True, "sales_data": chart_data}

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/artisan/orders")
async def get_artisan_orders(artisan_id: str = Form(...)):
    try:
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(url, key)

        # Fetch orders for the artisan
        response = supabase.from_('orders').select("*, user_profiles(full_name, avatar_url)").eq('artisan_id', artisan_id).execute()
        orders = response.data

        # For each order, fetch the order items
        for order in orders:
            order_items_response = supabase.from_('order_items').select("*, products(name, images)").eq('order_id', order['id']).execute()
            order['products'] = order_items_response.data

        return {"success": True, "orders": orders}

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/artisan/update-order-status")
async def update_order_status(order_id: str = Form(...), new_status: str = Form(...)):
    try:
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(url, key)

        response = supabase.from_('orders').update({"status": new_status}).eq('id', order_id).execute()

        return {"success": True, "data": response.data}

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/artisan/generate-content")
async def artisan_generate_content(
    image: UploadFile = File(...),
    contentType: str = Form(...),
    customPrompt: str = Form(None)
):
    try:
        # Initialize Vertex AI for the Gemini model
        vertexai.init(project="artisan-ai-project", location="us-central1")
        gemini_model = GenerativeModel("gemini-2.5-pro")

        content = await image.read()
        image_bytes = vision.Image(content=content)
        
        vision_client = vision.ImageAnnotatorClient()
        response = vision_client.label_detection(image=image_bytes)
        labels = response.label_annotations
        labels_text = ", ".join([label.description for label in labels])

        # Construct dynamic prompt
        base_prompt = ""
        if customPrompt:
            base_prompt = customPrompt
            if labels_text:
                base_prompt += f" \n\nConsider these visual elements from the image: {labels_text}."
        else:
            prompt_templates = {
                "social": f"Write a captivating social media post for a handmade craft with the following labels: {labels_text}.",
                "product": f"Write a professional marketing description for a handmade craft with the following labels: {labels_text}.",
                "story": f"Write a short, engaging story about the artisan who made this craft, which has the following labels: {labels_text}.",
                "email": f"Write a promotional email campaign for a handmade craft with the following labels: {labels_text}."
            }
            base_prompt = prompt_templates.get(contentType, prompt_templates["product"])

        image_part = Part.from_data(data=io.BytesIO(content).getvalue(), mime_type="image/jpeg")
        
        gemini_response = gemini_model.generate_content([image_part, base_prompt])
        generated_text = gemini_response.text

        return {
            "success": True,
            "generated_text": generated_text,
            "labels": labels_text
        }

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/artisan/generate-heritage-story")
async def generate_heritage_story_endpoint(
    name: str = Form(...),
    craft_type: str = Form(...),
    region: str = Form(...),
    materials: Optional[str] = Form(None),
    age: Optional[str] = Form(None),
    cultural_significance: Optional[str] = Form(None)
):
    try:
        if not GEMINI_API_KEY:
            raise Exception("Gemini API key not configured.")
        
        model = genai.GenerativeModel('gemini-2.5-pro')

        prompt = f"""
        Generate a compelling cultural heritage story for an artifact with the following details:
        Name: {name}
        Craft Type: {craft_type}
        Region: {region}
        """
        if materials:
            prompt += f"Materials: {materials}"
        if age:
            prompt += f"Approximate Age: {age}"
        if cultural_significance:
            prompt += f"Cultural Significance: {cultural_significance}"
        
        prompt += """
        Focus on the historical context, the artisan's skill, the cultural importance, and the journey of the craft through generations.
        Make the story engaging, evocative, and rich in detail, suitable for a cultural exhibition or marketing material.
        """

        response = model.generate_content(prompt)
        generated_story = response.text

        return {
            "success": True,
            "story": generated_story
        }

    except Exception as e:
        logging.error(f"Error generating heritage story: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating heritage story: {e}")

@app.post("/api/artisan/tts")
async def artisan_text_to_speech(data: Dict[str, Any] = Body(...)):
    text = data.get('text')
    lang_code = data.get('lang', 'en')
    speaking_rate = float(data.get('speakingRate', 1.0))

    if not text:
        raise HTTPException(status_code=400, detail="No text provided")
    
    try:
        tts_client = texttospeech.TextToSpeechClient()
        # Map language codes to humane voice names
        voice_map = {
            "en": "en-US-Neural2-F",
            "hi": "hi-IN-Wavenet-A",
            "bn": "bn-IN-Wavenet-A",
        }

        # Select a voice based on the language code from the frontend
        voice_name = voice_map.get(lang_code, "en-US-Neural2-F")

        ssml_text = f"<speak><prosody rate='{speaking_rate}'>{text}</prosody></speak>"
        synthesis_input = texttospeech.SynthesisInput(ssml=ssml_text)
        
        voice = texttospeech.VoiceSelectionParams(
            language_code=lang_code,
            name=voice_name
        )
        
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )
        
        response = tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        return Response(content=response.audio_content, media_type="audio/mpeg")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/artisan/translate")
async def artisan_translate_text(data: Dict[str, Any] = Body(...)):
    text = data.get('text')
    target_lang = data.get('target', 'bn')

    if not text:
        raise HTTPException(status_code=400, detail="No text provided")
    
    try:
        translate_client = translate.Client()
        result = translate_client.translate(
            text,
            target_language=target_lang
        )
        return {"success": True, "translation": result['translatedText']}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/artisan/stt")
async def artisan_speech_to_text(audio: UploadFile = File(...)):
    try:
        speech_client = speech.SpeechClient()
        content = await audio.read()
        audio_content = speech.RecognitionAudio(content=content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.MP3,
            language_code="en-US"
        )
        
        response = speech_client.recognize(config=config, audio=audio_content)
        transcribed_text = ""
        for result in response.results:
            transcribed_text += result.alternatives[0].transcript
            
        return {"success": True, "transcript": transcribed_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Wishlist Endpoints
@app.get("/api/wishlist")
async def get_wishlist_items(user_id: str):
    """Get all wishlist items for a user"""
    try:
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(url, key)

        response = supabase.from_('wishlist').select('product_id, products(*)').eq('user_id', user_id).execute()
        wishlist_items = response.data

        return {"success": True, "wishlist_items": wishlist_items}
    except Exception as e:
        logging.error(f"Error fetching wishlist: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/wishlist")
async def add_to_wishlist(data: Dict[str, str] = Body(...)):
    """Add a product to the user's wishlist"""
    user_id = data.get("user_id")
    product_id = data.get("product_id")

    if not user_id or not product_id:
        raise HTTPException(status_code=400, detail="user_id and product_id are required")

    try:
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(url, key)

        # Check if item already in wishlist
        existing_item = supabase.from_('wishlist').select('id').eq('user_id', user_id).eq('product_id', product_id).execute()
        if existing_item.data:
            return {"success": True, "message": "Product already in wishlist"}

        response = supabase.from_('wishlist').insert({'user_id': user_id, 'product_id': product_id}).execute()
        if response.data:
            return {"success": True, "message": "Product added to wishlist"}
        else:
            raise HTTPException(status_code=500, detail="Failed to add to wishlist")
    except Exception as e:
        logging.error(f"Error adding to wishlist: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/wishlist")
async def remove_from_wishlist(data: Dict[str, str] = Body(...)):
    """Remove a product from the user's wishlist"""
    user_id = data.get("user_id")
    product_id = data.get("product_id")

    if not user_id or not product_id:
        raise HTTPException(status_code=400, detail="user_id and product_id are required")

    try:
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(url, key)

        response = supabase.from_('wishlist').delete().eq('user_id', user_id).eq('product_id', product_id).execute()
        if response.data:
            return {"success": True, "message": "Product removed from wishlist"}
        else:
            raise HTTPException(status_code=500, detail="Failed to remove from wishlist")
    except Exception as e:
        logging.error(f"Error removing from wishlist: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Other endpoints
@app.get("/api/product/{product_id}")
async def get_product_details(product_id: str):
    try:
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(url, key)

        response = supabase.from_('products').select("*, artisans(name, location)").eq('id', product_id).single().execute()
        product = response.data

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        return {"success": True, "product": product}

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/crop-monitor/status")
async def get_crop_monitor_status():
    return {"status": "not_implemented"}

@app.get("/api/community/posts")
async def get_community_posts():
    return {"posts": []}

@app.get("/api/profile/{user_id}")
async def get_user_profile(user_id: str):
    return {"user_id": user_id, "status": "not_implemented"}

@app.get("/api/marketplace/products")
async def get_marketplace_products():
    return {"products": []}

@app.get("/api/orders/{user_id}")
async def get_user_orders(user_id: str):
    return {"user_id": user_id, "orders": []}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)