
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


        // have to do an email match for receiver
    
        let q_list = match_text.split(' ')
    
        let score = 0.0
    
        let check_txt = f_obj.message
        score += this.score_match(check_txt,q_list,1)
    
        let final_score = score/this.shrinkage
    
        f_obj.score = final_score
    
        return(final_score > SCORE_THRESHOLD)
    }


    creat_email_query(f_obj)  {
        return this.get_special_key_query(f_obj.mail,"mail")
    }

    /**
     * attempt_join_searches
     * 
     * Attempts to run the query on the new object to see if it can be added to query result lists.
     * 
     * injest an element into searchs... look at all the searches and add it to the query list calling q.inject
     * 
     * @param {*} f_obj 
     */
    attempt_join_searches(f_obj) {
        let searches = this.local_active_searches
        let receiver_match = false
        for ( let query in searches ) {
            let q = searches[query]
            let [match_text,orderby] = q.parts()
            if ( match_text !== 'any' ) {
                if ( this.good_match(f_obj,match_text) ) { // good match write a score to f_obj
                    q.inject(f_obj,orderby)
                    receiver_match = q
                }
            } else {
                q.inject(f_obj,orderby)
            }
        }
        if ( receiver_match === false ) {
            // create a new query for this match
            let email_query = this.creat_email_query(f_obj)
            this.get_search(email_query,0,1)  // the user's first email
        }
    }
        
}



module.exports = AppSearching
