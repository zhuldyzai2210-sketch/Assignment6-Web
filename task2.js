
$(function () {
  const roomNames = {
    balcony: "Balcony",
    hall: "Hall",
    kitchen: "Kitchen",
    living: "Living room"
  };

  const $modal = $("#guest-modal");
  const $card = $("#guest-card");

  let activeGuest = null;
  let busy = false;
  let cardBusy = false;
  let modalToken = 0;
  let spotlightTimer = null;

  const originalOrder = {};


  $(".room").each(function () {
    const id = this.id;

    originalOrder[id] = $(this)
      .find(".guest")
      .map(function () {
        return $(this).attr("data-name");
      })
      .get();
  });

  $(".room").each(function () {
    $(this).append(
      $("<button>")
        .addClass("sort-btn")
        .text("Sort by time")
        .attr("type", "button")
    );
  });

  
  function guestData($guest) {
    return {
      name: $guest.attr("data-name"),
      color: $guest.attr("data-color"),
      time: $guest.attr("data-time"),
      aitu: $guest.attr("data-aitu") === "true",
      items: ($guest.attr("data-items") || "")
        .split(",")
        .filter(Boolean),
      room: $guest.closest(".room").attr("id"),
      image: $guest.find(".avatar-ring img").attr("src")
    };
  }

  function words(items) {
    if (!items.length) return "No items";

    const names = {
      phone: "a phone",
      glasses: "glasses",
      bag: "a bag",
      cup: "a cup",
      crumbs: "cake crumbs"
    };

    return "Has " + items.map(x => names[x]).join(", ");
  }

  function roomArray(id) {
    return window.task2Rooms.find(room => room.id === id);
  }

  function setSpotlight($matches) {
    const $all = $(".room .guest");

    $all.stop(true, false);

    $all.not($matches).fadeTo(300, 0.2);
    $matches.fadeTo(300, 1);
  }

  function clearSpotlight() {
    $(".room .guest")
      .stop(true, false)
      .fadeTo(300, 1);
  }

  function currentMatches(caseNumber) {
    if (caseNumber === 14 || caseNumber === 15 ||
        caseNumber === 16) {
      return $(".room.highlighted .guest");
    }

    return $(".guest.highlighted");
  }

  

  $("#case-buttons").on("click.task2", ".case-btn", function () {
    const number = Number($(this).attr("data-case"));

    clearTimeout(spotlightTimer);

    spotlightTimer = setTimeout(function () {
      if (number === 19) {
        setSpotlight($());
        return;
      }

      setSpotlight(currentMatches(number));
    }, 0);
  });

  $("#clear-btn").on("click.task2", function () {
    clearTimeout(spotlightTimer);
    clearSpotlight();
  });


  $(".room").on("keydown", ".guest", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      $(this).trigger("click");
    }
  });

  function makeGuestsFocusable() {
    $(".room .guest").attr({
      tabindex: "0",
      role: "button",
      "aria-label": "Open guest details"
    });
  }

  makeGuestsFocusable();


  function showGuestDetails($guest) {
    const data = guestData($guest);

    const $photo = $("<div>")
      .addClass("guest-card-photo")
      .css("--ring", $guest.css("--ring"))
      .append(
        $("<img>").attr({
          src: data.image,
          alt: data.name
        })
      );

    const $info = $("<div>").addClass("guest-info");

    [
      "Came at " + data.time,
      data.aitu ? "AITU student" : "Not an AITU student",
      "Clothing color: " + data.color,
      words(data.items),
      "Room: " + roomNames[data.room]
    ].forEach(line => {
      $info.append($("<p>").text(line));
    });

    $("#guest-details").empty().append(
      $photo,
      $("<h2>").text(data.name),
      $info
    );

    $("#move-buttons").empty();

    Object.keys(roomNames).forEach(id => {
      if (id === data.room) return;

      $("<button>")
        .addClass("move-btn")
        .attr({
          type: "button",
          "data-room": id
        })
        .text("Move to " + roomNames[id])
        .appendTo("#move-buttons");
    });
  }

  function avatarRect($guest) {
    const element = $guest.find(".avatar-ring")[0];

    return element.getBoundingClientRect();
  }

  function cardDestination() {
    const width = Math.min(340, window.innerWidth - 30);

    return {
      left: (window.innerWidth - width) / 2,
      top: Math.max(15, (window.innerHeight - 430) / 2),
      width: width,
      height: 430
    };
  }

  function openGuest($guest) {
    if (busy || cardBusy) return;

    if (activeGuest) {
      closeGuest(function () {
        openGuest($guest);
      });
      return;
    }

    const token = ++modalToken;
    activeGuest = $guest;
    cardBusy = true;

    showGuestDetails($guest);

    const rect = avatarRect($guest);
    const destination = cardDestination();

    $("body").addClass("modal-open");
    $modal.show().attr("aria-hidden", "false");

    $card.stop(true, false).css({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      opacity: 0.75
    });

    $card.animate(destination, {
      duration: 380,
      queue: false,
      complete: function () {
        if (token !== modalToken) return;

        $card.css({
          height: "auto",
          opacity: 1
        });

        cardBusy = false;
        $("#close-guest").trigger("focus");
      }
    });
  }

  function closeGuest(callback) {
    if (!activeGuest) {
      if (callback) callback();
      return;
    }

    const token = ++modalToken;
    const $guest = activeGuest;

    activeGuest = null;
    cardBusy = true;

    const rect = avatarRect($guest);

    $card.stop(true, false).animate({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      opacity: 0.5
    }, 320, function () {
      if (token !== modalToken) return;

      $modal.hide().attr("aria-hidden", "true");
      $("body").removeClass("modal-open");
      cardBusy = false;

      if (callback) callback();
    });
  }

  $(".room").on("click", ".guest", function () {
    if (busy) return;

    const $clicked = $(this);

    if (activeGuest && activeGuest[0] !== this) {
      closeGuest(function () {
        openGuest($clicked);
      });
    } else if (!activeGuest) {
      openGuest($clicked);
    }
  });

  $("#close-guest").on("click", function () {
    closeGuest();
  });

  $modal.on("click", function (event) {
    if (event.target === this) {
      closeGuest();
    }
  });

  $(document).on("keydown", function (event) {
    if (event.key === "Escape" && activeGuest) {
      closeGuest();
    }
  });



  function updateArray(name, fromId, toId) {
    const from = roomArray(fromId);
    const to = roomArray(toId);

    const index = from.guests.findIndex(
      guest => guest[0] === name
    );

    if (index === -1) return;

    const data = from.guests.splice(index, 1)[0];
    to.guests.push(data);
  }



  $("#move-buttons").on("click", ".move-btn", function () {
    if (busy || !activeGuest || cardBusy) return;

    busy = true;

    const toId = $(this).attr("data-room");
    const $guest = activeGuest;
    const data = guestData($guest);
    const fromId = data.room;
    Object.keys(originalOrder).forEach(id => {
  originalOrder[id] = originalOrder[id].filter(
    existing => existing !== data.name
  );
});

originalOrder[toId].push(data.name);
    
    closeGuest(function () {
      const start = $guest[0].getBoundingClientRect();

      const $destination = $("#" + toId + " .guests");
      const targetRect = $destination[0]
        .getBoundingClientRect();

      const targetLeft = targetRect.right - start.width;
      const targetTop = targetRect.top;

      const $flying = $guest.clone(false, false)
        .removeClass("highlighted")
        .addClass("flying-guest")
        .css({
          left: start.left,
          top: start.top,
          width: start.width,
          height: start.height
        })
        .appendTo("body");

      $guest.addClass("task2-hidden");

    
      $guest.animate({
        width: 0,
        opacity: 0,
        marginLeft: 0,
        marginRight: 0
      }, {
        duration: 550,
        queue: false
      });

   
      $flying.animate({
        left: targetLeft,
        top: targetTop
      }, {
        duration: 650,
        queue: false,
        complete: function () {
          $flying.remove();

          $guest.stop(true, false)
            .detach()
            .appendTo($destination)
            .removeClass("task2-hidden")
            .css({
              width: 0,
              opacity: 1,
              marginLeft: "",
              marginRight: ""
            });

          updateArray(data.name, fromId, toId);

          
          $guest.animate({
            width: 57
          }, 550, function () {
            $guest.css({
              width: "",
              top: "",
              opacity: 1
            });

            busy = false;
            makeGuestsFocusable();
          });
        }
      });
    });
  });


  function animateReorder($container, orderedElements) {
    const $guests = $container.children(".guest");

    if (!$guests.length) return;

    const oldRects = new Map();

    $guests.each(function () {
      oldRects.set(this, this.getBoundingClientRect());
    });

    orderedElements.forEach(element => {
      $container.append(element);
    });

    const ghosts = [];

    orderedElements.forEach(element => {
      const oldRect = oldRects.get(element);
      const newRect = element.getBoundingClientRect();

      const $original = $(element);
      const $ghost = $original.clone(false, false)
        .removeClass("highlighted")
        .addClass("sort-ghost")
        .css({
          left: oldRect.left,
          top: oldRect.top,
          width: oldRect.width,
          height: oldRect.height
        })
        .appendTo("body");

      $original.addClass("task2-hidden");

      ghosts.push({
        ghost: $ghost,
        original: $original,
        left: newRect.left,
        top: newRect.top
      });
    });

    let finished = 0;

    ghosts.forEach(entry => {
      entry.ghost.animate({
        left: entry.left,
        top: entry.top
      }, {
        duration: 550,
        queue: false,
        complete: function () {
          entry.ghost.remove();
          entry.original.removeClass("task2-hidden");

          finished++;

          if (finished === ghosts.length) {
            busy = false;
          }
        }
      });
    });
  }

  
   
