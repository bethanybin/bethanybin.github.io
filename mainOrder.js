var config = {
    apiKey: "AIzaSyBlpmG9x7R_G2N7MqU3B_mHLaQ4V_5_494",
    authDomain: "pokebarorder.firebaseapp.com",
    databaseURL: "https://pokebarorder.firebaseio.com",
    projectId: "pokebarorder",
    storageBucket: "pokebarorder.appspot.com",
    messagingSenderId: "524205687373"
  };
  firebase.initializeApp(config);
  let userId = null;
  let size = null;
  let sizeHeader = document.getElementById('currSize');
  let baseHeader = document.getElementById('currBase');
  let sidesHeader = document.getElementById('currSides');
  let proteinHeader = document.getElementById('currProtein');
  let vegHeader = document.getElementById('currVeg');
  let sauceHeader = document.getElementById('currSauce');
  let drinksHeader = document.getElementById('currDrinks')
  const numProtein = {
    'Small':2,
    'Medium':3,
    'Large':4
  };
  let base = [];
  const baseLength = 2;
  let baseCounter = 0;
  let sides = [];
  var protein = [];
  var proteinLength = 0;
  let proteinCounter = 0;
  let veg = [];
  let sauce = [];
  let drinks = [];
  const buttonLogout = document.getElementById('logout');
  firebase.auth().onAuthStateChanged(firebaseUser =>{
    if(firebaseUser) {
      userId = firebaseUser.uid
    }
    else{
      window.location.replace("pokebarberkeley.html")
    }
  });

  buttonLogout.addEventListener('click', e => {
    firebase.auth().signOut();
  });

  let sizeClass = document.getElementsByClassName("sizeclass");
  let sizeFunction = function(event){
    size = event.target.textContent
    proteinLength = numProtein[size];
    protein = []
    proteinHeader.innerHTML = protein.join(', ');
    console.log(proteinLength)
    sizeHeader.innerHTML = size
  }

  for(var i = 0; i < sizeClass.length; i++){
    sizeClass[i].addEventListener('click', sizeFunction, false);
  }

  let baseClass = document.getElementsByClassName("baseclass");

  let baseFunction = function(event){
    const currBase = event.target.textContent;
    if(base.length === baseLength){
      if(baseCounter == baseLength){
        baseCounter = 0
      }
      base[baseCounter++] = currBase;
    }
    else{
      base.push(currBase);
      baseCounter = 0;
    }
    baseHeader.innerHTML = base.join(', ');
  }

  for(var i = 0; i < baseClass.length; i++){
    baseClass[i].addEventListener('click', baseFunction, false);
  }

  let sidesClass = document.getElementsByClassName("sidesclass");

  let sidesFunction = function(event){
    const currSide = event.target.textContent;
    if(sides.includes(currSide) === false){
      sides.push(currSide);
    }
    console.log(sides)
    sidesHeader.innerHTML = sides.join(', ');
  }

  for(var i = 0; i < sidesClass.length; i++){
    sidesClass[i].addEventListener('click', sidesFunction, false);
  }

  let proteinClass = document.getElementsByClassName("proteinclass");

  let proteinFunction = function(event){
    const currProtein = event.target.innerHTML;
    console.log(currProtein)
    if(proteinLength != 0){
      if(protein.length === proteinLength){
        if(proteinCounter === proteinLength){
          proteinCounter = 0;
        }
        protein[proteinCounter++] = currProtein;
      }
      else{
        protein.push(currProtein);
        proteinCounter = 0;
      }
    }
    console.log(protein)
    proteinHeader.innerHTML = protein.join(', ');
  }

  for(var i = 0; i < proteinClass.length; i++){
    proteinClass[i].addEventListener('click', proteinFunction, false);
  }

  let vegClass = document.getElementsByClassName("vegclass");
  let vegFunction = function(event){
    const currVeg = event.target.innerHTML;
    if(veg.includes(currVeg) === false){
      veg.push(currVeg);
    }
    vegHeader.innerHTML = veg.join(', ')
  }

  for(var i = 0; i < vegClass.length; i++){
    vegClass[i].addEventListener('click', vegFunction, false);
  }

  let sauceClass = document.getElementsByClassName("sauceclass");
  let sauceFunction = function(event){
    const currSauce = event.target.innerHTML;
    if(sauce.includes(currSauce) === false){
      sauce.push(currSauce);
    }
    sauceHeader.innerHTML = sauce.join(', ');
  }

  for(var i = 0; i < sauceClass.length; i++){
    sauceClass[i].addEventListener('click', sauceFunction, false);
  }

  let drinksClass = document.getElementsByClassName("drinksclass");
  let drinksFunction = function(event){
    const currDrink = event.target.innerHTML;
    if(drinks.includes(currDrink) === false){
      drinks.push(currDrink);
    }
    drinksHeader.innerHTML = drinks.join(', ');
  }

  for(var i = 0; i < drinksClass.length; i++){
    drinksClass[i].addEventListener('click', drinksFunction, false);
  }
