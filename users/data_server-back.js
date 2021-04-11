// data server under users     USERS
// viewing data server
//

const fs = require('fs')
const fsPromises = require('fs/promises')
const path = require('path'); 
const express = require('express');
const { generateKeyPair } = require('crypto');
const {MessageRelayer} = require("message-relay-services");
const { rejects } = require('assert');
//
const {file_watch_handler,load_directory} = require('./object_file_util');
const AppSearching = require('./application_searching.js')



class SearchesByUser {
    //
    //
    constructor(SearchClass,owner,conf) {
        this.searches = new SearchClass(conf)
        this.owner = owner
        //
        this.global_file_list = []
        this.global_file_list_by = {}
        this.searches.set_global_file_list_refs(this.global_file_list,this.global_file_list_by)
        this.user_info = {}
    }


    set_user_info(info) {
        if ( info === undefined ) return
        this.user_info  = info
    }

    async run_op(op) {
        switch ( op.cmd ) {
            case "search" : {
                let req = op.req
                return await this.process_search(req)
            }
            case "remove" : {
                let req = op.req
                this.searches.clear(req.body.query)
                break
            }
            case "info" : {
                return({ "status" : "OK", "data" : JSON.stringify(this.user_info) })
            }
            case "item" : {
                let item
                let req = op.req
                let key = req.body.key
                let field = req.body.field
                //
                let linear = global_file_list_by["update_date"]
                let n = linear.length
                let start = 0
                for ( let i = start; i < n; i++ ) {
                    item = linear[i]
                    if ( item ) {
                        if ( item[field] === key ) {
                            return({ "status" : "OK", "data" : JSON.stringify(item) })
                        }
                    }
                }
            }
        }
        return({ "status" : "OK" })
    }

    async process_search(req) {
        let query = req.params.query;
        let box_count = parseInt(req.params.bcount);
        let offset = parseInt(req.params.offset);
        //
        let search_results = this.searches.get_search(query,offset,box_count);
        return(search_results)
    }
    
}



/// ------------------------------------  EXPRESS APP


var bodyParser = require('body-parser');
var cors = require('cors')

// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// //
// setup app
const app = express()
app.use(urlencodedParser)
app.use(jsonParser)
app.use(cors)
// ----

/// ------------------------------------  EXPRESS APP


//
const PRUNE_MINUTES = 30
const TIMEOUT_THRESHHOLD = 8*60*60     // in seconds
const TIMEOUT_THRESHHOLD_INTERVAL = (1000*60)*PRUNE_MINUTES


let g_prune_timeout = null
process.on('SIGINT',(signal) => {
    if ( g_prune_timeout !== null ) {
        clearInterval(g_prune_timeout)
    }
    process.exit(0)
})


// USER INFORMATION
const g_public_viewable_user_fields = ['picture', 'bio', 'name', 'key-words']
var g_currently_loaded_users = {}


// ---- ---- ---- ---- ---- ---- ---- ---- ----
// // // // // 
// ---- ---- ---- ---- COMMAND LINE PARAMETERS ---- ---- ---- ---- ----
let g_port = 3000
let g_address = "localhost"
let g_update_dir = '/media/richard/ELEMENTS/data/users/records' 
let g_subdir = '/media/richard/ELEMENTS/data/users/records' 
let g_conf_file = '/media/richard/ELEMENTS/endpoint-services/user/config.json'
let g_user_assets_dir = '/media/richard/ELEMENTS/data/users/assets'
let g_conf = {
    'port' : 5114,
    'address' : 'localhost',
    'file_shunting' : false
}

//
// The plan here is to never use the defaults (except in testing) 
// So, command line processing is almost nothing. 
const PAR_COM_CONFIG = 2

const PAR_SHRINK = 3
const PAR_PORT = 4
const PAR_RECORD_DIRECTORY = 5
const PAR_UPDATE_DIRECTORY = 6
const PAR_ASSET_DIRECTORY = 7

