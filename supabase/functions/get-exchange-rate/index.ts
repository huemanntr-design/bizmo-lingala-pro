const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use exchangerate-api.com free endpoint for USD to CDF
    const response = await fetch(
      'https://open.er-api.com/v6/latest/USD'
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const rate = data.rates?.CDF;

    if (!rate) {
      throw new Error('CDF rate not found');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        rate: Math.round(rate), 
        source: 'open.er-api.com',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Exchange rate error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        rate: 2800, // fallback
        source: 'fallback'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
