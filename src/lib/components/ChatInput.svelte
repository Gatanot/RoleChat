<script>
    import { createEventDispatcher, tick } from "svelte"; // Import tick

    export let loading = false;
    let messageContent = "";
    const dispatch = createEventDispatcher();

    let textareaElement; // Variable to hold the textarea DOM element

    // Function to adjust textarea height
    function adjustTextareaHeight() {
        if (!textareaElement) return;
        textareaElement.style.height = "auto"; // Temporarily shrink to allow recalculation
        textareaElement.style.height = `${textareaElement.scrollHeight}px`; // Set to actual content height
    }

    // Call adjustTextareaHeight whenever messageContent changes (e.g., user types)
    // $: if (textareaElement && messageContent) { // This reactive statement can also work
    //     adjustTextareaHeight();
    // }
    // Using on:input is generally more direct for this use case.

    function handleSubmit() {
        const trimmedContent = messageContent.trim();
        if (trimmedContent && !loading) {
            dispatch("sendMessage", { content: trimmedContent });
            messageContent = "";
            // After messageContent is cleared, wait for DOM update, then reset textarea height
            tick().then(() => {
                adjustTextareaHeight();
            });
        }
    }
</script>

<form on:submit|preventDefault={handleSubmit} class="chat-input-form">
    <textarea
        bind:this={textareaElement}
        bind:value={messageContent}
        on:input={adjustTextareaHeight}
        placeholder={"输入消息..."}
        rows="1"
        aria-label="聊天输入框"
    ></textarea>
    <button
        type="submit"
        disabled={loading || messageContent.trim() === ""}
        aria-label={loading ? "发送中" : "发送消息"}
    >
        {#if loading}
            <svg
                class="send-icon loading-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <path
                    d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z"
                    opacity="0.2"
                />
                <path
                    d="M12 2C6.47715 2 2 6.47715 2 12H4C4 7.58172 7.58172 4 12 4V2Z"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 12 12"
                        to="360 12 12"
                        dur="0.8s"
                        repeatCount="indefinite"
                    />
                </path>
            </svg>
        {:else}
            <svg class="send-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                    d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"
                />
            </svg>
        {/if}
    </button>
</form>

<style>
    .chat-input-form {
        display: flex;
        gap: 0.75rem;
        padding: 1rem 1.75rem;
        border-top: 1px solid #dfe3e8;
        background-color: #f7f9fc;
        align-items: flex-end; /* Important for aligning button with multi-line textarea */
    }

    textarea {
        flex-grow: 1;
        padding: 0.75rem 1rem;
        border: 1.5px solid #d1d8e0;
        border-radius: 10px;
        resize: none; /* Keep this to prevent manual resize */
        font-family: inherit;
        font-size: 1rem;
        line-height: 1.5;
        /* min-height is already well defined, will act as the base for 1 row */
        min-height: calc(
            1.5em + 0.75rem * 2 + 3px
        ); /* (line-height + padding-top + padding-bottom + border-top + border-bottom) */
        max-height: 120px; /* Content will scroll if it exceeds this height */
        background-color: #fff;
        color: #34495e;
        transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        overflow-y: auto; /* Show scrollbar if content exceeds max-height */
        box-sizing: border-box; /* Ensure padding and border are included in height calculation */
    }
    textarea::placeholder {
        color: #95a5a6;
    }

    textarea:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
    }

    textarea:disabled {
        background-color: #e9ecef;
        cursor: not-allowed;
        opacity: 0.8;
    }

    button {
        width: 42px;
        height: 42px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
            background-color 0.2s ease,
            transform 0.1s ease;
        padding: 0;
        flex-shrink: 0;
    }

    button:hover:not(:disabled) {
        background-color: #2980b9;
        transform: translateY(-1px);
    }
    button:active:not(:disabled) {
        transform: translateY(0px);
    }

    button:disabled {
        background-color: #a3b1bd;
        cursor: not-allowed;
        opacity: 0.7;
    }
    .send-icon {
        width: 20px;
        height: 20px;
        fill: currentColor;
    }
    .loading-icon path {
        fill: currentColor;
    }
</style>
