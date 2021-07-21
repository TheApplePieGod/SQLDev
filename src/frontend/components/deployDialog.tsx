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
}

export const DeployDialog = (props: Props) => {
    const [migrationsFolder, setMigrationsFolder] = React.useState("");
    const [nameTemplate, setNameTemplate] = React.useState("Script{#4} - {f}");
    const [deploySettings, setDeploySettings] = React.useState<types.DeploySettings>({
        deleteOldFunctionScripts: false,
        includeSchema: false,
    })

    React.useEffect(() => {
        const savedMigrationsFolder = localStorage.getItem("migrationsFolder");
        if (savedMigrationsFolder)
            setMigrationsFolder(savedMigrationsFolder);
        const savedNameTemplate = localStorage.getItem("nameTemplate");
        if (savedNameTemplate)
            setNameTemplate(savedNameTemplate);
    }, []);

    const updateMigrationsFolder = () => {
        api.openFolderDialog(migrationsFolder).then((data) => {
            if (data.length == 0) return;
            setMigrationsFolder(data[0]);
            localStorage.setItem("migrationsFolder", data[0]);
        });
    }

    const updateNameTemplate = (name: string) => {
        setNameTemplate(name);
        localStorage.setItem("nameTemplate", name);
    }

    const deploy = () => {
        // api.deployScript(migrationsFolder, props.code, nameTemplate, deploySettings).then((result) => {
        //     console.log(result);
        // });
        api.deployBackend(migrationsFolder, props.code, deploySettings).then((result) => {
            console.log(result);
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
                                value={nameTemplate}
                                onChange={(e) => updateNameTemplate(e.target.value)}
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
                    </div>
                    <Button variant="contained" style={{ backgroundColor: "#1f9e2c" }} onClick={deploy}>Deploy</Button>
                </React.Fragment>
            }
        </Dialog>
    );
}