function openForm() {
  console.log("open")
  const mask = document.getElementsByClassName("login-popup")[0]
  mask.classList.remove("hide")
  // mask.classList.add("visible")
  document.getElementById("popupForm").style.display="block";
}

function closeForm() {
  const mask = document.getElementsByClassName("login-popup")[0]
  mask.classList.add("hide")
  document.getElementById("popupForm").style.display="none";
}
function handleCustomWinner(){
  const num = document.getElementById("custom-num").value
  if (num > users.length - State.historyWinners.length) {
    alert("未中奖人数没有这么多哦")
    return
  }else if (num <= 0){
    alert("中奖人数必须>=0哦")
    return
  }
  State.changeToLottoView(num)
  closeForm()
}
const slotInterval = 70;

const State = {
  num: 0,//中奖人数
  lottoView:false,
  historyWinners: [],
  winners:[],
  gender:"neutral",

  changeToLottoView : (n) => {
    if (n === "n"){
      console.log("ayayya")
      return
    }
    const num = parseInt(n)
    console.log("users",users.length)
    State.num = num
    State.lottoView = true
    setTimeout(ViewController.showLotto, 200)
    
  },
  drawWinner: () => {
    State.winner = []
    //TODO: make sure State.num < user.length
    //only do this when users.length is a small number
    while(State.winners.length < State.num){
        const r = Math.floor(Math.random() * users.length);
        if((State.historyWinners.indexOf(r) === -1) && (State.winners.indexOf(r) === -1)) State.winners.push(r);
    }
    console.log(State.historyWinners)
    console.log(State.winners)
    State.historyWinners = State.historyWinners.concat(State.winners)
    //determine what gender specific congratulation we should use
    let allMale = true
    let allFemale = true
    for (let i = 0; i < State.num; i++){
      if (users[State.winners[i]].gender === "male"){
        allFemale = false
      } else {
        allMale = false
      }
    }
    State.gender = allMale ? "male" : (allFemale ? "female" : "neutral")
    ViewController.startSlotMachine()
  }
}


class ViewController {
  static showLotto() {
    console.log("change to lottory view")
    //hide num select view and show lotto view
    const a = document.getElementsByClassName("select-num")[0]
    a.setAttribute("class",'hide')
    const lotto = document.getElementById("lotto")
    lotto.setAttribute("class",'lotto')


    //add html for lotto view
    const winners = document.getElementById("machines")
    console.log(State.num)
    for (let i = 0; i < State.num; i++){
      const e = document.createElement("li")
      e.innerHTML = "谁是下一个幸运儿？"
      e.id = `slot${i}`
      e.className = "slot-machine"
      // e.id = toString(i)
      winners.appendChild(e)
    }
  }
  static startSlotMachine(){
    const len = users.length
    let counters = [...Array(len).keys()]//offset random
    let timers = new Array(State.num).fill(null)
    // make all slots spin together
    // for (let i = 0; i < State.num; i++){
    //   timers[i] = setInterval(()=>spin(i+1.5, i, slotInterval),slotInterval)
    // }
    // function spin (minSec, id, itv){
    //   const milSec = minSec * 1000
    //   const e = document.getElementById(`slot${id}`)
    //   const winnerIdx = State.winners[id] //the idx of winner in users list
    //   const currIdx = counters[id] % len
    //   e.innerHTML = users[currIdx].name
    //   if ((counters[id] * itv >= milSec) && (currIdx === winnerIdx)){
    //     e.style.backgroundColor = "white"
    //     clearInterval(timers[id])
    //     return
    //   }
    //   counters[id] ++
    // }

    //this code starts the next spinner after the previous one finishes
    timers[0] = setInterval(()=>spin(1, 0, slotInterval),slotInterval)
    function spin (minSec, id, itv){
      const milSec = minSec * 1000
      const e = document.getElementById(`slot${id}`)
      const winnerIdx = State.winners[id] //the idx of winner in users list
      const currIdx = counters[id] % len
      e.innerHTML = users[currIdx].name
      if ((counters[id] * itv >= milSec) && (currIdx === winnerIdx)){
        e.style.backgroundColor = "white"
        clearInterval(timers[id])
        if (id < State.num - 1){
          timers[id + 1] = setInterval(() => spin(1,id+1,slotInterval),slotInterval)
        } else {
          ViewController.showCongrats()
        }
        return
      }
      counters[id] ++
    }
  }
  static showCongrats(){
    const e = document.getElementById("congrats")
    const genderedCon = congrats[State.gender]
    console.log(State.gender)
    e.innerHTML = genderedCon[Math.floor(Math.random()*genderedCon.length)]
  }
  static showCustomize(){

  }
}
class EventListener {
  static start(){
    //bind number-card clicking event
    const a = document.getElementsByClassName("number-list")[0]
    console.log("bind clicking event to number list")
    a.addEventListener("click", (e) => {
      EventHandler.cardClicked(e)
    })
    //bind customize-card clicking event
    const c = document.getElementById("n")
    c.addEventListener("click",(e) => {
      console.log("eventlistener:openform")
      openForm()
    })
    //bind lotto button clicking event
    const lottoBtn = document.getElementById("lotto-btn")
    console.log("bind clicking event to lotto btn")
    lottoBtn.addEventListener("click", (e) => {
      EventHandler.drawWinner()
    })
  }
}
class EventHandler {
  static cardClicked(e){
    if (e.target && e.target.nodeName === "LI"){
      const num = e.target.id;
      State.changeToLottoView(num)
    }
    if(e.target && e.target.nodeName == "SPAN") {
        const num = e.srcElement.parentElement.id;
        State.changeToLottoView(num)
    }
    
  }
  static drawWinner(){
    console.log("handle drawWinner event")
    State.drawWinner()

  }
}
function main(){
  console.log("welcome")
  EventListener.start()
}
main();