import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Base URL from env, API path configured in code
const AI_API_BASE_URL = process.env.TRY_ON_API_URL || 'http://localhost:8000';
const AI_API_SECRET_KEY = process.env.TRY_ON_API_SECRET_KEY || '';
const EXTERNAL_API_URL = `${AI_API_BASE_URL}/api/v1/tryon`;

// Log configuration on startup
console.log('🔧 [TRIAL API] Configuration:', {
  apiUrl: AI_API_BASE_URL,
  hasSecretKey: !!AI_API_SECRET_KEY,
  fullEndpoint: EXTERNAL_API_URL
});

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const userEmail = user.email;
    const hasPremium = user.hasPremium || false;
    const aiEnabled = user.aiEnabled || false;
    const body = await request.json();
    
    console.log('📥 [TRIAL API] Received request body:', JSON.stringify(body, null, 2));
    
    const { person_image, garment_images, collection } = body;

    // Validate user email
    if (!userEmail) {
      console.error('❌ [TRIAL API] User email not found in database');
      return NextResponse.json(
        { error: 'User email not found. Please update your profile with an email address.' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!person_image) {
      console.error('❌ [TRIAL API] Missing person_image');
      return NextResponse.json(
        { error: 'person_image is required' },
        { status: 400 }
      );
    }

    console.log('👕 [TRIAL API] Garment images received:', garment_images);
    console.log('👕 [TRIAL API] Garment images type:', typeof garment_images);
    console.log('👕 [TRIAL API] Garment images keys:', garment_images ? Object.keys(garment_images) : 'null/undefined');
    console.log('👕 [TRIAL API] Garment images count:', garment_images ? Object.keys(garment_images).length : 0);

    if (!garment_images || Object.keys(garment_images).length === 0) {
      console.error('❌ [TRIAL API] garment_images is empty or missing');
      return NextResponse.json(
        { error: 'garment_images is required and must not be empty' },
        { status: 400 }
      );
    }

    // Determine subscription type: "premium" if hasPremium, otherwise "trial" if aiEnabled
    const subscription_type = hasPremium ? 'premium' : (aiEnabled ? 'trial' : 'trial');
    
    // Prepare request body for external API
    const requestBody = {
      user_id: userId,
      email: userEmail,
      garment_images: garment_images,
      person_image: person_image,
      subscription_type: subscription_type,
      collection: collection || null, // Collection name from request body
    };

    // Prepare headers with Bearer token if available
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (AI_API_SECRET_KEY) {
      headers['Authorization'] = `Bearer ${AI_API_SECRET_KEY}`;
    }

    // Log the complete request details before making the API call
    console.log('🚀 [TRIAL API] ========== BACKEND REQUEST ==========');
    console.log('📍 [TRIAL API] URL:', EXTERNAL_API_URL);
    console.log('🔧 [TRIAL API] Method: POST');
    console.log('🔑 [TRIAL API] Headers:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': AI_API_SECRET_KEY ? 'Bearer ***' : 'Not set',
    });
    console.log('👤 [TRIAL API] User ID:', userId);
    console.log('💳 [TRIAL API] Subscription Type:', subscription_type);
    console.log('📁 [TRIAL API] Collection:', collection || 'Not provided');
    console.log('👕 [TRIAL API] Garment Count:', Object.keys(garment_images).length);
    console.log('📤 [TRIAL API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🚀 [TRIAL API] =====================================');

    // Make POST request to external API
    let externalResponse;
    try {
      externalResponse = await fetch(EXTERNAL_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });
    } catch (fetchError) {
      console.error('❌ [TRIAL API] Network error connecting to external API:', fetchError);
      return NextResponse.json(
        {
          error: 'Unable to connect to the AI service. Please ensure the TRY_ON_API_URL is configured correctly and the service is running.',
          details: fetchError instanceof Error ? fetchError.message : 'Network error'
        },
        { status: 503 }
      );
    }

    if (!externalResponse.ok) {
      let errorText;
      try {
        errorText = await externalResponse.text();
      } catch (parseError) {
        errorText = 'Unable to parse error response';
      }

      console.error('❌ [TRIAL API] External API error:', {
        status: externalResponse.status,
        statusText: externalResponse.statusText,
        error: errorText,
      });

      return NextResponse.json(
        {
          error: `AI service error: ${externalResponse.statusText || 'Unknown error'}`,
          details: errorText
        },
        { status: externalResponse.status }
      );
    }

    const result = await externalResponse.json();
    console.log('✅ [TRIAL API] External API response received');

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('❌ [TRIAL API] Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process trial request' 
      },
      { status: 500 }
    );
  }
}

