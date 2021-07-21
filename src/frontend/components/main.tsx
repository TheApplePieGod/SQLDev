import { Button, Paper, TextField, Typography, Select, MenuItem } from '@material-ui/core';
import React from 'react';
import * as api from '../definitions/api';
import * as types from '../definitions/types';
import * as theme from '../theme';
import '../css/global.css'
import { CodeEditor } from './codeEditor';
import { GlobalSnackbar, SnackbarState, SnackbarStatus } from './Snackbar';
const { ipcRenderer } = require("electron");

export const Main = () => {
    const [ready, setReady] = React.useState(false);
    const [statusText, setStatusText] = React.useState("Initializing...");
    const [snackbarState, setSnackbarState] = React.useState<SnackbarState>({
        status: SnackbarStatus.Closed,
        message: "",
        closeDelay: 3000
    });

    const onInitialized = (e: any, result: string) => {
        if (result == "") {
            setReady(true);
        } else {
            setStatusText(`Error initializing: ${result}`);
        }
    }

    const openSnackbar = (status: SnackbarStatus, message: string, closeDelay: number) => {
        setSnackbarState({
            status,
            message,
            closeDelay
        });
    }

    React.useEffect(() => {
        ipcRenderer.on('initialized', onInitialized);
        api.initialize();
        return (() => {
            ipcRenderer.off('initialized', onInitialized);
        });
    }, [])

    return (
        ready ?
        <div>
            <CodeEditor openSnackbar={openSnackbar} />
            <GlobalSnackbar state={snackbarState} onClose={() => setSnackbarState({...snackbarState, status: SnackbarStatus.Closed})} />
        </div>
        : <Typography color="textPrimary">{statusText}</Typography>
    );
}