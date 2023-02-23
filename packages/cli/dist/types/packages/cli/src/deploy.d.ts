import { NodeSSH } from 'node-ssh';
import { DeployConfig, LocalFileConfig, Server, ServerFileConfig } from './interfaces/deploy.interface';
export declare function step(msg: string): void;
export declare function errorStep(msg: string): void;
export declare function info(msg: string): void;
export declare function createSSH(): NodeSSH;
/**
 * @param {*} _path
 * @param {*} _file
 */
export declare const resolvePath: (_path: string, _file: string) => string;
/**
 * Select environment to deploy.
 * @param {*} CONFIG configuration
 */
export declare function selectDeployEnv(servers: Server[]): Promise<Server>;
export declare function getConfig(): Promise<DeployConfig | undefined>;
/**
 * Compress local files
 * @param {*} localConfig local configuration
 * @param {*} next
 */
export declare function compressFiles(localConfig: LocalFileConfig): Promise<void>;
/**
 * deploy
 * @param localConfig
 * @param serverConfig
 * @param next
 */
export declare function deploy(localConfig: LocalFileConfig, serverConfig: ServerFileConfig): Promise<void>;
/**
 * get time
 * @returns 2020-6-19_00-00-00
 */
export declare const getTime: () => string;
export declare function start(): Promise<void>;
