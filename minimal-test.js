require('dotenv').config({path: '.env.local'});
const axios = require('axios');

async function testChainGPT() {
  try {
    console.log('Testing ChainGPT API directly...');
    console.log('API Key:', process.env.CHAINGPT_API_KEY ? 'SET' : 'NOT SET');
    
    if (!process.env.CHAINGPT_API_KEY) {
      console.log('❌ No API key found!');
      return;
    }

    const response = await axios.post('https://api.chaingpt.org/chat/stream', {
      model: 'smart_contract_auditor',
      question: 'Test audit request',
      chatHistory: 'off'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.CHAINGPT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      responseType: 'stream'
    });

    console.log('✅ ChainGPT API is working!');
    console.log('Response status:', response.status);

  } catch (error) {
    console.log('❌ ChainGPT API test failed:');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testChainGPT();