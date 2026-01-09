// taken from the example at https://leeoniya.github.io/uPlot/demos/zoom-touch.html
var WATER_PLOT;
var INTERVAL_PLOT;

function touchZoomPlugin(opts) {
	function init(u, opts, data) {
		let over = u.over;
		let rect, oxRange, oyRange, xVal, yVal;
		let fr = {x: 0, y: 0, dx: 0, dy: 0};
		let to = {x: 0, y: 0, dx: 0, dy: 0};

		function storePos(t, e) {
			let ts = e.touches;

			let t0 = ts[0];
			let t0x = t0.clientX - rect.left;
			let t0y = t0.clientY - rect.top;

			if (ts.length == 1) {
				t.x = t0x;
				t.y = t0y;
				t.d = t.dx = t.dy = 1;
			}
			else {
				let t1 = e.touches[1];
				let t1x = t1.clientX - rect.left;
				let t1y = t1.clientY - rect.top;

				let xMin = Math.min(t0x, t1x);
				let yMin = Math.min(t0y, t1y);
				let xMax = Math.max(t0x, t1x);
				let yMax = Math.max(t0y, t1y);

				// midpts
				t.y = (yMin+yMax)/2;
				t.x = (xMin+xMax)/2;

				t.dx = xMax - xMin;
				t.dy = yMax - yMin;

				// dist
				t.d = Math.sqrt(t.dx * t.dx + t.dy * t.dy);
			}
		}

		let rafPending = false;

		function zoom() {
			rafPending = false;

			let left = to.x;
			let top = to.y;

			// non-uniform scaling
		//	let xFactor = fr.dx / to.dx;
		//	let yFactor = fr.dy / to.dy;

			// uniform x/y scaling
			let xFactor = fr.d / to.d;
			let yFactor = fr.d / to.d;

			let leftPct = left/rect.width;
			let btmPct = 1 - top/rect.height;

			let nxRange = oxRange * xFactor;
			let nxMin = xVal - leftPct * nxRange;
			let nxMax = nxMin + nxRange;

			let nyRange = oyRange * yFactor;
			let nyMin = yVal - btmPct * nyRange;
			let nyMax = nyMin + nyRange;

			u.batch(() => {
				u.setScale("x", {
					min: nxMin,
					max: nxMax,
				});

				u.setScale("y", {
					min: nyMin,
					max: nyMax,
				});
			});
		}

		function touchmove(e) {
			storePos(to, e);

			if (!rafPending) {
				rafPending = true;
				requestAnimationFrame(zoom);
			}
		}

		over.addEventListener("touchstart", function(e) {
			rect = over.getBoundingClientRect();

			storePos(fr, e);

			oxRange = u.scales.x.max - u.scales.x.min;
			oyRange = u.scales.y.max - u.scales.y.min;

			let left = fr.x;
			let top = fr.y;

			xVal = u.posToVal(left, "x");
			yVal = u.posToVal(top, "y");

			document.addEventListener("touchmove", touchmove, {passive: true});
		});

		over.addEventListener("touchend", function(e) {
			document.removeEventListener("touchmove", touchmove, {passive: true});
		});
	}

	return {
		hooks: {
			init
		}
	};
}

const width = Math.min(window.innerWidth - 30, 500);
function create_plot_opts(title, series){
	return {
		id: "chart1",
		class: "my-chart",
		width: width,
		height: width,
		series: [{}, {label: series, stroke: 'black'}],
		title: title,
		legend: {
			isolate: true
		},
		scales: {
			x: {
				time: true
			}
		},
		plugins: [
			touchZoomPlugin()
		],
		hooks: {
			setScale: [
			(u, key) => {
				if (key == 'x') {
					let min = u.scales.x.min;
					let max = u.scales.x.max;

					WATER_PLOT.setScale('x', {min, max});
					INTERVAL_PLOT.setScale('x', {min, max});
				}
			}
			]
		},
		axes: [
			{
			space: 40,
			incrs: [
				// minute divisors (# of secs)
				1, 5, 10, 15, 30,
				// hour divisors
				60, 60 * 5, 60 * 10, 60 * 15, 60 * 30,
				// day divisors
				3600, 3600 * 6, 3600 * 24,
				// week divisor
				3600 * 24 * 7,
			],
			values: [
			// tick incr          default           year                             month    day                        hour     min                sec       mode
				[3600 * 24 * 365,   "{YYYY}",         null,                            null,    null,                      null,    null,              null,        1],
				[3600 * 24 * 28,    "{MMM}",          "\n{YYYY}",                      null,    null,                      null,    null,              null,        1],
				[3600 * 24,         "{D}.{M}",        "\n{YYYY}",                      null,    null,                      null,    null,              null,        1],
				[3600,              "{H}",		      "\n{D}.{M}.{YY}",                null,    "\n{D}.{M}",               null,    null,              null,        1],
				[60,                "{H}:{mm}",       "\n{D}.{M}.{YY}",                null,    "\n{D}.{M}",               null,    null,              null,        1],
				[1,                 ":{ss}",          "\n{D}.{M}.{YY} {H}:{mm}",       null,    "\n{D}.{M} {H}:{mm}",      null,    "\n{H}:{mm}",      null,        1],
				[0.001,             ":{ss}.{fff}",    "\n{D}.{M}.{YY} {H}:{mm}",       null,    "\n{D}.{M} {H}:{mm}",      null,    "\n{H}:{mm}",      null,        1],
			],
			},
		],
	};
}


function draw_plots(time, water, delay) {
	WATER_PLOT = new uPlot(create_plot_opts('Wasserlevel', 'mm'), [time, water], document.getElementById('Wasser'));
	INTERVAL_PLOT = new uPlot(create_plot_opts('Abtastintervall', 's'), [time, delay], document.getElementById('Abtastintervall'));
}
