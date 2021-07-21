import React from 'react';
import * as theme from '../theme';
import * as api from '../definitions/api';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-tomorrow_night_bright";
import { Button, Divider, Typography, } from '@material-ui/core';
import { QueryResult } from '../definitions/types';
import { XGrid, GridColDef } from '@material-ui/x-grid';
import { DeployDialog } from './deployDialog';
import { SnackbarStatus } from './Snackbar';

interface Props {
    openSnackbar: (status: SnackbarStatus, message: string, closeDelay: number) => void;
}

export const CodeEditor = (props: Props) => {
    const [deployOpen, setDeployOpen] = React.useState(false);
    const [code, setCode] = React.useState("");
    const [secondaryCode, setSecondaryCode] = React.useState("");
    const [outputState, setOutputState] = React.useState<{ columns: GridColDef[], rows: any[] }>({
        columns: [],
        rows: [],
    })

    const onChange = (text: string) => {
        setCode(text);
        localStorage.setItem("savedCode", text);
    }

    const onChangeSecondary = (text: string) => {
        setSecondaryCode(text);
        localStorage.setItem("savedSecondaryCode", text);
    }

    React.useEffect(() => {
        const savedCode = localStorage.getItem("savedCode");
        if (savedCode)
            setCode(savedCode);
        const savedSecondaryCode = localStorage.getItem("savedSecondaryCode");
        if (savedSecondaryCode)
            setSecondaryCode(savedSecondaryCode);
    }, []);

    const updateOutputState = (output: QueryResult) => {
        let columns: GridColDef[] = [];

        if (output.data && output.data.length > 0) {
            Object.getOwnPropertyNames(output.data[0]).forEach((n) => {
                columns.push({
                    field: n,
                    headerName: n,
                    width: 200,
                })
            });

            output.data = output.data.concat(JSON.parse(JSON.stringify(output.data)))
            output.data = output.data.concat(JSON.parse(JSON.stringify(output.data)))
            output.data = output.data.concat(JSON.parse(JSON.stringify(output.data)))

            columns.unshift({ // identity column
                field: "id",
                headerName: "Index",
                width: 150,
            })
            // populate data with local identity
            for (let i = 0; i < output.data.length; i++) {
                output.data[i]["id"] = i;
            }
        }

        setOutputState({
            rows: output.data ?? [],
            columns
        });
    };

    const runAndTest = () => {
        api.submitSQL(code, secondaryCode).then((result) => {
            console.log(result);
            updateOutputState(result);
        });
    }

    // only run the test code
    const test = () => {
        api.submitSQL(secondaryCode, "").then((result) => {
            console.log(result);
            updateOutputState(result);
        });
    }

    const deploy = () => {
        setDeployOpen(true);
    }

    return (
        <React.Fragment>
            <div>
                <Typography color="textPrimary">Main Code Editor</Typography>
                <AceEditor
                    placeholder="Put your function create code here"
                    mode="sql"
                    theme="tomorrow_night_bright"
                    onChange={onChange}
                    value={code}
                    tabSize={4}
                    showPrintMargin={false}
                    width="100%"
                    fontSize="14px"
                    style={{ height: "60vh", marginBottom: "1rem" }}
                />
                <Typography color="textPrimary">Test Code Editor</Typography>
                <AceEditor
                    placeholder="Put your test code here"
                    mode="sql"
                    theme="tomorrow_night_bright"
                    onChange={onChangeSecondary}
                    value={secondaryCode}
                    tabSize={4}
                    showPrintMargin={false}
                    width="100%"
                    fontSize="14px"
                    style={{ height: "5vh", marginBottom: "1rem" }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "1rem" }}>
                    <Button size="large" variant="contained" onClick={test}>Test</Button>
                    <Button size="large" variant="contained" onClick={runAndTest}>{"Run & Test"}</Button>
                    <Button size="large" variant="contained" onClick={deploy}>Deploy</Button>
                </div>
                <Typography color="textPrimary">Output</Typography>
                <div style={{ height: "40vh" }}>
                    <XGrid
                        rows={outputState.rows}
                        columns={outputState.columns}
                        autoPageSize
                        disableSelectionOnClick
                        pagination
                    />
                </div>
            </div>
            <DeployDialog openSnackbar={props.openSnackbar} open={deployOpen} onClose={() => setDeployOpen(false)} code={code} />
        </React.Fragment>
    );
}