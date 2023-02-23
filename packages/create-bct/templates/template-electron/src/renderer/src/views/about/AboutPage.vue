<template>
  <div>关于项目</div>
  <button @click="goHome">回到首页</button>
  <div @click="handlePostMainProcess">发送事件到主进程</div>
</template>

<script setup lang="ts">
import { useChildWindow } from '@renderer/hooks/windows/open'

const router = useRouter()

const { listenData, postMessage } = useChildWindow(window)

function goHome() {
  router.push({
    name: 'main',
  })
}

function handlePostMainProcess() {
  console.log('aboutn 主进程', window)
}

onMounted(() => {
  listenData(data => {
    console.log('父窗口data', data)
  })
  postMessage({ msgName: 'hello', value: 'msg from your parent' })
})
</script>
