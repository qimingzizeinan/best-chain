/// <reference types="node" />
import { MakeDirectoryOptions, PathLike } from 'node:fs';
export declare function isEmptyDir(path: string): boolean;
export declare function isExistsSync(path: string): boolean;
export declare function emptyDirSync(dir: string): void;
export declare function mkdirSync(path: PathLike, options: MakeDirectoryOptions & {
    recursive: true;
}): void;
export declare function copyDir(srcDir: string, destDir: string): void;
export declare function copy(src: string, dest: string): void;
