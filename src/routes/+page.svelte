<script>
    // 从 $lib/stores 导入用于添加消息、消息历史记录和更新消息的函数/存储
    import {
        addMessage,
        idCounter,
        messageHistory,
        sliceMessage,
        updateMessage,
    } from "$lib/stores";
    // 从 $lib/components/ChatMessage.svelte 导入聊天消息组件
    import ChatMessage from "$lib/components/ChatMessage.svelte";
    // 从 $lib/components/ChatInput.svelte 导入聊天输入框组件
    import ChatInput from "$lib/components/ChatInput.svelte";
    // 从 $lib/components/DataPanel.svelte 导入数据面板组件 (用于AI设置)
    import DataPanel from "$lib/components/DataPanel.svelte";
    // 从 svelte/store 导入 get 函数，用于获取 store 的当前值
    import FileLoader from "$lib/components/FileLoader.svelte";
    import { get } from "svelte/store";
    // 从 svelte 导入 onMount (生命周期函数) 和 tick (等待DOM更新)
    import { onMount, tick } from "svelte";
    // 从 svelte/transition 导入 fly 过渡效果
    import { fly } from "svelte/transition";

    // 是否正在加载 AI 回复的状态标志
    let isLoading = false;
    // AI 设置对象
    let aiSettings = {
        systemPrompt: "你是一个乐于助人的助手。", // 系统提示语，用于指导 AI 的行为
        temperature: 1.3, // AI 回复的随机性（创造性）参数，值越高越随机
        maxTokens: 8192, // AI 回复的最大令牌数（长度限制）
    };

    // 数据面板（模型设置面板）是否显示的标志
    let showDataPanel = false;
    // 聊天应用头部的 DOM 引用
    let chatAppHeaderRef;
    // 数据面板的 CSS top 属性值
    let dataPanelTop = 0;
    // 数据面板的 CSS left 属性值
    let dataPanelLeft = 0;

    // 切换数据面板的显示/隐藏状态
    function toggleDataPanel() {
        showDataPanel = !showDataPanel;
        if (showDataPanel) {
            // 等待 DOM 更新（面板变为可见），然后计算其位置
            tick().then(calculatePanelPosition);
        }
    }
    function handleDataPanelClose() {
        showDataPanel = false;
    }
    // 计算数据面板的位置
    function calculatePanelPosition() {
        if (chatAppHeaderRef) {
            const headerRect = chatAppHeaderRef.getBoundingClientRect(); // 获取头部元素的边界矩形
            const chatContainer = chatAppHeaderRef.closest(
                ".chat-app-container", // 查找最近的 class 为 .chat-app-container 的祖先元素
            );
            if (!chatContainer) return; // 如果找不到聊天容器，则退出
            const chatContainerRect = chatContainer.getBoundingClientRect(); // 获取聊天容器的边界矩形

            dataPanelTop = headerRect.top; // 面板顶部与头部对齐 (视口坐标)
            dataPanelLeft = chatContainerRect.right + 10; // 面板左侧在聊天容器右侧 10px 处 (视口坐标)

            // 基本的边界检查：尝试将面板保持在屏幕内
            const panelElement = document.querySelector(".data-panel-flyout"); // 临时查询面板元素
            if (panelElement) {
                const panelWidth = panelElement.offsetWidth; // 获取面板宽度
                if (dataPanelLeft + panelWidth > window.innerWidth - 10) {
                    // 如果面板超出窗口右边界 (减去 10px 边距)
                    // 尝试将面板放在聊天容器左侧
                    let newLeft = chatContainerRect.left - panelWidth - 10;
                    if (newLeft < 10) {
                        // 如果左侧空间也不足
                        // 则将面板紧贴窗口右边缘
                        dataPanelLeft = Math.max(
                            10,
                            window.innerWidth - panelWidth - 10,
                        );
                    } else {
                        dataPanelLeft = newLeft; // 否则放在左侧
                    }
                }
                if (dataPanelLeft < 10) dataPanelLeft = 10; // 确保面板不会太靠左而超出窗口
            }
        }
    }

    // Svelte 生命周期钩子：组件挂载到 DOM 后执行
    onMount(() => {
        // 添加窗口大小调整事件监听器
        window.addEventListener("resize", () => {
            if (showDataPanel) {
                // 如果数据面板是显示的，则重新计算其位置
                calculatePanelPosition();
            }
        });
    });

    // 异步函数：获取聊天机器人的回复
    async function fetchChatResponse(sendHistory) {
        isLoading = true; // 设置加载状态为真
        let responseMessage = ""; // 初始化回复消息
        try {
            // 向后端 API /api/chat 发起 POST 请求
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", // 请求体为 JSON 格式
                },
                body: JSON.stringify({
                    // 请求体内容
                    message: sendHistory, // 发送的消息历史
                    temperature: aiSettings.temperature, // AI 温度参数
                    max_token: aiSettings.maxTokens, // AI 最大令牌数参数 (注意：API可能期望下划线命名)
                }),
            });

            if (!response.ok) {
                // 如果 HTTP 响应状态码不是成功 (2xx)
                const errorData = await response.json(); // 解析错误响应体
                throw new Error( // 抛出错误
                    errorData.error || `HTTP 错误! 状态: ${response.status}`,
                );
            }

            const data = await response.json(); // 解析成功响应体
            responseMessage = data.reply; // 获取 AI 的回复内容
        } catch (error) {
            console.error("发送消息失败:", error); // 在控制台打印错误
            responseMessage = `错误: ${error.message}`; // 设置错误消息为回复
        } finally {
            isLoading = false; // 无论成功或失败，都设置加载状态为假
        }
        // 将 AI 的回复添加到消息历史记录中
        addMessage({
            content: responseMessage,
            role: "assistant", // 角色为 "助手"
        });
    }

    // 处理发送消息事件 (由 ChatInput 组件触发)
    async function handleSendMessage(event) {
        // 将用户发送的消息添加到消息历史记录中
        addMessage({ content: event.detail.content, role: "user" });

        let currentHistory = get(messageHistory); // 获取当前的消息历史 (从 store 中)
        // 构造发送给 API 的消息历史负载，只包含 role 和 content
        let sendHistoryPayload = currentHistory.map(({ role, content }) => ({
            role,
            content,
        }));

        // 正确地将系统提示添加到发送历史的最前面
        sendHistoryPayload.unshift({
            role: "system", // 角色为 "系统"
            content: aiSettings.systemPrompt, // 使用 AI 设置中的系统提示
        });

        // 调用函数获取 AI 回复
        fetchChatResponse(sendHistoryPayload);
    }

    // 下载聊天历史记录为 JSON 文件
    function downloadChatHistory() {
        const history = {
            systemPrompt: aiSettings.systemPrompt,
            messages: get(messageHistory),
        }; // 获取当前消息历史
        const jsonData = JSON.stringify(history, null, 2); // 将历史记录转换为格式化的 JSON 字符串 (null, 2 用于美化输出)
        const blob = new Blob([jsonData], { type: "application/json" }); // 创建一个包含 JSON 数据的 Blob 对象
        const url = URL.createObjectURL(blob); // 为 Blob 对象创建一个临时的 URL
        const a = document.createElement("a"); // 创建一个 <a> 标签用于下载
        a.href = url; // 设置下载链接
        a.download = `对话历史.json`; // 设置下载文件名
        document.body.appendChild(a); // 将 <a> 标签添加到文档中
        a.click(); // 模拟点击 <a> 标签以触发下载
        document.body.removeChild(a); // 从文档中移除 <a> 标签
        URL.revokeObjectURL(url); // 释放之前创建的临时 URL
    }

    // 新增：处理从 JsonFileUploader 组件传来的数据
    async function handleJsonUploaded(event) {
        const { systemPrompt, messages } = event.detail;

        aiSettings.systemPrompt = systemPrompt;
        // 如果您的 messageHistory store 是一个 Svelte writable store,可以直接 .set()
        // 假设 messageHistory 是 writable
        messageHistory.set(messages);
        idCounter.set(messages.length);
        // 可选：给用户一些反馈
        console.log("对话历史已成功从JSON文件加载。");
        // 如果您有一个通知系统，可以在这里触发一个成功通知

        // 滚动到聊天窗口底部，以显示加载的消息
        await tick(); // 等待DOM更新
        const messagesPanel = document.querySelector(
            ".messages-panel .messages-list-wrapper",
        ); // 更精确的选择器
        if (messagesPanel) {
            // 更好的滚动方式，尤其是在消息从底部开始排列的情况下
            const parentContainer = messagesPanel.parentElement; // .messages-panel
            if (parentContainer) {
                parentContainer.scrollTop = parentContainer.scrollHeight;
            }
        }
    }
