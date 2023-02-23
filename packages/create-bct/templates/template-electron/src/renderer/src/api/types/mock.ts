interface IUserRole {
  roleId: number
  name: string
}
export interface IUserList {
  id: number
  name: string
  role: IUserRole
  createTime: string
  updateTime: string
}
