
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ No GEMINI_API_KEY found in .env.local");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("🔍 Querying Google AI API to list available models...");

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);

            if (json.error) {
                console.error("\n❌ API Error:");
                console.error(`Code: ${json.error.code}`);
                console.error(`Message: ${json.error.message}`);
                console.error(`Status: ${json.error.status}`);
            } else if (json.models) {
                console.log("\n✅ API Key is Valid! Available Models:");
                json.models.forEach(m => {
                    if (m.supportedGenerationMethods.includes("generateContent")) {
                        console.log(` - ${m.name.replace('models/', '')}`);
                    }
                });
                console.log("\nUse one of the names above in your ai-service.ts");
            } else {
                console.log("\n⚠️ Proper response received but no models list found:", json);
            }
        } catch (e) {
            console.error("Failed to parse response:", e);
            console.log("Raw response:", data);
        }
    });

}).on('error', (err) => {
    console.error("Network Error:", err.message);
});
