
let {uuid,sleeper,qnd_assert,dump_test_results} = require('./helpers.js')
let DirWatcherHandler = require('../lib/app_dir_watcher.js')

const { watch } = require('fs/promises');

const fs = require('fs')

/*
const ac = new AbortController();
const { signal } = ac;
setTimeout(() => ac.abort(), 10000);
*/


async function test_more_local() {

    let watcher = watch('../blog/data/blog/')

    for await (const event of watcher) {
console.dir(event)
        let {eventType,filename} = event
        let fname = filename.trim()
console.log(fname)
    }

    /*
    fs.watch('../blog/data/blog/', (eventType, filename) => {
        console.log(`event type is: ${eventType}`);
        if (filename) {
            console.log(`filename provided: ${filename}`);
        } else {
            console.log('filename not provided');
        }
    });
    */
}

class FauxUserSearch {
    constructor() {}

}

class FauxApplication {
    //
    constructor() {

    }

    get_custom_search(owner) {
        return new FauxUserSearch()
    }

    add_just_one(f_obj,is_new) {
        console.log(`FauxApplication ${__function}`)
        console.dir(f_obj)
    }
    //
}

class TestManager {
    //
    constructor() {

    }

    add_just_one(f_obj,is_new) {
        console.log(`TestManager ${__function}`)
        console.dir(f_obj)
    }
    //
    remove_just_one(elem_id) {
        console.log("remove_just_one: " + elem_id)
    }
    //
}

let sim_files = [
    [ "write", "../blog/data/blog/test_file1.json", JSON.stringify({
        "test" : 1, "value" : "something to say"
    }) ],
    [ "write", "../blog/data/blog/test_file2.json", JSON.stringify({
        "test" : 2, "value" : "butter finger winger dinger"
    }) ],
    [ "remove", "../blog/data/blog/test_file1.json" ],
    [ "write", "../blog/data/blog/test_file3.json", JSON.stringify([
        {"test" : 3, "value" : "sploppy doppy longer gone" },
        {"test" : 4, "value" : "cat bread dog food tomato"},
        {"test" : 5, "value" : "please keep this out of reach"},
        {"test" : 6, "value" : "put it next to the hand"},
        {"test" : 7, "value" : "wild things"},
        {"test" : 8, "value" : "how but the gill of the fish with a wish"}
    ]) ],
    [ "remove", "../blog/data/blog/test_file2.json" ],
    [ "sleep", 2 ],
    [ "remove", "../blog/data/blog/test_file3.json" ]
]


function file_changes() {
    let next_op = sim_files.shift()
    if ( next_op !== undefined ) {
        try {
            let path = next_op[1]
            if ( next_op[0] === "write" ) {
                let data = next_op[2]
                fs.writeFileSync(path,data)
            } else  if ( next_op[0] === "remove" ) {
                fs.unlinkSync(path)
            } else if ( next_op[0] === "sleep" ) {
                sleeper(parseInt(path))
            }
        } catch (e) {
        }
    }
}

async function test_DirWatcherHandler() {
    let element_manager = new TestManager()
    let application = new FauxApplication()
    let dwh = new DirWatcherHandler("../blog/data/blog",{},element_manager,application)
    dwh.start()
    let resolver = () => {}
    let p = new Promise((resolve,reject) => {
        resolver = () => { resolve(true) }
    })
    let intrvl = setInterval(file_changes,200)
    setTimeout(() => {
        clearInterval(intrvl)
        resolver()
    },5000)
    await p
}


async function all_tests_this_module() {
    await test_DirWatcherHandler()
    //test_more_local()
}


module.exports = all_tests_this_module

if ( require.main.filename === __filename ) {
    //
    (async () => {
        await all_tests_this_module()
        console.log("test_user_searches")
        dump_test_results()    
    })()
    //
}





