// Example: Supabase Edge Function
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://hitch-events.netlify.app/',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface RequestPayload {
  name: string;
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Get the request payload
    const { name }: RequestPayload = await req.json();

    // Process the request
    const data = {
      message: `Hello ${name}!`,
      timestamp: new Date().toISOString(),
    };

    // Return the response with CORS headers
    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  } catch (error) {
    // Handle errors
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  }
});