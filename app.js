// unit of game, 20px
const unit = 20;
const level = 2;

class Playground {
  /**
       * @param {DOM} container - dom node to install playground
       * @param {number} w - width of playground
       * @param {number} h - height of playground
       */
  constructor(container, w = 10, h = 10) {
    this.unit = unit;
    // min size of playground id 5 * 5
    this.width = Math.max(5, w);
    this.height = Math.max(5, h);
    this.el = null;
    this.snake = null; // snake instance
    this.meat = null; // meat instance
    this.interval = level >= 3 ? 100 : level >= 2 ? 150 : 200; // snake move interval
    this.prevTime = new Date();
    this.init(container);
  }
  init(container) {
    const playground = document.createElement('div');
    playground.id = 'playground';
    playground.style.width = `${this.unit * this.width}px`;
    playground.style.height = `${this.unit * this.height}px`;
    if (!container) {
      container = document;
    }
    this.el = playground;
    container.appendChild(playground);
    this.snake = new Snake(this);
    this.meat = new Meat(this);
  }
  // starts the game, set snake instance to be alive
  // and start rendering snake and meat
  start() {
    this.snake.alive = true;
    this.render();
  }
  // keep rendering game, and move the snake when time diff is larger than interval
  render() {
    const curTime = new Date();
    if (curTime - this.prevTime > this.interval) {
      this.prevTime = curTime;
      this.snake.move(); // snake move one step
    } 
    if (this.snake.alive) {
      this.snake.render();
      this.meat.render();
      requestAnimationFrame(() => {
        this.render();
      });
    } else {
      window.alert(`Game Over!\nYour score: ${this.snake.body.length - 4}`);
    }
  }
}
class Snake {
  constructor(playground) {
    this.playground = playground;
    this.vector = { x: 1, y: 0 }; // direction of moving
    this.alive = false; // if snake can move, set to be true when game starts, be false while game ends
    const startY = parseInt(playground.height / 2);
    const startX = parseInt(playground.width / 2);
    this.body = [
      new SnakeBone(startX - 3, startY, this),
      new SnakeBone(startX - 2, startY, this),
      new SnakeBone(startX - 1, startY, this),
      new SnakeBone(startX, startY, this),
    ];
    this.setOperations();
  }
  // when snake eats the meat, grow its length by one
  grow(coord) {
    this.body.unshift(new SnakeBone(coord.x, coord.y, this))
  }
  move() {
    // move every bone to its leading bone's position,
    // and then move the head one step towards the direction vector
    const head = this.body[this.body.length - 1];
    const tailCoord = {
      x: this.body[0].coord.x,
      y: this.body[0].coord.y,
    };
    for (let i = 0; i < this.body.length - 1; i += 1) {
      const cur = this.body[i];
      const next = this.body[i + 1];
      cur.change(next.coord);
    }
    head.move(this.vector);
    // snake eats the meat
    if (head.coord.x === this.playground.meat.coord.x && head.coord.y === this.playground.meat.coord.y) {
      this.grow(tailCoord);
      this.playground.meat.change();
    }
    // snake dies or not
    this.isAlive();
  }
  /**
       * test if snake is alive, i.e. if the head of snake hits boundary or its own body
       */
  isAlive() {
    const head = this.body[this.body.length - 1];
    const { width, height } = this.playground;
    if (head.coord.x > width - 1
        || head.coord.x < 0
        || head.coord.y > height - 1
        || head.coord.y < 0) {
      this.alive = false;
    }
    for (let i = 0; i < this.body.length - 1; i += 1) {
      const curBone = this.body[i];
      if (head.coord.x === curBone.coord.x && head.coord.y === curBone.coord.y) {
        this.alive = false;
        break;
      }
    }
  }
  render() {
    for (let i = 0; i < this.body.length; i += 1) {
      this.body[i].render();
    }
  }
  // user operation setting
  setOperations() {
    window.addEventListener('keydown', (e) => {
      // cant go opposite direction
      // up
      if (e.keyCode === 38) {
        if (this.vector.y !== 1) {
          this.vector = { x: 0, y: -1 };
        }
      }
      // down
      if (e.keyCode === 40) {
        if (this.vector.y !== -1) {
          this.vector = { x: 0, y: 1 };
        }
      }
      // left
      if (e.keyCode === 37) {
        if (this.vector.x !== 1) {
          this.vector = { x: -1, y: 0 };
        }
      }
      // right
      if (e.keyCode === 39) {
        if (this.vector.x !== -1) {
          this.vector = { x: 1, y: 0 };
        }
      }
    });
  }
}

// Bone aka body part of the snake
class SnakeBone {
  /**
       * @param {number} x - x coord of bone
       * @param {number} y - y coord of bone
       * @param {Snake} snake - snake instances which contains the bone
       */
  constructor(x, y, snake) {
    this.unit = unit;
    this.snake = snake; // Snake instance where the bone is
    this.coord = { x, y }; // coord of the bone
    this.el = null;
    this.init();
  }
  init() {
    const bone = document.createElement('div');
    this.el = bone;
    bone.classList.add('bone');
    bone.style.width = `${this.unit}px`;
    bone.style.height = `${this.unit}px`;
    this.render();
    this.snake.playground.el.appendChild(bone);
  }
  // move bone to the given coord
  change(newCoord) {
    let { coord } = this;
    coord.x = newCoord.x;
    coord.y = newCoord.y;
  }
  // move bone one step further
  move(vector) {
    let { coord } = this;
    coord.x += vector.x;
    coord.y += vector.y;
  }
  render() {
    this.el.style.left = `${this.unit * this.coord.x}px`;
    this.el.style.top = `${this.unit * this.coord.y}px`;
  }
}

class Meat {
  constructor(p) {
    this.unit = unit;
    this.playground = p;
    this.coord = {x: null, y: null};
    this.el = null;
    this.init();
  }
  init() {
    const meat = document.createElement('div');
    this.el = meat;
    meat.classList.add('meat');
    this.playground.el.appendChild(meat);
    this.change();
    this.render();
  }
  /**
       * change the spot of the meat when it was eaten by the snake,
       * the new spot can't overlap with snake body
       */
  change() {
    let tempX = parseInt(Math.random() * this.playground.width);
    let tempY = parseInt(Math.random() * this.playground.height);
    let overlap = true; // if meat position overlaps with snake body
    while (overlap) {
      overlap = this.playground.snake.body.some((bone) => {
        return bone.coord.x === tempX && bone.coord.y === tempY;
      });
      if (overlap) {
        tempX = parseInt(Math.random() * this.playground.width);
        tempY = parseInt(Math.random() * this.playground.height);
      }
    }
    this.coord = {
      x: tempX,
      y: tempY,
    };
  }
  render() {
    this.el.style.width = `${this.unit}px`;
    this.el.style.height = `${this.unit}px`;
    this.el.style.left = `${this.unit * this.coord.x}px`;
    this.el.style.top = `${this.unit * this.coord.y}px`;
  }
}
window.onload = function() {
  // game related
  let p = new Playground(document.querySelector('#container'), 25, 25);
  // start(restart) the game
  const btn = document.getElementById('btn');
  btn.addEventListener('click', () => {
    document.querySelector('#container').removeChild(document.querySelector('#playground'));
    p = new Playground(document.querySelector('#container'), 25, 25);
    p.start();
  });
}