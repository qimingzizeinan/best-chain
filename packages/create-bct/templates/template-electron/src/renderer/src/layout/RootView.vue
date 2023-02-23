<template>
  <RouterView></RouterView>
</template>

<script lang="ts" setup>
import { rendererInit } from '@ipc/index'
// 初始化渲染进程的ipc
rendererInit(window.electron.ipcRenderer)
</script>
