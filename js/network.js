class Network {
  constructor(As,Bs,weights) {
    this.output = new OutputNode()
    this.onGround = new InputNode(As[0],Bs[0],weights[0],this.output)
    this.d1 = new InputNode(As[1],Bs[1],weights[1],this.output)
  }

  decision(onGround, d1){
    this.output.clean()
    this.d1.output(d1)
    this.onGround.output(onGround)
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
  output(value){
    this.output.link(this.a*value+this.b,this.w)
  }
}

class OutputNode {
  constructor() {
    this.entries = []
  }
  link (value,weight){
    this.entries.append({value,weight})
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
    return total/(this.entries.length+1)
  }
}



