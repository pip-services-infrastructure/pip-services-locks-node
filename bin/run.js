let LocksProcess = require('../obj/src/container/LocksProcess').LocksProcess;

try {
    let proc = new LocksProcess();
    proc._configPath = "./config/config.yml";
    proc.run(process.argv);
} catch (ex) {
    console.error(ex);
}
