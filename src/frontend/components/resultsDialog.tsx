import React from 'react';
import * as theme from '../theme';
import { Button, Checkbox, Dialog, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@material-ui/core';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-csharp";
import "ace-builds/src-noconflict/theme-tomorrow_night_bright";

interface Props {
    open: boolean;
    onClose: () => void;
    results: string[];
}

export const ResultsDialog = (props: Props) => {
    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            fullWidth
            maxWidth="lg"
        >
            {props.open &&
                <React.Fragment>
                    <DialogTitle>Results</DialogTitle>
                    <div style={{ padding: "1rem" }}>
                        <Typography>Drop these into your DatabaseContext class and OnModelCreating function, respectively</Typography>
                        <br />
                        {
                            props.results.map((result, i) => {
                                return (
                                    <AceEditor
                                        key={i}
                                        placeholder={`Result ${i}`}
                                        mode="csharp"
                                        theme="tomorrow_night_bright"
                                        readOnly
                                        value={result}
                                        tabSize={4}
                                        showPrintMargin={false}
                                        width="100%"
                                        fontSize="14px"
                                        style={{ height: "45px", marginBottom: "1rem" }}
                                    />
                                );
                            })
                        }
                    </div>
                    <Button variant="contained" onClick={props.onClose}>Close</Button>
                </React.Fragment>
            }
        </Dialog>
    );
}