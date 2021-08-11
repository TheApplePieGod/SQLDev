import React from 'react';
import * as theme from '../theme';
import * as api from '../definitions/api';
import * as types from '../definitions/types';
import { Button, Checkbox, Dialog, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import { SnackbarStatus } from './Snackbar';
import { ResultsDialog } from './resultsDialog';

interface Props {
    open: boolean;
    onClose: () => void;
    openSnackbar: (status: SnackbarStatus, message: string, closeDelay: number) => void;
    project: types.Project;
    updateProject: (updatedProject: types.Project) => void;
}

export const DeployDialog = (props: Props) => {
    const [deployResults, setDeployResults] = React.useState<string[]>([]);

    React.useEffect(() => {
        
    }, [props.project.deploySettings]);

    const updateMigrationFolder = () => {
        api.openFolderDialog(props.project.migrationFolder).then((data) => {
            if (data.length == 0) return;
            props.updateProject({...props.project, migrationFolder: data[0]});
        });
    }

    const updateClassFolder = () => {
        api.openFolderDialog(props.project.classFolder).then((data) => {
            if (data.length == 0) return;
            props.updateProject({...props.project, classFolder: data[0]});
        });
    }

    const deploy = () => {
        api.deployScript(props.project.migrationFolder, props.project.mainCode, props.project.deploySettings).then((migrationResult) => {
            if (migrationResult.error == "") {
                api.deployBackend(props.project.classFolder, props.project.mainCode, props.project.deploySettings).then((backendResult) => {
                    if (backendResult.error == "") {
                        props.openSnackbar(SnackbarStatus.Success, `Everything was successfully deployed`, 3000);
                        setDeployResults(backendResult.result);
                    } else {
                        props.openSnackbar(SnackbarStatus.Error, `Migration script deployed successfully, but there was an error deploying class: ${backendResult.error}`, 6000);
                    }
                });
            } else {
                props.openSnackbar(SnackbarStatus.Error, `Error deploying migration script: ${migrationResult.error}`, 6000);
            }
        });
    }

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            fullWidth
        >
            {props.open &&
                <React.Fragment>
                    <DialogTitle>Deploy</DialogTitle>
                    <div style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", gap: "0.5rem" }}>
                            <TextField
                                fullWidth
                                label="Migrations folder"
                                variant="outlined"
                                value={props.project.migrationFolder}
                                disabled
                            />
                            <Button variant="outlined" onClick={updateMigrationFolder}>Change</Button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", gap: "0.5rem" }}>
                            <TextField
                                fullWidth
                                label="Script name template"
                                variant="outlined"
                                value={props.project.deploySettings.nameTemplate}
                                onChange={(e) => props.updateProject({...props.project, deploySettings: {...props.project.deploySettings, nameTemplate: e.target.value}})}
                            />
                            <Tooltip
                                title={
                                    <Typography>
                                        <b>{"{#n}"}</b>: Incremental script number with n digits <br />
                                        <b>{"{f}"}</b>: Name of the function
                                    </Typography>
                                }
                            >
                                <InfoIcon />
                            </Tooltip>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Tooltip title={<Typography>Delete previous scripts with the same name containing older versions of this function</Typography>}>
                                <InfoIcon />
                            </Tooltip>
                            <FormControlLabel
                                control={<Checkbox checked={props.project.deploySettings.deleteOldFunctionScripts} onChange={(e) => props.updateProject({...props.project, deploySettings: {...props.project.deploySettings, deleteOldFunctionScripts: e.target.checked}})} />}
                                label="Delete old function scripts"
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Tooltip title={<Typography>Include the schema name in the output script file if specified in the create function</Typography>}>
                                <InfoIcon />
                            </Tooltip>
                            <FormControlLabel
                                control={<Checkbox checked={props.project.deploySettings.includeSchema} onChange={(e) => props.updateProject({...props.project, deploySettings: {...props.project.deploySettings, includeSchema: e.target.checked}})} />}
                                label="Include schema"
                            />
                        </div>
                        <hr />
                        <br />
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", gap: "0.5rem" }}>
                            <TextField
                                fullWidth
                                label="C# Class folder"
                                variant="outlined"
                                value={props.project.classFolder}
                                disabled
                            />
                            <Button variant="outlined" onClick={updateClassFolder}>Change</Button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", gap: "0.5rem" }}>
                            <TextField
                                fullWidth
                                label="Exclude function prefix"
                                variant="outlined"
                                value={props.project.deploySettings.prefixExclude}
                                onChange={(e) => props.updateProject({...props.project, deploySettings: {...props.project.deploySettings, prefixExclude: e.target.value}})}
                            />
                            <Tooltip title={<Typography>Optionally exclude any prefixes in the function name from the output C# class and file name</Typography>}>
                                <InfoIcon />
                            </Tooltip>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", gap: "0.5rem" }}>
                            <TextField
                                fullWidth
                                label="C# class name template"
                                variant="outlined"
                                value={props.project.deploySettings.backendNameTemplate}
                                onChange={(e) => props.updateProject({...props.project, deploySettings: {...props.project.deploySettings, backendNameTemplate: e.target.value}})}
                            />
                            <Tooltip
                                title={
                                    <Typography>
                                        <b>{"{f}"}</b>: Name of the function after prefix exclusion
                                    </Typography>
                                }
                            >
                                <InfoIcon />
                            </Tooltip>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", gap: "0.5rem" }}>
                            <TextField
                                fullWidth
                                label="Class namespace"
                                variant="outlined"
                                value={props.project.deploySettings.classNamespace}
                                onChange={(e) => props.updateProject({...props.project, deploySettings: {...props.project.deploySettings, classNamespace: e.target.value}})}
                            />
                            <Tooltip title={<Typography>The namespace the C# class should be put in</Typography>}>
                                <InfoIcon />
                            </Tooltip>
                        </div>
                    </div>
                    <Button variant="contained" style={{ backgroundColor: "#1f9e2c" }} onClick={deploy}>Deploy</Button>
                    <Button variant="contained" onClick={props.onClose}>Cancel</Button>
                    <ResultsDialog open={deployResults.length > 0} onClose={() => setDeployResults([])} results={deployResults} />
                </React.Fragment>
            }
        </Dialog>
    );
}