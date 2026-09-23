const snackCards = document.querySelectorAll(".snack-card");
const accountForm = document.querySelector("#accountForm");
const studentNameInput = document.querySelector("#studentName");
const accountMessage = document.querySelector("#accountMessage");
const clearButton = document.querySelector("#clearOrder");
const savePointsButton = document.querySelector("#savePoints");
const mysteryDrawButton = document.querySelector("#mysteryDraw");
const freeSnackButton = document.querySelector("#freeSnack");
const screenTitle = document.querySelector(".screen-title");
const screenTotal = document.querySelector(".screen-total");
const orderPoints = document.querySelector("#orderPoints");
const savedPoints = document.querySelector("#savedPoints");
const rewardMessage = document.querySelector("#rewardMessage");
const orderItems = document.querySelector("#orderItems");
const snackBag = document.querySelector("#snackBag");

const order = new Map();
const activeAccountKey = "snackShackActiveAccount";
const rewardsPrefix = "snackShackEcoPoints:";
const mysteryPrizes = [
  "a bonus sticker",
  "first pick from the snack table",
  "a small surprise prize",
  "a free mystery topping",
  "a thank-you note from The Snack Shack"
];
let activeAccount = localStorage.getItem(activeAccountKey) || "";

function money(value) {
  return `$${value.toFixed(2)}`;
}

function cleanName(name) {
  return name.trim().replace(/\s+/g, " ");
}

function getAccountKey() {
  return `${rewardsPrefix}${activeAccount.toLowerCase()}`;
}

function hasAccount() {
  return activeAccount.length > 0;
}

function getSavedPoints() {
  if (!hasAccount()) {
    return 0;
  }

  return Number(localStorage.getItem(getAccountKey())) || 0;
}

function setSavedPoints(points) {
  if (!hasAccount()) {
    return;
  }

  localStorage.setItem(getAccountKey(), String(Math.max(points, 0)));
}

function getOrderTotal() {
  let total = 0;

  order.forEach((item) => {
    total += item.price * item.quantity;
  });

  return total;
}

function getOrderPoints() {
  let points = 0;

  order.forEach((item) => {
    points += item.points * item.quantity;
  });

  return points;
}

function updateRewardButtons() {
  const points = getSavedPoints();

  savedPoints.textContent = points;
  mysteryDrawButton.disabled = !hasAccount() || points < 100;
  freeSnackButton.disabled = !hasAccount() || points < 200;
}

function updateOrderPanel() {
  const totalItems = Array.from(order.values()).reduce((sum, item) => sum + item.quantity, 0);
  const total = getOrderTotal();
  const points = getOrderPoints();

  screenTitle.textContent = totalItems === 1 ? "1 snack selected" : `${totalItems} snacks selected`;
  screenTotal.textContent = money(total);
  orderPoints.textContent = `${points} eco points`;
  savePointsButton.disabled = !hasAccount() || points === 0;

  if (order.size === 0) {
    orderItems.innerHTML = hasAccount()
      ? '<p class="empty-order">Tap snacks to add them here.</p>'
      : '<p class="empty-order">Enter your name first, then tap snacks.</p>';
    snackBag.textContent = hasAccount() ? "Pay Mia in person" : "Start with your name";
    updateRewardButtons();
    return;
  }

  orderItems.innerHTML = "";

  order.forEach((item, name) => {
    const row = document.createElement("div");
    row.className = "order-item";

    const label = document.createElement("div");
    label.className = "order-name";
    label.innerHTML = `<span>${name}</span><small>${money(item.price)} each</small><em>${item.packaging} +${item.points} pts each</em>`;

    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "-";
    minus.setAttribute("aria-label", `Remove one ${name}`);
    minus.addEventListener("click", () => changeQuantity(name, -1));

    const count = document.createElement("span");
    count.textContent = item.quantity;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("aria-label", `Add one more ${name}`);
    plus.addEventListener("click", () => changeQuantity(name, 1));

    controls.append(minus, count, plus);
    row.append(label, controls);
    orderItems.append(row);
  });

  snackBag.textContent = `Total: ${money(total)}. Earn ${points} points.`;
  updateRewardButtons();
}

function setActiveAccount(name) {
  activeAccount = cleanName(name);

  if (!hasAccount()) {
    return false;
  }

  localStorage.setItem(activeAccountKey, activeAccount);
  studentNameInput.value = activeAccount;
  accountMessage.textContent = `Account ready for ${activeAccount}. These points are personal.`;
  rewardMessage.textContent = `${activeAccount}, choose snacks to earn your own eco points.`;
  updateOrderPanel();
  return true;
}

function addSnack(card) {
  if (!hasAccount()) {
    rewardMessage.textContent = "Please enter your name before buying snacks.";
    accountMessage.textContent = "Your name is needed so points do not mix with other students.";
    studentNameInput.focus();
    return;
  }

  const name = card.dataset.name;
  const price = Number(card.dataset.price);
  const points = Number(card.dataset.points);
  const packaging = card.dataset.packaging;
  const current = order.get(name);

  order.set(name, {
    price,
    points,
    packaging,
    quantity: current ? current.quantity + 1 : 1
  });

  rewardMessage.textContent = `${name} added. Green packaging earns ${points} points.`;
  updateOrderPanel();
}

function changeQuantity(name, amount) {
  const item = order.get(name);

  if (!item) {
    return;
  }

  item.quantity += amount;

  if (item.quantity <= 0) {
    order.delete(name);
  }

  updateOrderPanel();
}

function saveOrderPoints() {
  const points = getOrderPoints();

  if (!hasAccount() || points === 0) {
    return;
  }

  setSavedPoints(getSavedPoints() + points);
  order.clear();
  rewardMessage.textContent = `${points} eco points saved for ${activeAccount}. Thanks for choosing greener packaging.`;
  updateOrderPanel();
}

function spendPoints(cost, message) {
  const points = getSavedPoints();

  if (points < cost) {
    return;
  }

  setSavedPoints(points - cost);
  rewardMessage.textContent = message;
  updateRewardButtons();
}

snackCards.forEach((card) => {
  card.addEventListener("click", () => addSnack(card));
});

accountForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!setActiveAccount(studentNameInput.value)) {
    accountMessage.textContent = "Please type your name to start a personal points account.";
  }
});

clearButton.addEventListener("click", () => {
  order.clear();
  rewardMessage.textContent = hasAccount()
    ? `Order cleared. ${activeAccount}'s saved points stayed safe.`
    : "Order cleared.";
  updateOrderPanel();
});

savePointsButton.addEventListener("click", saveOrderPoints);

mysteryDrawButton.addEventListener("click", () => {
  const prize = mysteryPrizes[Math.floor(Math.random() * mysteryPrizes.length)];
  spendPoints(100, `Mystery draw result: you won ${prize}.`);
});

freeSnackButton.addEventListener("click", () => {
  spendPoints(200, "Reward redeemed: show Mia this message for one free snack.");
});

updateOrderPanel();

if (hasAccount()) {
  studentNameInput.value = activeAccount;
  accountMessage.textContent = `Account ready for ${activeAccount}. These points are personal.`;
  rewardMessage.textContent = `${activeAccount}, your saved points are loaded.`;
  updateOrderPanel();
}
