<!-- src/lib/components/ChatMessage.svelte -->
<script>
    import { createEventDispatcher } from "svelte"; // 导入事件分发器
    import { updateMessage } from "$lib/stores";
    import { marked } from "marked";
    export let message;

    const dispatch = createEventDispatcher(); // 初始化分发器

    let isEditing = false;
    let editedContent = message.content;
    let textareaElement;
    let copied = false;
    let copyTimeoutId = null;

    function handleEdit() {
        editedContent = message.content;
        isEditing = true;
        setTimeout(() => {
            textareaElement?.focus();
        }, 0);
    }

    function handleSave() {
        if (editedContent.trim() === "") {
            return;
        }
        updateMessage(message.id, editedContent.trim());
        isEditing = false;
    }

    function handleCancel() {
        isEditing = false;
    }

    function handleKeyDown(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            handleSave();
        }
        if (event.key === "Escape") {
            event.preventDefault();
            handleCancel();
        }
    }

    async function handleCopy() {
        if (copyTimeoutId) {
            clearTimeout(copyTimeoutId);
        }
        try {
            await navigator.clipboard.writeText(message.content);
            copied = true;
            copyTimeoutId = setTimeout(() => {
                copied = false;
                copyTimeoutId = null;
            }, 1500);
        } catch (err) {
            console.error("无法复制文本: ", err);
        }
    }

    $: messageClass =
        message.role === "user" ? "user-message" : "assistant-message";
    $: roleDisplay = message.role === "user" ? "你" : "AI";
    $: avatarChar = message.role === "user" ? "U" : "A";
</script>

