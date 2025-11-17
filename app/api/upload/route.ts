import { NextRequest, NextResponse } from 'next/server';
import cloudinary, { CloudinaryUploadResult } from '@/lib/cloudinary';

const ADMIN_SESSION_COOKIE = 'admin-session';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication by reading cookie from request
    // In API routes, we need to read cookies from the request object
    const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE);
    const isAdmin = adminSession?.value === 'authenticated';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

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

    // Upload to Cloudinary
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload(
        base64File,
        {
          folder: 'ecommerce-products',
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
    console.error('Upload error:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Handle Cloudinary errors
    if (error instanceof Error && error.message.includes('Cloudinary')) {
      return NextResponse.json(
        { error: 'Failed to upload to Cloudinary. Please check your configuration.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    );
  }
}
