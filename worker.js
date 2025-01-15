export default {
  async fetch(request, env, ctx) {
    // Parse the URL and query parameters
    const url = new URL(request.url);
    const params = url.searchParams;

    // Construct the Railway server URL
    const railwayUrl = new URL(
      "https://gifge-production.up.railway.app/generate-countdown"
    );

    // Forward all query parameters
    for (const [key, value] of params) {
      railwayUrl.searchParams.append(key, value);
    }

    try {
      // Fetch from Railway server
      const response = await fetch(railwayUrl.toString());

      if (!response.ok) {
        throw new Error(`Railway server responded with ${response.status}`);
      }

      // Create new response with appropriate headers
      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-store",
          "Content-Disposition": 'inline; filename="countdown.gif"',
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(`Error: ${error.message}`, {status: 500});
    }
  },
};
