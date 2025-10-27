# In-App Purchase Integration Guide

This guide explains how to integrate Apple In-App Purchases (IAP) with ReadBack.

## Development Mode (Current Setup)

**The app currently works WITHOUT the Apple shared secret key.** This allows you to:
- Test the subscription upgrade flow
- Develop and preview the app
- Build the UI and user experience

The upgrade button will directly update the database without Apple receipt verification.

## When You're Ready for Production

You'll need to add Apple IAP integration when:
1. You have an Apple Developer account
2. You've created the app in App Store Connect
3. You have the `APPLE_SHARED_SECRET` key

## Overview

ReadBack uses a subscription model:
- **Product ID:** `com.readback.premium`
- **Type:** Auto-renewable subscription
- **Price:** $10.99/month
- **Duration:** 1 month

## Setup in App Store Connect

### 1. Create IAP Product

1. Go to App Store Connect
2. Select your app
3. Navigate to "Features" → "In-App Purchases"
4. Click "+" to create new subscription
5. Fill in details:
   - Reference Name: ReadBack Premium
   - Product ID: `com.readback.premium`
   - Subscription Group: Create new group "ReadBack Subscriptions"
   - Subscription Duration: 1 month
   - Price: $10.99 USD

### 2. Add Subscription Details

- **Display Name:** Premium Subscription
- **Description:** Unlock unlimited sections and premium voices
- **Review Screenshot:** Upload screenshot showing premium features

### 3. Configure Subscription Group

- Group Name: ReadBack Subscriptions
- Add localized descriptions for different regions

## iOS Implementation

### Option 1: Using Capacitor Purchases Plugin (Recommended)

1. Install the plugin:
\`\`\`bash
npm install @capacitor-community/purchases
npx cap sync
\`\`\`

2. Add to your iOS code:

\`\`\`typescript
// lib/iap.ts
import { Purchases } from '@capacitor-community/purchases'

export async function initializeIAP() {
  await Purchases.configure({
    apiKey: 'your_revenuecat_api_key' // Optional: Use RevenueCat
  })
}

export async function purchasePremium() {
  try {
    const result = await Purchases.purchasePackage({
      identifier: 'com.readback.premium'
    })
    
    // Verify purchase on backend
    await fetch('/api/subscription/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: result.transaction.transactionIdentifier,
        receipt: result.transaction.transactionReceipt
      })
    })
    
    return result
  } catch (error) {
    console.error('Purchase failed:', error)
    throw error
  }
}

export async function restorePurchases() {
  const result = await Purchases.restorePurchases()
  return result
}
\`\`\`

3. Update the settings page:

\`\`\`typescript
// In components/settings-content.tsx
import { purchasePremium } from '@/lib/iap'

const handleUpgrade = async () => {
  setIsUpgrading(true)
  try {
    await purchasePremium()
    alert('Successfully upgraded to Premium!')
    router.refresh() // Refresh to show new status
  } catch (error) {
    alert('Purchase failed. Please try again.')
  } finally {
    setIsUpgrading(false)
  }
}
\`\`\`

### Option 2: Native StoreKit

1. Add StoreKit capability in Xcode
2. Create Swift bridge for IAP handling
3. Implement purchase flow in native code

## Backend Verification

Update the API route to verify receipts:

\`\`\`typescript
// app/api/subscription/upgrade/route.ts
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { transactionId, receipt } = await request.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify receipt with Apple
    const verificationResult = await verifyAppleReceipt(receipt)
    
    if (!verificationResult.valid) {
      return NextResponse.json({ error: "Invalid receipt" }, { status: 400 })
    }

    // Update subscription in database
    const { error } = await supabase.rpc("upgrade_to_premium", {
      user_id_param: user.id,
    })

    if (error) {
      return NextResponse.json({ error: "Failed to upgrade" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

async function verifyAppleReceipt(receipt: string) {
  // Use Apple's receipt verification API
  const response = await fetch('https://buy.itunes.apple.com/verifyReceipt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'receipt-data': receipt,
      'password': process.env.APPLE_SHARED_SECRET // From App Store Connect
    })
  })
  
  const data = await response.json()
  return { valid: data.status === 0 }
}
\`\`\`

## Testing IAP

### Sandbox Testing

1. Create sandbox tester account in App Store Connect
2. Sign out of App Store on device
3. Run app and attempt purchase
4. Sign in with sandbox account when prompted
5. Complete test purchase (no charge)

### Test Scenarios

- ✅ New subscription purchase
- ✅ Subscription renewal
- ✅ Restore purchases
- ✅ Subscription cancellation
- ✅ Failed payment
- ✅ Refund handling

## Webhook Setup (Optional)

For server-side subscription status updates:

1. Set up webhook endpoint: `/api/webhooks/apple`
2. Configure in App Store Connect
3. Handle subscription events:
   - INITIAL_BUY
   - RENEWAL
   - CANCEL
   - REFUND

## Environment Variables

### Development (Current)
No additional environment variables needed! The app works out of the box.

### Production (When Ready)
Add to your project:

\`\`\`env
APPLE_SHARED_SECRET=your_shared_secret_from_app_store_connect
\`\`\`

## Subscription Management

Users can manage subscriptions via:
- iOS Settings → Apple ID → Subscriptions
- App Store → Account → Subscriptions

## Common Issues

### "Cannot connect to iTunes Store"
- Check sandbox account is signed in
- Verify product ID matches exactly
- Ensure IAP is configured in App Store Connect

### "This In-App Purchase has already been bought"
- Use "Restore Purchases" functionality
- Clear sandbox tester purchase history

### Receipt verification fails
- Check APPLE_SHARED_SECRET is correct
- Use sandbox URL for testing: `https://sandbox.itunes.apple.com/verifyReceipt`
- Use production URL for live: `https://buy.itunes.apple.com/verifyReceipt`

## Resources

- [Apple IAP Documentation](https://developer.apple.com/in-app-purchase/)
- [StoreKit Documentation](https://developer.apple.com/documentation/storekit)
- [RevenueCat](https://www.revenuecat.com/) - Simplified IAP management
- [App Store Connect](https://appstoreconnect.apple.com/)
