

const fs = require('fs')
const path = require('path'); 
  

let g_indir = '/media/richard/ELEMENTS/writing/'
let g_outdir = '/media/richard/ELEMENTS/data/music_buzz/'
//
let word_list = fs.readFileSync('words.txt','ascii').toString()


word_list = word_list.replace(/\s\s+/g,' ').trim()
word_list = word_list.split(' ')


function gen_random_output(max_len) {
    let n = word_list.length
    let output = ''
    let maxw = Math.floor(Math.random()*250)
    maxw = Math.min(max_len,maxw)

    for ( let i = 0; i < maxw; i++ ) {
        //
        let index = Math.floor(Math.random()*n)
        let w = word_list[index]
        output += w + ' '
        //
    }
    output = output.trim()
    return(output)
}


function process_file(indir,file) {

    let subject = gen_random_output(24)
    let keys = gen_random_output(6)
    //
    let in_path = `${indir}${file}`

    keys = keys.replace(' ',',')

        // node data_placer.js $output $indir$afile ${keys} "$subject"


    const { spawn } = require('child_process');
    const ls = spawn('node', ['data_placer.js', g_outdir, in_path, keys, subject ]);

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });


}

function load_directory(dirpath) {

    g_global_file_list = []

    fs.readdir(dirpath, (err, files) => { 
        if (err)  {
            console.log(err); 
        } else { 
            console.log("Filenames with the .txt extension:"); 
            files.forEach(file => { 
                if ( path.extname(file) == ".txt" ) {
                    //
                    let fpath = dirpath + '/' + file
                    process_file(dirpath,file)
                    //
                } 
            }) 
        } 
    }) 
  
}



load_directory(g_indir)