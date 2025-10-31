---
title: Rural Smart Kisan
emoji: 🌾
colorFrom: green
colorTo: yellow
sdk: docker
pinned: false
---
# 🌾 Rural Smart Kisan

AI-Powered Agricultural Assistant for Indian Farmers using Google Cloud Platform.

## Features

- 🖼️ Image Analysis with Google Vision AI
- 🎤 Speech-to-Text for voice queries  
- 🤖 Smart Responses with Gemini AI
- 🌐 Multi-language Support (Hindi, English, Telugu, etc.)
- 💾 Query History Storage
- 🌦️ Weather & Market Insights

## Tech Stack
- **Backend**: FastAPI
- **AI Services**: Google Cloud Platform (Vision, Speech-to-Text, Gemini)
- **Deployment**: Hugging Face Spaces
- **Containerization**: Docker

## Local Development Setup

For local development, the easiest way to authenticate with GCP is to place your downloaded service account JSON key file in this directory (`public/huggingface_app`) and rename it to `service-account-key.json`.

The application will automatically detect and use this file. **This file is already in `.gitignore` and will not be committed.**

## Hugging Face Deployment Setup

This application uses a GCP Service Account for authentication. Follow these steps carefully to configure it for deployment on Hugging Face Spaces.

### 1. Create a Service Account in GCP
- Go to **IAM & Admin → Service Accounts** in your GCP Console.
- Click **CREATE SERVICE ACCOUNT**.
- Give it a name (e.g., `rural-kisan-ai`).
- Grant the following roles:
  - `Vertex AI User`
  - `Cloud Vision API User`
  - `Cloud Translation API User`
  - `Cloud Speech-to-Text API User`
  - `Cloud Datastore User` (for Firestore)
- Click **Done**.

### 2. Generate a JSON Key
- Find the service account you just created.
- Click on the three-dots menu under **Actions** and select **Manage keys**.
- Click **ADD KEY → Create new key**.
- Select **JSON** as the key type and click **CREATE**. A JSON file will be downloaded.

### 3. Base64 Encode the Key
- You must encode the **entire content** of the downloaded JSON file into a **single-line** base64 string.

- **On Linux or macOS:**
  ```bash
  cat your-key-file.json | base64 | tr -d '\n'
  ```
  *(Replace `your-key-file.json` with the actual filename.)*

- **On Windows (PowerShell):**
  ```powershell
  $json = Get-Content -Path "your-key-file.json" -Raw; [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($json))
  ```
  *(Replace `your-key-file.json` with the actual filename.)*

### 4. Add Secrets to Hugging Face Spaces
- In your Hugging Face Space, go to the **Settings** tab.
- Scroll down to **Repository secrets**.
- Add the following secrets:
  - `GCP_PROJECT_ID`: Your Google Cloud Project ID.
  - `GCP_LOCATION`: The GCP region for your services (e.g., `us-central1`).
  - `GCP_SERVICE_ACCOUNT_KEY_B64`: The **single-line base64 encoded string** you generated in the previous step.

### 🚨 Troubleshooting
- **Error:** `Failed to load GCP Service Account credentials: 'utf-8' codec can't decode byte...`
- **Meaning:** This means the `GCP_SERVICE_ACCOUNT_KEY_B64` secret is **not a valid base64 string**. You likely pasted the raw JSON content or a corrupted key.
- **Solution:** Carefully repeat **Step 3** to re-encode your key file and update the secret in your Hugging Face settings.

## API Usage

### Process Agricultural Input

```bash
curl -X POST "https://your-space.hf.space/api/process" \
  -F "text=मेरी फसल में कीट लग गए हैं" \
  -F "language=hi" \
  -F "farmer_id=farmer_001" \
  -F "location=Uttar Pradesh"