if ( process.argv[PAR_COM_CONFIG] !== undefined ) {             // g_conf_file  --- location of communication configuration
    g_conf_file = process.argv[PAR_COM_CONFIG]
}

if ( g_conf_file !== undefined ) {
    g_conf = JSON.parse(fs.readFileSync(g_conf_file,'ascii').toString())
            // if this fails the app crashes. So, the conf has to be true JSON
}
//
// // //
g_subdir = g_conf.records_dir
g_update_dir = g_conf.updating_records_directory
g_user_assets_dir = g_conf.assets_directory
g_port = g_conf.port
g_address = g_conf.address
//
//
//
if ( process.argv[PAR_SHRINK] !== undefined ) {         // Shrink -- multiplier for search metric
    g_conf.shrinkage = parseFloat(process.argv[PAR_SHRINK])
}
if ( process.argv[PAR_PORT] !== undefined ) {           // port --- port of the service provided in this module
    g_port = parseInt(process.argv[PAR_PORT])
}
if ( process.argv[PAR_RECORD_DIRECTORY] !== undefined ) {       // g_subdir  --- location of searchable records and new data
    g_subdir = process.argv[PAR_RECORD_DIRECTORY]
}
if ( process.argv[PAR_UPDATE_DIRECTORY] !== undefined ) {       // g_update_dir  --- location of new data
    g_update_dir = process.argv[PAR_UPDATE_DIRECTORY]
    if ( g_update_dir === 'same' ) g_update_dir = g_subdir
}
if ( process.argv[PAR_ASSET_DIRECTORY] !== undefined ) {       // g_update_dir  --- location of new data
    g_user_assets_dir = process.argv[PAR_ASSET_DIRECTORY]
    if ( g_user_assets_dir === 'same' ) g_user_assets_dir = g_subdir
}



// ---- ---- ---- ---- ---- ---- ---- ---- ----
// 
const g_search_interface = new AppSearching(g_conf)        // see initialization below

let g_particular_user_searches = {
    'admin' : new SearchesByUser(AppSearching,'admin',g_conf)
}

function addCustomSearch(owner) {
    g_particular_user_searches[owner] = new SearchesByUser(AppSearching,owner,g_conf)
}

async function run_custom_operation(owner,op) {
    let result = { "status" : "emtpy" } 
    try {
        let custom = g_particular_user_searches[owner]
        if ( custom ) {
            let custom = g_particular_user_searches[owner]
            result = await custom.run_op(op)
        }
    } catch(e) {}
    return result
}

async function paritcular_interface_info(item_key) {
    let custom = g_particular_user_searches[item_key]
    let op = { "cmd" : "info" } 
    result = await custom.run_op(op)
    return(result)
}

//
function public_view_user(f_obj) {
    let pub_view = {}
    for ( let ky in f_obj ) {
        if ( ky in g_public_viewable_user_fields ) {
            pub_view[ky] = f_obj[ky]
        }
    }
    return pub_view
}




// ---- ----  ---- ---- MESSAGE RELAY....(for publishing assets)
// ---- ----  ---- ---- configure


// ---- ----  ---- ---- create communication object (talks to an endpoint server)
 // most of the user in formation coming into this service is through file watching...
 // but some information may be obtained by direct query to a user endpoint
let g_message_relayer_users = new MessageRelayer(g_conf.users) 
//
// The persistence endpoint that relays files out to dashboard, profiles, and other user specific
// transitional frontend services...
let g_message_relayer = new MessageRelayer(g_conf.persistence)


