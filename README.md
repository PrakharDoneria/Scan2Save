# Scan2Save

Scan2Save is a life-saving medical ID application that turns standard school or workplace ID cards into instant first-responder lifesavers. 

## Features
- **Smart ID Generation**: Generate printable medical ID cards with a unique QR code.
- **AI Prescription Auto-fill**: Upload an old prescription (PDF/Image) and our Sarvam Vision AI integration automatically extracts your blood group, allergies, medical conditions, and habits!
- **Bulk Registration**: Faculty can download a CSV template and bulk upload hundreds of student records instantly.
- **AI First-Aid Assistant**: First responders can scan the QR code and use the real-time voice AI (powered by Sarvam Speech-to-Text and Text-to-Speech) to report the patient's condition and receive instant voice-guided first aid instructions.
- **Live Search**: Instantly look up emergency profiles by name or ID.

## Tech Stack
- **Frontend**: Next.js 15, React, Tailwind CSS, Lucide Icons
- **Backend/Database**: Supabase (PostgreSQL with JSONB)
- **AI Integrations**: Sarvam AI (Vision for OCR, Realtime Speech-to-Text WebSocket, Text-to-Speech, and `sarvam-105b` LLM)

## Getting Started

1. **Clone and Install**
   ```bash
   git clone <repo_url>
   cd scan2save
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   SARVAM_API_KEY=your_sarvam_api_key
   NEXT_PUBLIC_SARVAM_API_KEY=your_sarvam_api_key
   SARVAM_API_BASE_URL=https://api.sarvam.ai
   ```

3. **Database Setup**
   The application uses Supabase. Run the provided SQL schema in `supabase/schema.sql` on your Supabase project to create the necessary `profiles` table.

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
