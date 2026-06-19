/**
 * data/trips/northAmerica.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * North America — home base + adventures, 2024–2026
 *
 * Chapters:
 *   • San Francisco Bay Area  — home, training, run clubs, big rides
 *   • Road trip north          — Crater Lake, OR → Enchantments, WA  (Aug 2025)
 *   • Emigrant Wilderness      — Sierra Nevada backcountry            (Aug 2025)
 *   • Hoka UTMB Kodiak 21k    — Big Bear Lake, CA                    (Oct 2025)
 *   • Sequoia National Park    — Tulare County                        (Nov 2025)
 *   • Yosemite National Park   — Winter visit                         (Jan 2026)
 *   • Marble Mountains         — Memorial Day weekend wilderness      (May 2026)
 *   • Yosemite National Park   — Snow Creek & Yosemite Falls          (Jun 2026)
 *
 * Stop ID range: 300–399
 * Activity ID prefix: 'na-'
 */

import type { JourneyStop, Activity } from '../types';

export const northAmericaStops: JourneyStop[] = [
// ── HOME BASE ─────────────────────────────────────────────────────────────
{
  id: 300,
  name: 'San Francisco',
  date: '2024–2026',
  coords: [37.7749, -122.4194],
  journal: 'Home. The Panhandle at midnight with Midnight Runners. November Project steps at Kezar Stadium before the city wakes up. The cross-town trail from the Embarcadero all the way to the ocean. A run to Hookfish and back just to have a reason. Hawk Hill in Marin and back before noon. Everything starts and ends here.',
  countryId: 'us', level2Id: 'us-norcal', level3Id: 'sf-bay-area',
  country: 'United States'
},

// ── ROAD TRIP NORTH: CRATER LAKE → ENCHANTMENTS ────────────────────────
{
  id: 301,
  name: 'Crater Lake, Oregon',
  date: 'Aug 13, 2025',
  coords: [42.9446, -122.1090],
  journal: 'A leg-stretch on the drive north. Two miles along the rim — the water is that impossible shade of blue that looks like it was color-corrected in post. Got back in the car and kept going.',
  countryId: 'us', level2Id: 'us-pnw', level3Id: 'oregon',
  country: 'United States'
},
{
  id: 302,
  name: 'The Enchantments — Washington',
  date: 'Aug 15–18, 2025',
  coords: [47.5173, -120.8118],
  journal: 'One of the most coveted zone permits in the country — months of refresh-hammering finally paid off. Four days in the Alpine Lakes Wilderness: Day 1 hiked up to Snow Lake and got greeted with rain. Day 2 cleared into the most surreal landscape I have ever walked through — blue lakes, larch trees, granite everywhere. Day 3 was a side quest for higher ground, colder air. The hike out on Day 4 felt like returning from another world.',
  countryId: 'us', level2Id: 'us-pnw', level3Id: 'washington-cascades',
  country: 'United States'
},

// ── EMIGRANT WILDERNESS ───────────────────────────────────────────────────
{
  id: 303,
  name: 'Emigrant Wilderness, Sierra Nevada',
  date: 'Aug 22–24, 2025',
  coords: [38.2247, -119.5855],
  journal: 'A three-day solo loop into Tuolumne County backcountry — no permit needed, barely anyone out there. Hiked 12+ miles in to Lake Hyatt, floated in the afternoon, found Rosacone Lake the next morning before the long hike out. The kind of Sierra trip that makes you forget you live near a city.',
  countryId: 'us', level2Id: 'us-norcal', level3Id: 'sierra-nevada',
  country: 'United States'
},

// ── HOKA UTMB KODIAK ─────────────────────────────────────────────────────
{
  id: 304,
  name: 'Hoka UTMB Kodiak — Big Bear Lake',
  date: 'Oct 10–11, 2025',
  coords: [34.2436, -116.9114],
  journal: 'Drove to Big Bear Lake for the Hoka Kodiak 21k — a UTMB-certified mountain race in the San Bernardino mountains. Shakeout run the afternoon before to shake the drive out of the legs. Race day: 21k of singletrack above the lake. The altitude caught me off guard in the first few miles but the descent more than made up for it.',
  countryId: 'us', level2Id: 'us-socal', level3Id: 'big-bear',
  country: 'United States'
},

// ── SEQUOIA NATIONAL PARK ─────────────────────────────────────────────────
{
  id: 305,
  name: 'Sequoia National Park',
  date: 'Nov 25–26, 2025',
  coords: [36.5785, -118.7514],
  journal: 'Drove out for Thanksgiving week — a different world. Hiked past the General Sherman and kept going seven miles into the backcountry where the big trees block out the sky completely. Came back the next day for a shorter loop to the biggest single tree I have ever stood next to. Hard to hold the scale of it in your head.',
  countryId: 'us', level2Id: 'us-norcal', level3Id: 'sequoia-kings',
  country: 'United States'
},

// ── YOSEMITE NATIONAL PARK ────────────────────────────────────────────────
{
  id: 306,
  name: 'Yosemite National Park',
  date: 'Jan 31–Feb 1, 2026',
  coords: [37.7456, -119.5936],
  journal: 'January means no crowds and possible snow — both delivered. Hiked the valley floor to Union Point, 6.8 miles with views that feel implausible. Came back after dark for a night hike just to see it differently. Next morning: snowshoes on and up into the trees above the valley. Winter Yosemite is a different park entirely.',
  countryId: 'us', level2Id: 'us-norcal', level3Id: 'yosemite',
  country: 'United States'
},

// ── MARBLE MOUNTAINS WILDERNESS ───────────────────────────────────────────
{
  id: 307,
  name: 'Marble Mountains Wilderness',
  date: 'May 23–25, 2026',
  coords: [41.5515, -123.1762],
  journal: 'Memorial Day weekend in the Klamath — three days in the Marble Mountains Wilderness near the Trinity Alps. Alpine meadows thick with wildflowers, cracked ghost trees on the ridgelines, lakes still holding snow caps into late May. Day 3 was the light exit hike: birds, flowers, and the kind of quiet that makes you forget cell service exists.',
  countryId: 'us', level2Id: 'us-norcal', level3Id: 'marble-mountains',
  country: 'United States'
},

// ── YOSEMITE — SNOW CREEK ─────────────────────────────────────────────────
{
  id: 308,
  name: 'Yosemite National Park — Snow Creek',
  date: 'Jun 13–15, 2026',
  coords: [37.7735, -119.5391],
  journal: 'Back to Yosemite in June for a different kind of trip — no snow, full sun, and the Snow Creek trail from the valley floor all the way up toward Yosemite Falls. Three days of climbing: easing in with six miles, then the Snow Creek approach in the heat, then the big one — 15+ miles linking Snow Creek, the falls, and every side quest the map suggested. Completely different park than January.',
  countryId: 'us', level2Id: 'us-norcal', level3Id: 'yosemite',
  country: 'United States'
}];


