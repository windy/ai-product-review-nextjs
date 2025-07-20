import { NextRequest, NextResponse } from 'next/server';

// GET /api/image-proxy?url=<encoded_image_url>
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(imageUrl);

    // Validate URL format
    let url: URL;
    try {
      url = new URL(decodedUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Security checks
    if (url.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Only HTTPS URLs are allowed' },
        { status: 400 }
      );
    }

    // Block potentially dangerous domains
    const blockedDomains = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '10.',
      '172.',
      '192.168.',
    ];

    const hostname = url.hostname.toLowerCase();
    if (blockedDomains.some(blocked => hostname.includes(blocked))) {
      return NextResponse.json(
        { error: 'Access to this domain is not allowed' },
        { status: 403 }
      );
    }

    // Fetch the image
    const imageResponse = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'AI-Review-Hub-Image-Proxy/1.0',
      },
    });

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: imageResponse.status }
      );
    }

    // Check content type
    const contentType = imageResponse.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      return NextResponse.json(
        { error: 'URL does not point to an image' },
        { status: 400 }
      );
    }

    // Check file size (limit to 10MB)
    const contentLength = imageResponse.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image too large (max 10MB)' },
        { status: 413 }
      );
    }

    // Get image data
    const imageBuffer = await imageResponse.arrayBuffer();

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error in image proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}