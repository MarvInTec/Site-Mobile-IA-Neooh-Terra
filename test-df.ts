import https from 'https';

const data = JSON.stringify({
  queryInput: {
    text: {
      text: "Oi"
    },
    languageCode: "pt-br"
  }
});

const options = {
  hostname: 'dialogflow.cloud.google.com',
  port: 443,
  path: '/v1/integrations/messenger/webhook/projects/bootcam-llm-ai3/locations/global/agents/0658f3b1-b782-459c-80ba-2a8c74db91c0/sessions/test-session-123',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', responseData);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
