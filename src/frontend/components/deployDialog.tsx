import React from 'react';
import * as theme from '../theme';
import * as api from '../definitions/api';
import * as types from '../definitions/types';
import { Button, Checkbox, Dialog, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';

interface Props {
    open: boolean;
    onClose: () => void;
    code: string;
    openSnackbar: (status: SnackbarStatus, message: string, closeDelay: number) => void;
}

export const DeployDialog = (props: Props) => {
    const [migrationsFolder, setMigrationsFolder] = React.useState("");
    const [classFolder, setClassFolder] = React.useState("");
    const [deploySettings, setDeploySettings] = React.useState<types.DeploySettings>({
        deleteOldFunctionScripts: false,
        includeSchema: false,
        nameTemplate: "Script{#4} - {f}",
        prefixExclude: "udf_",
        classNamespace: ""
    })

    React.useEffect(() => {
        const savedMigrationsFolder = localStorage.getItem("migrationsFolder");
        if (savedMigrationsFolder)
            setMigrationsFolder(savedMigrationsFolder);
        const savedClassFolder = localStorage.getItem("classFolder");
        if (savedClassFolder)
            setClassFolder(savedClassFolder);
        const savedDeploySettings = localStorage.getItem("deploySettings");
        if (savedDeploySettings)
            setDeploySettings(JSON.parse(savedDeploySettings));
    }, []);

    React.useEffect(() => {
        localStorage.setItem("deploySettings", JSON.stringify(deploySettings));
    }, [deploySettings]);

    const updateMigrationsFolder = () => {
        api.openFolderDialog(migrationsFolder).then((data) => {
            if (data.length == 0) return;
            setMigrationsFolder(data[0]);
            localStorage.setItem("migrationsFolder", data[0]);
        });
    }

    const updateClassFolder = () => {
        api.openFolderDialog(classFolder).then((data) => {
            if (data.length == 0) return;
            setClassFolder(data[0]);
            localStorage.setItem("classFolder", data[0]);
        });
    }

    const deploy = () => {
        api.deployScript(migrationsFolder, props.code, deploySettings).then((migrationResult) => {
            if (migrationResult.error == "") {
                api.deployBackend(classFolder, props.code, deploySettings).then((backendResult) => {
                    if (backendResult.error == "") {

                    }
                });
            }
        });
    }

    const formatTemplateString = () => {
        
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
                                value={migrationsFolder}
                                disabled
                            />
                            <Button variant="outlined" onClick={updateMigrationsFolder}>Change</Button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", gap: "0.5rem" }}>
                            <TextField
                                fullWidth
                                label="Script name template"
                                variant="outlined"
                                value={deploySettings.nameTemplate}
                                onChange={(e) => setDeploySettings({...deploySettings, nameTemplate: e.target.value})}
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
                                control={<Checkbox checked={deploySettings.deleteOldFunctionScripts} onChange={(e) => setDeploySettings({...deploySettings, deleteOldFunctionScripts: e.target.checked})} />}
                                label="Delete old function scripts"
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Tooltip title={<Typography>Include the schema name in the output script file if specified in the create function</Typography>}>
                                <InfoIcon />
                            </Tooltip>
                            <FormControlLabel
                                control={<Checkbox checked={deploySettings.includeSchema} onChange={(e) => setDeploySettings({...deploySettings, includeSchema: e.target.checked})} />}
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
                                value={classFolder}
                                disabled
                            />
                            <Button variant="outlined" onClick={updateClassFolder}>Change</Button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", gap: "0.5rem" }}>
                            <TextField
                                fullWidth
                                label="Exclude function prefix"
                                variant="outlined"
                                value={deploySettings.prefixExclude}
                                onChange={(e) => setDeploySettings({...deploySettings, prefixExclude: e.target.value})}
                            />
                            <Tooltip title={<Typography>Optionally exclude any prefixes in the function name from the output C# class and file name</Typography>}>
                                <InfoIcon />
                            </Tooltip>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", gap: "0.5rem" }}>
                            <TextField
                                fullWidth
                                label="Class namespace"
                                variant="outlined"
                                value={deploySettings.classNamespace}
                                onChange={(e) => setDeploySettings({...deploySettings, classNamespace: e.target.value})}
                            />
                            <Tooltip title={<Typography>The namespace the C# class should be put in</Typography>}>
                                <InfoIcon />
                            </Tooltip>
                        </div>
                    </div>
                    <Button variant="contained" style={{ backgroundColor: "#1f9e2c" }} onClick={deploy}>Deploy</Button>
                    <Button variant="contained" onClick={props.onClose}>Cancel</Button>
                </React.Fragment>
            }
        </Dialog>
    );
}