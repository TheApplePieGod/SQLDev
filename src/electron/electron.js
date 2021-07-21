// Modules to control application life and create native browser window
import { app, BrowserWindow, Menu, Tray, ipcMain, session, dialog } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as os from 'os';
import * as sql from 'mssql';
import * as fs from 'fs'
import { exec, execSync } from 'child_process';

const isPackaged = require('electron-is-packaged').isPackaged;

app.commandLine.appendSwitch('remote-debugging-port', '9999');
app.setAppUserModelId(process.execPath);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let tray;
let isQuiting = false;

const reactDevToolsPath = path.join(os.homedir(), // verify this path
  "\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1\\Extensions\\fmkadmapgofadopljbjfkapdkoienihi\\4.10.1_0"
);

async function createWindow () {
	// Create the browser window.
	if (process.env.NODE_ENV !== 'development' || app.isPackaged || isPackaged) {
		Menu.setApplicationMenu(null);
	} else {
		//await session.defaultSession.loadExtension(reactDevToolsPath);
	}
	mainWindow = new BrowserWindow({
		width: 1920,
		height: 1080,
		icon: path.resolve(__dirname, './favicon.ico'),
		webPreferences: {
			//sandbox: true,
			nodeIntegration: true,
			contextIsolation: false,
			backgroundThrottling: false
		}
	});

	// Open the DevTools.
	//mainWindow.webContents.openDevTools()

	// Emitted when the window is closed.
	mainWindow.on('closed', function(e) {
		mainWindow = null;
	})

	if (process.env.NODE_ENV === 'development' && !app.isPackaged && !isPackaged) {
		mainWindow.loadURL(`http://localhost:4000`);
	} else {
		mainWindow.loadURL(
			`file:\\\\${__dirname}\\index.html`
		);
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  	app.quit()
} else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		// Someone tried to run a second instance, we should focus our window.
		if (mainWindow) {
		if (mainWindow.isMinimized()) mainWindow.restore()
		if (!mainWindow.isVisible()) mainWindow.show()
			mainWindow.focus()
		}
	})

	app.on('ready', createWindow)
}

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) createWindow()
})

// begin app code
// -----------------------------------------------------

// make sure to include an info section about this & the tcp thing & creating a user
ipcMain.handle('initialize', async (event) => {
	exec('net start \"SQL Server Browser\"', (err, stdout, stderr) => {
		if (err) {
			if (stderr.includes("already been started"))
				console.log("Server browser already running");
			else
				console.log(err);
		} else {
			console.log("Server browser successfully started");
		}

		let config = {
			user: 'migration',
			password: 'password',
			server: 'DESKTOP-KELGD28\\SQLEXPRESS', 
			database: 'BigMohammadBot_364208021171339265',
			options: {
				trustServerCertificate: true,
				multipleStatements: true
			}
		};
	
		sql.connect(config, (err) => {
			if (err) {
				console.log(err);
				event.sender.send('initialized', err);
			} else {
				event.sender.send('initialized', "");
			}
		})
	})
});

const runSql = async (code) => {
	try {
		const result = await sql.batch(code);
		return {
			data: result.recordset,
			lineNumber: -1,
			error: ""	
		};
	} catch (e) {
		return {
			data: [],
			lineNumber: e.lineNumber,
			error: e.message
		};
	}
}

const parseFunctionNameFromCode = (code, includeSchema) => {
	const lowerCode = code.toLowerCase();
	const createFunctionIndex = lowerCode.indexOf("create function"); // should exist for functions
	if (createFunctionIndex != -1) {
		const parenIndex = lowerCode.indexOf("(", createFunctionIndex);
		if (parenIndex != -1) {
			let fullName = code.substring(createFunctionIndex + 15, parenIndex);
			fullName = fullName.replaceAll("[","").replaceAll("]","").trim(); // remove escape specifiers
			if (includeSchema) {
				return fullName;
			} else {
				const nameSplit = fullName.split('.'); // in case we have a schema preceding the name
				if (nameSplit.length == 1) // no schema found
					return fullName;
				else
					return nameSplit[1].trim(); // return only the name
			}
		}
	}
	return "";
}

