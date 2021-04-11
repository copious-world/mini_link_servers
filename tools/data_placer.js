

const fs = require('fs')
// const path = require('path'); 
  

let g_subdir = process.argv[2]
let file = process.argv[3]
let g_key_input = process.argv[4]
let g_key_subject = process.argv[5]

const txt_Prefix = "MUSIC++++"

console.log('--------------------')
console.log(g_subdir)
console.log(file)
console.log(g_key_input)
console.log(g_key_subject)
console.log('--------------------')
// 'nuts,buts,huts,putz'
// one file at a time

let g_out_file = file
if ( file.indexOf('/') >= 0) {

    let file_parts = file.split('/')
    let store_name = file_parts[file_parts.length-1]

    g_out_file = store_name
}


let g_path = (g_subdir + '/' + g_out_file.replace('.txt','.json'))


let g_file_txt = fs.readFileSync(file,'utf-8').toString()

fs.access(g_path,fs.constants.F_OK | fs.constants.W_OK,(err) => {
    if ( err ) {
        console.log("creating")
        create_file(g_path)
    } else {
        try {
            console.log("updating")
            update_file(g_path)
        } catch(e) {
            console.log(e)
        }
    }
})

/*
    { "id" : 11, "color": "grey",
        "entry" : -1,
        "title" : "",
        "dates" : {
            "created" : "never",
            "updated" : "never"
        },
        "subject" : "",
        "keys" : [  ],
        "t_type" : "",
        "txt_full" : ""
    }

*/

function create_file(a_path) {
    //
    let keys = g_key_input.split(',')
    keys = keys.map(key => {
        return (encodeURIComponent(key.trim()))
    })
    let fobj = {  
        "color": "grey",
        "entry" : -1,
        "title" : "",
        "dates" : {
            "created" : '' + Date.now(),
            "updated" : '' + Date.now()
        },
        "subject" : encodeURIComponent(g_key_subject),
        "keys" : keys,
        "t_type" : "html",
        "txt_full" : txt_Prefix + encodeURIComponent(g_file_txt)
    }

    let output = JSON.stringify(fobj)

    fs.writeFileSync(a_path,output,'ascii')
}


function update_file(a_path) {

    let data = fs.readFileSync(a_path,'ascii').toString()
    let fobj = JSON.parse(data)

    fobj.dates.updated = '' + Date.now()
    fobj.txt_full = encodeURIComponent(txt_Prefix + g_file_txt)
    let output = JSON.stringify(fobj)

    fs.writeFileSync(a_path,output,'ascii')
}





let faux_data = [

    { 
        "id": 1, "color": "darkblue",
        "entry" : 20,
        "title" : "Mux nuts 1",
        "dates" : {
            "created" : "Jan 1, 1880",
            "updated" : "today"
        },
        "subject" : "Muts mux nuts with nits",
        "keys" : [ "nuts", "buts", "huts", "putz" ],
        "t_type" : "plain",
        "txt_full" : "FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation"
    },
    { "id" : 2, "color": "indigo",
        "entry" : 21,
        "title" : "Mux nuts 2 are ruts",
        "dates" : {
            "created" : "Jan 1, 1980",
            "updated" : "today"
        },
        "subject" : "Muts mux nuts with nits",
        "keys" : [ "nuts", "buts", "huts", "putz" ],
        "t_type" : "html",
        "txt_full" : "FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation"
    },
    { "id" : 3, "color": "deeppink",
        "entry" : 22,
        "title" : "McNugget nuts are in a rut",
        "dates" : {
            "created" : "Jan 1, 2001",
            "updated" : "today"
        },
        "subject" : "Muts mux nuts with nits",
        "keys" : [ "nuts", "buts", "huts", "putz" ],
        "t_type" : "plain",
        "txt_full" : "FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation"
    },
    { "id" : 4, "color": "salmon",
        "entry" : 23,
        "title" : "Rusty ruts use rust",
        "dates" : {
            "created" : "Jan 1, 2020",
            "updated" : "today"
        },
        "subject" : "Muts mux nuts with nits",
        "keys" : [ "language", "programinng", "huts", "putz" ],
        "t_type" : "plain",
        "txt_full" : "FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation"
    },
    { "id" : 5, "color": "gold",
        "entry" : 24,
        "title" : "Mux nuts 4",
        "dates" : {
            "created" : "Jan 1, 1999",
            "updated" : "today"
        },
        "subject" : "Muts mux nuts with nits",
        "keys" : [ "nuts", "buts", "huts", "putz" ],
        "t_type" : "markdown",
        "txt_full" : "FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation"
    },
    { "id" : 6, "color": "darkblue",
        "entry" : 25,
        "title" : "Speaking of ruts and huts",
        "dates" : {
            "created" : "Jan 1, 1907",
            "updated" : "today"
        },
        "subject" : "Muts mux nuts with nits",
        "keys" : [ "nuts", "huts", "clutz", "putz" ],
        "t_type" : "plain",
        "txt_full" : "FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation"
    },
    { "id" : 7, "color": "indigo",
    "entry" : 26,
        "title" : "Mux nuts 1",
        "dates" : {
            "created" : "Jan 1, 2120",
            "updated" : "today"
        },
        "subject" : "Muts mux nuts with nits",
        "keys" : [ "nuts", "buts", "huts", "putz" ],
        "t_type" : "svg",
        "txt_full" : "FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation"
    },
    { "id" : 8, "color": "deeppink",
    "entry" : 28,
        "title" : "Mux nuts 1",
        "dates" : {
            "created" : "Jan 1, 2021",
            "updated" : "today"
        },
        "subject" : "Muts mux nuts with nits",
        "keys" : [ "nuts", "buts", "huts", "putz" ],
        "t_type" : "markdown",
        "txt_full" : "FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation"
    },
    { "id" : 9, "color": "salmon",
    "entry" : 29,
        "title" : "Mux nuts 1",
        "dates" : {
            "created" : "Jan 1, 1889",
            "updated" : "today"
        },
        "subject" : "Muts mux nuts with nits",
        "keys" : [ "nuts", "buts", "huts", "putz" ],
        "t_type" : "html",
        "txt_full" : "FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation"
    },
    { "id" : 10, "color": "gold",
        "entry" : 30,
        "title" : "Juice spruce is the goose",
        "dates" : {
            "created" : "Jan 1, 1870",
            "updated" : "today"
        },
        "subject" : "Muts mux nuts with nits",
        "keys" : [ "nuts", "buts", "huts", "putz", "nuts", "buts", "huts", "putz", "nuts", "buts", "huts", "putz" ],
        "t_type" : "plain",
        "txt_full" : `FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation
        FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation
        FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation
        FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation
        FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation
        FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation
        FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation
        FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation
        FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation
        FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation
        FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation
        FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation
        FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation
        FOR SCORE AND TWENY YEARS ago our founding father came upon this name for a relation with elation
        FOR SCORE AND TWENY YEARS ago our founding fathers saw this first... again`
    },
    { "id" : 11, "color": "grey",
        "entry" : -1,
        "title" : "",
        "dates" : {
            "created" : "never",
            "updated" : "never"
        },
        "subject" : "",
        "keys" : [  ],
        "t_type" : "",
        "txt_full" : ""
    }

];