export const northAmericaActivities: Activity[] = [
// ── SAN FRANCISCO & BAY AREA ───────────────────────────────────────────────
{ id: 'na-r1', type: 'running', date: 'Jan 5, 2024', name: 'Hawk Hill + coffee outside', distance: 21.6, time: '1:18:16', location: 'Marin County', coords: [37.8285, -122.4977], highlight: true, desc: 'Over the bridge, up Hawk Hill, coffee at the summit, rip down. Pretty nice morning.', stopId: 300 },
{ id: 'na-c1', type: 'cycling', date: 'Jan 5, 2024', name: 'Hawk Hill + coffee outside', distance: 21.6, time: '1:18:16', location: 'Marin County', coords: [37.8285, -122.4977], highlight: true, desc: 'Over the bridge, up Hawk Hill, coffee at the summit, rip down. Pretty nice morning.', stopId: 300 },
{ id: 'na-r2', type: 'running', date: 'Jan 20, 2025', name: 'A coffee, egg sandwich, and pizza kind of hike', distance: 16.1, time: '5:30:00', location: 'San Francisco', coords: [37.7596, -122.4269], highlight: true, desc: '16 miles across San Francisco — every neighborhood, every food stop, no agenda', stopId: 300 },
{ id: 'na-r3', type: 'running', date: 'May 18, 2025', name: 'Bay to Breakers 🏅', distance: 7.5, time: '1:10:57', location: 'San Francisco', coords: [37.7749, -122.4194], highlight: true, desc: 'Third year running Bay to Breakers — from the Embarcadero to the Pacific', stopId: 300 },
{ id: 'na-c2', type: 'cycling', date: 'May 25, 2025', name: 'Blowing in the wind', distance: 48.0, time: '3:22:47', location: 'Marin County', coords: [37.9735, -122.5311], highlight: false, stopId: 300 },
{ id: 'na-r4', type: 'running', date: 'Sep 25, 2025', name: 'Midnight Runners SF #90', distance: 2.95, time: '31:12', location: 'San Francisco', coords: [37.7735, -122.4352], highlight: false, stopId: 300 },
{ id: 'na-r5', type: 'running', date: 'Sep 27, 2025', name: 'Bay to Lake: segment 1', distance: 5.1, time: '49:08', location: 'Marin County', coords: [37.9735, -122.5311], highlight: false, stopId: 300 },
{ id: 'na-c3', type: 'cycling', date: 'Sep 1, 2025', name: 'Labor Day Ride', distance: 48.2, time: '3:07:49', location: 'San Francisco', coords: [37.7749, -122.4194], highlight: false, stopId: 300 },
{ id: 'na-c4', type: 'cycling', date: 'Nov 22, 2025', name: 'Rapha × Boot Coffee Ride', distance: 59.5, time: '4:10:33', location: 'San Francisco', coords: [37.7749, -122.4194], highlight: true, desc: '60 miles — Marin, the bridge, the city, and enough coffee to fuel another 60', stopId: 300 },
{ id: 'na-r6', type: 'running', date: 'Mar 22, 2026', name: 'Modified cross-town trail', distance: 14.2, time: '3:10:32', location: 'San Francisco', coords: [37.7596, -122.4269], highlight: true, desc: 'San Francisco end-to-end: Embarcadero through the park and out to the ocean', stopId: 300 },
{ id: 'na-r7', type: 'running', date: 'Mar 29, 2026', name: 'A run to Hookfish 🎣', distance: 14.8, time: '3:29:14', location: 'San Francisco', coords: [37.7749, -122.4194], highlight: true, desc: 'Ran across the city to Hookfish for lunch, then ran back. Best excuse for a long run.', stopId: 300 },
{ id: 'na-h14', type: 'hiking', date: 'Jun 7, 2026', name: 'Wee little hike', distance: 5.2, time: '1:39:50', location: 'Marin County', coords: [37.8603, -122.5364], highlight: false, stopId: 300 },

// ── CRATER LAKE ───────────────────────────────────────────────────────────
{ id: 'na-h1', type: 'hiking', date: 'Aug 13, 2025', name: 'Back to our regular scheduled program', distance: 2.1, time: '0:52:00', location: 'Crater Lake, OR', coords: [42.9446, -122.1090], highlight: false, stopId: 301 },

// ── THE ENCHANTMENTS ──────────────────────────────────────────────────────
{ id: 'na-h2', type: 'hiking', date: 'Aug 15, 2025', name: 'Day 1 — Hike up to Snow Lake (and rain)', distance: 9.8, time: '5:22:00', location: 'Chelan County, WA', coords: [47.4982, -120.8255], highlight: false, stopId: 302 },
{ id: 'na-h3', type: 'hiking', date: 'Aug 16, 2025', name: 'Day 2 — Side quest for clearer waters', distance: 7.9, time: '4:18:00', location: 'Chelan County, WA', coords: [47.5173, -120.8118], highlight: true, desc: 'The clouds broke and the Upper Enchantments opened up — turquoise lakes and raw granite', stopId: 302 },
{ id: 'na-h4', type: 'hiking', date: 'Aug 17, 2025', name: 'Day 3 — Side quest for higher views', distance: 7.0, time: '3:58:00', location: 'Chelan County, WA', coords: [47.5244, -120.8032], highlight: false, stopId: 302 },
{ id: 'na-h5', type: 'hiking', date: 'Aug 18, 2025', name: 'Day 4 — Hike out of Snow Lake', distance: 9.0, time: '4:45:00', location: 'Chelan County, WA', coords: [47.4982, -120.8255], highlight: false, stopId: 302 },

// ── EMIGRANT WILDERNESS ───────────────────────────────────────────────────
{ id: 'na-h6', type: 'hiking', date: 'Aug 22, 2025', name: 'Hike into Lake Hyatt', distance: 12.6, time: '6:08:00', location: 'Emigrant Wilderness', coords: [38.2247, -119.5855], highlight: true, desc: '12+ miles of Tuolumne backcountry to a remote granite lake with no one else around', stopId: 303 },
{ id: 'na-w1', type: 'water', date: 'Aug 23, 2025', name: 'A little float 🏊', distance: 0.05, time: '0:28:00', location: 'Emigrant Wilderness', coords: [38.2247, -119.5855], highlight: false, stopId: 303 },
{ id: 'na-h7', type: 'hiking', date: 'Aug 24, 2025', name: 'Hike to Rosacone Lake', distance: 2.6, time: '1:18:00', location: 'Emigrant Wilderness', coords: [38.2312, -119.5791], highlight: false, stopId: 303 },
{ id: 'na-h8', type: 'hiking', date: 'Aug 24, 2025', name: 'Hike back to the car', distance: 9.5, time: '4:35:00', location: 'Emigrant Wilderness', coords: [38.2247, -119.5855], highlight: false, stopId: 303 },

// ── HOKA UTMB KODIAK ─────────────────────────────────────────────────────
{ id: 'na-r8', type: 'running', date: 'Oct 10, 2025', name: 'Kodiak shakeout run', distance: 3.2, time: '33:45', location: 'Big Bear Lake, CA', coords: [34.2436, -116.9114], highlight: false, stopId: 304 },
{ id: 'na-r9', type: 'running', date: 'Oct 11, 2025', name: 'Hoka UTMB Kodiak 21k 🏅', distance: 14.4, time: '3:10:00', location: 'Big Bear Lake, CA', coords: [34.2553, -116.8840], highlight: true, desc: 'UTMB-certified mountain race — 21k of singletrack above Big Bear Lake at altitude', stopId: 304 },

// ── SEQUOIA ───────────────────────────────────────────────────────────────
{ id: 'na-h9', type: 'hiking', date: 'Nov 25, 2025', name: 'Big trees, big rocks, big views', distance: 7.25, time: '3:45:00', location: 'Sequoia National Park', coords: [36.5785, -118.7514], highlight: true, desc: 'Past General Sherman and deep into the grove — the trees block out the sky', stopId: 305 },
{ id: 'na-h10', type: 'hiking', date: 'Nov 26, 2025', name: 'A hike to a big ass tree', distance: 1.5, time: '0:45:00', location: 'Sequoia National Park', coords: [36.5812, -118.7514], highlight: false, stopId: 305 },

// ── YOSEMITE ──────────────────────────────────────────────────────────────
{ id: 'na-h11', type: 'hiking', date: 'Jan 31, 2026', name: 'The valley floor to Union Point', distance: 6.8, time: '3:25:00', location: 'Yosemite National Park', coords: [37.7456, -119.5588], highlight: true, desc: 'Valley floor to Union Point — winter views with no crowds and a dusting of snow', stopId: 306 },
{ id: 'na-h12', type: 'hiking', date: 'Jan 31, 2026', name: 'Night hike', distance: 3.3, time: '1:35:00', location: 'Yosemite National Park', coords: [37.7451, -119.5936], highlight: false, stopId: 306 },
{ id: 'na-h13', type: 'hiking', date: 'Feb 1, 2026', name: 'Snowshoeing and shenanigans ❄️', distance: 2.8, time: '1:22:00', location: 'Yosemite National Park', coords: [37.7456, -119.6100], highlight: false, stopId: 306 },

// ── MARBLE MOUNTAINS ──────────────────────────────────────────────────────
{ id: 'na-h15', type: 'hiking', date: 'May 23, 2026', name: 'Day #1 // alpine medows, wildflowers, and streams', distance: 11.9, time: '5:27:38', location: 'Marble Mountains Wilderness', coords: [41.5942, -123.1437], highlight: false, stopId: 307 },
{ id: 'na-h16', type: 'hiking', date: 'May 24, 2026', name: 'Day #2 // vistas, alpine lakes, and snow caps', distance: 10.4, time: '4:31:43', location: 'Marble Mountains Wilderness', coords: [41.5240, -123.1160], highlight: true, desc: 'Ridgeline views, alpine lakes still rimmed with snow — the kind of day that sells you on three-day backpacking', stopId: 307 },
{ id: 'na-h17', type: 'hiking', date: 'May 25, 2026', name: 'Day #3 // cracked trees, wild flowers, and birdies', distance: 6.2, time: '2:25:14', location: 'Marble Mountains Wilderness', coords: [41.5515, -123.1762], highlight: false, stopId: 307 },

// ── YOSEMITE — SNOW CREEK ───────────────────────────────────────────────────
{ id: 'na-h18', type: 'hiking', date: 'Jun 13, 2026', name: '6 miles of hiking', distance: 6.0, time: '2:22:42', location: 'Yosemite National Park', coords: [37.7109, -119.5884], highlight: false, stopId: 308 },
{ id: 'na-h19', type: 'hiking', date: 'Jun 14, 2026', name: 'Snow creek isn\'t snowy in the sun🥵', distance: 8.4, time: '4:09:47', location: 'Yosemite National Park', coords: [37.7395, -119.5704], highlight: false, stopId: 308 },
{ id: 'na-h20', type: 'hiking', date: 'Jun 15, 2026', name: 'Snow Creek to Yosemite Falls + all the side quests', distance: 15.6, time: '7:36:54', location: 'Yosemite National Park', coords: [37.7735, -119.5391], highlight: true, desc: '15+ miles from Snow Creek up to Yosemite Falls and every detour worth taking — sun, elevation, and a completely different valley than winter', stopId: 308 }];