import { defineStore } from 'pinia'
interface IUser {
  name: string
}
export const useUserStore = defineStore({
  id: 'user', // id必填，且需要唯一
  // state
  state: (): IUser => {
    return {
      name: '',
    }
  },
  // getters
  getters: {},
  // actions
  actions: {},
})
