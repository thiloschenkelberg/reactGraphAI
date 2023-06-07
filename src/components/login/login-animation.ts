/*
	Designed by: SELECTO
	Original image: https://dribbble.com/shots/5311359-Diprella-Login
*/

export function runLoginAnimation(): void {
    const switchCtn = document.querySelector("#switch-cnt") as HTMLElement;
    const switchC1 = document.querySelector("#switch-c1") as HTMLElement;
    const switchC2 = document.querySelector("#switch-c2") as HTMLElement;
    const switchCircle = document.querySelectorAll(".switch__circle") as NodeListOf<HTMLElement>;
    const switchBtn = document.querySelectorAll(".switch-btn") as NodeListOf<HTMLElement>;
    const aContainer = document.querySelector("#a-container") as HTMLElement;
    const bContainer = document.querySelector("#b-container") as HTMLElement;
    const allButtons = document.querySelectorAll(".submit") as NodeListOf<HTMLButtonElement>;
  
    const getButtons = (e: Event) => e.preventDefault();
  
    const changeForm = (e: Event) => {
      switchCtn.classList.add("is-gx");
      setTimeout(function () {
        switchCtn.classList.remove("is-gx");
      }, 1500);
  
      switchCtn.classList.toggle("is-txr");
      switchCircle[0].classList.toggle("is-txr");
      switchCircle[1].classList.toggle("is-txr");
  
      switchC1.classList.toggle("is-hidden");
      switchC2.classList.toggle("is-hidden");
      aContainer.classList.toggle("is-txl");
      bContainer.classList.toggle("is-txl");
      bContainer.classList.toggle("is-z200");
    };
  
    const mainF = (e?: Event) => {
      for (let i = 0; i < allButtons.length; i++) allButtons[i].addEventListener("click", getButtons);
      for (let i = 0; i < switchBtn.length; i++) switchBtn[i].addEventListener("click", changeForm);
    };
  
    mainF();
  }
