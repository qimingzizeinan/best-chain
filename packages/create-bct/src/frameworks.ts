import { yellow, blue, green } from 'kolorist'

type ColorFunc = (str: string | number) => string

export type ProjectType = 'config' | 'project'

export type Framework<T> = {
  name: T
  display: string
  ready: boolean
  notReadyTip: string
  projectType: ProjectType
  color: ColorFunc
}

function defineConfigs<T extends string>(configs: Array<Framework<T>>): Array<Framework<T>> {
  return configs
}

export const FRAMEWORKS = defineConfigs([
  {
    name: 'electron',
    display: 'Electron',
    ready: true,
    notReadyTip: 'Under development',
    projectType: 'project',
    color: yellow
  },
  {
    name: 'cocos',
    display: 'Cocos',
    ready: false,
    notReadyTip: 'Under development',
    projectType: 'project',
    color: blue
  },
  {
    name: 'deploy-config',
    display: 'DeployConfig',
    ready: true,
    notReadyTip: 'Under development',
    projectType: 'config',
    color: green
  }
])

export type FrameworkNames = (typeof FRAMEWORKS)[number]['name'] | ''

export function getFrameworkByName(name: FrameworkNames) {
  return FRAMEWORKS.filter((framework) => framework.name === name)
}

export function getTemplates() {
  return FRAMEWORKS.map((item) => item.name)
}
