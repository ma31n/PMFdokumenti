import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { firebaseConfig } from "./firebase_config.js";

const app = initializeApp(firebaseConfig);  
const db = getDatabase(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const reference = ref(db,"datumi");

const opcijePrikaz = {
  kolokviji: "Kolokvij",
  domaci: "Domaći rad",
  ispiti: "Ispit",
  ostalo: "Ostalo"
}

const opcije = {
  kolokviji: "alert-warning",
  domaci: "alert-success",
  ispiti: "alert-danger",
  ostalo: "alert-info"
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

function sortOld(values,entry, currentDate, entryDate){
  if(currentDate>=entryDate){
    entry.classList.add("alert-light");
    entry.classList.add("entryOld");
    return "old"
  }
  else{
    entry.classList.add(opcije[values.kat]);
    return "new"
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
  let datumiGotovi = document.getElementById("datumi-gotovi");

  if(snapshot.exists()){

    let data = Object.entries(snapshot.val());

    datumi.innerHTML="";
    datumiGotovi.innerHTML="";

    data.sort(sortByDate); 
    for(var i = 0; i<data.length; i++){

      let id = data[i][0];
      let values = data[i][1];

      let currentDate=new Date();
      let entryDate=new Date(values.datum);
      let entry = document.createElement("div");
      entry.classList.add("entry");
      entry.classList.add("alert");
      entry.classList.add("container");
      entry.classList.add(opcije[values.kat]);
      

      let cat = document.createElement("span");
      cat.classList.add("kategorija");
      cat.textContent = `${opcijePrikaz[values.kat]}`.toUpperCase();
      
      let desc = document.createElement("span");
      desc.textContent = `${values.opis}: ${entryDate.toLocaleString("uk-Uk")}`;
      
      let time = document.createElement("span");
      time.classList.add("timeLeft");
      let timeLeft = Math.floor((entryDate - currentDate)/60/60/1000);
      time.textContent = `${timeLeft} SATI PREOSTALO`;
      
      let row = document.createElement("div");
      row.classList.add("row");
      entry.append(row);

      let col_cat = document.createElement("div");
      col_cat.classList.add("col-sm-2");
      col_cat.append(cat);

      let col_desc = document.createElement("div");
      col_desc.classList.add("col-sm-7");
      col_desc.append(desc);

      let col_time = document.createElement("div");
      col_time.classList.add("col-sm-3");
      col_time.append(time);

      row.append(col_cat);
      row.append(col_desc);
      row.append(col_time);

      entry.append(row);

      if(timeLeft>24){
        timeLeft=Math.ceil(timeLeft/24);
        time.textContent = `${timeLeft} DANA PREOSTALO`;
      }
      else if(timeLeft<0){
        time.textContent = `GOTOVO`;
      }
      
      entry.addEventListener("dblclick",function(){
        let deleteref = ref(db, `datumi/${id}`)
        remove(deleteref);
        
      })

      let result = sortOld(values,entry, currentDate, entryDate);

      if(result == "new"){datumi.append(entry);}
      else{datumiGotovi.append(entry);}
    }
  }

  else{
    datumi.innerHTML="No dates available!";
  }
})

document.getElementById("signIn").onclick = () =>{
  signInWithPopup(auth, provider)
  .then((result)=>{
      const user = result.user;
      document.getElementById("unos").style.display="block";
      document.getElementById("dodajbotun").style.display="inline";
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
    document.getElementById("dodajbotun").style.display="none";
    document.getElementById("signOut").style.display="none";
  })
  .catch((error) => {
  const errorCode = error.code;
  const errorMessage = error.message;
  const email = error.customData.email;
  const credential = GoogleAuthProvider.credentialFromError(error);

});
}
/*
onAuthStateChanged(auth, (user) =>{

})
*/
