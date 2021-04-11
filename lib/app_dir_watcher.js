//
const { DirWatcherHandler } = require('copious-little-searcher')


const TRACK_KEY = "LISTFILE::"
const TRACK_KEY_LEN = TRACK_KEY.length

class ServiceEntryWatcher extends DirWatcherHandler {

    constructor(dir,conf,element_manager,app) {
        super(dir,element_manager)
        this._conf = conf
        this.application = app
    }

    //
    async add_just_one_new_asset(fdata) {
        let f_obj = super.add_just_one_new_asset(fdata)
        if ( f_obj !== false ) {
            let is_new = true
            if ( Array.isArray(f_obj) ) {
                for ( let fobj of f_obj ) {
                    this.addToCustomSearch(fobj,is_new)                   /// custom search for users in memory
                }
            } else {
                this.addToCustomSearch(f_obj,is_new)                      /// custom search for users in memory
            }
        }
    }

    //
    track_list_id(name_id) {
        if ( (typeof name_id === "string") && (name_id.substr(TRACK_KEY_LEN) === TRACK_KEY) ) {
            return(true)
        } else {
            return(false)
        }
    }

    //
    async remove_just_one_asset(fname) {
        if ( fname.indexOf('+') > 0 ) {
            let asset_name = fname.replace('.json','')
            if( asset_name != fname ) {
                let [tracking,type,email] = fname.split('+')
                super.remove_just_one_asset(tracking)
            }
        }
    }

    //
    addToCustomSearch(f_obj,is_new) {
        if ( f_obj._id ) {
            let owner = f_obj.email
            let user_search = this.application.get_custom_search(owner)
            if ( user_search ) user_search.add_just_one(f_obj,is_new)
        }
    }

}


module.exports = ServiceEntryWatcher