'use strict';
if(typeof console === undefined) {
	var console = {log: function() {}};
}

const THRESHOLD = -1.5;
const gs_url = setup_gs_url();

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
	fetch(url, {
		method: 'GET',
		mode: 'cors',
		cache: 'default',
	})
		.then(r => r.text())
		.then(base64 => {
			console.log('done loading');
			const binary = atob(base64);
			const buffer = new Uint8Array(binary.length);

			for (let i = 0; i < binary.length; i++) {
				buffer[i] = binary.charCodeAt(i);
			}

			const view = new DataView(buffer.buffer);
			const result = [];

			for (let i = 0; i < buffer.length; i += 6) {
				const a = view.getUint32(i);
				const b = view.getUint16(i + 4);

				result.push([a, b]);
			}

			console.log(`Data size ${result.length}`)
			parse(result);
		});
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

	return [peaks, nf];
}


function diff(arr) {
  const n = arr.length;
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

	let [peaks, nf] = peak_finder(time, water);

	draw_plots(
		[time, water],
		[peaks.slice(1), diff(peaks)],
		[time.slice(1), diff(time)],
		[time.slice(1), nf],
	);
}


function load_all() {
	console.log('fetching...');
	load_data(`${gs_url}?type=getBinary`);
}


function main() {
	console.log('fetching...');
	const data = load_data(`${gs_url}?type=getLastBinary`);
}

main();
