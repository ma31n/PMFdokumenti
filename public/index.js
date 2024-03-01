import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { firebaseConfig } from "./firebase_config.js";

const app = initializeApp(firebaseConfig);  
const db = getDatabase(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const reference = ref(db,"datumi");
const opcije = {
  kolokviji: "Kolokvij",
  domaci: "Domaći rad",
  ispiti: "Ispit",
  ostalo: "Ostalo"
}

function sortByDate(a,b){
  a=new Date(a[1].datum);
  b=new Date(b[1].datum);

  if(a>b){
    return -1
  }
  else if(a<b){
    return 1
  }
  else{
    return 0
  }
}


document.getElementById("dodaj").onclick = () =>{
  let datum = document.getElementById("datum").value;
  let opis = document.getElementById("opis").value; 
  let kategorija = document.getElementById("kategorije").value;

  if(datum!="" && opis!=""){
    let date = new Date(datum).toLocaleString();

    let data = {
      opis: opis,
      datum: date,
      kat: kategorija
    }
      push(reference, data);
  }
  else{
    window.alert("INPUT ALL DETAILS")
  }
  
}

onValue(reference, function(snapshot){

  let datumi = document.getElementById("datumi");

  if(snapshot.exists()){

    let data = Object.entries(snapshot.val());

    datumi.innerHTML="";

    data.sort(sortByDate); 
    for(var i = 0; i<data.length; i++){

      let id = data[i][0];
      let values = data[i][1];
      let entry = document.createElement("div");
      entry.classList.add("entry");

      let cat = document.createElement("span");
      cat.classList.add(values.kat);
      cat.textContent = `${opcije[values.kat]}`;

      let desc = document.createElement("span");
      desc.textContent = `${values.opis}: ${values.datum}`;

      entry.append(cat);
      entry.append(desc);

      entry.addEventListener("dblclick",function(){
        let deleteref = ref(db, `datumi/${id}`)
        remove(deleteref);

      })
      datumi.append(entry);
    }
  }

  else{
    datumi.innerHTML="No dates added";
  }
})

document.getElementById("signIn").onclick = () =>{
  signInWithPopup(auth, provider)
  .then((result)=>{
      const user = result.user;
      document.getElementById("unos").style.display="block";
      document.getElementById("signOut").style.display="inline";
      window.alert("Welcome",user.displayName);
  })
  .catch((error) => {
  const errorCode = error.code;
  const errorMessage = error.message;
  const email = error.customData.email;
  const credential = GoogleAuthProvider.credentialFromError(error);

});
}

document.getElementById("signOut").onclick = () =>{
  signOut(auth)
  .then((result)=>{
    window.alert("Signed out");
    document.getElementById("unos").style.display="none";
    document.getElementById("signOut").style.display="none";
  })
  .catch((error) => {
  const errorCode = error.code;
  const errorMessage = error.message;
  const email = error.customData.email;
  const credential = GoogleAuthProvider.credentialFromError(error);

});
}

onAuthStateChanged(auth, (user) =>{
  /*
  console.log(user);
  
  if(typeof user=="object"){
    document.getElementById("unos").style.display="block";
  }
  else{
    document.getElementById("unos").style.display="none";
  }
  */ 
})

