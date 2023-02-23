import request from '@renderer/service'
import type { IUserList } from './types/mock'
export const getUserList = () => {
  return request<any, IUserList[]>({
    url: '/mock/getUserList',
    method: 'get',
  })
}
