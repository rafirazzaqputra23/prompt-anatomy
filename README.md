# Prompt Anatomy

Mengubah prompt singkat menjadi Master Prompt dengan struktur:
Role, Task, Context, Reasoning, Stop Conditions, Output.

## Local
Node.js 20+ diperlukan.

```bash
npm install
cp .env.example .env
# isi AI_API_KEY di .env
npm start
```

Buka http://localhost:3000

## Deploy
Deploy sebagai Web Service. Set environment variable:
- AI_API_KEY
- AI_MODEL
- AI_API_URL

Jangan commit file .env atau API key.
