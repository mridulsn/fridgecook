# fridgecook

Tick what's in your kitchen and see what you can cook right now, what needs one more thing, and what
needs two. It also says which single item from the shop would unlock the most dishes.

Live: https://mridulsaravanan.com/fridgecook/

- About a hundred Indian and everyday dishes (breakfasts, dals and curries, rice, breads, snacks, a few global
  favourites and sweets), each written for this project with short steps.
- Filters: everything, veg, veg with eggs, Jain (no onion, garlic or root vegetables), and a time limit.
- Each recipe shows what you have, what you need and what's optional.
- Your ticks are remembered on the device.

`dishes.js` is the dish list. `engine.js` does the matching and filters. `index.html` is the page.
Font: Pixelify Sans (SIL Open Font License, `assets/OFL-PixelifySans.txt`).

Testing: 1,449 checks on the dish list and matching (every ingredient is on the kitchen list, every dish is
reachable, diet rules hold, golden kitchens give the expected dishes), and 42 browser checks on desktop and phone.
