import React from 'react';
import { Button, Checkbox, Dialog, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@material-ui/core';

interface Props {
    open: boolean;
    onClose: () => void;
}

export const InfoDialog = (props: Props) => {
    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            fullWidth
            maxWidth="md"
        >
            {props.open &&
                <React.Fragment>
                    <DialogTitle>Connection Troubleshooting</DialogTitle>
                    <div style={{ padding: "1rem" }}>
                        <Typography color="textPrimary">{`- Make sure your server allows SQL authentication. Enable it in your server's security properties and restart the server.
                        `}</Typography>
                        <Typography color="textPrimary">{`- For named instances, make sure to enable the TCP protocol.
                            Open Computer Management -> Services and Applications -> SQL Server Configuration Manager -> SQL Server Network Configuration -> Protocols for <your server> -> TCP/IP -> Enable.
                            Make sure to restart the server after this.
                        `}</Typography>
                        <Typography color="textPrimary">{`- For named instances, make sure to enable and run the SQL Server Browser service. If the setting is enabled,
                        SQL Dev will attempt to do that itself if given administrator privileges.  
                        `}</Typography>
                        <Typography color="textPrimary">{`- For named instances, windows authentication will not work. You will need to setup a login and user on the database
                        with the correct permission levels (e.g. db_owner) (see https://www.guru99.com/sql-server-create-user.html)
                        `}</Typography>
                    </div>
                    <Button variant="contained" onClick={props.onClose}>Close</Button>
                </React.Fragment>
            }
        </Dialog>
    );
}