# ReadBack - TTS Notepad App

A mobile text-to-speech notepad application built with Next.js, Supabase, and Capacitor.

## Features

- **Text-to-Speech:** Convert any text to natural-sounding audio using OpenAI TTS
- **Unlimited Text Length:** No character limits per section
- **Multiple Voices:** 4 free voices + 2 premium voices
- **Section Management:** Organize and save your text sections
- **Subscription Tiers:** Free (10 sections) and Premium (unlimited)
- **Audio Caching:** Efficient audio storage to minimize API costs
- **Admin Dashboard:** Monitor users, subscriptions, and usage metrics

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Server Actions
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **TTS:** OpenAI Text-to-Speech API
- **Storage:** Vercel Blob
- **Mobile:** Capacitor (iOS)
- **Payments:** Apple In-App Purchases

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key
- Vercel account (for deployment)

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables (see Environment Variables section)

4. Run database migrations:
   - Execute SQL scripts in the `scripts/` folder in order
   - Scripts are numbered: 001, 002, 003, 004

5. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Required environment variables (automatically provided by Supabase integration):
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Additional required variables:
- `OPENAI_API_KEY` - Your OpenAI API key for TTS
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token

### Development Mode

**The app works without Apple IAP integration during development!**

- Subscription upgrades work directly without Apple receipt verification
- No `APPLE_SHARED_SECRET` required for testing
- Click "Upgrade Now" in Settings to test premium features
- Perfect for development and preview before App Store submission

When ready for production, follow the IAP Integration Guide to add Apple receipt verification.

## Database Schema

### Tables

1. **profiles** - User profile information
2. **sections** - Text sections created by users
3. **audio_cache** - Cached TTS audio files
4. **subscriptions** - User subscription status
5. **admin_users** - Admin access control

See `scripts/001_create_tables.sql` for full schema.

## Building for iOS

### 1. Build the Next.js app

\`\`\`bash
npm run build
\`\`\`

### 2. Add iOS platform

\`\`\`bash
npx cap add ios
\`\`\`

### 3. Sync web assets

\`\`\`bash
npx cap sync
\`\`\`

### 4. Open in Xcode

\`\`\`bash
npx cap open ios
\`\`\`

### 5. Configure in Xcode

- Set your Team and Bundle Identifier
- Configure App Icon (1024x1024 PNG)
- Add In-App Purchase capability
- Configure signing certificates

### 6. Set up In-App Purchases

1. Create IAP in App Store Connect:
   - Type: Auto-renewable subscription
   - Product ID: `com.readback.premium`
   - Price: $10.99/month

2. Implement IAP in iOS:
   - Use Capacitor Purchases plugin or native StoreKit
   - Verify receipts server-side
   - Update subscription status in database

## Admin Access

To grant admin access:

1. Run the admin role script: `scripts/004_create_admin_role.sql`
2. Insert user ID into `admin_users` table:
   \`\`\`sql
   INSERT INTO admin_users (id) VALUES ('user-uuid-here');
   \`\`\`
3. Access admin dashboard at `/admin`

## App Store Submission

### Required Assets

1. **App Icon:** 1024x1024 PNG (see `APP_STORE_METADATA.md`)
2. **Screenshots:** Multiple device sizes (see metadata file)
3. **Privacy Policy:** Use `PRIVACY_POLICY.md` or host at your domain
4. **App Metadata:** Complete information in `APP_STORE_METADATA.md`

### Submission Steps

1. Build and archive in Xcode
2. Upload to App Store Connect
3. Complete app information and metadata
4. Add screenshots and preview video
5. Set up In-App Purchase
6. Submit for review

### Review Notes

**Before App Store submission:**
- Add Apple IAP integration (see `IAP_INTEGRATION_GUIDE.md`)
- Set `APPLE_SHARED_SECRET` environment variable
- Test with Apple sandbox account

Provide test account credentials:
- Email: reviewer@readback.app
- Password: AppleReview2024!

## API Routes

- `POST /api/tts` - Generate text-to-speech audio
- `POST /api/subscription/upgrade` - Upgrade to premium (IAP webhook)

## Subscription Logic

- **Free Tier:** 10 sections max, 4 standard voices
- **Premium Tier:** Unlimited sections, 6 voices (4 standard + 2 premium)
- Subscription status checked on section creation and voice selection
- Audio cache reduces TTS API costs

## Cost Optimization

- Audio files cached in Vercel Blob
- Cache checked before generating new audio
- Same text + voice = reuse cached audio
- 30-day cache retention

## Support

For issues or questions:
- Email: support@readback.app
- Documentation: https://readback.app/docs

## License

Proprietary - All rights reserved

## Version

1.0.0 - Initial Release
