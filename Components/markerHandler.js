var tableNumber = null;
AFRAME.registerComponent("markerhandler", {
  init: async function () {
    if (tableNumber === null) {
      this.askTableNumber();
    }
    var dishes = await this.getDishes();
    this.el.addEventListener("markerFound", () => {
      var markerid = this.el.id;
      console.log("marker found");
      this.handleMarkerFound(dishes, markerid);
    });
    this.el.addEventListener("markerLost", () => {
      console.log("marker lost");
      this.handleMarkerLost();
    });
  },

  askTableNumber: function () {
    var iconUrl =
      "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title: "Welcome To Hunger",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeHolder: "Type your table number",
          type: "number",
          min: 1,
        },
      },
      closeOnClickOutside: false,
    }).then((inputValue) => {
      tableNumber = inputValue;
    });
  },

  getDishes: async function () {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then((snap) => {
        return snap.docs.map((doc) => doc.data());
      });
  },

  handleMarkerFound: function (dishes, markerid) {
    var todaysDay = new Date().getDay();
    var days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    var dish = dishes.filter((dish) => {
      dish.id === markerid;
    })[0];
    if (dish.unavailable_days.includes(days[todaysDay])) {
      swal({
        icon: warning,
        title: dish.dish_name.toUpperCase(),
        text: "This Dish is Not Available Today",
        timer: 2500,
        buttons: false,
      });
    } else {
      var model = document.querySelector(`#model-${dish.id}`);
      model.setAttribute("position", dish.model_geometry.position);
      model.setAttribute("rotation", dish.model_geometry.rotation);
      model.setAttribute("scale", dish.model_geometry.scale);

      //Update UI conent VISIBILITY of AR scene(MODEL , INGREDIENTS & PRICE)
      model.setAttribute("visible", true);

      var ingredientsContainer = document.querySelector(
        `#main-plane-${dish.id}`
      );
      ingredientsContainer.setAttribute("visible", true);

      var priceplane = document.querySelector(`#price-plane-${dish.id}`);
      priceplane.setAttribute("visible", true);

      //Changing button div visibility
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";
      var ratingButton = document.getElementById("rating-button");
      var orderButton = document.getElementById("order-button");
      ratingButton.addEventListener("click", function () {
        swal({
          icon: "warning",
          title: "Rate Dish",
          text: "WORK IN PROGRESS",
        });
      });
      orderButton.addEventListener("click", () => {
          var tNumber;
          tableNumber <= 9?(tNumber = `T0${tableNumber}`):(tNumber = `T${tableNumber}`)
          this.handleOrder(tNumber, dish)
        swal({
          icon: "https://i.imgur.com/4NZ6ULY.jpg",
          title: "THANKS FOR ORDERING",
          text: "YOUR ORDER WILL SOON BE SERVED",
        });
      });
    }
  },

  handleOrder:function(tNumber, dish){
      firebase.firestore().collection("tables").doc(tNumber).get().then(doc => {
          var details = doc.data()
          if(details["current_orders"][dish.id]){
              details["current_orders"][dish.id]["subtotal"] = currentQuantity*dish.price
          }else{
            details["current_orders"][dish.id] = {item:dish.dish_name,price:dish.price, quantity:1, subtotal:dish.price*1}
            details.total_bill+=dish.price
            firebase.firestore().collection("tables").doc(doc.id).update(details)
          }
      })
  },

  handleMarkerLost: function () {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  },
});
