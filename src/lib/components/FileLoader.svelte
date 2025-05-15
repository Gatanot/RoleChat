<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    /** @type {HTMLInputElement} */
    let fileInput;
    let errorMessage = "";
    let fileName = ""; // 用于显示已选择的文件名

    function handleFileSelect(event) {
        errorMessage = ""; // 清除上一次的错误信息
        const file = event.target.files && event.target.files[0];

        if (!file) {
            fileName = ""; // 用户取消了文件选择
            if (fileInput) {
                fileInput.value = ""; // 清除输入框的值，以防万一
            }
            return;
        }

        fileName = file.name; // 显示当前选择的文件名

        if (file.type !== "application/json") {
            errorMessage = "文件类型错误：请上传 .json 文件。";
            if (fileInput) {
                fileInput.value = ""; // 清除以便可以重新选择同一个文件
            }
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const fileContent = e.target?.result;
                if (typeof fileContent !== "string") {
                    errorMessage = "无法读取文件内容。";
                    if (fileInput) fileInput.value = "";
                    return;
                }
                const jsonData = JSON.parse(fileContent);

                if (validateJsonFormat(jsonData)) {
                    // 分发解析后的数据
                    dispatch("jsonLoaded", {
                        systemPrompt: jsonData.systemPrompt,
                        messages: jsonData.messages,
                    });
                    // 成功后，保留文件名，清除错误信息（已在函数开头完成）
                    // 清除 input.value 允许用户再次上传同名文件（如果需要的话）
                    if (fileInput) fileInput.value = "";
                } else {
                    errorMessage =
                        "JSON 文件内容或格式不符合要求。请检查控制台获取更多信息。";
                    if (fileInput) fileInput.value = "";
                }
            } catch (error) {
                console.error("解析JSON错误:", error);
                errorMessage = `解析 JSON 文件失败: ${error.message}`;
                if (fileInput) fileInput.value = "";
            }
        };

        reader.onerror = () => {
            errorMessage = "读取文件时发生错误。";
            if (fileInput) fileInput.value = "";
        };

        reader.readAsText(file);
    }

    function validateJsonFormat(data) {
        if (!data || typeof data !== "object") {
            console.error("验证错误: 数据不是一个对象。", data);
            return false;
        }
        if (typeof data.systemPrompt !== "string") {
            console.error(
                "验证错误: 'systemPrompt' 必须是字符串。",
                data.systemPrompt,
            );
            return false;
        }
        if (!Array.isArray(data.messages)) {
            console.error(
                "验证错误: 'messages' 必须是一个数组。",
                data.messages,
            );
            return false;
        }

        return data.messages.every((msg, index) => {
            if (!msg || typeof msg !== "object") {
                console.error(
                    `验证错误: messages[${index}] 不是一个对象。`,
                    msg,
                );
                return false;
            }
            if (typeof msg.content !== "string") {
                console.error(
                    `验证错误: messages[${index}].content 必须是字符串。`,
                    msg.content,
                );
                return false;
            }
            if (
                typeof msg.role !== "string" ||
                !["user", "assistant"].includes(msg.role)
            ) {
                console.error(
                    `验证错误: messages[${index}].role 必须是 "user" 或 "assistant"。`,
                    msg.role,
                );
                return false;
            }
            // id 在示例中是数字，我们坚持这个格式
            if (typeof msg.id !== "number" || !Number.isInteger(msg.id)) {
                console.error(
                    `验证错误: messages[${index}].id 必须是整数。`,
                    msg.id,
                );
                return false;
            }
            // 可以根据需要添加更多校验，例如 id 是否唯一等。
            return true;
        });
    }

    function triggerFileInput() {
        if (fileInput) {
            fileInput.click();
        }
    }
</script>

<div class="json-uploader-container">
    <input
        type="file"
        accept=".json,application/json"
        bind:this={fileInput}
        on:change={handleFileSelect}
        style="display: none;"
        aria-hidden="true"
    />
    <button
        on:click={triggerFileInput}
        class="upload-button"
        title="上传对话历史 (JSON)"
    >
        上传对话
    </button>
    {#if errorMessage}
        <p class="error-message" role="alert">{errorMessage}</p>
    {/if}
</div>

<style>
    .json-uploader-container {
        display: flex;
        align-items: center;
        gap: 8px; /* 按钮和文件名之间的间隙 */
    }
    .upload-button {
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

    .upload-button:hover {
        background-color: #4a80c0;
    }

    .upload-button:active {
        background-color: #3e6aa4;
    }

    .error-message {
        color: #dc3545; /* 错误红色 */
        font-size: 0.85em;
        margin: 0 0 0 5px; /* 与文件名或按钮保持一点距离 */
        white-space: normal; /* 允许多行 */
    }
</style>
