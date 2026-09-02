const snackCards = document.querySelectorAll(".snack-card");
const clearButton = document.querySelector("#clearOrder");
const screenTitle = document.querySelector(".screen-title");
const screenTotal = document.querySelector(".screen-total");
const orderItems = document.querySelector("#orderItems");
const snackBag = document.querySelector("#snackBag");

const order = new Map();

function money(value) {
  return `$${value.toFixed(2)}`;
}

function getOrderTotal() {
  let total = 0;

  order.forEach((item) => {
    total += item.price * item.quantity;
  });

  return total;
}

function updateOrderPanel() {
  const totalItems = Array.from(order.values()).reduce((sum, item) => sum + item.quantity, 0);
  const total = getOrderTotal();

  screenTitle.textContent = totalItems === 1 ? "1 snack selected" : `${totalItems} snacks selected`;
  screenTotal.textContent = money(total);

  if (order.size === 0) {
    orderItems.innerHTML = '<p class="empty-order">Tap snacks to add them here.</p>';
    snackBag.textContent = "Pay Mia in person";
    return;
  }

  orderItems.innerHTML = "";

  order.forEach((item, name) => {
    const row = document.createElement("div");
    row.className = "order-item";

    const label = document.createElement("div");
    label.className = "order-name";
    label.innerHTML = `<span>${name}</span><small>${money(item.price)} each</small>`;

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

  snackBag.textContent = `Total: ${money(total)}. Pay in person.`;
}

function addSnack(card) {
  const name = card.dataset.name;
  const price = Number(card.dataset.price);
  const current = order.get(name);

  order.set(name, {
    price,
    quantity: current ? current.quantity + 1 : 1
  });

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

snackCards.forEach((card) => {
  card.addEventListener("click", () => addSnack(card));
});

clearButton.addEventListener("click", () => {
  order.clear();
  updateOrderPanel();
});

updateOrderPanel();