const sortQueue = [];

function processSortQueue() {
  if (busy || cardBusy || activeGuest || !sortQueue.length) return;

  const $room = sortQueue.shift();
  busy = true;

  const id = $room.attr("id");
  const $container = $room.find(".guests");
  const $button = $room.find(".sort-btn");
  const sorted = $button.attr("data-sorted") === "true";
  const elements = $container.children(".guest").get();

  if (!sorted) {
    elements.sort((a, b) =>
      $(a).attr("data-time")
        .localeCompare($(b).attr("data-time"))
    );
    $button.attr("data-sorted", "true").text("Original order");
  } else {
    elements.sort((a, b) =>
      originalOrder[id].indexOf($(a).attr("data-name")) -
      originalOrder[id].indexOf($(b).attr("data-name"))
    );
    $button.attr("data-sorted", "false").text("Sort by time");
  }

  animateReorder($container, elements);

  const check = setInterval(function () {
    if (!busy) {
      clearInterval(check);
      processSortQueue();
    }
  }, 20);
}

$(".room").on("click", ".sort-btn", function () {
  sortQueue.push($(this).closest(".room"));
  processSortQueue();
});

  

  $("#move-buttons").on("click.task2order", ".move-btn", function () {
    if (!activeGuest) return;

    const name = activeGuest.attr("data-name");
    const destination = $(this).attr("data-room");

    Object.keys(originalOrder).forEach(id => {
      originalOrder[id] = originalOrder[id]
        .filter(existing => existing !== name);
    });

    originalOrder[destination].push(name);
  });


  $("#case-buttons").on("click.task2focus", ".case-btn", function () {
    makeGuestsFocusable();
  });
});
