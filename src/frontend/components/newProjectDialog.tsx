import React from 'react';
import * as theme from '../theme';
import * as types from '../definitions/types';
import { Button, Checkbox, Dialog, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@material-ui/core';

interface Props {
    open: boolean;
    onClose: () => void;
    loadedProjects: Record<string, types.Project>;
    switchProject: (project: string) => void;
    setLoadedProjects: (newProjects: Record<string, types.Project>) => void;
}

export const NewProjectDialog = (props: Props) => {
    const [projectName, setProjectName] = React.useState("");

    const handleClose = () => {
        props.onClose();
        setProjectName("");
    }

    const create = () => {
        const newName = projectName.trim();
        props.switchProject(newName);

        let newProjects = props.loadedProjects;
        newProjects[newName] = types.ProjectDefault;
        props.setLoadedProjects(newProjects);

        handleClose();
    }

    return (
        <Dialog
            open={props.open}
            onClose={handleClose}
            fullWidth
            maxWidth="lg"
        >
            {props.open &&
                <React.Fragment>
                    <DialogTitle>New Project</DialogTitle>
                    <div style={{ padding: "1rem" }}>
                        <TextField
                            fullWidth
                            onChange={(e) => setProjectName(e.target.value)}
                            label="Project Name"
                            variant="outlined"
                            value={projectName}
                        />
                    </div>
                    {Object.getOwnPropertyNames(props.loadedProjects).some(p => p.toLowerCase() == projectName.toLowerCase().trim()) && <Typography style={{ color: "#e8191c" }}>This name is already in use</Typography>}
                    <Button variant="contained" disabled={Object.getOwnPropertyNames(props.loadedProjects).some(p => p.toLowerCase() == projectName.toLowerCase().trim())} style={{ backgroundColor: "#1f9e2c" }} onClick={create}>Create</Button>
                    <Button variant="contained" onClick={handleClose}>Cancel</Button>
                </React.Fragment>
            }
        </Dialog>
    );
}