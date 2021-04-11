<script>
	export let name;

	import ThingGrid from './ThingGrid.svelte';
	import FullThing from './ThingFull.svelte';
	import FloatWindow from './FloatWindow.svelte';

	import { onMount } from 'svelte';

	import {get_search} from "./search_box.js"

	const appsearch = 'search'  // songsearch  search

	let qlist_ordering = [
		{ id: 1, text: `update_date` },
		{ id: 2, text: `score` },
		{ id: 3, text: `create_date` }
	];

	let search_ordering = qlist_ordering[2];
	let search_topic = 'any'

	let g_max_title_chars = 20


	let current_roller_title = ""
	let current_roller_subject = ""


	let current_thing = { 
			"id" : 0, "color": 'grey',
			"entry" : 0,
			"title" : "no content",
			"dates" : {
				"created" : "never",
				"updated" : "never"
			},
			"subject" : "",
			"keys" : [  ],
			"t_type" : "",
			"txt_full" : "",
			"score" : 1.0
		}


	let window_scale = { "w" : 0.4, "h" : 0.6 }

	function popup_size() {
		let smallest_w = 200   // smallest and bigget willing to accomodate
		let biggest_w = 3000

		let smallest_h = 600
		let biggest_h = 1000

		// bounded window width
		let w = Math.max(smallest_w,window.innerWidth)
		w = Math.min(biggest_w,w)

		// bounded window height
		let h = Math.max(smallest_h,window.innerHeight)
		h = Math.min(biggest_h,h)

		let p_range
		let P
		//	percentage h range 
		let h_p_max = 0.80
		let h_p_min = 0.60
		p_range = h_p_max - h_p_min
		P = (biggest_h - h)/(biggest_h - smallest_h)
		console.log("P h: " + P)
		let h_scale = P*(p_range) + h_p_min

		//	percentage w range 
		let w_p_max = 0.96
		let w_p_min = 0.20
		p_range = w_p_max - w_p_min
		P = (biggest_w - w)/(biggest_w - smallest_w)
		console.log("P w: " + P)
		let w_scale = P*(p_range) + w_p_min

		// Setting the current height & width 
		// to the elements 

		return { "w" : w_scale, "h" : h_scale }
	}

	//
	window_scale = popup_size()
	//
	onMount(() => {
		window.addEventListener("resize", (e) => {
			//
			let scale = popup_size()
			//
			window_scale.h = scale.h; 
			window_scale.w = scale.w;
			//
		})
	})

	function handleMessage(event) {
		let key = "xy_"
		let txt = event.detail.text;
		let idx = txt.substr(txt.indexOf(key) + 3);

		let etype = event.detail.type
		idx = parseInt(idx);
		idx--;
		if ( (idx !== undefined) && (idx >= 0) && (idx < things.length)) {
			let athing = things[idx];
			if ( athing !== undefined ) {
				if ( etype === 'click' ) {
					current_thing = athing;
					start_floating_window();
				} else {
					current_roller_title = athing.title
					current_roller_subject = athing.subject
				}
			}
		}
	}


	let app_empty_object = { "id" : 1, "color": 'grey',
			"entry" : -1,
			"title" : "",
			"dates" : {
				"created" : "never",
				"updated" : "never"
			},
			"subject" : "",
			"keys" : [  ],
			"t_type" : "",
			"txt_full" : "",
			"score" : 1.0
		}

	let things = [				// window
		app_empty_object
	];

	let other_things = [];		// current data...		loaded from server 

	let article_count = 1
	let article_index = 1


	let box_delta = 1;		// how boxes to add when increasing the window


	function padd_other_things(count) {
		let n = count - other_things.length
		while ( n > 0 ) {
			other_things.push(false)
			n--
		}
	}

	function needs_data(start,end) {
		if ( other_things.length > 0 ) {
			for ( let i = start; i < end; i++ ) {
				if ( other_things[i] === false ) {
					return true
				}
			}
		}
		return(false)
	}

	function do_data_placement() {
		let end = (article_index + things.length)
		let start = article_index - 1
		if ( needs_data(start,end) ) {
			load_and_place_data(start,things.length)
		} else {
			place_data()
		}
	}


	function handleClick_remove() {
		for ( let i = 0; i < box_delta; i++ ) {
			let p = things
			p.pop()
			things = [...p];
		}
	}


	
	async function handleClick_add() {
		let start = things.length
		for ( let i = 0; i < box_delta; i++ ) {
			let thing_counter = things.length
			thing_counter++
			things = [...things, 
			{
				"id" : thing_counter, "color": "grey",
				"title" : "",
				"dates" : {
					"created" : "never",
					"updated" : "never"
				},
				"subject" : "",
				"keys" : [  ],
				"t_type" : "",
				"txt_full" : "",
				"score" : 1.0
			}];
		}
		//
		let end = things.length   /// start + box_delta
		if ( needs_data(start,end) ) {
			load_and_place_data(start,things.length)
		} else {
			place_data()
		}
		//
	}


	function clonify(obj) {
		let o = JSON.parse(JSON.stringify(obj))
		return o
	}

	function place_data(dstart) {
		let l = things.length;
		let lo = other_things.length;
		//
		let strt = (( dstart === undefined ) ? (article_index-1) : (dstart-1));
		//
		console.log(`place_data: ${strt}  ${lo}`)
		for ( let i = 0; i < l; i++ ) {
			if ( (strt + i) < lo ) {
				let oto = other_things[strt + i];
				if ( oto !== false ) {
					oto.id = i+1;
					things[i] = oto;
				} else {
					let ceo = clonify(app_empty_object);
					ceo.id = i+1;
					things[i] = ceo;
				}
			} else {
				let ceo = clonify(app_empty_object);
				ceo.id = i+1;
				things[i] = ceo;
			}
		}
	}

	function handle_index_changed() {
		do_data_placement()
		
	}
	function handleClick_first() {
		article_index = 1
		do_data_placement()
	}

	function handleClick_last() {
		article_index = article_count
		do_data_placement()
	}

	function handle_keyDown(ev) {
		if(ev.charCode == 13){
			article_index = 1
			data_fetcher(ev)
		}
	}

	function handle_order_change(ev) {
		article_index = 1
		data_fetcher(ev)
	}


	function load_and_place_data(start,how_many) {
		data_fetcher(null,start,how_many)
	}

	function handleClick_fetch(ev) {
		article_index = 1
		data_fetcher(ev)
	}

	async function data_fetcher(ev,qstart,alt_length) {
		let l = (alt_length === undefined) ? things.length : alt_length
		let stindex = (qstart === undefined) ? (article_index - 1): qstart
		let qry = encodeURIComponent(search_topic)

		qry += '|' + search_ordering.text
		//
		//console.log(search_ordering.text)
		//
		let uid = get_search(qry,true)
		//
		stindex = Math.max(0,stindex)
		let post_data = {
			"uid" : uid,
			"query" : qry,
			"box_count" : l,
			"offset" : stindex
		};
		try {
			let rest = `${post_data.uid}/${post_data.query}/${post_data.box_count}/${post_data.offset}`
			let srver = location.host
			let prot = location.protocol
			let sp = '//'
			let search_result = await postData(`${prot}${sp}${srver}/${appsearch}/${rest}`, post_data)
			if ( search_result ) {
				let data = search_result.data;
				if ( data ) {
					data = data.map(datum => {
						datum.subject = decodeURIComponent(datum.subject)
						datum.title = decodeURIComponent(datum.subject)
						datum.txt_full = decodeURIComponent(datum.txt_full)
						datum.keys = datum.keys.map(key => {
							return(decodeURIComponent(key))
						})
						return datum
					})
					if ( qstart === undefined ) {	// used the search button
						other_things = data;		// replace data
						article_index = 1
						let lo = search_result.count;
						article_count = lo;
						if ( lo > other_things.length ) {
							padd_other_things(lo)
						}
					} else {
						let lo = search_result.count;
						article_count = lo;
						if ( lo > other_things.length ) {
							padd_other_things(lo)
						}

						let n = data.length
						for ( let i = 0; i < n; i++ ) {
							other_things[i + stindex] = data.shift()
						}
						// // 
					}
					place_data()
				}
			}
		} catch (e) {
			alert(e.message)
		}
	}

	
