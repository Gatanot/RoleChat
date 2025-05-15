// src/routes/api/chat/+server.js
import { json } from '@sveltejs/kit';
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: "sk-ca944d8dd7944e8c81dcedb175304d17",
});
/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        // 1. 从请求中解析 JSON body
        // 注意：request.json() 是一个异步操作
        const body = await request.json();

        // 2. 从 body 中获取你需要的数据
        const userMessage = body.message; // 假设你期望一个包含 "message" 字段的 JSON 对象
        const userTemperature = body.temperature;
        const userMaxToken = body.max_token
        if (!userMessage) {
            return json({ error: 'Missing "message" in request body' }, { status: 400 });
        }

        // 3. 在这里处理你的逻辑
        const completion = await openai.chat.completions.create({
            messages: userMessage,
            model: "deepseek-chat",
            max_tokens: userMaxToken,
            temperature: userTemperature,
        });

        const aiResponse = completion.choices[0].message.content;

        // 4. 返回一个 JSON 响应
        return json({
            reply: aiResponse,
            received: userMessage,
            timestamp: new Date().toISOString()
        }, { status: 200 });

    } catch (error) {
        // 如果 request.json() 失败 (例如，body 不是有效的 JSON)
        // 或者其他在处理过程中发生的错误
        console.error('Error processing POST request:', error);
        return json({ error: 'Invalid request or server error' }, { status: 400 }); // 或 500，取决于错误类型
    }
}

// 你也可以在这里定义 GET, PUT, DELETE 等其他 HTTP 方法
// export async function GET({ url }) {
//     const queryParam = url.searchParams.get('q');
//     return json({ message: `GET request received with query: ${queryParam}` });
// }