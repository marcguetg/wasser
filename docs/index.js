'use strict';
if(typeof console === undefined) {
	var console = {log: function() {}};
}
var FAKE = true;
var THRESHOLD = -3;

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
	if (FAKE) {
		let data = localStorage.getItem('Buffer');
		console.log(data);
		parse(JSON.parse(data));
	} else {
		fetch(`${url}?type=getData`)
			.then(
				resp => resp.json()
					.then(
						data => {
							console.log(data)
							localStorage.setItem('Buffer', JSON.stringify(data));
							parse(data);
						},
						err => console.log(err)
					)
			);
	}
}

function normalizeZScore(arr) {
	// mean
	const n = arr.length;
	let sum = arr.reduce((a, b) => a + b, 0);
	let mean = sum / n;
  
	// std
	let varr = arr.reduce((a, b) => a + (b - mean) ** 2);
	const std = Math.sqrt(varr / n);

	const out = new Float64Array(n);
	for (let i = 0; i < n; i++) {
		out[i] = (arr[i] - mean) / std;
	}

	return out;
}

function peak_finder(t, water) {
	let flow = diff(water);
	let nf = normalizeZScore(flow);

	let peaks = [];
	let last = null;

	nf.forEach((w, i) => {
		if (w > THRESHOLD) {
			if (last !== null) {
				peaks.push(t[i]);
				last = null;
			}
		} else {
			if ((last === null) || (w < water[last])) {
				last = i;
			}
		}
	});

	return peaks;
}


function diff(arr) {
  const n = arr.length;
  console.log(n);
  const out = new Float64Array(n - 1);

  for (let i = 0; i < n - 1; i++) {
    out[i] = arr[i + 1] - arr[i];
  }
  return out;
}


function parse(data) {
	let n = data.length;

	let time = new Float64Array(n);
	let water = new Float64Array(n);

	data.forEach((e, i) => {
		time[i] = e[0];
		water[i] = e[1];
	});

	let peaks = peak_finder(time, water);

	draw_plots(
		[time, water],
		[peaks.slice(1), diff(peaks)],
		[time.slice(1), diff(time)],
	);
}

function main() {
	const gs_url = setup_gs_url();
	console.log('fetching...');
	const data = load_data(gs_url);
	console.log('done loading');
}

main();
