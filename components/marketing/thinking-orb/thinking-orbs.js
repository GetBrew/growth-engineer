/*
MIT License

Copyright (c) 2026 Jakub Antalik

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Vanilla JavaScript adaptation of Thinking Orbs:
https://github.com/Jakubantalik/thinking-orbs
*/

export function thinkingOrbs(scope = document, options = {}) {
	const config = {
		state: "working",
		size: 64,
		speed: 1,
		theme: "auto",
		paused: false,
		...options,
	};

	const labels = {
		working: "Working…",
		searching: "Searching…",
		solving: "Solving…",
		listening: "Listening…",
		composing: "Composing…",
		shaping: "Shaping…",
	};

	const stateToMode = {
		working: "orbits",
		searching: "globe",
		solving: "rubik",
		listening: "wave",
		composing: "ribbon",
		shaping: "morph",
	};

	const baseProfiles = {
		globe: {
			latRings: 17,
			lonDensity: 44,
			rBase: 0.6,
			rDepth: 1.7,
			rBoost: 1,
			inkFar: 0.62,
			inkSpan: 0.54,
			rsPow: 0.6,
			rMin: 0.3,
		},
		orbits: {
			orbitN: 12,
			ghostN: 40,
			ghostR: 0.9,
			ghostA: 0.5,
			particles: 3,
			partR: 1.2,
			partRDepth: 1.6,
			rsPow: 0.6,
			rMin: 0.3,
		},
		rubik: {
			latRings: 15,
			lonDensity: 40,
			moveCount: 14,
			rBase: 0.6,
			rDepth: 1.7,
			rActive: 0.3,
			inkFar: 0.62,
			inkSpan: 0.54,
			rsPow: 0.6,
			rMin: 0.3,
		},
		wave: {
			rings: 15,
			lonDensity: 40,
			rBase: 0.6,
			rDepth: 1.7,
			rsPow: 0.6,
			rMin: 0.3,
		},
		ribbon: {
			lanes: 5,
			segs: 88,
			ghostN: 150,
			rBase: 1.1,
			rDepth: 1.7,
			rsPow: 0.6,
			rMin: 0.3,
		},
		morph: {
			rDot: 0.021,
			iconD: 1,
			rMin: 0.25,
		},
	};

	const presets = {
		orbits: {
			20: { speed: 3.9, count: 0.238, size: 2.4 },
			64: { speed: 1.885, count: 1, size: 1 },
		},
		globe: {
			20: {
				speed: 2.665,
				count: 0.105,
				size: 1.75,
				extra: { scanMul: 4.335, dimBase: 0.45 },
			},
			64: {
				speed: 2.015,
				count: 0.42,
				size: 1.15,
				extra: { scanMul: 4.08, dimBase: 0.45 },
			},
		},
		rubik: {
			20: { speed: 1.95, count: 0.088, size: 1.9 },
			64: { speed: 1.82, count: 0.35, size: 1.05 },
		},
		wave: {
			20: { speed: 3.998, count: 0.105, size: 1.6 },
			64: { speed: 4.388, count: 0.341, size: 1 },
		},
		ribbon: {
			20: {
				speed: 3.12,
				count: 0.051,
				size: 1.073,
				extra: { spin: 0, bandMul: 4.94, wobMul: 1 },
			},
			64: {
				speed: 2.34,
				count: 0.25,
				size: 0.85,
				extra: { spin: 0, bandMul: 3.9, wobMul: 1 },
			},
		},
		morph: {
			20: {
				speed: 2.08,
				count: 0.53,
				size: 1.011,
				extra: { spread: 1.45 },
			},
			64: {
				speed: 2.405,
				count: 0.54,
				size: 0.395,
				extra: { spread: 1.45 },
			},
		},
	};

	const clamp = (value, min = 0, max = 1) =>
		Math.min(max, Math.max(min, value));
	const mix = (from, to, progress) => from + (to - from) * progress;
	const readNumber = (value, fallback) => {
		const number = Number.parseFloat(value);
		return Number.isFinite(number) ? number : fallback;
	};
	const readBoolean = (value, fallback) => {
		if (value === undefined) return fallback;
		return value !== "false";
	};
	const hash = (a, b) => {
		const value = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
		return value - Math.floor(value);
	};
	const angleDelta = (a, b) =>
		Math.atan2(Math.sin(a - b), Math.cos(a - b));
	const radiusScale = (size, power) => (size / 300) ** power;
	const fibonacciDirection = (index, count) => {
		const golden = Math.PI * (3 - Math.sqrt(5));
		const y = 1 - (2 * (index + 0.5)) / count;
		const radius = Math.sqrt(1 - y * y);
		const angle = index * golden;
		return [radius * Math.cos(angle), y, radius * Math.sin(angle)];
	};

	const makeProjector = (yaw, tilt, centerX, centerY, scale) => {
		const sinTilt = Math.sin(tilt);
		const cosTilt = Math.cos(tilt);
		const sinYaw = Math.sin(yaw);
		const cosYaw = Math.cos(yaw);

		return (x, y, z) => {
			const rotatedX = x * cosYaw + z * sinYaw;
			const rotatedZ = -x * sinYaw + z * cosYaw;
			const rotatedY = y * cosTilt - rotatedZ * sinTilt;
			const depth = y * sinTilt + rotatedZ * cosTilt;
			return [
				centerX + rotatedX * scale,
				centerY - rotatedY * scale,
				depth,
			];
		};
	};

	const paintDots = (context, dots, dark, minimumRadius = 0.3) => {
		dots.sort((first, second) => first.z - second.z);

		dots.forEach((dot) => {
			const alpha = dot.a ?? 1;
			if (alpha < 0.02) return;

			const white = clamp(dot.white);
			const gray = Math.round((dark ? 1 - white : white) * 255);
			context.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
			context.beginPath();
			context.arc(
				dot.x,
				dot.y,
				Math.max(minimumRadius, dot.r),
				0,
				Math.PI * 2,
			);
			context.fill();
		});
	};

	const countPairs = [
		["latRings", "lonDensity"],
		["rings", "lonDensity"],
		["lanes", "segs"],
	];
	const countKeys = ["orbitN", "ghostN"];
	const radiusKeys = [
		"rBase",
		"rDepth",
		"rActive",
		"rDot",
		"ghostR",
		"partR",
		"partRDepth",
	];

	const scaleCounts = (source, multiplier) => {
		const output = { ...source };
		const scaledKeys = new Set();
		const pairMultiplier = Math.sqrt(multiplier);

		countPairs.forEach(([firstKey, secondKey]) => {
			if (
				output[firstKey] === undefined ||
				output[secondKey] === undefined ||
				scaledKeys.has(firstKey) ||
				scaledKeys.has(secondKey)
			) {
				return;
			}

			output[firstKey] = Math.max(
				2,
				Math.round(output[firstKey] * pairMultiplier),
			);
			output[secondKey] = Math.max(
				2,
				Math.round(output[secondKey] * pairMultiplier),
			);
			scaledKeys.add(firstKey);
			scaledKeys.add(secondKey);
		});

		countKeys.forEach((key) => {
			if (output[key] === undefined || scaledKeys.has(key)) return;
			output[key] = Math.max(1, Math.round(output[key] * multiplier));
		});

		if (output.iconD !== undefined) {
			output.iconD = Math.max(0.02, output.iconD * multiplier);
		}

		return output;
	};

	const scaleRadii = (source, multiplier) => {
		const output = { ...source };
		radiusKeys.forEach((key) => {
			if (output[key] !== undefined) output[key] *= multiplier;
		});
		return output;
	};

	const resolvePreset = (state, size) => {
		const mode = stateToMode[state];
		const small = presets[mode][20];
		const large = presets[mode][64];
		const progress = clamp((size - 20) / 44);
		const countMultiplier = mix(small.count, large.count, progress);
		const sizeMultiplier = mix(small.size, large.size, progress);
		let drawOptions = scaleCounts(baseProfiles[mode], countMultiplier);
		drawOptions = scaleRadii(drawOptions, sizeMultiplier);

		const extraKeys = new Set([
			...Object.keys(small.extra ?? {}),
			...Object.keys(large.extra ?? {}),
		]);
		extraKeys.forEach((key) => {
			const smallValue = small.extra?.[key] ?? large.extra?.[key];
			const largeValue = large.extra?.[key] ?? small.extra?.[key];
			drawOptions[key] = mix(smallValue, largeValue, progress);
		});

		return {
			mode,
			baseSpeed: mix(small.speed, large.speed, progress),
			drawOptions,
		};
	};

	const drawOrbits = (context, size, time, dark, drawOptions) => {
		const center = size / 2;
		const radius = center * 0.82;
		const project = makeProjector(time * 0.12, 0.3, center, center, 1);
		const dotScale = radiusScale(size, drawOptions.rsPow ?? 0.6);
		const dots = [];
		const orbitCount = drawOptions.orbitN ?? 12;
		const ghostCount = drawOptions.ghostN ?? 40;
		const particleCount = drawOptions.particles ?? 3;

		for (let orbit = 0; orbit < orbitCount; orbit += 1) {
			const firstRandom = hash(orbit, 1.7);
			const secondRandom = hash(orbit, 5.2);
			const thirdRandom = hash(orbit, 8.9);
			const orbitRadius = radius * (0.45 + 0.52 * firstRandom);
			const longitude = firstRandom * 2 * Math.PI;
			const latitude = Math.acos(2 * secondRandom - 1);
			const normalX = Math.sin(latitude) * Math.cos(longitude);
			const normalY = Math.cos(latitude);
			const normalZ = Math.sin(latitude) * Math.sin(longitude);
			let unitX = -normalY;
			let unitY = normalX;
			const unitZ = 0;
			const unitLength = Math.max(
				0.000001,
				Math.hypot(unitX, unitY),
			);
			unitX /= unitLength;
			unitY /= unitLength;
			const perpendicularX = normalY * unitZ - normalZ * unitY;
			const perpendicularY = normalZ * unitX - normalX * unitZ;
			const perpendicularZ = normalX * unitY - normalY * unitX;
			const direction = thirdRandom > 0.5 ? 1 : -1;
			const orbitSpeed = (0.25 + 0.55 * thirdRandom) * direction;

			for (let index = 0; index < ghostCount; index += 1) {
				const angle = (index / ghostCount) * 2 * Math.PI;
				const cosine = Math.cos(angle);
				const sine = Math.sin(angle);
				const [x, y, z] = project(
					(unitX * cosine + perpendicularX * sine) * orbitRadius,
					(unitY * cosine + perpendicularY * sine) * orbitRadius,
					(unitZ * cosine + perpendicularZ * sine) * orbitRadius,
				);
				const depth = (z / orbitRadius + 1) / 2;
				dots.push({
					x,
					y,
					z,
					r: (drawOptions.ghostR ?? 0.9) * dotScale,
					white: 0.72,
					a: (drawOptions.ghostA ?? 0.5) * (0.4 + 0.6 * depth),
				});
			}

			for (let index = 0; index < particleCount; index += 1) {
				const angle =
					time * orbitSpeed +
					(index / particleCount) * 2 * Math.PI +
					secondRandom * 6;
				const cosine = Math.cos(angle);
				const sine = Math.sin(angle);
				const [x, y, z] = project(
					(unitX * cosine + perpendicularX * sine) * orbitRadius,
					(unitY * cosine + perpendicularY * sine) * orbitRadius,
					(unitZ * cosine + perpendicularZ * sine) * orbitRadius,
				);
				const depth = (z / orbitRadius + 1) / 2;
				dots.push({
					x,
					y,
					z,
					r:
						((drawOptions.partR ?? 1.2) +
							(drawOptions.partRDepth ?? 1.6) * depth) *
						dotScale,
					white: 0.3 - 0.22 * depth,
				});
			}
		}

		paintDots(context, dots, dark, drawOptions.rMin);
	};

	const drawGlobe = (context, size, time, dark, drawOptions) => {
		const center = size / 2;
		const radius = center * 0.82;
		const spin = 0.5;
		const tilt = 0.4 + 0.06 * Math.sin(time * 0.35);
		const project = makeProjector(
			time * spin,
			tilt,
			center,
			center,
			radius,
		);
		const scan =
			time * (spin + (1.7 - spin) * (drawOptions.scanMul ?? 1));
		const dotScale = radiusScale(size, drawOptions.rsPow ?? 0.6);
		const dots = [];
		const latitudeRings = drawOptions.latRings ?? 17;
		const longitudeDensity = drawOptions.lonDensity ?? 44;

		for (let ring = 0; ring <= latitudeRings; ring += 1) {
			const latitude = -Math.PI / 2 + (ring / latitudeRings) * Math.PI;
			const cosineLatitude = Math.cos(latitude);
			const sineLatitude = Math.sin(latitude);
			const longitudeCount = Math.max(
				1,
				Math.round(Math.abs(cosineLatitude) * longitudeDensity),
			);

			for (let index = 0; index < longitudeCount; index += 1) {
				const longitude = (index / longitudeCount) * 2 * Math.PI;
				const [x, y, z] = project(
					cosineLatitude * Math.cos(longitude),
					sineLatitude,
					cosineLatitude * Math.sin(longitude),
				);
				const depth = (z + 1) / 2;
				const distance = angleDelta(longitude + time * spin, scan);
				const boost =
					Math.exp(-(distance * distance) / 0.18) * Math.max(0, z);
				const dimBase = drawOptions.dimBase ?? 1;

				dots.push({
					x,
					y,
					z,
					r:
						((drawOptions.rBase ?? 0.6) +
							(drawOptions.rDepth ?? 1.7) * depth +
							(drawOptions.rBoost ?? 1) * boost) *
						dotScale,
					white:
						(drawOptions.inkFar ?? 0.62) -
						(drawOptions.inkSpan ?? 0.54) * depth,
					a: dimBase + (1 - dimBase) * Math.min(1, boost),
				});
			}
		}

		paintDots(context, dots, dark, drawOptions.rMin);
	};

	const moveCache = new Map();
	const getMoves = (count) => {
		if (moveCache.has(count)) return moveCache.get(count);

		const moves = [];
		for (let index = 0; index < count; index += 1) {
			const axis = Math.min(2, Math.floor(hash(index, 2.3) * 3));
			const minimum =
				-1 + 0.5 * Math.min(3, Math.floor(hash(index, 5.9) * 4));
			const direction = hash(index, 7.7) < 0.5 ? 1 : -1;
			moves.push({
				axis,
				minimum,
				maximum: minimum + 0.5,
				angle: (direction * Math.PI) / 2,
			});
		}

		moveCache.set(count, moves);
		return moves;
	};

	const getSolveCycle = (time, count, slotDuration, restDuration) => {
		const cycleDuration = 2 * count * slotDuration + restDuration;
		const cycleTime = time % cycleDuration;
		const amounts = new Array(count).fill(0);
		let activeMove = -1;

		if (cycleTime < 2 * count * slotDuration) {
			const slot = Math.floor(cycleTime / slotDuration);
			const slotProgress =
				(cycleTime - slot * slotDuration) / slotDuration;
			const clampedProgress = Math.min(1, slotProgress / 0.7);
			const easedProgress = 1 - (1 - clampedProgress) ** 3;

			if (slot < count) {
				for (let index = 0; index < slot; index += 1) amounts[index] = 1;
				amounts[slot] = easedProgress;
				activeMove = slot;
			} else {
				const reverseIndex = 2 * count - 1 - slot;
				for (let index = 0; index < reverseIndex; index += 1) {
					amounts[index] = 1;
				}
				amounts[reverseIndex] = 1 - easedProgress;
				activeMove = reverseIndex;
			}
		}

		return { amounts, activeMove };
	};

	const applyMoves = (point, moves, solveCycle) => {
		let [x, y, z] = point;
		let inActiveMove = false;

		moves.forEach((move, index) => {
			const amount = solveCycle.amounts[index];
			if (amount <= 0) return;

			const coordinate = move.axis === 0 ? x : move.axis === 1 ? y : z;
			if (coordinate < move.minimum || coordinate >= move.maximum) return;
			if (index === solveCycle.activeMove) inActiveMove = true;

			const angle = move.angle * amount;
			const cosine = Math.cos(angle);
			const sine = Math.sin(angle);

			if (move.axis === 0) {
				const nextY = y * cosine - z * sine;
				z = y * sine + z * cosine;
				y = nextY;
			} else if (move.axis === 1) {
				const nextX = x * cosine + z * sine;
				z = -x * sine + z * cosine;
				x = nextX;
			} else {
				const nextX = x * cosine - y * sine;
				y = x * sine + y * cosine;
				x = nextX;
			}
		});

		return [x, y, z, inActiveMove];
	};

	const drawRubik = (context, size, time, dark, drawOptions) => {
		const center = size / 2;
		const radius = center * 0.82;
		const project = makeProjector(
			time * 0.55,
			0.35 + 0.1 * Math.sin(time * 0.9),
			center,
			center,
			radius,
		);
		const dotScale = radiusScale(size, drawOptions.rsPow ?? 0.6);
		const moveCount = drawOptions.moveCount ?? 14;
		const moves = getMoves(moveCount);
		const solveCycle = getSolveCycle(time, moveCount, 0.42, 1.2);
		const latitudeRings = drawOptions.latRings ?? 15;
		const longitudeDensity = drawOptions.lonDensity ?? 40;
		const dots = [];

		for (let ring = 0; ring <= latitudeRings; ring += 1) {
			const latitude = -Math.PI / 2 + (ring / latitudeRings) * Math.PI;
			const cosineLatitude = Math.cos(latitude);
			const sineLatitude = Math.sin(latitude);
			const longitudeCount = Math.max(
				1,
				Math.round(Math.abs(cosineLatitude) * longitudeDensity),
			);

			for (let index = 0; index < longitudeCount; index += 1) {
				const longitude = (index / longitudeCount) * 2 * Math.PI;
				const movedPoint = applyMoves(
					[
						cosineLatitude * Math.cos(longitude),
						sineLatitude,
						cosineLatitude * Math.sin(longitude),
					],
					moves,
					solveCycle,
				);
				const [x, y, z] = project(
					movedPoint[0],
					movedPoint[1],
					movedPoint[2],
				);
				const depth = (z + 1) / 2;
				const activeSize = movedPoint[3] ? drawOptions.rActive ?? 0.3 : 0;

				dots.push({
					x,
					y,
					z,
					r:
						((drawOptions.rBase ?? 0.6) +
							(drawOptions.rDepth ?? 1.7) * depth +
							activeSize) *
						dotScale,
					white:
						(drawOptions.inkFar ?? 0.62) -
						(drawOptions.inkSpan ?? 0.54) * depth -
						(movedPoint[3] ? 0.14 : 0),
				});
			}
		}

		paintDots(context, dots, dark, drawOptions.rMin);
	};

	const drawWave = (context, size, time, dark, drawOptions) => {
		const center = size / 2;
		const radius = center * 0.874;
		const project = makeProjector(time * 0.18, 0.38, center, center, 1);
		const dotScale = radiusScale(size, drawOptions.rsPow ?? 0.6);
		const ringCount = drawOptions.rings ?? 15;
		const longitudeDensity = drawOptions.lonDensity ?? 40;
		const dots = [];

		for (let ring = 0; ring <= ringCount; ring += 1) {
			const latitude = -Math.PI / 2 + (ring / ringCount) * Math.PI;
			const cosineLatitude = Math.cos(latitude);
			const sineLatitude = Math.sin(latitude);
			const wave =
				0.62 * Math.sin(time * 2.1 - ring * 0.52) +
				0.38 * Math.sin(time * 1.27 + ring * 0.83);
			const ringRadius = radius * (0.88 + 0.105 * wave);
			const longitudeCount = Math.max(
				1,
				Math.round(Math.abs(cosineLatitude) * longitudeDensity),
			);

			for (let index = 0; index < longitudeCount; index += 1) {
				const longitude = (index / longitudeCount) * 2 * Math.PI;
				const [x, y, z] = project(
					cosineLatitude * Math.cos(longitude) * ringRadius,
					sineLatitude * ringRadius,
					cosineLatitude * Math.sin(longitude) * ringRadius,
				);
				const depth = (z / radius + 1) / 2;
				const crest = Math.max(0, wave);

				dots.push({
					x,
					y,
					z,
					r:
						((drawOptions.rBase ?? 0.6) +
							(drawOptions.rDepth ?? 1.7) * depth) *
						(1 + 0.4 * crest) *
						dotScale,
					white: 0.66 - 0.56 * depth - 0.1 * crest,
				});
			}
		}

		paintDots(context, dots, dark, drawOptions.rMin);
	};

	const drawRibbon = (context, size, time, dark, drawOptions) => {
		const center = size / 2;
		const radius = center * 0.78;
		const spin = drawOptions.spin ?? 1;
		const project = makeProjector(
			time * 0.1 * spin,
			0.3,
			center,
			center,
			1,
		);
		const dotScale = radiusScale(size, drawOptions.rsPow ?? 0.6);
		const dots = [];
		const ghostCount = drawOptions.ghostN ?? 150;

		for (let index = 0; index < ghostCount; index += 1) {
			const direction = fibonacciDirection(index, ghostCount);
			const [x, y, z] = project(
				direction[0] * radius,
				direction[1] * radius,
				direction[2] * radius,
			);
			const depth = (z / radius + 1) / 2;
			dots.push({
				x,
				y,
				z,
				r: 0.8 * dotScale,
				white: 0.78,
				a: 0.1 + 0.22 * depth,
			});
		}

		const yaw = time * 0.24 * spin;
		const tilt = 0.55 + 0.3 * Math.sin(time * 0.18) * spin;
		const unitX = Math.cos(yaw);
		const unitY = 0;
		const unitZ = Math.sin(yaw);
		const perpendicularX = -unitZ * Math.sin(tilt);
		const perpendicularY = Math.cos(tilt);
		const perpendicularZ = unitX * Math.sin(tilt);
		const normalX = unitY * perpendicularZ - unitZ * perpendicularY;
		const normalY = unitZ * perpendicularX - unitX * perpendicularZ;
		const normalZ = unitX * perpendicularY - unitY * perpendicularX;
		const baseLanes = drawOptions.lanes ?? 5;
		const segmentCount = drawOptions.segs ?? 88;
		const laneCount = Math.max(
			1,
			Math.round(baseLanes * (drawOptions.bandMul ?? 1)),
		);

		for (let lane = 0; lane < laneCount; lane += 1) {
			const laneOffset = (lane - (laneCount - 1) / 2) * 0.075;
			const edge =
				Math.abs(lane - (laneCount - 1) / 2) /
				Math.max(1, (laneCount - 1) / 2);

			for (let segment = 0; segment < segmentCount; segment += 1) {
				const angle = (segment / segmentCount) * 2 * Math.PI;
				const wobble =
					(0.16 * Math.sin(angle * 3 - time * 1.7 + lane * 0.22) +
						0.07 * Math.sin(angle * 5 + time * 1.1)) *
					(drawOptions.wobMul ?? 1);
				const offset = laneOffset + wobble;
				const rawX =
					unitX * Math.cos(angle) +
					perpendicularX * Math.sin(angle) +
					normalX * offset;
				const rawY =
					unitY * Math.cos(angle) +
					perpendicularY * Math.sin(angle) +
					normalY * offset;
				const rawZ =
					unitZ * Math.cos(angle) +
					perpendicularZ * Math.sin(angle) +
					normalZ * offset;
				const length = Math.hypot(rawX, rawY, rawZ);
				const [x, y, z] = project(
					(rawX / length) * radius,
					(rawY / length) * radius,
					(rawZ / length) * radius,
				);
				const depth = (z / radius + 1) / 2;

				dots.push({
					x,
					y,
					z,
					r:
						((drawOptions.rBase ?? 1.1) +
							(drawOptions.rDepth ?? 1.7) * depth) *
						(1 - 0.25 * edge) *
						dotScale,
					white: 0.52 - 0.44 * depth + 0.18 * edge,
					a: 0.4 + 0.6 * depth,
				});
			}
		}

		paintDots(context, dots, dark, drawOptions.rMin);
	};

	const smoothStep = (value) => value * value * (3 - 2 * value);
	const makePolygonPath = (vertices) => {
		const lengths = [];
		let totalLength = 0;

		vertices.forEach((vertex, index) => {
			const nextVertex = vertices[(index + 1) % vertices.length];
			const length = Math.hypot(
				nextVertex[0] - vertex[0],
				nextVertex[1] - vertex[1],
			);
			lengths.push(length);
			totalLength += length;
		});

		return (progress) => {
			let targetLength = progress * totalLength;
			let segment = 0;
			while (
				targetLength > lengths[segment] &&
				segment < vertices.length - 1
			) {
				targetLength -= lengths[segment];
				segment += 1;
			}

			const first = vertices[segment];
			const second = vertices[(segment + 1) % vertices.length];
			const segmentProgress = lengths[segment]
				? Math.min(1, targetLength / lengths[segment])
				: 0;
			return [
				mix(first[0], second[0], segmentProgress),
				mix(first[1], second[1], segmentProgress),
			];
		};
	};

	const regularPolygonVertices = (sides, radius, rotation = -Math.PI / 2) =>
		Array.from({ length: sides }, (_unused, index) => {
			const angle = rotation + (index / sides) * 2 * Math.PI;
			return [Math.cos(angle) * radius, Math.sin(angle) * radius];
		});

	const starVertices = (points, outerRadius, innerRadius) =>
		Array.from({ length: points * 2 }, (_unused, index) => {
			const angle = -Math.PI / 2 + (index / (points * 2)) * 2 * Math.PI;
			const radius = index % 2 === 0 ? outerRadius : innerRadius;
			return [Math.cos(angle) * radius, Math.sin(angle) * radius];
		});

	const circlePath = (progress) => {
		const angle = -Math.PI / 2 + progress * 2 * Math.PI;
		return [Math.cos(angle) * 0.24, Math.sin(angle) * 0.24];
	};
	const trianglePath = makePolygonPath([
		[0, -0.26],
		[0.24, 0.16],
		[-0.24, 0.16],
	]);
	const squarePath = makePolygonPath([
		[0, -0.2],
		[0.2, -0.2],
		[0.2, 0.2],
		[-0.2, 0.2],
		[-0.2, -0.2],
	]);
	const pentagonPath = makePolygonPath(regularPolygonVertices(5, 0.25));
	const starPath = makePolygonPath(starVertices(5, 0.27, 0.12));
	const morphPaths = [
		circlePath,
		trianglePath,
		squarePath,
		pentagonPath,
		starPath,
	];

	const drawMorph = (context, size, time, dark, drawOptions) => {
		const holdDuration = 1.4;
		const morphDuration = 0.9;
		const segmentDuration = holdDuration + morphDuration;
		const cycleTime = time % (segmentDuration * morphPaths.length);
		const pathIndex = Math.floor(cycleTime / segmentDuration);
		const localTime = cycleTime - pathIndex * segmentDuration;
		const morphProgress =
			localTime > holdDuration
				? smoothStep((localTime - holdDuration) / morphDuration)
				: 0;
		const spread = drawOptions.spread ?? 1;
		const firstPath = morphPaths[pathIndex];
		const secondPath = morphPaths[(pathIndex + 1) % morphPaths.length];
		const sampleCount = 160;
		const sampledPoints = [];

		for (let index = 0; index < sampleCount; index += 1) {
			const progress = index / sampleCount;
			const firstPoint = firstPath(progress);
			const secondPoint = secondPath(progress);
			sampledPoints.push([
				mix(firstPoint[0], secondPoint[0], morphProgress) * spread,
				mix(firstPoint[1], secondPoint[1], morphProgress) * spread,
			]);
		}

		const segmentLengths = [];
		let totalLength = 0;
		sampledPoints.forEach((point, index) => {
			const nextPoint = sampledPoints[(index + 1) % sampleCount];
			const length = Math.hypot(
				nextPoint[0] - point[0],
				nextPoint[1] - point[1],
			);
			segmentLengths.push(length);
			totalLength += length;
		});

		const dotCount = Math.max(
			6,
			Math.round(44 * (drawOptions.iconD ?? 1)),
		);
		const dotRadius = (drawOptions.rDot ?? 0.021) * 2.1 * spread;
		const pulse = 1 + 0.02 * Math.sin(localTime * 3.1);
		const center = size / 2;
		const dots = [];
		let segment = 0;
		let accumulatedLength = 0;

		for (let index = 0; index < dotCount; index += 1) {
			const targetLength = (index / dotCount) * totalLength;
			while (
				accumulatedLength + segmentLengths[segment] < targetLength &&
				segment < sampleCount - 1
			) {
				accumulatedLength += segmentLengths[segment];
				segment += 1;
			}

			const firstPoint = sampledPoints[segment];
			const secondPoint = sampledPoints[(segment + 1) % sampleCount];
			const segmentProgress = segmentLengths[segment]
				? Math.min(
						1,
						(targetLength - accumulatedLength) / segmentLengths[segment],
					)
				: 0;
			const x = mix(firstPoint[0], secondPoint[0], segmentProgress) * pulse;
			const y = mix(firstPoint[1], secondPoint[1], segmentProgress) * pulse;

			dots.push({
				x: center + x * size,
				y: center + y * size,
				z: 0,
				r: Math.max(0.35, dotRadius * size),
				white: 0.1,
			});
		}

		paintDots(context, dots, dark, drawOptions.rMin);
	};

	const modeDrawers = {
		orbits: drawOrbits,
		globe: drawGlobe,
		rubik: drawRubik,
		wave: drawWave,
		ribbon: drawRibbon,
		morph: drawMorph,
	};

	const selector = "[data-thinking-orb]";
	const canvases = [];
	if (scope instanceof Element && scope.matches(selector)) canvases.push(scope);
	if (scope.querySelectorAll) canvases.push(...scope.querySelectorAll(selector));
	if (!canvases.length) return () => {};

	const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
	const reducedMotionQuery = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	);
	let reducedMotion = reducedMotionQuery.matches;
	let animationFrame = 0;
	let sharedListenersRemoved = false;
	let intersectionObserver;
	let themeObserver;
	const instances = [];

	const getAncestorTheme = (element) => {
		let currentElement = element;
		while (currentElement) {
			const theme = currentElement.getAttribute("data-theme");
			if (theme === "dark") return true;
			if (theme === "light") return false;
			if (currentElement.classList.contains("dark")) return true;
			if (currentElement.classList.contains("light")) return false;
			currentElement = currentElement.parentElement;
		}
		return null;
	};

	const resolveDarkTheme = (instance) => {
		if (instance.theme === "dark") return true;
		if (instance.theme === "light") return false;
		return getAncestorTheme(instance.canvas) ?? systemThemeQuery.matches;
	};

	const drawFrame = (instance, time) => {
		const { context, size, devicePixelRatio } = instance;
		context.setTransform(
			devicePixelRatio,
			0,
			0,
			devicePixelRatio,
			0,
			0,
		);
		context.clearRect(0, 0, size, size);
		instance.draw(
			context,
			size,
			time,
			instance.dark,
			instance.drawOptions,
		);
	};

	const canAnimate = (instance) =>
		!instance.destroyed &&
		!instance.paused &&
		instance.effectiveSpeed > 0 &&
		instance.visible &&
		!reducedMotion &&
		document.visibilityState !== "hidden";

	const render = () => {
		animationFrame = 0;
		const time = performance.now() / 1000;
		let needsAnotherFrame = false;

		instances.forEach((instance) => {
			if (!canAnimate(instance)) return;
			drawFrame(instance, time * instance.effectiveSpeed);
			needsAnotherFrame = true;
		});

		if (needsAnotherFrame) animationFrame = requestAnimationFrame(render);
	};

	const requestRender = () => {
		if (animationFrame || !instances.some(canAnimate)) return;
		animationFrame = requestAnimationFrame(render);
	};

	const removeSharedListeners = () => {
		if (sharedListenersRemoved) return;
		sharedListenersRemoved = true;
		cancelAnimationFrame(animationFrame);
		animationFrame = 0;
		intersectionObserver?.disconnect();
		themeObserver?.disconnect();
		document.removeEventListener("visibilitychange", requestRender);
		systemThemeQuery.removeEventListener("change", refreshThemes);
		reducedMotionQuery.removeEventListener("change", updateReducedMotion);
	};

	const removeSharedListenersWhenEmpty = () => {
		if (instances.every((instance) => instance.destroyed)) {
			removeSharedListeners();
		}
	};

	const refreshThemes = () => {
		const time = performance.now() / 1000;
		instances.forEach((instance) => {
			if (instance.destroyed) return;
			instance.dark = resolveDarkTheme(instance);
			drawFrame(instance, time * instance.effectiveSpeed);
		});
		requestRender();
	};

	const updateReducedMotion = () => {
		reducedMotion = reducedMotionQuery.matches;
		if (reducedMotion) {
			cancelAnimationFrame(animationFrame);
			animationFrame = 0;
			instances.forEach((instance) => {
				if (!instance.destroyed) drawFrame(instance, 0.6);
			});
			return;
		}
		requestRender();
	};

	intersectionObserver =
		typeof IntersectionObserver === "undefined"
			? null
			: new IntersectionObserver((entries) => {
					entries.forEach((entry) => {
						const instance = instances.find(
							(candidate) => candidate.canvas === entry.target,
						);
						if (instance) instance.visible = entry.isIntersecting;
					});
					requestRender();
				});

	canvases.forEach((canvas) => {
		if (!(canvas instanceof HTMLCanvasElement)) return;
		canvas.__thinkingOrbDestroy?.();

		const requestedState = canvas.dataset.orbState ?? config.state;
		const state = Object.hasOwn(labels, requestedState)
			? requestedState
			: "working";
		const size = Math.max(
			8,
			readNumber(canvas.dataset.orbSize, readNumber(config.size, 64)),
		);
		const speed = Math.max(
			0,
			readNumber(canvas.dataset.orbSpeed, readNumber(config.speed, 1)),
		);
		const requestedTheme = canvas.dataset.orbTheme ?? config.theme;
		const theme = ["auto", "dark", "light"].includes(requestedTheme)
			? requestedTheme
			: "auto";
		const paused = readBoolean(canvas.dataset.orbPaused, config.paused);
		const devicePixelRatio = Math.min(2, window.devicePixelRatio || 1);
		const context = canvas.getContext("2d");
		if (!context) return;

		const preset = resolvePreset(state, size);
		const instance = {
			canvas,
			context,
			state,
			size,
			theme,
			paused,
			devicePixelRatio,
			draw: modeDrawers[preset.mode],
			drawOptions: preset.drawOptions,
			effectiveSpeed: preset.baseSpeed * speed,
			dark: true,
			visible: true,
			destroyed: false,
		};

		canvas.width = Math.round(size * devicePixelRatio);
		canvas.height = Math.round(size * devicePixelRatio);
		canvas.style.width = `${size}px`;
		canvas.style.height = `${size}px`;
		if (!canvas.hasAttribute("role")) canvas.setAttribute("role", "img");
		if (!canvas.hasAttribute("aria-label")) {
			canvas.setAttribute("aria-label", labels[state]);
		}

		instance.dark = resolveDarkTheme(instance);
		instances.push(instance);
		intersectionObserver?.observe(canvas);

		const destroy = () => {
			if (instance.destroyed) return;
			instance.destroyed = true;
			intersectionObserver?.unobserve(canvas);
			if (canvas.__thinkingOrbDestroy === destroy) {
				delete canvas.__thinkingOrbDestroy;
			}
			removeSharedListenersWhenEmpty();
		};
		canvas.__thinkingOrbDestroy = destroy;

		drawFrame(
			instance,
			reducedMotion ? 0.6 : (performance.now() / 1000) * instance.effectiveSpeed,
		);
	});

	if (!instances.length) return () => {};

	themeObserver = new MutationObserver(refreshThemes);
	themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class", "data-theme"],
		subtree: true,
	});
	document.addEventListener("visibilitychange", requestRender);
	systemThemeQuery.addEventListener("change", refreshThemes);
	reducedMotionQuery.addEventListener("change", updateReducedMotion);
	requestRender();

	return () => {
		instances.forEach((instance) => instance.canvas.__thinkingOrbDestroy?.());
		removeSharedListeners();
	};
}
