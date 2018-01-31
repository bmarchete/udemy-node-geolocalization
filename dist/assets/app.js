function template(address, img) {
  return ` <div class="demo-card-wide mdl-card mdl-shadow--2dp">
    <div class="mdl-card__title">
        <img src="${img}">
    </div>
    <div class="mdl-card__supporting-text">
      ${address}
    </div>

    
  </div>`;
}

window.onload = () => {
  let button = document.querySelector("#enviar");
  let grid = document.querySelector("#grid");

  button.addEventListener("click", save);

  read();
};

function read() {
  const spinner = document.querySelector("#spinner");
  spinner.classList.add("is-active");

  axios
    .get("/all")
    .then(response => {
      console.log(response);

      response.data.forEach(element => {
        let card = template(element.address, element.image);
        grid.innerHTML += card;
      });

      spinner.classList.remove("is-active");
    })
    .catch(error => {
      //alert(error);
      spinner.classList.remove("is-active");
    });
}

function save() {

  if (!navigator.geolocation) {
    output.innerHTML = "<p>Seu browser não suporta geolocalização!</p>";
    return;
  }

  navigator.geolocation.getCurrentPosition(sucess, error, {
    enableHighAccuracy: true
  });

  function sucess(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const spinner = document.querySelector("#spinner");
    spinner.classList.add("is-active");

    axios
      .post("/geocode", { lat, lng })
      .then(function(response) {
        console.log(response);

        let card = template(
          response.data.address,
          `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=300x300&sensor=false`
        );
        
        grid.innerHTML += card;

        spinner.classList.remove("is-active");
      })
      .catch(function(error) {
        console.log(error);
        spinner.classList.remove("is-active");
      });
  }

  function error(error) {
    console.log("Não é possível buscar seu local");
  }
}


