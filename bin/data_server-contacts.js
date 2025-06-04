#!/usr/bin/env node

// data server under ....<app name>
// viewing data server

//
const GeneralDataServer = require('link-server-class')
//
//
const PRUNE_MINUTES = 30
const TIMEOUT_THRESHHOLD_INTERVAL = (1000*60)*PRUNE_MINUTES
const PAR_COM_CONFIG = 2

//
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// ---- ---- ---- ---- CONFIG FILE    ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
let g_conf = {
    'port' : 5114,
    'address' : 'localhost',
    'file_shunting' : false
}

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

if ( process.argv[PAR_COM_CONFIG] !== undefined ) {     // conf_file  --- location of communication configuration
    let conf_file = process.argv[PAR_COM_CONFIG]
    if ( conf_file !== undefined ) {
        g_conf = JSON.parse(fs.readFileSync(conf_file,'ascii').toString())
                // if this fails the app crashes. So, the conf has to be true JSON
    }
} else {
    console.log("Failed to load configuration")
    process.exit(0)
}


// ---- ---- ---- ---- CONSTRUCT  ---- ---- ---- ---- ---- ---- ---- ----
//  ./contacts/server.conf
g_conf.application_searcher = '../contacts/application_searching.js'

let g_data_server = new GeneralDataServer(g_conf)

// ---- ---- ---- ---- START  ---- ---- ---- ---- ---- ---- ---- ----
//
g_data_server.initialize(TIMEOUT_THRESHHOLD_INTERVAL)
//
g_data_server.start()
//

// ---- ---- ---- ---- SHUTDOWN  ---- ---- ---- ---- ---- ---- ---- ----

// Handle ^C
process.on('SIGINT', () => {
    console.log("shutting down")
    try {
        g_data_server.shutdown()
    } catch(e) {
        process.exit(0)
    }
});

