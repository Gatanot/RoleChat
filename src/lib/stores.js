import { writable, get } from 'svelte/store';

const initialMessages = []
// { id: Date.now(), role: 'assistant', content: '你好！我是 AI 助手，我们可以开始对话了。使用 Store 进行管理。' }
// 创建一个 writable store 来存储消息数组
export const messageHistory = writable(initialMessages);
export const ai_message = writable(initialMessages);
// 用于生成唯一 ID 的计数器（也可以放在 store 内部，如果需要更复杂的逻辑）
const initial_id = 0;
export const idCounter = writable(initial_id)
// --- Helper 函数来操作 store ---

/**
 * 向 store 中添加一条新消息
 * @param {{ role: 'user' | 'assistant', content: string }} messageData - 消息数据（不含 id）
 */
export function addMessage(messageData) {
    const currentId = get(idCounter);
    const newMessage = {
        ...messageData,
        id: currentId // 生成唯一 ID
    };
    // 使用 store 的 update 方法来更新数组
    messageHistory.update(currentMessages => [...currentMessages, newMessage]);
    ai_message.update(currentMessages => [...currentMessages, messageData]);
    idCounter.update(currentID => currentID + 1)
    return newMessage; // 返回添加的消息（可能有用）
}

/**
 * 更新 store 中指定索引的消息内容
 * @param {number} index - 要更新的消息在数组中的索引
 * @param {string} newContent - 新的消息内容
 */
export function updateMessage(index, newContent) {
    messageHistory.update(currentMessages => {
        // 创建一个新数组以保证响应式更新
        return currentMessages.map((msg, i) => {
            if (i === index) {
                // 如果内容没有实际变化，可以返回原对象以优化
                if (msg.content === newContent) {
                    return msg;
                }
                // 返回更新了 content 的新对象副本
                return { ...msg, content: newContent };
            }
            return msg; // 其他消息保持不变
        });
    });
    console.log(`Store updated message at index ${index}`);
}
export function sliceMessage(index) {
    messageHistory.update(currentMessages => {
        return currentMessages.slice(0, index + 1);
    });
    const currentId = get(idCounter);
    idCounter.update(currentID => currentID - 1)
}