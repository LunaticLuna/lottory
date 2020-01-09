/*** helper functions***/
function formatDate (timestamp) {
  const d = new Date(timestamp)
  const time = d.toLocaleTimeString('en-US')
  return d.toLocaleDateString('zh-CN') + " | " + time.substr(0, 5) + time.slice(-2)  
}
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
function historyToText(history){
  let result = ""
  for(let key in history){
    const entry = history[key]
    result += entry.time + "\n"
    
    const names = entry.winners.join(" ")
    result += names + "\n\n"
  }
  return result
}
/*** helper function ends***/



function openForm() {
  const mask = document.getElementById("custom-popup")
  mask.classList.remove("hide")
  // mask.classList.add("visible")
  document.getElementById("popupForm").style.display="block";
}

function closeForm() {
  const mask = document.getElementById("custom-popup")
  mask.classList.add("hide")
  document.getElementById("popupForm").style.display="none";
}
function handleCloseHistory(){
  const mask = document.getElementById("winner-popup")
  mask.classList.add("hide")
}
function handleDownloadHistory(){
  // alert("功能未实现")
  const history = State.history
  if (Object.entries(history).length === 0 && history.constructor === Object){
    alert("未开始抽奖")
    return
  }
  // console.log(historyToText(history))
  download("中奖名单.txt",historyToText(State.history))
}
function handleBackToMain(){
  handleCloseHistory()
  State.backToMainView()
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
  history:{},
  winners:[],
  gender:"neutral",
  drawing:false,
  counters : [],
  timers : [],
  currEntry:null,

  changeToLottoView : (n) => {
    if (n === "n"){
      return
    }
    const num = parseInt(n)
    if (n > users.length - State.historyWinners.length){
      alert("未中奖人数没有这么多哦")
      return
    }
    State.num = num
    State.lottoView = true
    setTimeout(ViewController.showLotto, 200)
    
  },
  backToMainView : () => {
    State.lottoView = false;
    State.num = 0
    State.winners = []
    if (State.drawing === true){
      alert("抽奖进行中！请抽出中奖者后再返回^_^")
      return
    }
    ViewController.showMain()
  },
  drawWinner: () => {

    if (State.drawing === false){
      if (State.num > users.length - State.historyWinners.length){
        alert("未中奖人数没有这么多哦")
        return
      }
      //开始抽奖
      State.drawing = true
      State.winners = []
      //TODO: make sure State.num < user.length
      //only do this when users.length is a small number
      

      while(State.winners.length < State.num){
          const r = Math.floor(Math.random() * users.length);
          if((State.historyWinners.indexOf(r) === -1) && (State.winners.indexOf(r) === -1)) State.winners.push(r);
      }
      //
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
      State.counters = [...Array(users.length).keys()]
      State.timers = new Array(State.num).fill(null)
      ViewController.startSlotMachine(State.counters, State.timers)
      ViewController.toggleDrawButton("start")
    }else{
      //停止抽奖
      State.drawing = false
      const timestamp = Date.now()
      State.history[timestamp] = {
        time : formatDate(timestamp),
        winners: State.winners.map((idx) => users[idx].name),
      }
      console.log(State.history)
      ViewController.stopSlotMachine(State.winners,State.timers)
      ViewController.toggleDrawButton("stop")


    }
  },
  checkHistory(){
    if(!State.drawing){
      ViewController.showHistory(State.history)
    }
    
  }
    
}