<div class="message-item {messageClass} {isEditing ? 'is-editing-mode' : ''}">
    <div class="message-bubble {isEditing ? 'editing-active-bubble' : ''}">
        {#if !isEditing}
            <div
                class="avatar-container {message.role === 'user'
                    ? 'avatar-user'
                    : 'avatar-assistant'}"
            >
                {avatarChar}
            </div>
        {/if}
        <div class="message-content-wrapper">
            <div class="message-header">
                {#if isEditing}
                    <div
                        class="avatar-container static-avatar {message.role ===
                        'user'
                            ? 'avatar-user'
                            : 'avatar-assistant'}"
                    >
                        {avatarChar}
                    </div>
                {/if}
                <strong>{roleDisplay}</strong>
                {#if !isEditing}
                    <div class="message-actions">
                        <button
                            on:click={handleCopy}
                            title={copied ? "已复制!" : "复制"}
                            class="action-btn copy-btn"
                            disabled={copied}
                        >
                            {#if copied}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            {:else}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.121A1.5 1.5 0 0117 6.621V16.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 017 16.5v-13z"
                                    ></path>
                                    <path
                                        d="M4.5 6A1.5 1.5 0 003 7.5v10A1.5 1.5 0 004.5 19h7a1.5 1.5 0 001.5-1.5v-1.321A3.002 3.002 0 0112.379 15H8.5A1.5 1.5 0 017 13.5V9.379A3.002 3.002 0 015.321 8H4.5A1.5 1.5 0 003 7.5V6zM4.5 6"
                                    ></path>
                                </svg>
                            {/if}
                        </button>

                        <button
                            on:click={handleEdit}
                            title="编辑"
                            class="action-btn edit-btn"
                        >
                            <!-- 编辑图标 -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                                ></path>
                            </svg>
                        </button>
                    </div>
                {/if}
            </div>

            {#if isEditing}
                <div class="editing-area">
                    <textarea
                        bind:this={textareaElement}
                        bind:value={editedContent}
                        on:keydown={handleKeyDown}
                        rows="3"
                        aria-label="编辑消息内容"
                    ></textarea>
                    <div class="edit-controls">
                        <button
                            on:click={handleSave}
                            class="control-btn save-btn"
                        >
                            保存 <span class="key-hint">(Ctrl+Enter)</span>
                        </button>
                        <button
                            on:click={handleCancel}
                            class="control-btn cancel-btn"
                        >
                            取消 <span class="key-hint">(Esc)</span>
                        </button>
                    </div>
                </div>
            {:else}
                <div class="message-text">
                    <div>{@html marked.parse(message.content)}</div>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    /* Styles are largely the same, only minor additions if needed for the new button,
       but existing .action-btn styles should cover it.
       Ensure .message-actions can accommodate multiple buttons.
    */
    .message-item {
        display: flex;
        max-width: 100%;
        margin-bottom: 1rem; /* Added some margin between messages */
    }

    .user-message {
        justify-content: flex-end;
    }
    .user-message .message-bubble:not(.editing-active-bubble) {
        background-color: #e9edf0;
        color: #34495e;
        border-bottom-right-radius: 6px;
    }
    .user-message .avatar-container {
        background-color: #7f8c8d;
    }
    .user-message .message-header strong {
        color: #2c3e50;
    }
    .user-message .action-btn {
        color: #566573;
    }
    .user-message .action-btn:hover:not(:disabled) {
        color: #2c3e50;
    }
    .user-message .action-btn:disabled {
        color: rgba(86, 101, 115, 0.5);
        cursor: default;
    }
    .user-message .action-btn:disabled:hover {
        background-color: transparent !important;
    }

    .assistant-message {
        justify-content: flex-start;
    }
    .assistant-message .message-bubble:not(.editing-active-bubble) {
        background-color: #e9edf0;
        color: #34495e;
        border-bottom-left-radius: 6px;
    }
    .assistant-message .avatar-container {
        background-color: #7f8c8d;
    }
    .assistant-message .message-header strong {
        color: #2c3e50;
    }
    .assistant-message .action-btn {
        color: #566573;
    }
    .assistant-message .action-btn:hover:not(:disabled) {
        color: #2c3e50;
    }
    .assistant-message .action-btn:disabled {
        color: rgba(86, 101, 115, 0.5);
        cursor: default;
    }
    .assistant-message .action-btn:disabled:hover {
        background-color: transparent !important;
    }

    .message-bubble {
        padding: 0.7rem 1.1rem;
        border-radius: 14px;
        box-shadow:
            0 3px 6px rgba(0, 0, 0, 0.04),
            0 1px 3px rgba(0, 0, 0, 0.03);
        max-width: 78%;
        word-wrap: break-word;
        overflow-wrap: break-word;
        line-height: 1.55;
        display: flex;
        gap: 0.75rem;
        position: relative;
    }
    .user-message .message-bubble:not(.editing-active-bubble) {
        flex-direction: row-reverse;
    }

    .avatar-container {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.95em;
        color: white;
        flex-shrink: 0;
        align-self: flex-start;
    }

    .message-content-wrapper {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        min-width: 0; /* Important for text wrapping in flex children */
    }

    .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.4rem;
        font-size: 0.9em;
    }
    .message-header strong {
        font-weight: 600;
        margin-right: auto; /* Pushes actions to the right */
    }

    .message-actions {
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
        margin-left: 0.5rem; /* Space between role name and actions */
        display: flex;
        gap: 0.3rem; /* Ensures buttons have space between them */
    }
    .message-bubble:hover .message-actions,
    .message-actions button:focus-visible /* Show on focus for accessibility */ {
        opacity: 1;
    }

    .action-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 3px; /* Small padding around icon */
        border-radius: 5px;
        line-height: 1; /* Prevents extra space */
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .action-btn svg {
        width: 16px; /* Consistent icon size */
        height: 16px; /* Consistent icon size */
        display: block;
    }
    .action-btn:hover:not(:disabled) {
        background-color: rgba(0, 0, 0, 0.07);
    }
    .action-btn:disabled {
        cursor: default;
    }
    .action-btn.copy-btn svg {
        /* Slightly larger copy icon as before */
        width: 17px;
        height: 17px;
    }
    /* Optional: specific class for refresh button if needed, e.g. .refresh-btn */

    /* --- 编辑模式样式 --- */
    .is-editing-mode.user-message,
    .is-editing-mode.assistant-message {
        justify-content: flex-start; /* Align left when editing */
    }

    .editing-active-bubble {
        max-width: 100%; /* Full width when editing */
        width: 100%;
        background-color: #ffffff;
        color: #34495e;
        border: 1.5px solid #bdc3c7;
        box-shadow:
            0 5px 15px rgba(0, 0, 0, 0.07),
            0 2px 6px rgba(0, 0, 0, 0.05);
        flex-direction: column; /* Stack header and textarea vertically */
        gap: 0.5rem;
    }
    .editing-active-bubble .avatar-container.static-avatar {
        width: 30px;
        height: 30px;
        font-size: 0.85em;
        margin-right: 0.5rem;
        align-self: center; /* Center avatar within the header space */
    }
    .editing-active-bubble .message-header strong {
        color: #2c3e50 !important; /* Ensure consistent color */
    }
    /* Ensure user avatar color is correct in editing mode if it was globally white */
    .editing-active-bubble.user-message .avatar-user,
    .is-editing-mode.user-message .avatar-user {
        background-color: #3498db;
    }

    .editing-area {
        width: 100%;
    }
    .editing-area textarea {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1.5px solid #d1d8e0;
        border-radius: 10px;
        box-sizing: border-box;
        resize: vertical;
        min-height: 70px;
        font-family: inherit;
        font-size: 1rem;
        line-height: 1.5;
        background-color: #fdfdfd;
        color: #34495e;
        margin-bottom: 0.75rem;
    }
    .editing-area textarea:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
        background-color: #fff;
    }

    .edit-controls {
        display: flex;
        gap: 0.6rem;
        justify-content: flex-end;
        margin-top: 0.25rem;
    }
    .control-btn {
        padding: 0.5rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        border: 1px solid transparent;
        font-size: 0.9em;
        font-weight: 500;
        transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            transform 0.1s ease;
    }
    .control-btn:hover {
        transform: translateY(-1px);
    }
    .control-btn:active {
        transform: translateY(0px);
    }

    .save-btn {
        background-color: #2ecc71;
        color: white;
        border-color: #2ecc71;
    }
    .save-btn:hover {
        background-color: #27ae60;
        border-color: #27ae60;
    }

    .cancel-btn {
        background-color: #f1f3f5;
        color: #566573;
        border-color: #dee2e6;
    }
    .cancel-btn:hover {
        background-color: #e9ecef;
        border-color: #ced4da;
    }

    .key-hint {
        font-size: 0.85em;
        opacity: 0.65;
        margin-left: 0.3em;
    }
</style>
