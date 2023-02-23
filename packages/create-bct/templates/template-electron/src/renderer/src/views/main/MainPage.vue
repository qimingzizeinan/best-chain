<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useRequest } from '@renderer/hooks'
import { getAddrs } from '@renderer/api/index'
import { getUserList } from '@renderer/api/mock'
import { ref } from 'vue'
import {
  useParentWindow,
  openWindowByMainProcess,
} from '@renderer/hooks/windows/open'

const { openWindow, postMessage, listenData } = useParentWindow()

// 发起请求
const { data, loading, runParams } = useRequest(getAddrs, {
  apiKey: import.meta.env.VITE_APP_KEY,
})

const handleAgainRequest = () => {
  // 手动调用
  runParams({ apiKey: import.meta.env.VITE_APP_KEY })
}

getUserList()

const log = ref('')
const msg = ref('')

function handleOpenNewWindow() {
  // window.open打开窗口
  openWindow('/about', '_blank', { a: '1' })
  // 监听父窗口传过来的数据
  listenData(data => {
    console.log('子窗口data', data)
  })
  setTimeout(() => {
    // 向父窗口发送数据
    postMessage({ msgName: 'hello111', value: 'msg from your parent' })
  }, 3000)
  // windowOpenByMain('about', '/about')
}

function handleOpenNewWindowMain() {
  // 主进程打开新窗口
  openWindowByMainProcess('about', '/about')
}
</script>

<template>
  <div>
    <el-button type="primary" size="small" @click="handleOpenNewWindow">
      window.open打开新窗口
    </el-button>
  </div>
  <div>
    <el-button type="primary" size="small" @click="handleOpenNewWindowMain">
      主进程打开新窗口
    </el-button>
  </div>
  <RouterLink to="/about">关于</RouterLink>
  <!-- 请求 -->
  <el-button type="primary" size="small" @click="handleAgainRequest">
    重新请求
  </el-button>

  <div>{{ loading }}</div>
  <div>{{ data }}</div>

  <div>ipc调用</div>
  <div>
    <textarea v-model="log" cols="60" rows="10" disabled />
    <div style="margin-top: 20px">
      <input v-model="msg" type="text" placeholder="send msg to main process" />
      <button style="margin-left: 20px" @click="sendMsg">Send</button>
    </div>
  </div>
</template>

<style scoped></style>
