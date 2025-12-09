require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:8080', // Replace with your frontend URL in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Shiprocket API Base URL
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

// In-memory storage for Shiprocket token and its expiry
let shiprocketAuthToken = null;
let tokenExpiry = null; // Unix timestamp in seconds

// Function to get or refresh Shiprocket auth token
const getShiprocketToken = async () => {
  const now = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds

  // Check if token exists and is not expired (give a 60-second buffer)
  if (shiprocketAuthToken && tokenExpiry && tokenExpiry > (now + 60)) {
    console.log('Using existing Shiprocket token.');
    return shiprocketAuthToken;
  }

  console.log('Shiprocket token expired or not found. Logging in...');
  try {
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });

    if (response.data && response.data.token) {
      shiprocketAuthToken = response.data.token;
      // Shiprocket token typically expires in 15 days (1296000 seconds)
      // We'll store the expiry time based on when we received it.
      tokenExpiry = now + 1296000; 
      console.log('Successfully obtained new Shiprocket token.');
      return shiprocketAuthToken;
    } else {
      throw new Error('Shiprocket login failed: No token received.');
    }
  } catch (error) {
    console.error('Error logging into Shiprocket:', error.response ? error.response.data : error.message);
    throw new Error('Failed to authenticate with Shiprocket.');
  }
};

// Middleware to ensure Shiprocket token is available for routes
const authenticateShiprocket = async (req, res, next) => {
  try {
    req.shiprocketToken = await getShiprocketToken();
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- API Routes ---

// Route to manually trigger Shiprocket login (for testing/initial setup)
app.post('/login-shiprocket', async (req, res) => {
  try {
    const token = await getShiprocketToken();
    res.status(200).json({ message: 'Shiprocket login successful', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to create an order in Shiprocket
app.post('/create-order', authenticateShiprocket, async (req, res) => {
  try {
    const orderData = req.body;
    const token = req.shiprocketToken;

    // Example order creation payload structure (adjust as per your needs)
    const shiprocketPayload = {
      order_id: orderData.order_id, // Your internal order ID
      order_date: orderData.order_date, // YYYY-MM-DD HH:MM
      pickup_location: { // This should ideally come from your settings or product data
        name: "Aslam Tailor",
        address: "Shop No. 123, Main Market",
        address_2: "Near Clock Tower",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110001",
        country: "India",
        email: "aslamtailor@example.com",
        phone: "9876543210"
      },
      channel_id: "", // Optional: Your sales channel ID in Shiprocket
      comment: "Custom tailored order",
      billing_customer_name: orderData.address_details.fullName,
      billing_last_name: "", // Shiprocket sometimes splits full name
      billing_address: orderData.address_details.streetAddress,
      billing_address_2: orderData.address_details.landmark || orderData.address_details.postOffice || "",
      billing_city: orderData.address_details.city,
      billing_pincode: orderData.address_details.pincode,
      billing_state: orderData.address_details.state,
      billing_country: "India",
      billing_email: orderData.customer_email, // Customer's email
      billing_phone: orderData.address_details.phone,
      shipping_customer_name: orderData.address_details.fullName,
      shipping_last_name: "",
      shipping_address: orderData.address_details.streetAddress,
      shipping_address_2: orderData.address_details.landmark || orderData.address_details.postOffice || "",
      shipping_city: orderData.address_details.city,
      shipping_pincode: orderData.address_details.pincode,
      shipping_state: orderData.address_details.state,
      shipping_country: "India",
      shipping_email: orderData.customer_email,
      shipping_phone: orderData.address_details.phone,
      order_items: orderData.items.map(item => ({
        name: item.name,
        sku: item.id, // Use product ID as SKU
        units: item.quantity,
        selling_price: item.price,
        discount: 0, // Adjust if you have item-level discounts
        tax: 0,
        hsn: "" // Optional: Harmonized System of Nomenclature code
      })),
      payment_method: orderData.payment_method === 'cod' ? 'COD' : 'Prepaid',
      shipping_charges: 0, // Assuming free shipping
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: orderData.total_amount,
      length: 10, // Default dimensions, adjust based on your products
      breadth: 10,
      height: 10,
      weight: 0.5, // Default weight in kg, adjust based on your products
    };

    const response = await axios.post(`${SHIPROCKET_BASE_URL}/orders/create`, shiprocketPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error creating Shiprocket order:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to create Shiprocket order', details: error.response ? error.response.data : error.message });
  }
});

// Route to check available courier services
app.post('/check-courier', authenticateShiprocket, async (req, res) => {
  try {
    const { pickup_postcode, delivery_postcode, weight, cod_amount, order_amount, dimensions } = req.body;
    const token = req.shiprocketToken;

    const response = await axios.post(`${SHIPROCKET_BASE_URL}/courier/serviceability`, {
      pickup_postcode,
      delivery_postcode,
      weight, // in kg
      cod: cod_amount, // COD amount if applicable
      order_id: "TEST_ORDER_123", // A dummy order ID for serviceability check
      length: dimensions?.length || 10,
      breadth: dimensions?.breadth || 10,
      height: dimensions?.height || 10,
      // For prepaid orders, use order_amount, for COD use cod_amount
      // Shiprocket API docs suggest using 'declared_value' for prepaid
      declared_value: order_amount, 
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error checking courier serviceability:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to check courier serviceability', details: error.response ? error.response.data : error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Shiprocket backend running on port ${PORT}`);
});