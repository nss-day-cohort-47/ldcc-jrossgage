console.log('yum, yum, yum');

import { LoginForm } from "./auth/LoginForm.js";
import { RegisterForm } from "./auth/RegisterForm.js";
import { NavBar, listToppingsInDrop } from "./nav/NavBar.js";
import { SnackCard } from "./snacks/SnackCard.js"
import { SnackList } from "./snacks/SnackList.js";
import { SnackDetails } from "./snacks/SnackDetails.js";
import { Footer } from "./nav/Footer.js";
import {
	logoutUser, setLoggedInUser, loginUser, registerUser, getLoggedInUser,
	getSnacks, getSingleSnack, getToppingDetails, getSnackByTopping, addType
} from "./data/apiManager.js";



const applicationElement = document.querySelector("#ldsnacks");

//login/register listeners
applicationElement.addEventListener("click", event => {
	event.preventDefault();
	if (event.target.id === "login__submit") {
		//collect all the details into an object
		const userObject = {
			name: document.querySelector("input[name='name']").value,
			email: document.querySelector("input[name='email']").value
		}
		loginUser(userObject)
			.then(dbUserObj => {
				if (dbUserObj) {
					sessionStorage.setItem("user", JSON.stringify(dbUserObj));
					startLDSnacks();
				} else {
					//got a false value - no user
					const entryElement = document.querySelector(".entryForm");
					entryElement.innerHTML = `<p class="center">That user does not exist. Please try again or register for your free account.</p> ${LoginForm()} <hr/> <hr/> ${RegisterForm()}`;
				}
			})
	} else if (event.target.id === "register__submit") {
		//collect all the details into an object
		const userObject = {
			name: document.querySelector("input[name='registerName']").value,
			email: document.querySelector("input[name='registerEmail']").value,
			isAdmin: false
		}
		console.log(userObject)
		registerUser(userObject)
			.then(dbUserObj => {
				sessionStorage.setItem("user", JSON.stringify(dbUserObj));
				startLDSnacks();
			})
	}
})

//add type event listener 
applicationElement.addEventListener('click', event => {
	event.preventDefault();
	if (event.target.id === "typeButton") {
		const typeObject = {
			name: document.querySelector("input[name='registerType']").value
		}
		console.log(typeObject)
		addType(typeObject)
		showNavBar()
	}
})

//logout event
applicationElement.addEventListener("click", event => {
	if (event.target.id === "logout") {
		logoutUser();
		sessionStorage.clear();
		checkForUser();
	}
})
// end login register listeners

// snack listeners
applicationElement.addEventListener("click", event => {
	event.preventDefault();

	if (event.target.id.startsWith("detailscake")) {
		const snackId = event.target.id.split("__")[1];
		getSingleSnack(snackId)
			.then(snack => {
				getToppingDetails(snackId)
			    .then(toppingArr => {
					showDetails(snack, toppingArr);
				}) 	
			})
	}
})


applicationElement.addEventListener("click", event => {
	event.preventDefault();
	if (event.target.id === "allSnacks") {
		showSnackList();
	}
})

//displaying details on the dom using the snack detail card
const showDetails = (snackObj, toppingArr) => {
	const listElement = document.querySelector("#mainContent");
	listElement.innerHTML = SnackDetails(snackObj, toppingArr);
}
//listening for change in the topping drop down
applicationElement.addEventListener("change", event => {
	if(event.target.id ==="toppingList") {
		const toppingIndex = event.target.options.selectedIndex
		renderSnackByTopping(toppingIndex)
	}
})

const renderSnackByTopping = (toppingId) => {
	   getSnackByTopping(toppingId)
	    .then(arr => {
			let filteredSnackHTML = ""
			const listElement = document.querySelector("#filteredSnacks")
			for (const eachObj of arr) {
				filteredSnackHTML += SnackCard(eachObj.snack);
				listElement.innerHTML = filteredSnackHTML
			}
		  console.log(arr)
	  })
}

//end snack listeners

//looks to sessionStorage to find a logged in user
const checkForUser = () => {
	if (sessionStorage.getItem("user")) {
		setLoggedInUser(JSON.parse(sessionStorage.getItem("user")));
		startLDSnacks();
	} else {
		applicationElement.innerHTML = "";
		//show login/register
		showNavBar()
		showLoginRegister();
	}
}

const showLoginRegister = () => {
	//template strings can be used here too
	applicationElement.innerHTML += `${LoginForm()} <hr/> <hr/> ${RegisterForm()}`;
}

const showNavBar = () => {
	applicationElement.innerHTML += NavBar();
	
}

const showSnackList = () => {
	getSnacks().then(allSnacks => {
		const listElement = document.querySelector("#mainContent")
		listElement.innerHTML = SnackList(allSnacks);
	})
}

const showFooter = () => {
	applicationElement.innerHTML += Footer();
}

const startLDSnacks = () => {
	applicationElement.innerHTML = "";
	showNavBar();
	applicationElement.innerHTML += `<div id="mainContent"></div>`;
	showSnackList();
	showFooter();
	listToppingsInDrop();

}

checkForUser();
