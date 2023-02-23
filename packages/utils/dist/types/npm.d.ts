declare const defaultRegistry = "https://registry.npmjs.org";
declare function getNpmInfo(pkgName: string, registry?: string): Promise<any>;
declare function getLatestVersion(pkgName: string, registry?: string): Promise<any>;
declare function getNpmLatestSemverVersion(pkgName: string, baseVersion: any, registry?: string): Promise<any>;
export { defaultRegistry, getNpmInfo, getLatestVersion, getNpmLatestSemverVersion };
