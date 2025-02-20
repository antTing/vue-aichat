# vue-aichat

vue3仿 chatgpt/deepseek web，兼容deepseek/OpenAI API接口风格的模型。在根目录下手动添加 .env 文件，配置API Key。（如下所示）

## Project Description

A chat application based on Vue 3, inspired by the design of ChatGPT and DeepSeek. It supports the use of OpenAI API models and is compatible with the API interface style of DeepSeek. The project is currently in the early stages of development and is still under active maintenance.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```

## ⚡ Tips

node version <a href="https://nodejs.org/" target="_blank">>=20.16.0</a>

### environment variables

Manually add .env files to the root directory of the project.

```js
// Your API Key
VITE_API_KEY=sk-xxx

// Or other OpenAI API interface style models
VITE_BASE_URL=https://api.openai.com/v1
```
