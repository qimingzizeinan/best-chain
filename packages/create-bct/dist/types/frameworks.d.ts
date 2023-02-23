type ColorFunc = (str: string | number) => string;
export type ProjectType = 'config' | 'project';
export type Framework<T> = {
    name: T;
    display: string;
    ready: boolean;
    notReadyTip: string;
    projectType: ProjectType;
    color: ColorFunc;
};
export declare const FRAMEWORKS: Framework<"electron" | "cocos" | "deploy-config">[];
export type FrameworkNames = (typeof FRAMEWORKS)[number]['name'] | '';
export declare function getFrameworkByName(name: FrameworkNames): Framework<"electron" | "cocos" | "deploy-config">[];
export declare function getTemplates(): ("electron" | "cocos" | "deploy-config")[];
export {};