ipcMain.handle('submitSQL', async (event, code, secondaryCode) => {
	// attempt to drop the function if it already exists
	const functionNameWithSchema = parseFunctionNameFromCode(code, true);
	if (functionNameWithSchema != "")
		await runSql(`IF OBJECT_ID('${functionNameWithSchema}') IS NOT NULL\n\tDROP FUNCTION ${functionNameWithSchema}`);

	const firstResult = await runSql(code);
	if (firstResult.error == "" && secondaryCode != "") {
		const secondResult = await runSql(secondaryCode);
		return secondResult;
	} else {
		return firstResult;
	}
});

ipcMain.handle('openFolderDialog', async (event, path) => {
	const result = await dialog.showOpenDialog(mainWindow, {
		properties: ["openDirectory"],
		defaultPath: path
	});
	return result.filePaths;
});

const enumerateDirectory = (path, fileList) => {
	const files = fs.readdirSync(path);
	
	files.forEach((file) => {
		const newPath = `${path}/${file}`;
		if (fs.statSync(newPath).isDirectory()) {
			if (file != "node_modules" && !file.endsWith(".asar")) {
				fileList.push({ name: file, children: [] });
				enumerateDirectory(newPath, fileList[fileList.length - 1].children);
			}
		} else {
			fileList.push({ name: file, children: undefined });
		}
	});
}

// schema should be specified when creating functions to prevent any possible issues
ipcMain.handle('deployScript', async (event, path, code, settings) => {
	if (fs.existsSync(path)) {
		const firstScriptNumberIndex = settings.nameTemplate.indexOf("{#");
		const scriptNumDigits = parseInt(settings.nameTemplate[firstScriptNumberIndex + 2]);
		const lastScriptNumberIndex = firstScriptNumberIndex + scriptNumDigits;

		const functionName = parseFunctionNameFromCode(code, settings.includeSchema);
		if (functionName == "")
			return {error: "Could not determine function name", result: []};

		let currentIncrement = 0;
		const files = fs.readdirSync(path);
		files.forEach((file) => {
			if (firstScriptNumberIndex != -1) {
				const parsed = parseInt(file.substring(firstScriptNumberIndex, lastScriptNumberIndex));
				if (!isNaN(parsed) && parsed > currentIncrement)
					currentIncrement = parsed;
			}
			if (settings.deleteOldFunctionScripts) {
				if (file.includes(functionName)) {
					fs.rmSync(`${path}/${file}`);
				}
			}
		});
		currentIncrement++;

		const formattedIncrement = currentIncrement.toString().padStart(scriptNumDigits, "0");
		if (formattedIncrement.length > scriptNumDigits)
			return {error: "Script number exceeds allowed digits", result: []};
		else {
			const functionNameIndex = settings.nameTemplate.indexOf("{f}");
			let finalScriptName = settings.nameTemplate;
			if (firstScriptNumberIndex != -1)
				finalScriptName = finalScriptName.substring(0, firstScriptNumberIndex) + formattedIncrement + finalScriptName.substring(firstScriptNumberIndex + 4);
			if (functionNameIndex != -1)
				finalScriptName = finalScriptName.substring(0, functionNameIndex) + functionName + finalScriptName.substring(functionNameIndex + 3);

			const functionNameWithSchema = parseFunctionNameFromCode(code, true);
			const finalCode = `IF OBJECT_ID('${functionNameWithSchema}') IS NOT NULL\n\tDROP FUNCTION ${functionNameWithSchema}\nGO\n${code}`;

			fs.writeFileSync(`${path}/${finalScriptName}.sql`, finalCode);

			return {error: "", result: [finalScriptName]};
		}
	}
	return {error: "Migration directory does not exist", result: []};
});

/*
IF OBJECT_ID('wamm_notifications.udf_GetAlerts') IS NOT NULL
DROP FUNCTION [wamm_notifications].udf_GetAlerts
GO
CREATE FUNCTION [wamm_notifications].udf_GetAlerts(@UserId int)
RETURNS @ResultTable TABLE (Id int, Content NVARCHAR( 200 ), ClickAction int, ClickInfo NVARCHAR(75), Viewed bit, [Timestamp] datetime)
AS BEGIN
INSERT INTO @ResultTable
	
	select Alert.Id, Alert.Content, Alert.ClickAction, Alert.ClickInfo, Alert.Viewed, Alert.[Timestamp]
	from wamm_notifications.[Alert] Alert
		left join dbo.[User] [User] on ([User].id = Alert.UserId)
	where Alert.UserId = @UserId
		and ([User].Deleted = 0 and [User].Active = 1)

RETURN
END
*/

