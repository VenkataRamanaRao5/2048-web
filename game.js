let classNames = new Map([
    [0, 'empty'],
    [2, 'two'],
    [4, 'four'],
    [8, 'eight'],
    [16, 'sixteen'],
    [32, 'thirty-two'],
    [64, 'sixty-four'],
    [128, 'one-two-eight'],
    [256, 'two-five-six'],
    [512, 'five-twelve'],
    [1024, 'thousand-twenty-four'],
    [2048, 'two-thousand-forty-eight'],
    [4096, 'four-thousand-ninety-six']
])

const gameGrid = document.getElementById('game')
const scoreBox = document.getElementById("score")

const squareSize = parseInt(getComputedStyle(gameGrid).getPropertyValue('--size').split('px')[0]),
    padding = parseInt(getComputedStyle(gameGrid).getPropertyValue('--margin').split('px')[0])

console.log(squareSize, padding)

function coordinates(position) {
    return [position[1] * (squareSize + padding),
    position[0] * (squareSize + padding)]
}

class Square {
    constructor(position, value, box) {
        this.position = position
        this.value = value
        this.box = box
        this.move(this.position)
    }

    move(pos) {
        this.position = pos
        let coords = coordinates(pos)
        this.box.style.left = `${coords[0]}px`
        this.box.style.top = `${coords[1]}px`
    }

    grow(){
        this.box.classList.remove(classNames.get(this.value))
        this.value *= 2
        setTimeout(() => {
            this.box.firstElementChild.innerText = this.value
        }, 250)
        this.box.classList.add(classNames.get(this.value))
        return this.value
    }

    clear(){
        this.box.remove()
    }

    toString(){
        return `Square(${this.value})`
    }
}

const Empty = class { }

class Grid {

    constructor() {
        this.grid = []
        this.freeSquares = []
        for (let i = 0; i < 4; i++) {
            let boo = []
            for (let j = 0; j < 4; j++) {
                boo.push(Empty)
                var sq = document.createElement('div')
                sq.classList.add('square')
                sq.classList.add('empty')
                let coords = coordinates([i, j])
                sq.style.left = `${coords[0]}px`
                sq.style.top = `${coords[1]}px`
                gameGrid.appendChild(sq)
                this.freeSquares.push([i, j])
            }
            this.grid.push(boo)
        }
        this.score = 0
        scoreBox.innerText = `Score: 0`
        this.willFuse = []
        this.createSquare()
        this.createSquare()
    }

    createSquare() {
        let v = Math.random() < 0.9 ? 2 : 4
        let i = Math.floor(Math.random() * this.freeSquares.length)
        let sq = document.createElement('div')
        sq.classList.add(classNames.get(v))
        sq.classList.add('square')
        let num = document.createElement('span')
        num.innerText = v
        sq.appendChild(num)
        let pos = this.freeSquares.splice(i, 1)[0]
        gameGrid.appendChild(sq)
        this.grid[pos[0]][pos[1]] = new Square(pos, v, sq)
    }

    moveUp() {
        let has_moved = false
        for (let col = 0; col < 4; col++) {
            let last_taken = -1
            let last_grown = -1
            for (let row = 0; row < 4; row++) {
                //print(last_taken, this.grid[row][col], this.grid[last_taken][col], (row, col))
                if (this.grid[row][col] === Empty)
                    continue
                else if(last_taken == -1 ||
                    last_grown == last_taken ||
                    this.grid[last_taken][col].value != this.grid[row][col].value){
                    this.freeSquares.push([row, col])
                    this.freeSquares = this.freeSquares.filter(e => !(e[0] == last_taken + 1 && e[1] == col))
                    let temp = this.grid[row][col]
                    this.grid[row][col] = Empty
                    this.grid[last_taken + 1][col] = temp
                    temp.move([last_taken + 1, col])
                    last_taken++
                    if (last_taken != row)
                        has_moved = true
                }
                else {
                    this.freeSquares.push([row, col])
                    last_grown = last_taken
                    this.grid[row][col].move([last_grown, col])
                    //setTimeout((last_grown) => {
                        this.willFuse.push(this.grid[row][col])
                        this.grid[row][col] = Empty
                        this.score += this.grid[last_grown][col].grow()
                    //}, 250, last_grown)
                    has_moved = true
                    //print(this.freeSquares)
                }
            }
        }
        if(has_moved)
            setTimeout(() => this.createSquare(), 275)
    }

