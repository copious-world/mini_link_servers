
class RecordSearchApp {
    //
    constructor(conf,UserOnlySearches,AppSearching,EntryWatcher,ObjFileDirLoader) {
        //
        this._USearch = UserOnlySearches
        this._AppSearching = AppSearching
        this._EntryWatcher = EntryWatcher
        this._ObjFileDirLoader = ObjFileDirLoader
        //
        this._subdir = conf.records_dir
        this._update_dir = conf.updating_records_directory
        this._user_assets_dir = conf.assets_directory
        this._port = conf.port
        this._address = conf.address
        this._global_file_list = []
        this._global_file_list_by = {}
        //
        this._search_interface = false
        this._search_watcher = false
        this._items_loader = false
        this._conf = conf
        //
        this._big_file_list = []
        this._big_file_list_by = {}
        //
        if ( this._USearch ) {
            this._particular_user_searches = {
                'admin' : new this._USearch(this._AppSearching,'admin',this._conf)
            }
        }
        this._particular_user_searches = false
        this.initialize()
    }


    initialize() {
        this._search_interface = new this._AppSearching(this._conf)        // see initialization below
        this._search_interface.set_global_file_list_refs(this._big_file_list,this._big_file_list_by)
        this._search_watcher = new this._EntryWatcher(this._update_dir,this._conf,this._search_interface,this)
        this._items_loader = new this._ObjFileDirLoader(this._subdir,this._big_file_list,this.after_loading)
    }

    after_loading() {
        if (  this._search_interface ) {
            this._search_interface.update_global_file_list_quotes_by()
        }
    }

    start_watching_files() {
        if ( this._search_watcher ) {
            this._search_watcher.start()
        }
    }

    port() {
        return this._port
    }
    
    items_loader() {
        return this._items_loader
    }
    
    search_interface() {
        return this._search_interface
    }

    async get_custom_search(owner) {
        if ( this._particular_user_searches !== false ) {
            let user_search =  this._particular_user_searches[owner]
            if ( user_search === undefined ) {
                this._particular_user_searches[owner] = new this._USearch(this._AppSearching,owner,this._conf)
            }
            user_search = this._particular_user_searches[owner]
            if ( user_search ) {
                return user_search
            }
        }
        return false
    }


    async process_search(req) {
        let query = req.params.query;
        let box_count = parseInt(req.params.bcount);
        let offset = parseInt(req.params.offset);
        //
        if ( this._search_interface ) {
            let search_results = await this._search_interface.get_search(query,offset,box_count);
            return(search_results)
        }
        return []
    }


    async process_custom_search(owner,req) {
        //-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
        let data = []
        if ( this._particular_user_searches !== false ) {
            try {
                let custom = this._particular_user_searches[owner]
                if ( custom ) {
                    data = await custom.process_search(req)
                }
            } catch (e) {
            }
        }
        return(data)
    }


    async run_custom_operation(owner,op) {
        let result = { "status" : "emtpy" } 
        if ( this._particular_user_searches !== false ) {
            try {
                let custom = this._particular_user_searches[owner]
                if ( custom ) {
                    let custom = this._particular_user_searches[owner]
                    result = await custom.run_op(op)
                }
            } catch(e) {}
            }
        return result
    }
    
    async particular_interface_info(item_key) {
        let result = { "status" : "emtpy" } 
        if ( this._particular_user_searches !== false ) {
            let custom = this._particular_user_searches[item_key]
            let op = { "cmd" : "info" } 
            result = await custom.run_op(op)
        }
        return(result)
    }


    rate_limited(uid) {
        return false
    }
    
    rate_limit_redirect(req,res) {
        return res.redirect('/')
    }

    async rated_search_processing(req,res) {
        //
        let uid = req.params.uid;
        if ( this.rate_limited(uid) ) {
            return this.rate_limit_redirect(req,res)
        }
        //
        let data = await this.process_search(req)
        return data
    }

    async rated_custom_search_processing(req,res) {
        let owner = req.params.owner;
        if ( this.rate_limited(owner) ) {
            return this.rate_limit_redirect(req,res)
        }
        if ( this._search_watcher ) {
            let data = this.process_custom_search(owner,req)
            //
            return data
        }
        return []
    }

    async rated_custom_search_ops(req,res) {
        let owner = req.params.owner;
        if ( this.rate_limited(owner) ) {
            return this.rate_limit_redirect(req,res)
        }
        let cmd = req.params.op
        if ( cmd === 'user-info' ) {
            let uid = req.body.uid
            let response = await this.particular_interface_info(owner,uid)  // particular_interface_info shall check for role access
            return response
        }
        //
        let op = {
            "cmd" : req.params.op,
            "req" : req
        }
        //
        if ( this._search_watcher ) {
            let data = await this.run_custom_operation(owner,op)
            return data
        }
    }
}


module.exports = RecordSearchApp