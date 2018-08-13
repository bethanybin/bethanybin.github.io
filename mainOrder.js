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

  document.getElementById('size').addEventListener('click', function(event){
    size = event.target.textContent
    proteinLength = numProtein[size];
    protein = []
    proteinHeader.innerHTML = protein.join(', ');
    console.log(proteinLength)
    sizeHeader.innerHTML = size
  });

  // document.getElementById('base').addEventListener('click', function(event){
  //   const currBase = event.target.textContent;
  //   if(base.length === baseLength){
  //     base[0] = currBase;
  //   }
  //   else{
  //     base.push(currBase);
  //   }
  //   baseHeader.innerHTML = base.join(', ');
  // });

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


  document.getElementById('sides').addEventListener('click', function(event){
    const currSide = event.target.textContent;
    if(sides.includes(currSide) === false){
      sides.push(currSide);
    }
    console.log(sides)
    sidesHeader.innerHTML = sides.join(', ');
  });

  document.getElementById('protein').addEventListener('click', function(event){
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
  });

  document.getElementById('veg').addEventListener('click', function(event){
    const currVeg = event.target.innerHTML;
    if(veg.includes(currVeg) === false){
      veg.push(currVeg);
    }
    vegHeader.innerHTML = veg.join(', ')
  });

  document.getElementById('sauce').addEventListener('click', function(event){
    const currSauce = event.target.innerHTML;
    if(sauce.includes(currSauce) === false){
      sauce.push(currSauce);
    }
    sauceHeader.innerHTML = sauce.join(', ');
  });

  document.getElementById('drinks').addEventListener('click', function(event){
    const currDrink = event.target.innerHTML;
    if(drinks.includes(currDrink) === false){
      drinks.push(currDrink);
    }
    drinksHeader.innerHTML = drinks.join(', ');
  });
