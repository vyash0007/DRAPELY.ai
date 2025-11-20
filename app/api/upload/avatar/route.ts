import { NextRequest, NextResponse } from 'next/server';
import cloudinary, { CloudinaryUploadResult } from '@/lib/cloudinary';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get current user (optional - can work without auth too)
    const user = await getCurrentUser();
    const userId = user?.id || 'anonymous';

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userName = formData.get('userName') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Build public_id with user ID and optional user name
    // Format: avatar/{userId} or avatar/{userId}_{userName}
    const sanitizedName = userName 
      ? userName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 20)
      : '';
    const publicId = sanitizedName 
      ? `${userId}_${sanitizedName}`
      : userId;

    // Upload to Cloudinary under avatar folder
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload(
        base64File,
        {
          folder: 'avatar',
          public_id: publicId,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      );
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    
    // Handle Cloudinary errors
    if (error instanceof Error && error.message.includes('Cloudinary')) {
      return NextResponse.json(
        { error: 'Failed to upload to Cloudinary. Please check your configuration.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}


