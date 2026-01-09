'use strict';
if(typeof console === undefined) {
	var console = {log: function() {}};
}


function setup_gs_url() {
	const gs_url_input = document.getElementById('gs_url_input');
	var gs_url = localStorage.getItem('gs_url');
	gs_url_input.value = gs_url;
	gs_url_input.addEventListener('keydown', e => {
		if (event.key === 'Enter') {
			gs_url = gs_url_input.value;
			localStorage.setItem('gs_url', gs_url);
			location.reload();
		}
	});

	return gs_url;
}

function load_data(url) {
	fetch(`${url}?type=getData`)
		.then(
			resp => resp.json()
				.then(
					data => parse(data),
					err => console.log(err)
				)
		);
}

function parse(data) {
	var time = [];
	var water = [];
	var delta = [];
	var last = data[0][0];

	data.forEach(e => {
		time.push(e[0] * 1000);
		water.push(e[1]);
		delta.push(e[0] - last);
		last = e[0];
	});

	draw_plots(time, water, delta);
}

function main() {
	const gs_url = setup_gs_url();
	console.log('fetching...');
	const data = load_data(gs_url);
	console.log('done loading');
}

main();
