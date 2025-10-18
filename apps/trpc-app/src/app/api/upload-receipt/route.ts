import { NextRequest, NextResponse } from 'next/server';
import { uploadReceiptToCloudinary } from '~/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('receipt') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    console.log('[Upload] Uploading receipt:', file.name, `(${Math.round(file.size / 1024)}KB)`);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const receiptUrl = await uploadReceiptToCloudinary(buffer, file.name);

    console.log('[Upload] Receipt uploaded successfully:', receiptUrl);

    return NextResponse.json({ 
      success: true, 
      receiptUrl 
    });
  } catch (error) {
    console.error('[Upload] Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
