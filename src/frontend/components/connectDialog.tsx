import React from 'react';
import { Button, Checkbox, Dialog, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@material-ui/core';
import * as types from '../definitions/types';
import * as api from '../definitions/api';
import InfoIcon from '@material-ui/icons/Info';

interface Props {
    open: boolean;
    onClose: () => void;
    project: types.Project,
    updateProject: (updatedProject: types.Project) => void;
    setConnecting: (connecting: boolean) => void;
}

export const ConnectDialog = (props: Props) => {
    const [password, setPassword] = React.useState("");

    const handleClose = () => {
        props.onClose();
        setPassword("");
    }

    const handleConnect = () => {
        handleClose();
        props.setConnecting(true);

        let connectionInfo = {...props.project.connectionInfo};
        connectionInfo.password = password;

        api.initialize(connectionInfo);
    }

    const updatePassword = (newPassword: string) => {
        setPassword(newPassword);
        if (props.project.connectionInfo.storePassword) {
            props.updateProject({...props.project, connectionInfo: {...props.project.connectionInfo, password: newPassword}})
        }
    }

    const updateStorePassword = (store: boolean) => {
        if (store)
            props.updateProject({...props.project, connectionInfo: {...props.project.connectionInfo, storePassword: store, password: password}});
        else
            props.updateProject({...props.project, connectionInfo: {...props.project.connectionInfo, storePassword: store, password: ""}})
    }

    React.useEffect(() => {
        if (props.open)
            setPassword(props.project.connectionInfo.password);
    }, [props.open]);

    return (
        <Dialog
            open={props.open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
        >
            {props.open &&
                <React.Fragment>
                    <DialogTitle>Connect</DialogTitle>
                    <div style={{ padding: "1rem" }}>
                        <TextField
                            fullWidth
                            label="User"
                            variant="outlined"
                            value={props.project.connectionInfo.user}
                            onChange={(e) => props.updateProject({...props.project, connectionInfo: {...props.project.connectionInfo, user: e.target.value}})}
                            style={{ marginBottom: "0.75rem" }}
                        />
                        <TextField
                            fullWidth
                            onChange={(e) => updatePassword(e.target.value)}
                            label="Password"
                            variant="outlined"
                            value={password}
                            style={{ marginBottom: "0.75rem" }}
                        />
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", gap: "0.5rem" }}>
                            <TextField
                                fullWidth
                                label="Server"
                                variant="outlined"
                                value={props.project.connectionInfo.server}
                                onChange={(e) => props.updateProject({...props.project, connectionInfo: {...props.project.connectionInfo, server: e.target.value}})}
                                style={{ marginBottom: "0.75rem" }}
                            />
                            <Tooltip title={<Typography>If using a named instance (i.e. COMPUTER\SQLEXPRESS), make sure to include the entire name</Typography>}>
                                <InfoIcon />
                            </Tooltip>
                        </div>
                        <TextField
                            fullWidth
                            label="Database"
                            variant="outlined"
                            value={props.project.connectionInfo.database}
                            onChange={(e) => props.updateProject({...props.project, connectionInfo: {...props.project.connectionInfo, database: e.target.value}})}
                            style={{ marginBottom: "0.75rem" }}
                        />
                        <FormControlLabel
                            control={<Checkbox checked={props.project.connectionInfo.storePassword} onChange={(e) => updateStorePassword(e.target.checked)} />}
                            label="Store password"
                        /> <br />
                        <FormControlLabel
                            control={<Checkbox checked={props.project.connectionInfo.trustServerCertificate} onChange={(e) => props.updateProject({...props.project, connectionInfo: {...props.project.connectionInfo, trustServerCertificate: e.target.checked}})} />}
                            label="Trust server certificate"
                        /> <br />
                        <FormControlLabel
                            control={<Checkbox checked={props.project.connectionInfo.encrypt} onChange={(e) => props.updateProject({...props.project, connectionInfo: {...props.project.connectionInfo, encrypt: e.target.checked}})} />}
                            label="Encrypt"
                        /> <br />
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <FormControlLabel
                                control={<Checkbox checked={props.project.connectionInfo.autoStartServerBrowser} onChange={(e) => props.updateProject({...props.project, connectionInfo: {...props.project.connectionInfo, autoStartServerBrowser: e.target.checked}})} />}
                                label="Start SQL server browser"
                            />
                            <Tooltip title={<Typography>Attempt to start the SQL Server Browser service. This is required to enable connections to named instances (i.e. "SQLEXPRESS"). If disabled, you will likely have to start it manually (Note: admin permissions are required to start the service).</Typography>}>
                                <InfoIcon />
                            </Tooltip>
                        </div>
                    </div>
                    <Button variant="contained" style={{ backgroundColor: "#1f9e2c" }} onClick={handleConnect}>Connect</Button>
                    <Button variant="contained" onClick={handleClose}>Cancel</Button>
                </React.Fragment>
            }
        </Dialog>
    );
}