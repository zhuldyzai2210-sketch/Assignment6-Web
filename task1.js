
$(function () {

  const rooms = [
    {
      id: "balcony",
      name: "Balcony",
      floor: 2,
      guests: [
        ["Aigerim", "green", "20:45", true, ["cup", "crumbs"]],
        ["Aliya", "black", "21:15", false, ["phone", "cup"]],
        ["Madina", "green", "22:10", false, ["phone", "bag", "crumbs"]],
        ["Ivan", "black", "20:10", true, ["cup"]]
      ]
    },
    {
      id: "hall",
      name: "Hall",
      floor: 2,
      guests: [
        ["Arman", "yellow", "20:35", false, ["bag", "glasses"]],
        ["Sophia", "purple", "21:20", true, ["phone"]],
        ["Dias", "green", "19:45", true, []],
        ["Bekzat", "purple", "20:55", false, ["bag", "cup", "crumbs"]],
        ["Aruzhan", "blue", "21:50", true, ["phone"]],
        ["Saule", "green", "21:25", false, ["glasses"]]
      ]
    },
    {
      id: "kitchen",
      name: "Kitchen",
      floor: 1,
      guests: [
        ["Nurlan", "red", "19:40", true, ["phone", "cup"]],
        ["Emma", "black", "20:15", false, ["bag"]],
        ["Timur", "green", "21:05", true, ["phone", "bag", "crumbs"]],
        ["Sergey", "yellow", "20:50", false, []],
        ["Yerlan", "red", "21:40", true, ["glasses", "phone"]],
        ["Kamila", "green", "20:05", false, ["cup"]]
      ]
    },
    {
      id: "living",
      name: "Living room",
      floor: 1,
      guests: [
        ["Daniel", "blue", "19:55", true, ["glasses"]],
        ["Zarina", "green", "21:10", false, ["bag", "phone", "crumbs"]],
        ["Natasha", "yellow", "20:30", true, []],
        ["Askar", "black", "21:00", true, ["phone"]],
        ["Inkar", "purple", "20:20", false, ["bag"]]
      ]
    }
  ];

  const colors = {
    red: "#e84b58",
    blue: "#3978d6",
    green: "#28996d",
    black: "#333941",
    yellow: "#e9aa25",
    purple: "#9b55ce"
  };

  
const iconPaths = {
  phone: `
    <rect x="6" y="2" width="8" height="16" rx="1.5"/>
    <line x1="9" y1="15.5" x2="11" y2="15.5"/>
  `,

  glasses: `
    <circle cx="5.5" cy="10" r="3.5"/>
    <circle cx="14.5" cy="10" r="3.5"/>
    <path d="M9 9.5 Q10 8 11 9.5"/>
    <path d="M2 9 L1 8 M18 9 L19 8"/>
  `,

  bag: `
    <rect x="4" y="7" width="12" height="11" rx="1.5"/>
    <path d="M7 7 V5 A3 3 0 0 1 13 5 V7"/>
  `,

  cup: `
    <path d="M4 6 H14 V13 Q14 16 11 16 H7 Q4 16 4 13 Z"/>
    <path d="M14 8 H17 Q19 8 18 11 Q17 13 14 13"/>
    <path d="M3 18 H16"/>
    <path d="M7 2 V4 M11 2 V4"/>
  `,

  crumbs: `
    <path d="M4 3 H13 L17 7 V17 H4 Z"/>
    <path d="M13 3 V7 H17"/>
    <circle cx="8" cy="10" r="1"/>
    <circle cx="13" cy="12" r="1"/>
    <circle cx="9" cy="15" r="0.7"/>
  `
};


  const titles = [
    "Who is in the hall?",
    "Yellow or purple clothes",
    "AITU students upstairs",
    "Glasses or a bag",
    "Who has nothing?",
    "Phone but no bag",
    "Arrived 20:30–21:00",
    "After 21:00, not AITU",
    "Next to Askar",
    "Last in each room",
    "Third in each room",
    "After Timur",
    "Before someone in black",
    "Where is Aruzhan?",
    "Rooms with fewer than 6",
    "Cup but no glasses",
    "First arrival in each room",
    "Miras arrives",
    "Natasha leaves",
    "Who stole the cake?"
  ];

  function icon(type) {
    return `<svg viewBox="0 0 20 20">${iconPaths[type]}</svg>`;
  }


  function createGuest(data) {
    const [name, color, time, aitu, items] = data;

    const $card = $("<div>")
      .addClass("guest color-" + color)
      .toggleClass("aitu", aitu)
      .attr({
        "data-name": name,
        "data-color": color,
        "data-time": time,
        "data-aitu": String(aitu),
        "data-items": items.join(",")
      })
      .css("--ring", colors[color]);

    items.forEach(item => $card.addClass("has-" + item));

    const $avatar = $("<div>").addClass("avatar-ring");

    $avatar.append(
      $("<img>").attr({
        src: "https://api.dicebear.com/9.x/open-peeps/svg?seed=" +
          encodeURIComponent(name),
        alt: name
      })
    );

    if (aitu) {
      $avatar.append(
        $("<span>").addClass("aitu-badge").text("A")
      );
    }

    const $items = $("<div>").addClass("guest-items");

    items.forEach(item => {
      $items.append(
        $("<span>")
          .addClass("item-icon")
          .attr("title", item)
          .html(icon(item))
      );
    });

    return $card.append(
      $avatar,
      $("<div>").addClass("guest-name").text(name),
      $("<div>").addClass("guest-time").text("◷ " + time),
      $items
    );
  }


  function buildParty() {
    $(".room .guests").empty();
    $(".room").removeClass("highlighted");

    rooms.forEach(room => {
      const $container = $("#" + room.id + " .guests");

      room.guests.forEach(guest => {
        $container.append(createGuest(guest));
      });
    });
  }


  titles.forEach((title, index) => {
    $("<button>")
      .addClass("case-btn")
      .attr("data-case", index + 1)
      .text(`Case ${index + 1} — ${title}`)
      .appendTo("#case-buttons");
  });


  function jump($guests) {
    $guests.each(function () {
      $(this)
        .stop(true, true)
        .animate({ top: "-13px" }, 170)
        .animate({ top: "0px" }, 200);
    });
  }

  function showResult(number, $found, chain) {
    $found.addClass("highlighted");

    const names = $found.map(function () {
      return $(this).hasClass("room")
        ? $(this).find("h2").text()
        : $(this).attr("data-name");
    }).get();

    jump(
      $found.filter(".guest")
        .add($found.filter(".room").find(".guest"))
    );

    $("#result").text(
      `Case ${number} — Found ${names.length}: ` +
      (names.length ? names.join(", ") : "None")
    );

    $("#chain").text(chain);
  }

  function runCase(number) {
    buildParty();

    $(".case-btn").removeClass("active");
    $(`.case-btn[data-case="${number}"]`).addClass("active");

    let $found = $();
    let chain = "";

    switch (number) {
      case 1:
        chain = '$("#hall .guest")';
        $found = $("#hall .guest");
        break;

      case 2:
        chain = '$(".guest.color-yellow, .guest.color-purple")';
        $found = $(".guest.color-yellow, .guest.color-purple");
        break;

      case 3:
        chain = '$(".room[data-floor=\'2\'] .guest.aitu")';
        $found = $(".room[data-floor='2'] .guest.aitu");
        break;

      case 4:
        chain = '$(".guest.has-glasses, .guest.has-bag")';
        $found = $(".guest.has-glasses, .guest.has-bag");
        break;

      case 5:
        chain = '$(".guest[data-items=\'\']")';
        $found = $(".guest[data-items='']");
        break;

      case 6:
        chain = '$(".guest.has-phone:not(.has-bag)")';
        $found = $(".guest.has-phone:not(.has-bag)");
        break;

      case 7:
        chain = '$(".guest").filter(function () { const t = $(this).attr("data-time"); return t >= "20:30" && t <= "21:00"; })';
        $found = $(".guest").filter(function () {
          const t = $(this).attr("data-time");
          return t >= "20:30" && t <= "21:00";
        });
        break;

      case 8:
        chain = '$(".guest:not(.aitu)").filter(function () { return $(this).attr("data-time") > "21:00"; })';
        $found = $(".guest:not(.aitu)").filter(function () {
          return $(this).attr("data-time") > "21:00";
        });
        break;

      case 9:
        chain = '$(".guest[data-name=\'Askar\']").prev().add($(".guest[data-name=\'Askar\']").next())';
        $found = $(".guest[data-name='Askar']")
          .prev()
          .add($(".guest[data-name='Askar']").next());
        break;

      case 10:
        chain = '$(".room .guests .guest:last-child")';
        $found = $(".room .guests .guest:last-child");
        break;

      case 11:
        chain = '$(".room .guests .guest:nth-child(3)")';
        $found = $(".room .guests .guest:nth-child(3)");
        break;

      case 12:
        chain = '$(".guest[data-name=\'Timur\']").nextAll(".guest")';
        $found = $(".guest[data-name='Timur']").nextAll(".guest");
        break;

      case 13:
        chain = '$(".guest.color-black").prev(".guest")';
        $found = $(".guest.color-black").prev(".guest");
        break;

      case 14:
        chain = '$(".guest[data-name=\'Aruzhan\']").closest(".room")';
        $found = $(".guest[data-name='Aruzhan']").closest(".room");
        break;

      case 15:
        chain = '$(".room").filter(function () { return $(this).find(".guest").length < 6; })';
        $found = $(".room").filter(function () {
          return $(this).find(".guest").length < 6;
        });
        break;

      case 16:
        chain = '$(".room:has(.has-cup):not(:has(.has-glasses))")';
        $found = $(".room:has(.has-cup):not(:has(.has-glasses))");
        break;

      case 17:
        chain = '$(".room .guest").filter(function () { const t = $(this).attr("data-time"); return !$(this).siblings(".guest").filter(function () { return $(this).attr("data-time") < t; }).length; })';
        $found = $(".room .guest").filter(function () {
          const t = $(this).attr("data-time");
          return !$(this).siblings(".guest").filter(function () {
            return $(this).attr("data-time") < t;
          }).length;
        });
        break;

      case 18:
        chain = 'createGuest(["Miras","blue","21:20",true,["phone"]]).insertAfter($(".guest[data-name=\'Askar\']")).hide().fadeIn(600)';
        $found = createGuest(
          ["Miras", "blue", "21:20", true, ["phone"]]
        )
          .insertAfter($(".guest[data-name='Askar']"))
          .hide()
          .fadeIn(600);
        break;

      case 19:
        chain = '$(".guest[data-name=\'Natasha\']").fadeOut(600, function () { $(this).remove(); })';
        $found = $(".guest[data-name='Natasha']");

        $("#result").text(
          "Case 19 — Natasha says goodbye and leaves the party."
        );
        $("#chain").text(chain);

        $found.fadeOut(600, function () {
          $(this).remove();
        });
        return;

      case 20:
        chain = '$(".room[data-floor=\'1\'] .guest.has-crumbs:not(.has-cup)").filter(function () { const t = $(this).attr("data-time"); return t > "21:00" && t < "21:30" && $(this).prev(".aitu").add($(this).next(".aitu")).length > 0; })';
        $found = $(".room[data-floor='1'] .guest.has-crumbs:not(.has-cup)")
          .filter(function () {
            const t = $(this).attr("data-time");
            return t > "21:00" &&
              t < "21:30" &&
              $(this).prev(".aitu")
                .add($(this).next(".aitu")).length > 0;
          });
        break;
    }

    showResult(number, $found, chain);

    if (number === 20 && $found.length) {
      $("#result").prepend("🎂 CAKE THIEF FOUND! ");
    }
  }


  $("#case-buttons").on("click", ".case-btn", function () {
    runCase(Number($(this).attr("data-case")));
  });

  $("#clear-btn").on("click", function () {
    buildParty();
    $(".case-btn").removeClass("active");
    $("#result").text("Party restored. Choose a case.");
    $("#chain").text("Select a case...");
  });

  buildParty();
  $(".legend-icon").each(function () {
  const type = $(this).attr("data-icon");
  $(this).prepend(icon(type));
});
});
