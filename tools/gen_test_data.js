

const fs = require('fs')
// const path = require('path'); 
  

let g_indir ='/media/richard/ELEMENTS/writing/'
//
let word_list = fs.readFileSync('words.txt','ascii').toString()


word_list = word_list.replace(/\s\s+/g,' ').trim()
word_list = word_list.split(' ')


function gen_random_output() {
    let n = word_list.length
    let output = ''
    let maxw = Math.floor(Math.random()*250)
    maxw = Math.max(24,maxw)

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

for ( let i = 2; i <= 100; i++ ) {
    let fname = `${g_indir}test${i}.txt`
    let output = gen_random_output()
    fs.writeFile(fname,output,'ascii',(err) => {
        if ( err ) {
            console.log(err.message)
        }
    })
}