    moveRight() {
        let has_moved = false
        for (let row = 0; row < 4; row++) {
            let last_taken = 4
            let last_grown = -1
            for (let col = 3; col > -1; col--) {
                //print(last_taken, this.grid[row][col], this.grid[last_taken][col], (row, col))
                if (this.grid[row][col] === Empty)
                    continue
                else if (last_taken == 4 ||
                    last_grown == last_taken ||
                    this.grid[row][last_taken].value != this.grid[row][col].value) {
                    this.freeSquares.push([row, col])
                    this.freeSquares = this.freeSquares.filter(e => !(e[0] == row && e[1] == last_taken - 1))
                    let temp = this.grid[row][col]
                    this.grid[row][col] = Empty
                    this.grid[row][last_taken - 1] = temp
                    temp.move([row, last_taken - 1])
                    last_taken--
                    if (last_taken != col)
                        has_moved = true
                }
                else {
                    last_grown = last_taken
                    this.grid[row][col].move([row, last_grown])
                    //setTimeout((last_grown) => {
                    this.willFuse.push(this.grid[row][col])
                    this.freeSquares.push([row, col])
                    this.grid[row][col] = Empty
                    this.score += this.grid[row][last_grown].grow()
                    //}, 250, last_grown)
                    has_moved = true
                    //print(this.freeSquares)
                }
            }
        }
        if (has_moved)
            setTimeout(() => this.createSquare(), 275)
    }

    moveDown() {
        let has_moved = false
        for (let col = 0; col < 4; col++) {
            let last_taken = 4
            let last_grown = -1
            for (let row = 3; row > -1; row--) {
                //print(last_taken, this.grid[row][col], this.grid[last_taken][col], (row, col))
                if (this.grid[row][col] === Empty)
                    continue
                else if (last_taken == 4 ||
                    last_grown == last_taken ||
                    this.grid[last_taken][col].value != this.grid[row][col].value) {
                        this.freeSquares.push([row, col])
                        this.freeSquares = this.freeSquares.filter(e => !(e[0] == last_taken - 1 && e[1] == col))
                    let temp = this.grid[row][col]
                    this.grid[row][col] = Empty
                    this.grid[last_taken - 1][col] = temp
                    temp.move([last_taken - 1, col])
                    last_taken--
                    if (last_taken != row)
                        has_moved = true
                }
                else {
                    last_grown = last_taken
                    this.grid[row][col].move([last_grown, col])
                    //setTimeout((last_grown) => {
                        this.willFuse.push(this.grid[row][col])
                        this.freeSquares.push([row, col])
                        this.grid[row][col] = Empty
                        this.score += this.grid[last_grown][col].grow()
                    //}, 250, last_grown)
                    has_moved = true
                    //print(this.freeSquares)
                }
            }
        }
        if (has_moved)
            setTimeout(() => this.createSquare(), 275)
    }

    moveLeft() {
        let has_moved = false
        for (let row = 0; row < 4; row++) {
            let last_taken = -1
            let last_grown = -1
            for (let col = 0; col < 4; col++) {
                //print(last_taken, this.grid[row][col], this.grid[last_taken][col], (row, col))
                if (this.grid[row][col] === Empty)
                    continue
                else if (last_taken == -1 ||
                    last_grown == last_taken ||
                    this.grid[row][last_taken].value != this.grid[row][col].value) {
                    this.freeSquares.push([row, col])
                    this.freeSquares = this.freeSquares.filter(e => !(e[0] == row && e[1] == last_taken + 1))
                    let temp = this.grid[row][col]
                    this.grid[row][col] = Empty
                    this.grid[row][last_taken + 1] = temp
                    temp.move([row, last_taken + 1])
                    last_taken++
                    if (last_taken != col)
                        has_moved = true
                }
                else {
                    last_grown = last_taken
                    this.grid[row][col].move([row, last_grown])
                    //setTimeout((last_grown) => {
                        this.willFuse.push(this.grid[row][col])
                        this.freeSquares.push([row, col])
                        this.grid[row][col] = Empty
                        this.score += this.grid[row][last_grown].grow()
                        //}, 250, last_grown)
                        has_moved = true
                        //print(this.freeSquares)
                }
            }
        }
        if (has_moved)
            setTimeout(() => this.createSquare(), 275)
    }

    isGameOver(){
        if (this.freeSquares.length > 0)
            return false
        for(let i = 1; i < 3; i++)
            for(let j = 0; j < 4; j++)
                if (this.grid[i][j].value == this.grid[i - 1][j].value
					|| this.grid[i][j].value == this.grid[i + 1][j].value
					|| this.grid[j][i].value == this.grid[j][i - 1].value
					|| this.grid[j][i].value == this.grid[j][i + 1].value)
                    return false
        return true
    }

}

let g = new Grid()

window.addEventListener('keydown', (e) => {
    switch(e.key){
        case 'ArrowDown':
        case 'ArrowUp':
        case 'ArrowLeft':
        case 'ArrowRight':
            g['move' + e.key.substring(5)]()
            if(g.isGameOver()){
                if (window.confirm("New Game?"))
                    g = new Grid()
            }
    }
    setTimeout(() => {
        g.willFuse.forEach(e => {
            e.clear()
        })
        g.willFuse = []
        scoreBox.innerText = `Score: ${g.score}`
    }, 275)
})

document.getElementById("newGame").addEventListener('click', (e) => {
    g = new Grid()
})