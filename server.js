const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// SERPAPI Key from environment
const SERPAPI_KEY = process.env.SERPAPI_KEY;

// Search Nigerian products
app.post('/search', async (req, res) => {
  try {
    const { product_query, location = 'Lagos', max_results = 3 } = req.body;
    
    console.log(`🔍 Searching: ${product_query} in ${location}`);
    
    // Search SerpAPI
    const searchResults = await searchSerpAPI(product_query, location, max_results);
    
    // Format for WhatsApp
    const formatted = formatResults(searchResults);
    
    res.json({
      success: true,
      data: formatted
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.json({
      success: false,
      data: [],
      error: error.message
    });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('🇳🇬 Nigeria Marketplace API is running!');
});

// SerpAPI function
async function searchSerpAPI(query, location, maxResults) {
  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google_shopping',
        q: `${query} site:jumia.com.ng OR site:konga.com Nigeria`,
        location: `${location}, Nigeria`,
        hl: 'en',
        gl: 'ng',
        api_key: SERPAPI_KEY,
        num: maxResults
      },
      timeout: 10000
    });
    
    return response.data.shopping_results || [];
  } catch (error) {
    console.log('SerpAPI error:', error.message);
    return [];
  }
}

// Format results
function formatResults(results) {
  if (!results || results.length === 0) {
    return [{
      name: 'No products found',
      price: 'Try Jumia or Konga directly',
      store: 'jumia.com.ng',
      location: 'Nigeria'
    }];
  }
  
  return results.slice(0, 5).map(item => ({
    name: item.title?.slice(0, 100) || 'Product',
    price: item.price || 'Price not available',
    store: item.source || 'Store',
    location: 'Nigeria',
    rating: item.rating || null
  }));
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔑 SerpAPI Key: ${SERPAPI_KEY ? 'Set' : 'Missing!'}`);
});
