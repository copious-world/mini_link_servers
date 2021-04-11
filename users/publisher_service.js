// data server under users     USERS
// viewing data server
//

const fs = require('fs')
const fsPromises = require('fs/promises')
const path = require('path'); 
const express = require('express');
const { generateKeyPair } = require('crypto');
const {MessageRelayer} = require("message-relay-services");
//


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


// ---- ----  ---- ---- MESSAGE RELAY....(for publishing assets)
// ---- ----  ---- ---- configure

//
// The persistence endpoint that relays files out to dashboard, profiles, and other user specific
// transitional frontend services...
let g_message_relayer = new MessageRelayer(g_conf.persistence)

function healthy(obj,tx_op) {
    if ( obj._tx_op === tx_op ) {
        return(true)
    }
    if ( obj._tx_op === 'S' ) {
        return(false)
    }
    // other things, such as content filters, etc.
    return(true)
}


function service_passable(obj,srv_link) {
    return false
}

function post_to_service(srv_link,obj) {
}


async function publisher() {
//
    if ( g_message_relayer ) {
        let pub_conf = g_conf.publisher
        for ( let topic in pub_conf.topics )  {
            let topic_obj = pub_conf.topics[topic]
            if ( topic_obj.m_path === undefined ) {
                topic_obj.m_path = "persistence"
            }
            if ( topic_obj.source === undefined ) {
                topic_obj.source = "publication-users"
            }
            if ( !(topic_obj.no_endpoint) ) {
                let tx_op = topic_obj._tx_op
                let path = topic_obj.m_path
                let asset_intake = ((m_path,tx_op) =>  {
                    return (obj) => {
                        if ( healthy(obj,tx_op) ) {
                            let msg = Object.assign({},obj)  // _id is in here, etc.
                            msg.m_path = m_path
                            msg._tx_op = tx_op
                            g_message_relayer.messenger.send(msg)
                        }
                    }
                })(path,tx_op)
                g_message_relayer.subscribe(topic,topic_obj,asset_intake)
            } else {
                let service_url = topic_obj.service_url
                let asset_forward = ((srv_link) =>  {
                    return (obj) => {
                        if ( service_passable(obj,srv_link) ) {
                            post_to_service(srv_link,obj)
                        }
                    }
                })(service_url)
                g_message_relayer.subscribe(topic,topic_obj,asset_forward)
            }
        }
    }
//
}




publisher()