const parseFunctionReturnValue = (code) => {
	code = code.replaceAll("\r", " ").replaceAll("\n", " ").replaceAll("\t", " ");
	const lowerCode = code.toLowerCase();
	const returnStartIndex = lowerCode.indexOf("table (");
	if (returnStartIndex != -1) {
		// parse out just the function signature via paren counts
		let parenCount = 0;
		let valuesString = "";
		for (let i = returnStartIndex + 6; i < code.length; i++) {
			if (code[i] == '(')
				parenCount++;
			else if (code[i] == ')')
				parenCount--;
			valuesString += code[i]
			if (parenCount == 0)
				break;
		}
		if (valuesString.length >= 2) // remove leading and trailing paren
			valuesString = valuesString.substring(1, valuesString.length - 1);

		let values = valuesString.trim().split(',');
		if (values.length > 0) {
			let finalValues = [];
			values.forEach((value) => {
				// (hopefully) format so we are left with <name type> and then parse
				let parenIndex = value.indexOf('(');
				let endParenIndex = value.indexOf(')');
				while (parenIndex != -1 && endParenIndex != -1) {
					value = value.substring(0, parenIndex) + value.substring(endParenIndex + 1);
					parenIndex = value.indexOf('(');
					endParenIndex = value.indexOf(')');
				}
				value = value.replaceAll("(", "").replaceAll(")", "").replaceAll("[", "").replaceAll("]", "").trim(); // just in case

				let varName = "";
				let sqlType = "";
				let firstToken = true;
				for (let i = 0; i < value.length; i++) {
					if (value[i] == ' ') {
						firstToken = false;
						continue;
					}
					if (firstToken)
						varName += value[i];
					else
						sqlType += value[i];
				}

				finalValues.push({ var: varName, type: sqlType.toLowerCase() });
			});

			return finalValues;
		}
	}
	return [];
}

const getCSharpTypeFromSqlType = (type) => {
	switch (type) {
		default:
			return "UNSUPPORTED_TYPE";
		// numerics
		case "bit":
			return "bool";
		case "decimal":
			return "decimal";
		case "int":
			return "int";
		case "smallint":
			return "Int16";
		case "bigint":
			return "Int64";
		case "float":
			return "float";
		
		// date and time
		case "date":
		case "datetime":
		case "datetime2":
			return "DateTime";

		// character strings
		case "char":
		case "varchar":
		case "text":
			return "string";

		// unicode character strings
		case "nchar":
		case "nvarchar":
		case "ntext":
			return "string";

		// binary
		case "binary":
		case "varbinary":
			return "byte[]";

		// other
		case "uniqueidentifier":
			return "Guid";
	}
}

ipcMain.handle('deployBackend', async (event, path, code, settings) => {
	if (fs.existsSync(path)) {
		let functionName = parseFunctionNameFromCode(code, false);
		if (functionName == "")
			return {error: "Could not determine function name", result: []};
		
		if (settings.prefixExclude != "") {
			functionName = functionName.replace(settings.prefixExclude, "").trim();
		}

		const classMembers = [];
		const parsedReturnValues = parseFunctionReturnValue(code);
		parsedReturnValues.forEach((value) => {
			classMembers.push(`public ${getCSharpTypeFromSqlType(value.type)} ${value.var} { get; set; }`);
		});

		const finalFileName = `${functionName}Result`;
		const finalText = `using System;\nusing System.Collections.Generic;\nusing System.ComponentModel.DataAnnotations;\nusing System.ComponentModel.DataAnnotations.Schema;\n\nnamespace ${settings.classNamespace}\n{\n\tpublic class ${finalFileName}\n\t{\n\t\t${classMembers.join('\n\t\t')}\n\t}\n}`;

		fs.writeFileSync(`${path}/${finalFileName}.cs`, finalText);

		// return the two lines that need to be added to databasecontext
		const line1 = `public DbSet<${finalFileName}> ${finalFileName}Model { get; set; }`;
		const line2 = `modelBuilder.Entity<${finalFileName}>().HasNoKey();`;
		return {error: "", result: [line1, line2]};
	}
	return {error: "Backend directory does not exist", result: []};
});