

class Network {
  constructor(As,Bs,weights) {
    this.output = new OutputNode()
    this.As = As
    this.Bs = Bs
    this.weights = weights
    this.onGround = new InputNode(As[0],Bs[0],weights[0],this.output)
    this.d1 = new InputNode(As[1],Bs[1],weights[1],this.output)
  }

  decision(onGround, d){
    this.output.clean()
    this.d1.link(d)
    this.onGround.link(onGround)
    return this.output.decision()
  }
}


class InputNode {
  constructor(a,b,w,output) {
    this.a = a
    this.b = b
    this.w = w
    this.output = output
  }
  link(value){
    this.output.link(this.a*value+this.b,this.w)
  }
}

class OutputNode {
  constructor() {
    this.entries = []
  }
  link (value,weight){
    this.entries.push({value,weight})
  }

  clean(){
    this.entries = []
  }

  decision(){
    let total = 0
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i]
      total+= entry.value*entry.weight
    }
    return total/(this.entries.length)
  }
}

let running = false
let gen = 1

const gravity = 25
const playerX = 10
const playerHeight = 15
const playerWidth = 5
let blocHeight = 5
const floorHeight = 80
const playerFloorHeight = window.innerHeight*(floorHeight/100)-window.innerHeight*playerHeight/100
let blocTopHeight = window.innerHeight*(floorHeight/100)-window.innerHeight*blocHeight/100
let playerSize = window.innerHeight*(playerHeight/100)
let blocY = window.innerHeight*((floorHeight-blocHeight)/100)
let blocSize = window.innerHeight*(blocHeight/100)
class Player {
  constructor(id, network) {
    this.id = id
    this.network = network
    this.velocity = 0
    this.y = 0
    this.element = document.createElement("div")
  }

  init(body){
    if (!body) body = document.body
    this.element.setAttribute("class","player")
    this.element.style.height = playerHeight+"vh"
    this.element.style.width = playerWidth+"vw"
    body.append(this.element)
  }

  jump(){
    if (this.y < playerFloorHeight) return
    this.velocity -= 60
  }

  update(){
    this.y += this.velocity
    if (this.velocity < 0 ) this.velocity += 5
    this.onGround = 0
    if (this.y == playerFloorHeight){
      this.onGround = 1
      return
    }
    this.y += gravity
    if(this.y > playerFloorHeight) this.y = playerFloorHeight

    this.element.style.top = this.y+'px'
  }

  decision(d1){
	  let de = this.network.decision(this.onGround,d1) 
    if (de >= 0.5) this.jump()
  }

  die(){
    deads.push(this)
    players = arrayRemove(players, this)
    this.element.remove()
  }
}
let blocs = []
let players = []
let deads = []
let score = 1
const no = 350
for (let i = 0; i < no; i++) {
  const player = new Player(i,new Network([Math.random(),Math.random()],[Math.random(),Math.random()],[Math.random(),Math.random()]))
  players.push(player)
  player.init(document.body)
}



let last = 30
function loop(){
  for (let i = 0; i < players.length; i++) {
    const player = players[i]
    player.update()
    if (blocs.length > 0){
      const b = blocs.filter(b => playerX < b.x);
      if (b.length > 0)
      {
      b[0].div.style.background = "red"
      player.decision(b[0].x)
      }

    }
  }
  updateBlocs()
  if (last > 0) last-= 1
  else{
    last = (Math.random()+1) *(players.length/10) + 20
    addBloc()
  }
  if (players.length > 1) setTimeout(loop,50)
  else newGen()

}


function newGen(){

  const winner = players[0]
  players = [new Player(50, winner.network)]
  winner.die()
  console.log(winner.id + " is the winner of the gen " + gen)
  for (let i = 0; i < deads.length; i++) {
    const dead = deads[i]
    let factor = [1, 1, 1, 1, 1, 1]
    if (Math.random() <= 0.45)
    {
	    factor[Math.floor(Math.random()*factor.length)] += Math.random();
	    factor[Math.floor(Math.random()*factor.length)] += Math.random();
	    factor[Math.floor(Math.random()*factor.length)] += Math.random();
	    factor[Math.floor(Math.random()*factor.length)] += Math.random();
	    factor[Math.floor(Math.random()*factor.length)] += Math.random();
	    factor[Math.floor(Math.random()*factor.length)] += Math.random();
	    factor[Math.floor(Math.random()*factor.length)] *= -1;
    }
    const child = new Player(i, new Network(
      [((winner.network.As[0]+dead.network.As[0])/2) * factor[0],((winner.network.As[1]+dead.network.As[1])/2) * factor[1]]
      ,[((winner.network.Bs[0]+dead.network.Bs[0])/2) * factor[2],((winner.network.Bs[1]+dead.network.Bs[1])/2) * factor[3]],
      [((winner.network.weights[0]+dead.network.weights[0])/2) * factor[4],((winner.network.weights[1]+dead.network.weights[1])/2) * factor[5]]))
    players.push(child)
    child.init(document.body)
  }


  gen++
  score = 1
  console.log("New gen")
  document.title = "Gen "+ gen
  deads = []
  for (let i = 0; i < blocs.length; i++) {
    const bloc = blocs[i]
    document.body.removeChild(bloc.div)
  }
  blocs = []

  loop()
}

function updateBlocs() {
  for (let i = 0; i < blocs.length; i++) {
    const bloc = blocs[i]
    if (bloc.x < 0) {
      blocs.splice(i, 1)
      bloc.div.parentElement.removeChild(bloc.div)
    }
    bloc.x = bloc.x - score
    bloc.div.style.left = bloc.x + "vw"
    if (playerX < bloc.x+5 && playerX + playerWidth > bloc.x) {
      bloc.div.style.background = "blue"
      for (let j = 0; j < players.length; j++) {
        const player = players[j]
        if (player.y + playerSize > blocTopHeight){
            if (players.length > 1){
              player.die()
            }

            console.log(player.id + " is dead " + players.length + "remaining")
        }
      }
    }
  }
}


function addBloc(){
  const element = document.createElement("div")
  element.setAttribute("class","bloc")
  score += (no / players.length) / 1000
  if (score > 5) score = 5
  element.style.top = blocTopHeight+"px"
  element.style.height = blocHeight+"vh"
  element.style.left = "100vw"
  document.body.append(element)
  blocs.push({div: element,x:100})
  console.log("new bloc")
}


document.title = "Gen "+ gen
loop()
document.onmousemove = function(e){
  var x = e.pageX;
  var y = e.pageY;
  e.target.title = "X is "+x+" and Y is "+y;
};

 function arrayRemove(arr, value) { 
    
        return arr.filter(function(ele){ 
            return ele != value; 
        });
    }