</script>



<div>

	<div style="border: solid 2px navy;padding: 4px;background-color:#EFEFEF;">
		<div class="blg-ctrl-panel" style="display:inline-block;vertical-align:bottom;background-color:#EFFFFE" >
			<span style="color:navy;font-weight:bold">Boxes</span>
			<input type=number class="blg-ctl-number-field" bind:value={box_delta} min=1 max=4>

			<button class="blg-ctl-button" on:click={handleClick_remove}>
				-
			</button>

			<button class="blg-ctl-button"  on:click={handleClick_add}>
				+
			</button>
		</div>
		<div class="blg-ctrl-panel" style="display:inline-block;vertical-align:bottom;background-color:#EFEFFE" >
			<button on:click={handleClick_fetch}>
				search
			</button>
			<div style="display:inline-block;">
			&nbsp;<input type=text bind:value={search_topic} on:keypress={handle_keyDown} >
			</div>
		</div>
		<div class="blg-ctrl-panel" style="display:inline-block;background-color:#FFFFFA" >
			
			<button class="blg-ctl-button" on:click={handleClick_first}>&le;</button>
			<input class="blg-ctl-slider" type=range bind:value={article_index} min=1 max={article_count} on:change={handle_index_changed} >
			<button class="blg-ctl-button" on:click={handleClick_last}>&ge;</button>
			<input type=number class="blg-ctl-number-field" bind:value={article_index} min=1 max={article_count} on:change={handle_index_changed} >
			of {article_count}
		</div>
		<div class="blg-ctrl-panel" style="display:inline-block;background-color:#FFFFFA" >
			<select bind:value={search_ordering} on:change="{handle_order_change}">
				{#each qlist_ordering as ordering}
					<option value={ordering}>
						{ordering.text}
					</option>
				{/each}
			</select>

		</div>
	</div>
	<div style="border: solid 1px grey;padding: 4px;background-color:#F5F6EF;">
		<div class="sel-titles" >Title: {current_roller_title}</div><div class="sel-titles">Subject: {current_roller_subject}</div>
	</div>
  
	<div class="blg-grid-container">
		<ThingGrid things={things} on:message={handleMessage} />
	</div>

	
</div>


<FloatWindow title={current_thing.title.substr(0,g_max_title_chars) + '...'} scale_size={window_scale} use_smoke={false}>
	<FullThing {...current_thing} />
</FloatWindow>


<style>

	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	.blg-grid-container {
		border-top : solid 2px green;
		padding-top: 4px;
		height: calc(100vh - 240px);
		overflow-y:scroll;
		background-color: rgb(250, 250, 242);
	}

	.blg-ctl-button {
		max-width: 20px;
		border-radius: 6px;
	}

	.blg-ctl-slider {
		height: 35px;
		vertical-align: bottom;
	}

	.blg-ctl-number-field {
		max-width: 60px
	}

	.blg-ctrl-panel {
		padding:2px;
		padding-left:6px;
		padding-right:4px;
		margin:0px;
		border: none;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	.sel-titles {
		display:inline-block;
		width:45%;
		font-weight:bold;
		color:black;
		font-size:0.75em;
		margin: 6px;
	}


</style>
