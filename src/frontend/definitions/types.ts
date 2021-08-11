export interface Window {

}

export interface InitializeResult {
    connectResult: string;
    browserServiceStarted: boolean;
    browserServiceShouldStart: boolean;
}

export interface QueryResult {
    data: any[];
    lineNumber: number;
    error: string;
}

export interface DeploySettings {
    deleteOldFunctionScripts: boolean;
    includeSchema: boolean;
    nameTemplate: string;
    prefixExclude: string;
    backendNameTemplate: string;
    classNamespace: string;
}

export const DeploySettingsDefault: DeploySettings = {
    deleteOldFunctionScripts: false,
    includeSchema: false,
    nameTemplate: "Script{#4} - {f}",
    prefixExclude: "udf_",
    backendNameTemplate: "{f}QueryReturnValue",
    classNamespace: ""
}

export interface DeployResult {
    error: string;
    result: string[];
}

export interface ConnectionInfo {
    user: string;
    password: string;
    server: string;
    database: string;
    connectionTimeoutMs: number;
    storePassword: boolean;
    trustServerCertificate: boolean;
    encrypt: boolean;
    autoStartServerBrowser: boolean;
}

export const ConnectionInfoDefault: ConnectionInfo = {
    user: "",
    password: "",
    server: "",
    database: "",
    connectionTimeoutMs: 10000,
    storePassword: false,
    trustServerCertificate: true,
    encrypt: false,
    autoStartServerBrowser: true
}

export interface Project {
    deploySettings: DeploySettings;
    connectionInfo: ConnectionInfo;
    migrationFolder: string;
    classFolder: string;
    mainCode: string;
    testCode: string;
}

export const ProjectDefault: Project = {
    deploySettings: DeploySettingsDefault,
    connectionInfo: ConnectionInfoDefault,
    migrationFolder: "",
    classFolder: "",
    mainCode: "",
    testCode: "",
}