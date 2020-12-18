"use strict";

const ts = require("typescript");
const fs = require("fs");
const path = require("path");
const process = require("process");

function reportDiagnostics(diagnostics) { 
    let bError = false;
    diagnostics.forEach(diagnostic => {
        let messages = {
            0: "Warning",
            1: "Error",
            2: "Suggestion",
            3: "Message"
        };
        let message = messages[diagnostic.category];
        if(diagnostic.category === 1) bError = true;
        if (diagnostic.file) {
            const where = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            message += ' ' + diagnostic.file.fileName + ' ' + where.line + ', ' + where.character + 1;
        }
        message += ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(message);
    });
    return bError;
}

function readConfigFile(configFileName) { 
    // Read config file
    const configFileText = fs.readFileSync(configFileName).toString();  

    // Parse JSON, after removing comments. Just fancier JSON.parse
    const result = ts.parseConfigFileTextToJson(configFileName, configFileText);
    const configObject = result.config;
    if (!configObject) {
        reportDiagnostics([result.error]);
        process.exit(1);
    }

    // Extract config infromation
    const configParseResult = ts.parseJsonConfigFileContent(configObject, ts.sys, path.dirname(configFileName));
    if (configParseResult.errors.length > 0) {
        reportDiagnostics(configParseResult.errors);
        process.exit(1);
    }
    return configParseResult;
}


function compile(configFileName) {
    // Extract configuration from config file
    const config = readConfigFile(configFileName);

    // Compile
    const program = ts.createProgram(config.fileNames, config.options);
    const emitResult = program.emit();

    // Report errors
    let error = reportDiagnostics(ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics));

    // Return code
    const exitCode = !!error ? 1 : 0;
    process.exit(exitCode);
}

let config = "tsconfig.json";
if(process.argv.indexOf("--config") >= 0) config = process.argv[process.argv.indexOf("--config") + 1];
compile(config);