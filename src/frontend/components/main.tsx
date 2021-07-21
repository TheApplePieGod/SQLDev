import { Button, Paper, TextField, Typography, Select, MenuItem } from '@material-ui/core';
import React from 'react';
import * as api from '../definitions/api';
import * as types from '../definitions/types';
import * as theme from '../theme';
import '../css/global.css'
import { CodeEditor } from './codeEditor';
const { ipcRenderer } = require("electron");

export const Main = () => {
    const [ready, setReady] = React.useState(false);
    const [statusText, setStatusText] = React.useState("Initializing...");

    const onInitialized = (e: any, result: string) => {
        if (result == "") {
            setReady(true);
        } else {
            setStatusText(`Error initializing: ${result}`);
        }
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
            <CodeEditor />
        </div>
        : <Typography color="textPrimary">{statusText}</Typography>
    );
}