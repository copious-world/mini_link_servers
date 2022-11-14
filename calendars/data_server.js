#!/usr/bin/env node

// data server under ....<app name>
// viewing data server
//
const fs = require('fs')
const polka       = require('polka');
const send        = require('@polka/send-type');
const app         = polka();

const cors = require('cors')
app.use(cors())

//
const AppSearching = require('./application_searching.js')  // the definer of this data type
//
const {ObjFileDirLoader} = require('copious-registry')
const EntryWatcher = require('../lib/app_dir_watcher.js')
const RecordSearchApp = require('../lib/the_record_searcher_app.js')

const CalendarSearches = AppSearching  // 
//
let g_prune_timeout = null
//
//
// ---- ---- ---- ---- ---- ---- ---- ---- ----
//
const PRUNE_MINUTES = 30
const TIMEOUT_THRESHHOLD = 8*60*60     // in seconds
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

if ( process.argv[PAR_COM_CONFIG] !== undefined ) {     // g_conf_file  --- location of communication configuration
    g_conf_file = process.argv[PAR_COM_CONFIG]
}

if ( g_conf_file !== undefined ) {
    g_conf = JSON.parse(fs.readFileSync(g_conf_file,'ascii').toString())
            // if this fails the app crashes. So, the conf has to be true JSON
} else {
    console.log("Failed to load configuration")
    process.exit(0)
}
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
//
let g_search_app = new RecordSearchApp(g_conf,CalendarSearches,AppSearching,EntryWatcher,ObjFileDirLoader)
//
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
//
let g_port = g_search_app.port()
let g_items_loader = g_search_app.items_loader()
let g_search_interface = g_search_app.search_interface()
//
// ---- ----  ---- ---- MESSAGE RELAY....(for publishing assets)
// had a message relay here for publishing that a new entry came in... leave it up to data supplier to publish
// ---- ----  ---- ---- WATCH SUBDIRECTORY....   // Get new data as files. Files may contain one (dedicated file) or more entries (JSON array)
g_search_app.start_watching_files()
//
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

// ---- ---- ---- ---- HTML APPLICATION PATHWAYS  ---- ---- ---- ---- ---- ---- ----

app.get('/',(req, res) => {
    try {
        const data = fs.readFileSync(g_conf.index_file)
        send(res,200,data)    
    } catch (e) {
        send(res,404,"what")    
    }
})

app.get('/:uid/:query/:bcount/:offset', async (req, res) => {
    let data = await g_search_app.rated_search_processing(req,res)
    send(res,200,data)
})

app.post('/:uid/:query/:bcount/:offset', async (req, res) => {
    let data = await g_search_app.rated_search_processing(req,res)
    send(res,200,data)
})

app.get('/custom/:owner/:query/:bcount/:offset', async (req, res) => {
    let data = await g_search_app.rated_custom_search_processing(req,res)
    send(res,200,data)
})

app.post('/custom/:op/:owner', async (req, res) => {
    let data = await g_search_app.rated_custom_search_ops(req,res)
    send(res,200,data)
})

app.get('/cycle/:halt', (req, res) => {
    let do_halt = req.params.halt
    //g_search_interface.backup_searches(do_halt)
    send(res,200,"OK")
})

app.get('/reload',(req, res) => {
    g_items_loader.load_directory()
    send(res,200,"OK")
})

app.get('/persistence/add-publisher/:plink', (req, res) => {
    let persistence_link = req.params.plink
    persistence_link = decodeURIComponent(persistence_link)
    // check that this publisher is OK.  This will give us a link making
    // this service be a client for subcription to publication...
    g_search_app.add_persistence_service(persistence_link,'admin-calendars')
    send(res,200,{ "status" : "OK" })
})

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

// // 
// prune_searches
// // 
function prune_searches() {
    console.log("pruning searches")
    let count = g_search_interface.prune(TIMEOUT_THRESHHOLD)
    console.log(`searches pruned: ${count}`)
}
//
const start = async () => {
    try {
        app.listen(g_port, () => {
            console.log(`[calendar searcher] Application Listening on Port ${g_port}`);
          })
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// ---- ---- ---- ---- RUN  ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// // // 
//
g_items_loader.load_directory()
//g_search_interface.restore_searches()     // calendar is not storing or caching searches (calendars are simple)
//g_prune_timeout = setInterval(prune_searches,TIMEOUT_THRESHHOLD_INTERVAL)
//
//
start()
//
// ---- ---- ---- ---- SHUTDOWN  ---- ---- ---- ---- ---- ---- ---- ----
// Do graceful shutdown
function shutdown() {
    console.log('graceful shutdown express');
    process.exit(0)
}

// Handle ^C
process.on('SIGINT', () => {
    console.log("shutting down")
    if ( g_prune_timeout !== null ) {
        clearInterval(g_prune_timeout)
    }
    shutdown()
});

