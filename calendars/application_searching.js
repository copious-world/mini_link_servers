
const { Searching } = require('copious-little-searcher')

const {first_day_of_month_ts} = require('month-utils')


class CalendarSearching extends Searching {


    constructor(conf) {
        super(conf)
        this.sorted_keys
    }

    // will return a list of months containing scheduled slots
    // query will be a simplified query -- just a start date
    get_search(query,offset,box_count) {
        let start_time = parseInt(query)
        let start_date = first_day_of_month_ts(start_time)
        let first_month = this.global_tracking_map[start_date]
        if ( first_month ) {
            this.keys_sorter()
            let index = this.sorted_keys.indexOf(start_date)
            if ( index > 0 ) {
                if ( (index + offset) < this.sorted_keys.length ) {
                    let results = []
                    let start = (index + offset)
                    let end = Math.min(this.sorted_keys.length - 1,start + box_count)
                    for ( let i = start; i < end; i++ ) {
                        let obj = this.global_tracking_map[this.sorted_keys[i]]
                        results.push(obj)
                    }
                }
            }
        }
        return []
    }

    async backup_searches(do_halt) {}

    prune(delta_timeout) {}

    async restore_searches() {}

}


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



class AppSearching extends CalendarSearching {

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
    good_match(f_obj,match_text) {
        //
        let q_list_str = decodeURIComponent(match_text) // match_text.split(' ')
        let q_list = ""
        let score = 0.0             // obsolutely match start time above all other things give that is part of the query
        try {
            let q_list_obj = JSON.parse(q_list_str)
            if  ( q_list_obj && (q_list_obj.start_time !== undefined)) {
                let st = q_list_obj.start_time
                if ( st && (st == f_obj.start_time) ) {
                    f_obj.score = Infinity
                    return true
                } 
            }
        } catch (e) {
        }
        //
        let check_txt = f_obj.message   // leaving this field name (might change later... this is data describing events in the month)
        score += this.score_match(check_txt,q_list,1)
        let final_score = score/this.shrinkage
        f_obj.score = final_score
        //
        return(final_score > SCORE_THRESHOLD)
    }
    
}



module.exports = AppSearching
