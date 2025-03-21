


const { Searching } = require('copious-little-searcher')


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



class AppSearching extends Searching {

    // 
    constructor(conf) {
        super(conf)
    }

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

    // a match score particular to this data type....
    good_match(f_obj,match_text,qry) {
    
        let q_list = match_text.split(' ')
    
        let score = 0.0
    
        let check_txt = f_obj.message
        score += this.score_match(check_txt,q_list,1)
    
        let final_score = score/this.shrinkage
    
        f_obj.score = final_score
    
        return(final_score > SCORE_THRESHOLD)
    }
    
}



module.exports = AppSearching
