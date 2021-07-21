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
}