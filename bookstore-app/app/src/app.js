const express = require('express');
const client = require('prom-client');

const app = express();
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Travel Packages
const travelPackages = [
  { id: 1, name: 'Bali Getaway', category: 'Beach', price: 899, description: '7 days in tropical paradise with spa & surfing', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Bali_beach.jpg' },
  { id: 2, name: 'Swiss Alps Adventure', category: 'Adventure', price: 1499, description: 'Ski, snowboard & explore the Alps', image: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Swiss_Alps.jpg' },
  { id: 3, name: 'Dubai Desert Safari', category: 'Luxury', price: 1099, description: '5-star desert safari, dune bashing & camel rides', image: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Dubai_desert.jpg' },
  { id: 4, name: 'Paris Romantic Escape', category: 'City', price: 1299, description: '5 days in Paris with Eiffel Tower tour', image: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg' },
  { id: 5, name: 'Thailand Explorer', category: 'Beach', price: 999, description: 'Bangkok, Phuket & Phi Phi Islands adventure', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Phi_phi_islands.jpg' },
  { id: 6, name: 'Kenya Safari Expedition', category: 'Wildlife', price: 1799, description: 'Safari tours & wildlife adventures in Maasai Mara', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Masai_Mara.jpg' },
  { id: 7, name: 'Tokyo Tech & Culture', category: 'City', price: 1399, description: 'Shibuya, Akihabara & Mt. Fuji day trip', image: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Tokyo_Skyline.jpg' },
  { id: 8, name: 'Maldives Luxury Retreat', category: 'Luxury', price: 2499, description: 'Private overwater villa & snorkeling experience', image: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Maldives_Beach.jpg' }
];

app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', packages: travelPackages.length }));

// Prometheus metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Home Page - Travel Website UI
app.get('/', (req, res) => {
  const html = `
    <html><head><title>✈️ यात्रा अन्वेषक</title><style>
      body{font-family:Arial;margin:0;background:linear-gradient(to bottom,#e0c3fc,#fbc2eb);color:#333}
      .header{background:#d63384;color:white;text-align:center;padding:40px 20px}
      .header h1{margin:0;font-size:40px}
      .header p{margin:10px 0 0;font-size:18px}
      .packages{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px;padding:30px}
      .package{background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.1);transition:transform .2s}
      .package:hover{transform:translateY(-5px)}
      .package img{width:100%;height:200px;object-fit:cover}
      .info{padding:15px}
      .info h3{margin:0;font-size:22px}
      .info p{font-size:14px;color:#666}
      .price{color:#e74c3c;font-weight:bold;font-size:20px;margin-top:10px}
      .category{background:#ff7f50;color:white;padding:5px 10px;border-radius:20px;font-size:12px;display:inline-block;margin-top:8px}
    </style></head><body>
      <div class="header">
        <h1>✈️ यात्रा अन्वेषक</h1>
        <p>आपके सपनों की मंज़िलें, प्यार के साथ चुनी गई ❤️</p>
      </div>
      <div class="packages">
        ${travelPackages.map(p => `
          <div class="package">
            <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Travel'">
            <div class="info">
              <h3>${p.name}</h3>
              <p>${p.description}</p>
              <div class="price">\$${p.price}</div>
              <span class="category">${p.category}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </body></html>
  `;
  res.send(html);
});

// API endpoints
app.get('/api/packages', (req, res) => {
  const { category } = req.query;
  const packages = category ? travelPackages.filter(p => p.category.toLowerCase().includes(category.toLowerCase())) : travelPackages;
  res.json({ packages, total: packages.length });
});

app.get('/api/packages/:id', (req, res) => {
  const travelPackage = travelPackages.find(p => p.id === parseInt(req.params.id));
  travelPackage ? res.json(travelPackage) : res.status(404).json({ error: 'Package not found' });
});

app.get('/api/categories', (req, res) => {
  const categories = [...new Set(travelPackages.map(p => p.category))];
  res.json({ categories });
});

module.exports = app;