async function publish_static(user_obj) {
    //
    try {
        // PUBLISH PROFILE
        let topic = 'user-profile'
        let profile_obj = Object.assign({},user_obj)
        let fpath = g_user_assets_dir + user_obj.dir_paths.profile
        profile_obj.profile = (await fsPromises.readFile(fpath)).toString()
        profile_obj.profile = encodeURIComponent(profile_obj.profile)
console.log("publish_static " + topic)
console.dir(profile_obj)
        let result = await g_message_relayer.publish(topic,profile_obj)
        console.log(result)
        //
        // PUBLISH DASHBOARD
        topic = 'user-dashboard'
        let dash_obj = Object.assign({},user_obj)
        fpath = g_user_assets_dir + user_obj.dir_paths.dashboard
        dash_obj.dashboard = (await fsPromises.readFile(fpath)).toString()
        dash_obj.dashboard = encodeURIComponent(dash_obj.dashboard)
console.log("publish_static " + topic)
console.dir(dash_obj)
        result = await g_message_relayer.publish(topic,dash_obj)
        console.log(result)
        //
    } catch(e) {
        console.error(e)
    }
   //
}



// ---- ----  ---- ---- WATCH SUBDIRECTORY....
//
console.log("watchging dir " + g_update_dir)
let g_watch_for_new_files = fs.watch(g_update_dir)  // watch for files in only one specific directory...
// ---- ---- ---- ---- ---- ---- ---- ---- ----
// ---- ---- ---- ---- ---- ---- ---- ---- ----

// FILE CHANGE LISTENER
g_watch_for_new_files.on('change', (eventType, filename) => {
                                                                if ( eventType === 'change' ) {
                                                                    let fname = filename.trim()
                                                                    if ( fname.substr(0,2) === '._' ) return
                                                                    user_record_add_or_update(fname)
                                                                } else if ( eventType === 'rename' ) {
                                                                    let fname = filename.trim()
                                                                    if ( fname.substr(0,2) === '._' ) return
                                                                    user_record_handle_remove(fname)
                                                                }
                                                            });

//
// ---- ---- ---- ---- ---- ---- ---- ---- ----
//


//
function user_record_add_or_update(filename) {
    // require this to be a json file
    if ( filename.substr(0,2) === '._' ) return
    if ( path.extname(filename) === '.json' ) {
        let fpath = g_update_dir + '/' + filename
        file_watch_handler(fpath,add_just_one_new_user)
    }
}



function user_record_handle_remove(filename) {
    if ( path.extname(filename) === '.json' ) {
        let fpath = g_update_dir + '/' + filename
        file_watch_handler(fpath,false,remove_just_one_user,filename)
    }
}



// ttt@b.com_d1833d2cc77287f622d748b8bf3e0c53c3272beb069ca907bcc632fe61855855
//
async function remove_just_one_user(fname) {
    if ( fname.indexOf('@') > 0 ) {
        let asset_name = fname.replace('.json','')
        if( asset_name != fname ) {
            let [email,tracking] = fname.split('_')
            g_search_interface.remove_just_one(tracking)
        }
    }
}










// called in the 'file watch handler' in response to loading a file...
// fdata comes fromthe file.
async function add_just_one_new_user(fdata) {
    try {
        let f_obj = JSON.parse(fdata)
        let user_dir = f_obj.dir_paths
        //
        if ( f_obj.dates === undefined ) {
            f_obj.dates = {
                "created" : Date.now(),
                "updated" : Date.now()
            }
        }
        //
        // PUBLISH STATIC FILES -- this module subscribes to a "presitence" endpoint....
        if ( user_dir ) {
            publish_static(f_obj)           // PUBLISH STATIC FILES FOR THIS NEW USER....
        }
        //
        let searchable = public_view_user(f_obj)
        //
        g_global_file_list.push(searchable)
        f_obj.entry = g_global_file_list.length
        f_obj.score = 1.0
        g_global_file_list_by["create_date"].push(searchable)
        g_global_file_list_by["update_date"].push(searchable)
        g_currently_loaded_users[f_obj.uid] = f_obj
        //
        addCustomSearch(f_obj.uid)                      /// custom search for users in memory
    } catch (e) {
        console.log(e)
    }
}


// -------- ------------ ---------- --------------