</script>

<!-- 
  .app-layout div 如果你需要一个共享的相对上下文会很有帮助，
  但是对于面板使用 position:fixed，它的重要性就降低了。
  我们将保持 body 作为主要的 flex 容器，用于居中 chat-app-container。
-->
<div class="chat-app-container">
    <!-- 应用头部，使用 bind:this 将 DOM 元素引用绑定到 chatAppHeaderRef 变量 -->
    <header class="app-header" bind:this={chatAppHeaderRef}>
        <h1>历史可编辑对话</h1>
        <div class="header-actions">
            <FileLoader on:jsonLoaded={handleJsonUploaded} />
            <!-- 下载对话历史按钮 -->
            <button on:click={downloadChatHistory} class="download-button">
                下载对话
            </button>
            <!-- 切换模型设置面板按钮 -->
            <button on:click={toggleDataPanel} class="settings-toggle-button">
                模型设置
            </button>
        </div>
    </header>
    <!-- 消息显示面板 -->
    <div class="messages-panel">
        <!-- 消息列表包装器，用于实现消息从底部向上排列的效果 -->
        <div class="messages-list-wrapper">
            <!-- 遍历消息历史记录 ($messageHistory 是一个 Svelte store, $ 前缀表示自动订阅) -->
            <!-- message.id 作为 key 用于 Svelte 高效更新列表 -->
            {#each $messageHistory as message}
                <!-- 渲染单个聊天消息组件 -->
                <ChatMessage {message}></ChatMessage>
            {/each}
        </div>
    </div>
    <!-- 如果 isLoading 为 true，则显示加载状态指示器 -->
    {#if isLoading}
        <div class="loading-status">
            <div class="spinner-animation"></div>
            <!-- 加载动画 -->
            <span>等待AI回复中...</span>
        </div>
    {/if}
    <!-- 聊天输入框组件，监听 sendMessage 事件 -->
    <ChatInput loading={isLoading} on:sendMessage={handleSendMessage}
    ></ChatInput>
</div>

<!-- 如果 showDataPanel 为 true，则显示数据面板 (模型设置面板) -->
{#if showDataPanel}
    <div
        class="data-panel-flyout"
        style="top: {dataPanelTop}px; left: {dataPanelLeft}px;"
        transition:fly={{ x: 100, duration: 250, opacity: 0.5 }}
    >
        <!-- 数据面板组件，双向绑定 settings 属性到 aiSettings变量 -->
        <DataPanel bind:settings={aiSettings} on:close={handleDataPanelClose} />
    </div>
{/if}

<style>
    /* 全局 body 样式 (no changes needed here for the primary request) */
    :global(body) {
        font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            "Helvetica Neue",
            Arial,
            sans-serif;
        margin: 0;
        background-color: #eef2f7;
        color: #333;
        display: flex;
        justify-content: center;
        align-items: flex-start; /* This is good, keeps growing content at the top */
        min-height: 100vh; /* Ensures body takes at least full viewport height */
        padding: 1rem;
        box-sizing: border-box;
    }

    /* 聊天应用主容器样式 */
    .chat-app-container {
        width: 100%;
        max-width: 800px;
        /* REMOVE: height: calc(100vh - 40px); */
        /* REMOVE: max-height: 850px; */
        display: flex;
        flex-direction: column;
        background-color: #ffffff;
        border-radius: 16px;
        box-shadow:
            0 12px 28px rgba(0, 0, 0, 0.08),
            0 4px 10px rgba(0, 0, 0, 0.05);
        overflow: hidden; /* Can keep for border-radius clipping if needed, content inside will expand it */
    }

    /* 应用头部样式 (no changes) */
    .app-header {
        padding: 1.25rem 1.75rem;
        background-color: #f7f9fc;
        border-bottom: 1px solid #dfe3e8;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .app-header h1 {
        margin: 0;
        font-size: 1.6em;
        font-weight: 600;
        color: #2c3e50;
    }

    /* 消息显示面板样式 */
    .messages-panel {
        /* REMOVE: flex-grow: 1; */
        /* REMOVE: overflow-y: auto; */
        padding: 1.5rem 1.75rem;
        display: flex;
        flex-direction: column;
        /* The panel will now grow with its content */
    }

    /* 消息列表包装器样式 */
    .messages-list-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        /* REMOVE: margin-top: auto; */ /* Messages will now stack from the top */
    }

    /* Webkit 内核浏览器滚动条样式 (These will no longer apply to .messages-panel) */
    /* You might want to apply similar styling globally if desired:
    :global(body::-webkit-scrollbar) { width: 6px; }
    :global(body::-webkit-scrollbar-thumb) { background-color: #bdc3c7; border-radius: 3px; }
    :global(body::-webkit-scrollbar-track) { background-color: transparent; }
    */
    .messages-panel::-webkit-scrollbar {
        width: 6px;
    }
    .messages-panel::-webkit-scrollbar-thumb {
        background-color: #bdc3c7;
        border-radius: 3px;
    }
    .messages-panel::-webkit-scrollbar-track {
        background-color: transparent;
    }

    /* 加载状态指示器样式 (no changes) */
    .loading-status {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem 1.75rem;
        font-style: italic;
        color: #7f8c8d;
        gap: 0.6rem;
        background-color: #f7f9fc;
        border-top: 1px solid #dfe3e8;
    }

    .spinner-animation {
        width: 18px;
        height: 18px;
        border: 2.5px solid rgba(52, 152, 219, 0.25);
        border-top-color: #3498db;
        border-radius: 50%;
        animation: spin-animation 0.7s linear infinite;
    }

    @keyframes spin-animation {
        to {
            transform: rotate(360deg);
        }
    }
    /* ... (rest of the styles for buttons, data-panel-flyout, etc. remain unchanged) ... */
    .download-button {
        padding: 5px 12px;
        background-color: #5a99e0;
        color: white;
        border: 1px solid #4a80c0;
        border-radius: 4px;
        font-size: 12px;
        font-weight: normal;
        cursor: pointer;
        transition: background-color 0.15s ease-in-out;
        line-height: 1.3;
    }

    .download-button:hover {
        background-color: #4a80c0;
    }

    .download-button:active {
        background-color: #3e6aa4;
    }

    .settings-toggle-button {
        padding: 5px 12px;
        background-color: #5a99e0;
        color: white;
        border: 1px solid #4a80c0;
        border-radius: 4px;
        font-size: 12px;
        font-weight: normal;
        cursor: pointer;
        transition: background-color 0.15s ease-in-out;
        line-height: 1.3;
    }

    .settings-toggle-button:hover {
        background-color: #4a80c0;
    }
    .settings-toggle-button:active {
        background-color: #3e6aa4;
    }

    .data-panel-flyout {
        position: fixed;
        z-index: 1000;
        background-color: #f7f8fa;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        overflow: hidden;
    }
</style>
