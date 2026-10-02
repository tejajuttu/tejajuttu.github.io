// Small progressive enhancements. Every page works without this file.

// Chess puzzle: reveal / reset the answer.
(function () {
  var button = document.querySelector("[data-chess-toggle]");
  if (!button) return;
  var board = document.querySelector("[data-board]");
  var answer = document.querySelector("[data-chess-answer]");
  var from = board.querySelector('[data-sq="g6"]');
  var to = board.querySelector('[data-sq="g7"]');
  var queen = "♕";
  button.hidden = false;
  button.addEventListener("click", function () {
    var open = button.getAttribute("aria-expanded") === "true";
    if (open) {
      to.textContent = "";
      to.classList.remove("hit");
      from.textContent = queen;
      answer.textContent = "";
      button.textContent = "Show the answer";
    } else {
      from.textContent = "";
      to.textContent = queen;
      to.classList.add("hit");
      answer.textContent = "Qg7#. The king on f6 protects the queen, and every escape square is covered.";
      button.textContent = "Reset the board";
    }
    button.setAttribute("aria-expanded", String(!open));
    board.setAttribute("aria-label", open
      ? "Chess position: white king f6, white queen g6, black king h8"
      : "Chess position after the answer: white queen g7, white king f6, black king h8");
  });
})();

// Archive: filter by category.
(function () {
  var group = document.querySelector("[data-filters]");
  if (!group) return;
  var buttons = group.querySelectorAll("button");
  var items = document.querySelectorAll("[data-cat]");
  var status = document.querySelector("[data-filter-status]");
  group.hidden = false;
  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      var cat = b.getAttribute("data-filter");
      var shown = 0;
      buttons.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      items.forEach(function (li) {
        var match = cat === "all" || li.getAttribute("data-cat") === cat;
        li.hidden = !match;
        if (match) shown++;
      });
      if (status) status.textContent = shown + " projects shown";
    });
  });
})();
