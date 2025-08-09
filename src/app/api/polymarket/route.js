// Next.js API route to proxy Polymarket API requests and avoid CORS issues

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tokenIds = searchParams.get('clob_token_ids');
  
  if (!tokenIds) {
    return Response.json({ error: 'Missing clob_token_ids parameter' }, { status: 400 });
  }

  // Split token IDs and limit batch size to prevent extremely long URLs
  const tokenIdArray = tokenIds.split(',');
  const maxBatchSize = 5; // Reduced from 10 to keep URLs manageable
  
  if (tokenIdArray.length > maxBatchSize) {
    return Response.json({ 
      error: `Too many token IDs. Maximum ${maxBatchSize} allowed per request.` 
    }, { status: 400 });
  }

  try {
    const polymarketUrl = `https://gamma-api.polymarket.com/markets?clob_token_ids=${tokenIds}`;
    
    const response = await fetch(polymarketUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return Response.json(
        { error: `Polymarket API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return Response.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('Error fetching from Polymarket API:', error);
    return Response.json(
      { error: 'Failed to fetch from Polymarket API' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