async function user_get(uid) {
    //
    let user = g_currently_loaded_users[uid]
    if ( user ) {
        return public_view_user(user)
    }
    //
    /*
    let user_record = await g_message_relayer_users.remote_fetch_message(uid)
    add_just_one_new_user(user_record)
    user = g_currently_loaded_users[uid]
    return public_view_user(f_obj)
    */
   return({})
}




// 
// when creating assets for a new user, use templates and put them in user specific directories
// 
// 


//  ----
let g_global_file_list = []
let g_global_file_list_by = {}

g_search_interface.set_global_file_list_refs(g_global_file_list,g_global_file_list_by)



function inject_user_object(u_obj) {
    g_global_file_list.push(u_obj)    
}

function after_loading() {
    g_search_interface.update_global_file_list_quotes_by()
    console.log("done loading blog entries ... ready")
}


// // 
// prune_searches
// // 
function prune_searches() {
    //
    console.log("pruning searches")
    let count = g_search_interface.prune(TIMEOUT_THRESHHOLD)
    //
    console.log(`searches pruned: ${count}`)
}




async function process_search(req) {
    let query = req.params.query;
    let box_count = parseInt(req.params.bcount);
    let offset = parseInt(req.params.offset);
    //
    let search_results = await g_search_interface.get_search(query,offset,box_count);
    return(search_results)
}


// ---- ---- ---- ---- 

function rate_limited(uid) {
    return false
}


function rate_limit_redirect(req,res) {
    return res.redirect('/')
}

// ---- ---- ---- ---- HTML APPLICATION PATHWAYS  ---- ---- ---- ---- ---- ---- ----


app.get('/:uid/:query/:bcount/:offset', async (req, res) => {
    let uid = req.params.uid;
    if ( rate_limited(uid) ) {
        return rate_limit_redirect(req,res)
    }
    //
    let data = await process_search(req)
    res.send(data)
})


// { uid: '12345', query: 'any', bcount: '1', offset: '1' }
//
app.post('/:uid/:query/:bcount/:offset', async (req, res) => {
    let uid = req.params.uid;
    let data = await user_get(uid)
    res.send(data)
})



app.get('/custom/:op/:owner/:uid/:query/:bcount/:offset', async (req, res) => {
    let uid = req.params.uid;
    let owner = req.params.owner;
    if ( rate_limited(owner) ) {
        return rate_limit_redirect(req,res)
    }
    let data = []
    try {
        let custom = g_particular_user_searches[owner]
        if ( custom ) {
            data = await custom.process_search(req)
        }
    } catch (e) {
    }
    //
    //
    res.send(data)
})



app.post('/custom/:op/:owner', async (req, res) => {
    let uid = req.params.owner;
    if ( rate_limited(owner) ) {
        return rate_limit_redirect(req,res)
    }
    let cmd = req.params.op
    let owner = req.params.owner
    if ( cmd === 'user-info' ) {
        let uid = req.body.uid
        let response = await paritcular_interface_info(owner,uid)  // paritcular_interface_info shall check for role access
        return response
    }
    //
    let op = {
        "cmd" : req.params.op,
        "req" : req
    }
    //
    let data = await run_custom_operation(owner,op)
    res.send(data)
})


app.get('/cycle/:halt', (req, res) => {
    let do_halt = req.params.halt
    backup_searches(do_halt)
    res.send("OK")
})


app.get('/reload',(req, res) => {
    load_directory(g_subdir)
    res.send("OK")
})


// ---- ---- ---- ---- RUN  ---- ---- ---- ---- ---- ---- ---- ----
// // // 
// 
load_directory(g_subdir,true,inject_user_object,after_loading)
//
//
g_search_interface.restore_searches()
//
// //
g_prune_timeout = setInterval(prune_searches,TIMEOUT_THRESHHOLD_INTERVAL)
//
//
app.listen(g_port, () => {
  console.log(`Example app listening at http://localhost:${g_port}`)
})
