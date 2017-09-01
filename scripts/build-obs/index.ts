const git: any = require('simple-git')();
const url = require('url');
const unzip: any = require('unzipper');
import * as path from 'path';
import * as shell from 'shelljs';
import * as process from 'process';
import * as https from 'https';
import * as fs from 'fs';
import * as os from 'os';

/* This can work on other platforms with some modifications:
    1. Remove dependency download for platforms that don't use it. 
    
   That's it!
 */

const buildPath = path.join(__dirname, 'build');
const obsPath = path.join(__dirname, 'obs-studio');
const obsDepsZipPath = path.join(buildPath, `dependencies2015.zip`);
const obsDepsPath = path.join(buildPath, `dependencies2015`);
const obsDepsPath64 = path.join(obsDepsPath, `win64`);
const obsBuild64 = path.join(buildPath, `obs-build64`);

let configType = shell.env['npm_config_OBS_BUILD_TYPE'] || 'Release';
let obsGenerator = shell.env['npm_config_OSN_GENERATOR'];

function finishInstall(error: any, stdout: string, stderr: string) {
    if (error) {
        console.log(`Failed to install files: ${error}`);
        console.log(`${stdout}`);
        console.log(`${stderr}`);
        process.exit(1);
    }
}

function obsInstall() {
    let cmd = `cmake --build \"${buildPath}\" --config ${configType} --target install`;
    console.log(cmd);
    shell.exec(cmd, { async: true, silent: true}, finishInstall);
}

function finishInstallConfigure(error: any, stdout: string, stderr: string) {
    if (error) {
        console.log(`Failed to install files: ${error}`);
        console.log(`${stdout}`);
        console.log(`${stderr}`);
        process.exit(1);
    }

    obsInstall();
}

function obsInstallConfigure() {
    let cmd = `cmake "${__dirname}" -DOBS_BUILD_TYPE="${configType}" -DOBS_STUDIO_BUILD64="${obsBuild64}" -DOBS_STUDIO_DEPS64="${obsDepsPath64}"`;
    console.log(cmd);
    shell.exec(cmd, { async: true, silent: true}, finishInstallConfigure);
}

function finishBuild(error: any, stdout: string, stderr: string) {
    if (error) {
        console.log(`Failed to build obs: ${error}`);
        console.log(`${stdout}`);
        console.log(`${stderr}`);
        process.exit(1);
    }

    obsInstallConfigure();
}

function obsBuild() {
    let cmd = `cmake --build \"${obsBuild64}\" --config ${configType}`;
    console.log(cmd);
    shell.exec(cmd, { async: true, silent: true}, finishBuild);
}

function finishConfigure(error: any, stdout: string, stderr: string) {
    if (error) {
        console.log(`Failed to execute cmake: ${error}`);
        console.log(`${stdout}`);
        console.log(`${stderr}`);
        process.exit(1);
    }

    obsBuild();
}

/* Just assume cmake is available in $PATH */
function obsConfigure() {
    let generator: string;

    if (obsGenerator)
        generator = `-G"${obsGenerator}"`;
    else if (os.platform() == 'win32')
        generator = `-G"Visual Studio 14 2015 Win64"`
    else {
        console.log(`Unsupported platform!`);
        process.exit(1);
    }

    const cmd = `cmake ${generator} -DENABLE_UI=false -DDepsPath="${obsDepsPath64}" -H"${obsPath}" -B"${obsBuild64}"`;

    console.log(cmd);

    shell.exec(cmd, { async: true, silent: true }, finishConfigure);
}

function unpackObsDeps() {
    console.log(`Unpacking ${obsDepsZipPath}`);

    fs.createReadStream(`${obsDepsZipPath}`)
        .pipe(unzip.Extract({ path: `${obsDepsPath}` })
            .once('close', () => {
                obsConfigure();
            }));
}

function downloadObsDeps(missing: any) {
    /* Already exists, assume it's okay
     * TODO: Perform checksum. */
    if (!missing) {
        unpackObsDeps();
        return;
    }

    let file =  fs.createWriteStream(obsDepsZipPath);
    let reqUrl = url.parse('https://obsproject.com/downloads/dependencies2015.zip');

    let reqFinish = (response: any) => {
        console.log(`Saving file to ${obsDepsZipPath}`);
        response.on('data', (data: any) => {
            file.write(data);
        });

        response.on('end', () => {
            unpackObsDeps();
        });
    };

    let req = https.get(reqUrl, reqFinish);

    req.on('error', (error: any) => {
        console.log('Failed to download dependencies!');
    });
}

shell.mkdir(buildPath);
shell.cd(buildPath);
fs.access(obsDepsZipPath, downloadObsDeps);