class ViewController {
  static showLotto() {
    console.log("change to lottory view")
    //hide num select view and show lotto view
    const a = document.getElementById("select")
    a.setAttribute("class",'hide')
    const lotto = document.getElementById("lotto")
    lotto.setAttribute("class",'lotto')

    const backBtn = document.getElementById("back")
    backBtn.disabled = false
    //add html for lotto view
    const winners = document.getElementById("machines")
    console.log(State.num)
    for (let i = 0; i < State.num; i++){
      const e = document.createElement("li")
      e.innerHTML = "谁是下一个幸运儿？"
      e.id = `slot${i}`
      e.className = "slot-machine"
      // e.id = toString(i)
      console.log(e)
      winners.appendChild(e)
    }
  }
  static startSlotMachine(counters, timers){
    const len = users.length
    // make all slots spin together
    for (let i = 0; i < State.num; i++){
      timers[i] = setInterval(()=>spin(i,),slotInterval)
    }
    function spin ( id){
      const e = document.getElementById(`slot${id}`)
      const currIdx = counters[id] % len
      e.innerHTML = users[currIdx].name
      counters[id] ++
    }

    //this code starts the next spinner after the previous one finishes
    // timers[0] = setInterval(()=>spin(1, 0, slotInterval),slotInterval)
    // function spin (minSec, id, itv){
    //   const milSec = minSec * 1000
    //   const e = document.getElementById(`slot${id}`)
    //   const winnerIdx = State.winners[id] //the idx of winner in users list
    //   const currIdx = counters[id] % len
    //   e.innerHTML = users[currIdx].name
    //   if ((counters[id] * itv >= milSec) && (currIdx === winnerIdx)){
    //     e.style.backgroundColor = "white"
    //     clearInterval(timers[id])
    //     if (id < State.num - 1){
    //       timers[id + 1] = setInterval(() => spin(1,id+1,slotInterval),slotInterval)
    //     } else {
    //       ViewController.showCongrats()
    //     }
    //     return
    //   }
    //   counters[id] ++
    // }
  }
  static stopSlotMachine(winners, timers){
    for (let i = 0; i < timers.length; i++){
      clearInterval(timers[i])
      const e = document.getElementById(`slot${i}`)
      e.innerHTML = users[winners[i]].name

    }
  }
  static showCongrats(){
    const e = document.getElementById("congrats")
    const genderedCon = congrats[State.gender]
    console.log(State.gender)
    e.innerHTML = genderedCon[Math.floor(Math.random()*genderedCon.length)]
  }
  static toggleDrawButton(state){
    if (state === "start"){
      const e = document.getElementById("lotto-btn")
      e.innerHTML = "停！"
    }else if (state === "stop"){
      const e = document.getElementById("lotto-btn")
      e.innerHTML = "继续抽奖"
    }
    
  }
  static showMain(){
    console.log("change to main view")
    const list = document.getElementById("machines")
    list.innerHTML = ""
    const b = document.getElementById("lotto")

    b.setAttribute("class","hide")
    const a = document.getElementById("select")
    a.setAttribute('class',"select-num")
    const backBtn = document.getElementById("back")
    backBtn.disabled = true
  }
  static showCustomize(){

  }
  static showHistory(history){
    const popup = document.getElementById("winner-popup")
    popup.classList.remove("hide")
    const text = document.getElementById("text")
    text.className = "text-container"
    text.innerHTML = ""
    //if empty history:
    if (Object.entries(history).length === 0 && history.constructor === Object){
      text.innerHTML = "<p>未开始抽奖</p>"
    }
    for (let key in history){
      console.log("history.key:",key)
      if (history.hasOwnProperty(key)){
        
        const entry = history[key]
        console.log("entry:",entry)
        const p1 = document.createElement("p")
        p1.innerHTML = `${entry.time}:`
        p1.classList.add("bold")
        const p2 = document.createElement("p")
        p2.innerHTML = `${entry.winners}`
        text.appendChild(p1)
        text.appendChild(p2)
        const hr = document.createElement("hr")
        text.appendChild(hr)
        console.log(text)
      }
    }

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
      EventHandler.toggleDrawWinner()
    })
    //bind back button with clicking event
    const backBtn = document.getElementById("back")
    console.log("bind back button")
    backBtn.addEventListener("click", (e) =>{
      EventHandler.backToNum()
    })
    //bind history button with clicking event
    const historyBtn = document.getElementById("history")
    console.log("bind history button")
    historyBtn.addEventListener("click", (e) =>{
      EventHandler.handleHistory()
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
  static toggleDrawWinner(){
    console.log("handle drawWinner event")

    State.drawWinner()

  }
  static backToNum(){
    console.log("handle back event")
    State.backToMainView()
  }
  static handleHistory(){
    State.checkHistory()
  }
}
function main(){
  console.log("welcome")
  EventListener.start()
}
main();