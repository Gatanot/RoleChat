# 项目接受

这是一个ai对话界面.特点是实现了对历史消息的编辑,可以引导ai向你的意图靠近.对roleplay和ai写作有一定帮助

# 注意事项

## `.env`文件

如果你希望从源码构建这个项目,请一定注意添加`.env`文件,并在其中添加以下内容:
- OPENAI_API_KEY
- OPENAI_BASE_URL
- OPENAI_MODEL_NAME

你的API需要是OpenAI格式的.

## 下载上传对话

下载上传的文件只能是`json`文件.具体内容格式如下:
```
{
  "systemPrompt": "",
  "messages": [
    {
      "content": "",
      "role": "user",
      "id": 0
    },
    {
      "content": "",
      "role": "assistant",
      "id": 1
    },
    {
      "content": "",
      "role": "user",
      "id": 2
    },
    ...
  ]
}
```