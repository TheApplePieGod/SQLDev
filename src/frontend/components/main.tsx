import { Button, Paper, TextField, Typography, Select, MenuItem, FormControl, InputLabel, Fab, IconButton } from '@material-ui/core';
import React from 'react';
import * as api from '../definitions/api';
import * as types from '../definitions/types';
import * as theme from '../theme';
import '../css/global.css'
import { CodeEditor } from './codeEditor';
import { GlobalSnackbar, SnackbarState, SnackbarStatus } from './Snackbar';
import { NewProjectDialog } from './newProjectDialog';
import DeleteIcon from '@material-ui/icons/Delete';
import { ConfirmDialog } from './confirmDialog';
import { ConnectDialog } from './connectDialog';
import { InfoDialog } from './infoDialog';
import InfoIcon from '@material-ui/icons/Info'
const { ipcRenderer } = require("electron");

const INITIAL_STATUS_TEXT = "Initializing...";

export const Main = () => {
    const [connecting, setConnecting] = React.useState(false);
    const [ready, setReady] = React.useState(false);
    const [statusText, setStatusText] = React.useState(INITIAL_STATUS_TEXT);
    const [project, setProject] = React.useState("");
    const [newProjectOpen, setNewProjectOpen] = React.useState(false);
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [connectOpen, setConnectOpen] = React.useState(false);
    const [infoOpen, setInfoOpen] = React.useState(false);
    const [closing, setClosing] = React.useState(false);
    const [loadedProjects, setLoadedProjects] = React.useState<Record<string, types.Project>>({});
    const [snackbarState, setSnackbarState] = React.useState<SnackbarState>({
        status: SnackbarStatus.Closed,
        message: "",
        closeDelay: 3000
    });

    const openSnackbar = (status: SnackbarStatus, message: string, closeDelay: number) => {
        setSnackbarState({
            status,
            message,
            closeDelay
        });
    }

    const onInitialized = (e: any, result: types.InitializeResult) => {
        if (result.connectResult == "") {
            setReady(true);
        } else {
            setStatusText(`Error initializing: ${result.connectResult}`);
        }
        setConnecting(false);

        if (result.browserServiceShouldStart && !result.browserServiceStarted)
            openSnackbar(SnackbarStatus.Error, "Error: SQL Server Browser service could not be started", 5000);
    }

    const updateProject = (newProject: string) => {
        setProject(newProject);
        localStorage.setItem("project", newProject);
    }

    const switchProject = (newProject: string) => {
        updateProject(newProject);
        setStatusText(INITIAL_STATUS_TEXT);
        setReady(false);
        setConnecting(false);
        setClosing(true);
        api.closeConnection().then(() => setClosing(false));
    }

    const updateLoadedProjects = (newProjects: Record<string, types.Project>) => {
        setLoadedProjects({...newProjects});
        localStorage.setItem("projectList", JSON.stringify(newProjects));
    }

    const loadAllProjects = () => {
        const projectsString = localStorage.getItem("projectList");
        if (projectsString) {
            const projectList: Record<string, types.Project> = JSON.parse(projectsString);
            setLoadedProjects(projectList);
            if (Object.getOwnPropertyNames(projectList).length == 0)
                updateProject("");
        } else {
            setLoadedProjects({});
            updateProject("");
        }
    }

    const deleteProject = () => {
        setConfirmOpen(false);
        let newProjects = loadedProjects;
        delete newProjects[project];
        updateLoadedProjects(newProjects);
        switchProject("");
    }

    const updateLoadedProject = (updatedProject: types.Project) => {
        let newProjects = loadedProjects;
        newProjects[project] = updatedProject;
        updateLoadedProjects(newProjects);
    }

    React.useEffect(() => {
        const savedProject = localStorage.getItem("project");
        if (savedProject)
            setProject(savedProject);

        loadAllProjects();

        ipcRenderer.on('initialized', onInitialized);
        return (() => {
            ipcRenderer.off('initialized', onInitialized);
        });
    }, [])

    return (
        <div>
            {closing &&
                <div style={{ backgroundColor: "rgba(255,255,255,0.15)", position: "fixed", width: "100vw", height: "100vh", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography color="textPrimary" variant="h2">Cleaning up...</Typography>
                </div>
            }
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel id="project-select-label">Selected project</InputLabel>
                    <Select
                        labelId="project-select-label"
                        label="Selected project"
                        value={project}
                        disabled={connecting}
                        onChange={(e) => switchProject(e.target.value as string)}
                    >
                        {
                            Object.getOwnPropertyNames(loadedProjects).map((p, i) => {
                                return <MenuItem key={i} value={p}>{p}</MenuItem>
                            })    
                        }
                    </Select>
                </FormControl>
                <Fab disabled={connecting} size="small" style={{ fontSize: "32px", paddingBottom: "0.4rem", backgroundColor: "#1f9e2c" }} onClick={() => setNewProjectOpen(true)}>+</Fab>
                {project != "" && <Fab disabled={connecting} size="small" style={{ backgroundColor: "#9b3032" }} onClick={() => setConfirmOpen(true)}><DeleteIcon /></Fab>}
            </div>
            {project != "" &&
                (ready ?
                    <CodeEditor project={loadedProjects[project]} openSnackbar={openSnackbar} updateProject={updateLoadedProject} />
                    :
                    <div>
                        {(connecting || statusText != INITIAL_STATUS_TEXT) &&
                            <Typography style={{ marginTop: "0.5rem" }} color="textPrimary">{statusText}</Typography>
                        }
                        <div style={{ display: "flex", alignItems: "center", marginTop: "0.25rem" }}>
                            <Button disabled={connecting} variant="contained" onClick={() => setConnectOpen(true)}>Connect</Button>
                            <IconButton onClick={() => setInfoOpen(true)}><InfoIcon /></IconButton>
                        </div>
                    </div>
                )
            }
            <NewProjectDialog
                open={newProjectOpen}
                onClose={() => setNewProjectOpen(false)}
                loadedProjects={loadedProjects}
                switchProject={switchProject}
                setLoadedProjects={updateLoadedProjects}
            />
            <ConfirmDialog
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={deleteProject}
                body="This action cannot be undone."
            />
            <InfoDialog
                open={infoOpen}
                onClose={() => setInfoOpen(false)}
            />
            <GlobalSnackbar state={snackbarState} onClose={() => setSnackbarState({...snackbarState, status: SnackbarStatus.Closed})} />
            {project != "" &&
                <ConnectDialog
                    open={connectOpen}
                    onClose={() => setConnectOpen(false)}
                    project={loadedProjects[project]}
                    updateProject={updateLoadedProject}
                    setConnecting={(c) => { setConnecting(c); setStatusText(INITIAL_STATUS_TEXT); }}
                />
            }
        </div>
    );
}