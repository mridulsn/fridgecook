/* fridgecook engine: what you have in, dishes you can make (or nearly make) out.
   Works in the browser and in Node (for tests). */
(function (root) {
  'use strict';

  var DISHES = typeof module === 'object' && module.exports ? require('./dishes.js') : root.FRIDGECOOK_DISHES;

  // The kitchen, by shelf. Everyday spices, salt, oil and water are assumed.
  var CATALOG = [
    ['Vegetables', ['onion', 'tomato', 'potato', 'garlic', 'ginger', 'green chilli', 'coriander', 'curry leaves', 'mint', 'lemon',
      'capsicum', 'carrot', 'peas', 'beans', 'cauliflower', 'cabbage', 'spinach', 'brinjal', 'okra', 'bottle gourd',
      'mushroom', 'cucumber', 'corn', 'spring onion', 'broccoli', 'drumstick']],
    ['Fruit', ['banana', 'apple', 'pomegranate', 'raisins']],
    ['Dairy and eggs', ['milk', 'curd', 'paneer', 'butter', 'ghee', 'cheese', 'cream', 'eggs']],
    ['Meat, fish and tofu', ['chicken', 'fish', 'tofu', 'soya chunks']],
    ['Grains and bread', ['rice', 'cooked rice', 'atta', 'maida', 'rava', 'rice flour', 'besan', 'poha', 'oats', 'bread',
      'pasta', 'noodles', 'vermicelli', 'idli batter', 'dosa batter', 'cornflour']],
    ['Dals and beans', ['toor dal', 'moong dal', 'masoor dal', 'chana dal', 'urad dal', 'rajma', 'kabuli chana', 'sprouts']],
    ['Pantry', ['sugar', 'jaggery', 'honey', 'tamarind', 'coconut', 'coconut milk', 'peanuts', 'cashews', 'nuts', 'peanut butter',
      'soy sauce', 'ketchup', 'chilli sauce', 'sambar powder', 'biryani masala', 'chole masala', 'amchur', 'cardamom',
      'whole spices', 'custard powder', 'sesame', 'olives', 'green chutney']]
  ];
  var KNOWN = {};
  CATALOG.forEach(function (g) { g[1].forEach(function (x) { KNOWN[x] = g[0]; }); });

  var MEAT = { chicken: 1, fish: 1 };
  // Root vegetables and others a Jain kitchen leaves out.
  var JAIN_NO = { onion: 1, garlic: 1, potato: 1, carrot: 1, ginger: 1, mushroom: 1, 'spring onion': 1, beetroot: 1, radish: 1 };

  function diet(d) {
    if (d.needs.concat(d.opt).some(function (x) { return MEAT[x]; })) return 'nonveg';
    if (d.needs.indexOf('eggs') >= 0) return 'egg';
    return 'veg';
  }
  function jainOk(d) { return diet(d) === 'veg' && !d.needs.some(function (x) { return JAIN_NO[x]; }); }

  function allowed(d, mode) {
    var k = diet(d);
    if (mode === 'veg') return k === 'veg';
    if (mode === 'egg') return k !== 'nonveg';
    if (mode === 'jain') return jainOk(d);
    return true;
  }

  // have: array of ingredient names. opts: { diet: 'all'|'veg'|'egg'|'jain', maxMins: 0 (any) }
  function match(have, opts) {
    opts = opts || {};
    var H = {};
    (have || []).forEach(function (x) { H[x] = 1; });
    // Cooked rice can always be made from rice
    if (H.rice) H['cooked rice'] = 1;
    var out = { now: [], one: [], two: [] };
    DISHES.forEach(function (d, i) {
      if (!allowed(d, opts.diet || 'all')) return;
      if (opts.maxMins && d.mins > opts.maxMins) return;
      var missing = d.needs.filter(function (x) { return !H[x]; });
      if (missing.length > 2) return;
      var using = d.needs.concat(d.opt).filter(function (x) { return H[x]; });
      // Nothing you ticked is in it: not a suggestion, just a dish
      if (!d.needs.some(function (x) { return H[x]; })) return;
      var item = { id: i, dish: d, missing: missing, using: using, diet: diet(d),
        jainSkip: opts.diet === 'jain' ? d.opt.filter(function (x) { return JAIN_NO[x]; }) : [] };
      (missing.length === 0 ? out.now : missing.length === 1 ? out.one : out.two).push(item);
    });
    var byUse = function (a, b) {
      return (b.using.length / (b.dish.needs.length + b.dish.opt.length)) - (a.using.length / (a.dish.needs.length + a.dish.opt.length)) ||
        a.dish.mins - b.dish.mins || a.dish.name.localeCompare(b.dish.name);
    };
    out.now.sort(byUse); out.one.sort(byUse); out.two.sort(byUse);
    // What one extra item would unlock the most dishes
    var unlock = {};
    out.one.forEach(function (m) {
      var k = m.missing[0] === 'cooked rice' ? 'rice' : m.missing[0];   // nobody buys cooked rice
      unlock[k] = (unlock[k] || 0) + 1;
    });
    out.bestBuy = Object.keys(unlock).sort(function (a, b) { return unlock[b] - unlock[a] || a.localeCompare(b); }).slice(0, 3)
      .map(function (k) { return { item: k, dishes: unlock[k] }; });
    return out;
  }

  var api = { DISHES: DISHES, CATALOG: CATALOG, KNOWN: KNOWN, JAIN_NO: JAIN_NO, diet: diet, jainOk: jainOk, match: match };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FridgeCook = api;
})(this);
