<!-- DataPanel.svelte 文件 -->
<script>
    import { createEventDispatcher } from "svelte";
    // 如果父组件没有提供设置，则使用这些默认设置，或作为初始结构。
    export let settings = {
        systemPrompt: "",
        temperature: 1.3,
        maxTokens: 2048,
    };

    const dispatch = createEventDispatcher();

    // 如果你没有使用 bind:settings，这个 $: dispatch 块可以很好地响应更改。
    // 使用 bind:settings 时，父组件的 `aiSettings` 对象会通过输入框上的 bind:value 直接被修改，
    // 因此这个 dispatch 更像是一个通知，用于告知其他未绑定的组件发生了变化。
    // 对于更新父组件的 `aiSettings` 而言，它并非严格必要。
    $: dispatch("settingsChange", {
        systemPrompt: settings.systemPrompt,
        temperature: Number(settings.temperature),
        maxTokens: Number(settings.maxTokens),
    });

    // 新增：处理关闭按钮点击的函数
    function handleCloseClick() {
        dispatch("close"); // 分发 'close' 事件
    }
</script>

<div class="data-panel-container">
    <h2 class="panel-title">模型设置</h2>

    <div class="form-group">
        <label for="system-prompt">系统提示</label>
        <textarea id="system-prompt" bind:value={settings.systemPrompt} rows="5"
        ></textarea>
    </div>

    <div class="form-group">
        <label for="temperature-slider">
            温度: {Number(settings.temperature).toFixed(2)}
            <span class="tooltip">(0.0 - 2.0)</span>
        </label>
        <div class="slider-input-group">
            <input
                type="range"
                id="temperature-slider"
                class="slider"
                bind:value={settings.temperature}
                min="0"
                max="2"
                step="0.01"
            />
            <input
                type="number"
                id="temperature-number"
                bind:value={settings.temperature}
                min="0"
                max="2"
                step="0.01"
                class="number-input number-input-small"
            />
        </div>
    </div>

    <div class="form-group">
        <label for="max-tokens-slider">
            最大Token: {settings.maxTokens}
            <span class="tooltip">生成内容的最大长度</span>
        </label>
        <div class="slider-input-group">
            <input
                type="range"
                id="max-tokens-slider"
                class="slider"
                bind:value={settings.maxTokens}
                min="1"
                max="8192"
                step="1"
            />
            <input
                type="number"
                id="max-tokens-number"
                bind:value={settings.maxTokens}
                min="1"
                max="16384"
                step="1"
                class="number-input number-input-large"
            />
        </div>
    </div>

    <!-- 新增：关闭按钮 -->
    <div class="panel-actions">
        <button class="close-button" on:click={handleCloseClick}>
            关闭面板
        </button>
    </div>
</div>

<style>
    .data-panel-container {
        /* 背景颜色、边框、边框圆角、盒子阴影现在由 +page.svelte 文件中的 .data-panel-flyout 类处理 */
        padding: 24px; /* 保留内部填充 */
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
        max-width: 350px; /* 控制弹出面板的宽度 */
        display: flex; /* 新增：为了更好地控制底部按钮的布局 */
        flex-direction: column; /* 新增 */
        height: 100%; /* 新增：确保容器占满 .data-panel-flyout 的高度 */
        box-sizing: border-box; /* 新增：确保 padding 不会增加总高度 */
    }

    .panel-title {
        font-size: 1.4rem;
        font-weight: 600;
        color: #333;
        margin-top: 0;
        margin-bottom: 28px;
        text-align: left;
    }

    .form-group {
        margin-bottom: 22px;
    }
    /* 新增：让表单组占据剩余空间，将按钮推到底部 */
    .form-group:last-of-type {
        flex-grow: 1; 
    }


    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #454f5b;
        font-size: 0.95rem;
    }

    .form-group label .tooltip {
        font-weight: 400;
        font-size: 0.8em;
        color: #6c757d;
        margin-left: 5px;
    }

    .form-group textarea,
    .form-group .number-input {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid #dcdfe6;
        border-radius: 8px;
        box-sizing: border-box;
        background-color: #ffffff;
        color: #333;
        font-size: 0.9rem;
        line-height: 1.5;
        transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
    }

    .form-group textarea:focus,
    .form-group .number-input:focus,
    .form-group .slider:focus {
        border-color: #5a99e0;
        box-shadow: 0 0 0 2px rgba(90, 153, 224, 0.2);
        outline: none;
    }

    .form-group textarea {
        resize: vertical;
        min-height: 90px;
    }

    .slider-input-group {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .slider {
        flex-grow: 1;
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 6px;
        background: #e9ecef;
        border-radius: 3px;
        outline: none;
        padding: 0;
        margin: 8px 0;
    }

    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        background: #4a90e2;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: #4a90e2;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
    .number-input-small {
        width: 80px !important;
        flex-shrink: 0;
    }

    .number-input-large {
        width: 95px !important;
        flex-shrink: 0;
    }

    /* 新增：按钮容器和按钮样式 */
    .panel-actions {
        margin-top: 20px; /* 与最后一个表单组的间距 */
        padding-top: 20px; /* 按钮上方的内边距，可选 */
        border-top: 1px solid #e0e0e0; /* 可选的分隔线 */
        display: flex;
        justify-content: flex-end; /* 按钮靠右 */
    }

    .close-button {
        padding: 8px 16px;
        background-color: #6c757d; /* 灰色背景 */
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .close-button:hover {
        background-color: #5a6268; /* 悬停时深一点的灰色 */
    }
    .close-button:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(108, 117, 125, 0.4);
    }
</style>