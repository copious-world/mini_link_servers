



const {Searching} = require('./searching.js')

const SCORE_THRESHOLD = 0.5


// // // // // // // // // // // // // // 
let shrink = 3.2
let title_weight = 3
let subject_weight = 3
let key_weight = 3
let text_weight = 3
let component_weight = 3
// // // // // // // // // // // // // // 




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



function component_score_match(component_part,q_list,mult) {
    let score = 0.0
    let n = component_part.graphic.length
    //
    for ( let i = 0; i < n; i++ ) {
        let check_txt = component_part.graphic[i]
        score += score_match(check_txt,q_list,mult)
    }
    return(score/n)
}


class AppSearching extends Searching {
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
    good_match(f_obj,match_text) {
    
        let q_list = match_text.split(' ')
    
        let score = 0.0
    
        let check_txt = f_obj.title
        score += score_match(check_txt,q_list,title_weight)
        check_txt = f_obj.subject
        score += score_match(check_txt,q_list,subject_weight)
        check_txt = f_obj.keys.join(' ')
        score += score_match(check_txt,q_list,key_weight)
        check_txt = f_obj.txt_full
        score += score_match(check_txt,q_list,text_weight)
        let check_obj = f_obj.components
        score += component_score_match(check_obj,q_list,component_weight)
        //
        let final_score = score/this.shrinkage
    
        f_obj.score = final_score
    
        return(final_score > SCORE_THRESHOLD)
    }
    
}



module.exports = AppSearching
