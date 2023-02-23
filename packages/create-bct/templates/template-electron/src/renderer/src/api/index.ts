import request from '@renderer/utils/request'
export const getAddrs = () => {
  return request.get(
    'http://rap2api.taobao.org/app/mock/275371/example/1610522232038',
  )
}
