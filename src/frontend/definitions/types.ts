export interface Window {

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
    classNamespace: string;
}

export interface DeployResult {
    error: string;
    result: string[];
}