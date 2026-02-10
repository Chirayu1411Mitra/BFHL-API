const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(express.json());
const OFFICIAL_EMAIL = process.env.OFFICIAL_EMAIL; 
const GEMINI_KEY = process.env.GEMINI_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

const isPrime = (num) => {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

app.get('/health', (req, res) => {
    res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL
    });
});
app.post('/bfhl', async (req, res) => {
    try {
        const keys = Object.keys(req.body);
        
        if (keys.length !== 1) {
            return res.status(400).json({ is_success: false, message: "Exactly one key required." });
        }

        const key = keys[0];
        const input = req.body[key];
        let result;

        switch (key) {
            case 'fibonacci': 
                const n = parseInt(input);
                let series = [0, 1];
                for (let i = 2; i < n; i++) series.push(series[i - 1] + series[i - 2]);
                result = series.slice(0, n);
                break;

            case 'prime': 
                result = input.filter(n => isPrime(parseInt(n)));
                break;

            case 'lcm': 
                result = input.reduce((acc, val) => lcm(acc, val));
                break;

            case 'hcf': 
                result = input.reduce((acc, val) => gcd(acc, val));
                break;

            case 'AI': 
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                const prompt = `Question: ${input}. Provide a single-word answer.`;
                const aiResponse = await model.generateContent(prompt);
                result = aiResponse.response.text().trim();
                break;

            default:
                return res.status(400).json({ is_success: false, message: "Invalid key." });
        }

        res.status(200).json({
            is_success: true,
            official_email: OFFICIAL_EMAIL,
            data: result
        });

    } catch (error) {
        res.status(500).json({
            is_success: false,
            error: "Internal Server Error"
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));