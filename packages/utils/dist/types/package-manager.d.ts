interface PackageOption {
    targetPath: string;
    storePath: string;
    name: string;
    version: string;
}
export declare class PackageManager {
    targetPath: string;
    storePath: string;
    packageName: string;
    packageVersion: string;
    npmFilePathPrefix: string;
    constructor(options: PackageOption);
    get npmFilePath(): string;
    prepare(): Promise<void>;
    install(): Promise<void>;
    exists(): Promise<boolean>;
    getPackage(isOriginal?: boolean): any;
    getRootFilePath(isOriginal?: boolean): string | null;
    getVersion(): Promise<any>;
    getLatestVersion(): Promise<any>;
    update(): Promise<void>;
}
export {};
