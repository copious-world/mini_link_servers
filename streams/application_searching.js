


const { Searching } = require('copious-little-searcher')

const SCORE_THRESHOLD = 0.5


// utility : count_occurances
function count_occurances(check_txt,term) {
    let cnt = 0
    let cumm_index = 0
    let n = Math.max(check_txt.length,1)

    let i = 0
    while ( (i = check_txt.indexOf(term,i)) >= 0 ) {
        i++
        cnt++
        cumm_index +=(n - i)
    }

    return([cnt,cumm_index/n])
}


function unload_text(txt) {
    if ( txt === undefined ) return(false)
    txt = txt.trim()
    if ( txt.length === 0 ) return(false)
    return(txr)
}


class AppSearching extends Searching {

    //
    constructor(conf) {
        super(conf)
    }

    //
    score_match(check_txt,q_list,mult) {
        let score = 0
        let index_score = 0
        
        q_list.forEach(term => {
            let [cnt,iscr] = count_occurances(check_txt,term)
            score += cnt
            index_score += iscr
        })
    
        score = (score + index_score)/Math.max(q_list.length,1)
        //console.log(`score: ${score}`)
        return(score*mult)
    }

    // title
    // subject
    // abstract
    // keys

    // a match score particular to this data type....
    good_match(f_obj,match_text) {
    
        let q_list = match_text.split(' ')
    
        let score = 0.0
    
        let check_txt = unload_text(f_obj.title)
        if ( check_txt !== false ) { score += this.score_match(check_txt,q_list,3) }
        //
        check_txt = unload_text(f_obj.subject)
        if ( check_txt !== false ) { score += this.score_match(check_txt,q_list,3) }
        
        let keys = f_obj.keys
        if ( keys && keys.length && Array.isArray(keys) ) {
            check_txt = f_obj.keys.join(' ')
            score += this.score_match(check_txt,q_list,3)
        }

        check_txt = unload_text(f_obj.abstract)
        if ( check_txt !== false ) { score += this.score_match(check_txt,q_list,2.3) }

        //
        let final_score = score/this.shrinkage
    
        f_obj.score = final_score
    
        return(final_score > SCORE_THRESHOLD)
    }
    
}



module.exports = AppSearching
