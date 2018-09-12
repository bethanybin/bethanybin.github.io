var config = {
    apiKey: "AIzaSyBlpmG9x7R_G2N7MqU3B_mHLaQ4V_5_494",
    authDomain: "pokebarorder.firebaseapp.com",
    databaseURL: "https://pokebarorder.firebaseio.com",
    projectId: "pokebarorder",
    storageBucket: "pokebarorder.appspot.com",
    messagingSenderId: "524205687373"
  };
  firebase.initializeApp(config);

  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const buttonLogin = document.getElementById('login');

  buttonLogin.addEventListener('click', e =>{
    const emailText = email.value;
    const passwordText = password.value;
    const auth = firebase.auth();
    const promise = auth.signInWithEmailAndPassword(emailText, passwordText);
    promise.catch(e => console.log(e.message));
  });

  firebase.auth().onAuthStateChanged(firebaseUser =>{
    if(firebaseUser) {
      var queryString = "?para1=" + firebaseUser.uid
      window.location = "mainOrder.html" + queryString
    }
    else{
      console.log('no one');
    }
  });
