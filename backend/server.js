// backend/server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:8080', // frontend URL (development). बदलना हो तो बदल लो
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

// In-memory token and expiry
let shiprocketAuthToken = null;
let tokenExpiry = null; // unix seconds

const getShiprocketToken = async () => {
  const now = Math.floor(Date.now() / 1000);
  if (shiprocketAuthToken && tokenExpiry && tokenExpiry > (now + 60)) {
    console.log('Using existing Shiprocket token.');
    return shiprocketAuthToken;
  }

  console.log('Shiprocket token expired or not found. Logging in...');
  try {
    const resp = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }, { headers: { 'Content-Type': 'application/json' } });

    if (resp.data && resp.data.token) {
      shiprocketAuthToken = resp.data.token;
      // assume token valid for 15 days (1296000 sec). adjust if needed
      tokenExpiry = now + 1296000;
      console.log('Successfully obtained new Shiprocket token.');
      return shiprocketAuthToken;
    } else {
      throw new Error('No token received from Shiprocket login.');
    }
  } catch (err) {
    console.error('Error logging into Shiprocket:', err.response ? err.response.data : err.message);
    throw new Error('Failed to authenticate with Shiprocket. Check EMAIL/PASSWORD or 2FA.');
  }
};

const authenticateShiprocket = async (req, res, next) => {
  try {
    req.shiprocketToken = await getShiprocketToken();
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper validators
const onlyDigits = (s = '') => String(s).replace(/\D/g, '');
const isValidPhone = (p) => {
  const d = onlyDigits(p);
  return d.length === 10;
};
const isValidPincode = (p) => {
  const d = onlyDigits(p);
  return d.length === 6;
};

// Test login route
app.post('/login-shiprocket', async (req, res) => {
  try {
    const token = await getShiprocketToken();
    res.status(200).json({ message: 'Shiprocket login successful', token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create order route
app.post('/create-order', authenticateShiprocket, async (req, res) => {
  try {
    const orderData = req.body || {};

    // Basic required fields validation
    if (!orderData.order_id) return res.status(400).json({ message: 'order_id is required' });
    if (!orderData.order_date) return res.status(400).json({ message: 'order_date is required (YYYY-MM-DD HH:MM)' });
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({ message: 'items array required with at least one item' });
    }
    if (!orderData.address_details) return res.status(400).json({ message: 'address_details required' });
    const a = orderData.address_details;

    // Normalize and fallback: if billing missing, use shipping or vice versa
    // We'll treat given address_details as shipping address; billing will copy if absent.
    const shipping = {
      fullName: a.fullName || a.name || '',
      phone: a.phone || '',
      streetAddress: a.streetAddress || a.address || '',
      city: a.city || '',
      state: a.state || '',
      pincode: a.pincode || '',
      postOffice: a.postOffice || '',
      landmark: a.landmark || ''
    };

    // validate phone and pincode
    if (!isValidPhone(shipping.phone)) {
      return res.status(400).json({ message: 'Shipping phone must be 10 digits' });
    }
    if (!isValidPincode(shipping.pincode)) {
      return res.status(400).json({ message: 'Shipping pincode must be 6 digits' });
    }

    // If billing info provided separately, use it, else copy shipping
    const billing = orderData.billing_address || orderData.billing || shipping;

    if (!isValidPhone(billing.phone)) {
      // try to use shipping phone if billing invalid
      billing.phone = shipping.phone;
    }
    if (!isValidPincode(billing.pincode)) {
      billing.pincode = shipping.pincode;
    }

    // Build order_items
    const order_items = orderData.items.map(item => ({
      name: item.name || 'Item',
      sku: String(item.id || item.sku || 'SKU'),
      units: parseInt(item.quantity || 1, 10),
      selling_price: Number(item.price || 0),
      discount: Number(item.discount || 0),
      tax: Number(item.tax || 0),
      hsn: item.hsn || ''
    }));

    // Build payload required by Shiprocket
    const shiprocketPayload = {
      order_id: String(orderData.order_id),
      order_date: orderData.order_date, // "YYYY-MM-DD HH:MM" expected

      // IMPORTANT flag required by Shiprocket validations
      shipping_is_billing: true,

      // Pickup location - change to your real pickup address / merchant details as needed
      pickup_location: {
        name: "Aslam Tailor",
        address: "House No 1, Basahi Village, Near Chakhafiz Jama Masjid",
        address_2: "Po Basahi, PS Janta Bazar",
        city: "Saran",
        state: "Bihar",
        pincode: "841206",
        country: "India",
        email: process.env.SHIPROCKET_EMAIL || 'aslamtailorclothes@example.com',
        phone: "8873961545"
      },

      // Explicit channel id provided
      channel_id: "9191867",

      comment: orderData.comment || "Order from website",

      billing_customer_name: billing.fullName,
      billing_last_name: "",
      billing_address: billing.streetAddress,
      billing_address_2: billing.landmark || billing.postOffice || "",
      billing_city: billing.city,
      billing_pincode: billing.pincode,
      billing_state: billing.state,
      billing_country: "India",
      billing_email: orderData.customer_email || orderData.customerEmail || '',
      billing_phone: onlyDigits(billing.phone),

      shipping_customer_name: shipping.fullName,
      shipping_last_name: "",
      shipping_address: shipping.streetAddress,
      shipping_address_2: shipping.landmark || shipping.postOffice || "",
      shipping_city: shipping.city,
      shipping_pincode: shipping.pincode,
      shipping_state: shipping.state,
      shipping_country: "India",
      shipping_email: orderData.customer_email || orderData.customerEmail || '',
      shipping_phone: onlyDigits(shipping.phone),

      order_items,

      payment_method: (orderData.payment_method === 'cod' || (orderData.payment_method || '').toLowerCase() === 'cod') ? 'COD' : 'Prepaid',
      shipping_charges: Number(orderData.shipping_charges || 0),
      giftwrap_charges: Number(orderData.giftwrap_charges || 0),
      transaction_charges: Number(orderData.transaction_charges || 0),
      total_discount: Number(orderData.total_discount || 0),
      sub_total: Number(orderData.total_amount || 0),

      // default dims (can be overridden by orderData.dimensions)
      length: (orderData.dimensions && orderData.dimensions.length) ? Number(orderData.dimensions.length) : 10,
      breadth: (orderData.dimensions && orderData.dimensions.breadth) ? Number(orderData.dimensions.breadth) : 10,
      height: (orderData.dimensions && orderData.dimensions.height) ? Number(orderData.dimensions.height) : 10,
      weight: Number(orderData.weight || 0.5) // kg
    };

    // Send create order to Shiprocket
    const token = req.shiprocketToken;
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/orders/create`, shiprocketPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    return res.status(200).json(response.data);
  } catch (err) {
    console.error('Error creating Shiprocket order:', err.response ? err.response.data : err.message);
    const details = err.response ? err.response.data : err.message;
    // If Shiprocket returns a 4xx/422, forward friendly message
    if (err.response && err.response.status) {
      return res.status(err.response.status).json({ message: 'Failed to create Shiprocket order', details });
    }
    return res.status(500).json({ message: 'Failed to create Shiprocket order', details });
  }
});

// Check courier/serviceability
app.post('/check-courier', authenticateShiprocket, async (req, res) => {
  try {
    const { pickup_postcode, delivery_postcode, weight, cod_amount, order_amount, dimensions } = req.body;
    if (!pickup_postcode || !delivery_postcode) {
      return res.status(400).json({ message: 'pickup_postcode and delivery_postcode required' });
    }
    const token = req.shiprocketToken;
    const body = {
      pickup_postcode,
      delivery_postcode,
      weight: Number(weight || 0.5),
      cod: Number(cod_amount || 0),
      order_id: "SERVICE_CHECK_" + Date.now(),
      length: (dimensions && dimensions.length) ? Number(dimensions.length) : 10,
      breadth: (dimensions && dimensions.breadth) ? Number(dimensions.breadth) : 10,
      height: (dimensions && dimensions.height) ? Number(dimensions.height) : 10,
      declared_value: Number(order_amount || 0),
    };

    const resp = await axios.post(`${SHIPROCKET_BASE_URL}/courier/serviceability`, body, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    res.status(200).json(resp.data);
  } catch (err) {
    console.error('Error checking courier serviceability:', err.response ? err.response.data : err.message);
    const details = err.response ? err.response.data : err.message;
    if (err.response && err.response.status) {
      return res.status(err.response.status).json({
        message: 'Failed to check courier serviceability',
        details
      });
    }
    return res.status(500).json({ message: 'Failed to check courier serviceability', details });
  }
});

app.listen(PORT, () => {
  console.log(`Shiprocket backend running on port ${PORT}`);
});