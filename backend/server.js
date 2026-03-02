const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());

// Stripe webhook needs raw body — must come BEFORE express.json()
const { handleWebhook } = require('./controllers/client/paiementController');
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/public', require('./routes/public.routes'));
app.use('/api/client', require('./routes/client.routes'));
app.use('/api/vendeur', require('./routes/vendeur.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Error handler
app.use(require('./middleware/errorHandler.middleware'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur demarre sur le port ${PORT}`));
