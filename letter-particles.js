class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  // return the angle of the vector in radians
  getDirection() {
    return Math.atan2(this.y, this.x);
  }

  // set the direction of the vector in radians
  setDirection(angle) {
    const magnitude = this.getMagnitude();
    this.x = Math.cos(angle) * magnitude;
    this.y = Math.sin(angle) * magnitude;
  }

  // get the magnitude of the vector
  getMagnitude() {
    // use pythagoras theorem to work out the magnitude of the vector
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  // set the magnitude of the vector
  setMagnitude(magnitude) {
    const direction = this.getDirection();
    this.x = Math.cos(direction) * magnitude;
    this.y = Math.sin(direction) * magnitude;
  }

  // add two vectors together and return a new one
  add(v2) {
    return new Vector(this.x + v2.x, this.y + v2.y);
  }

  // add a vector to this one
  addTo(v2, scalar = 1) {
    this.x += v2.x * scalar;
    this.y += v2.y * scalar;
  }

  // subtract two vectors and return a new one
  subtract(v2) {
    return new Vector(this.x - v2.x, this.y - v2.y);
  }

  // subtract a vector from this one
  subtractFrom(v2) {
    this.x -= v2.x;
    this.y -= v2.y;
  }

  // multiply this vector by a scalar and return a new one
  multiply(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  // multiply this vector by the scalar
  multiplyBy(scalar) {
    this.x *= scalar;
    this.y *= scalar;
  }

  // scale this vector by scalar and return a new vector
  divide(scalar) {
    return new Vector(this.x / scalar, this.y / scalar);
  }

  // scale this vector by scalar
  divideBy(scalar) {
    this.x /= scalar;
    this.y /= scalar;
  }

  // dot product of two vectors
  dotProduct(v2) {
    return this.x * v2.x + this.y * v2.y;
  }

  // normalize a given vector
  normalize() {
    return new Vector(
      this.x / Math.sqrt(this.x * this.x + this.y * this.y),
      this.y / Math.sqrt(this.x * this.x + this.y * this.y),
    );
  }

  limit(max, factor) {
    if (Math.abs(this.x) > max) {
      this.x *= factor;
    }
    if (Math.abs(this.y) > max) {
      this.y *= factor;
    }
    return this;
  }
}

class Letter {
  constructor(element, mouse) {
    this.element = element;
    this.mouse = mouse;
    this.opacity = 0;
    this.target = new Vector();
    this.pos = new Vector();
    this.vel = new Vector();
    this.acc = new Vector();
    this.maxMagnitude = 30;

    // tick, tick
    const MS_PER_UPDATE = 4;
    let [rAF, elapsed, previous, lag] = [null, 0, 0, 0];
    const tick = (current) => {
      //console.log(elapsed);
      elapsed = current - previous;
      previous = current;
      lag += elapsed;

      // Update or simulate
      while (lag > MS_PER_UPDATE) {
        this.update(MS_PER_UPDATE / 1000);
        lag -= MS_PER_UPDATE;
      }
      // Render
      this.draw(lag / MS_PER_UPDATE);
      rAF = requestAnimationFrame(tick);
    };
    rAF = requestAnimationFrame(tick);
  }

  setRandomPosition() {
    this.pos = new Vector(
      (Math.random() - 0.5) * window.innerWidth,
      (Math.random() - 0.5) * window.innerHeight,
    );
    this.vel = new Vector(
      (Math.random() - 0.5) * 3900,
      (Math.random() - 0.5) * 3900,
    );
  }

  update(dt) {
    this.pos.addTo(this.vel, dt);
    this.acc = this.target.subtract(this.pos);
    // this.acc = this.mouse.add(this.pos);
    // this.acc.multiplyBy(-1);
    // console.log(this.acc.getMagnitude());
    this.opacity = 1 - this.acc.getMagnitude() / 300;
    this.acc.setMagnitude(this.maxMagnitude);
    this.vel.addTo(this.acc);
    this.vel.limit(0.98, 0.98);
  }
  draw() {
    this.element.style.transform = `
      translate3d(${this.pos.x}px,${this.pos.y}px,0)
    `;
    this.element.style.opacity = this.opacity;
  }
}

class LetterParticles extends HTMLElement {
  constructor() {
    super();
    this.letters = new Set();
  }
  connectedCallback() {
    const mouse = new Vector();
    document.addEventListener('mousemove', (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    });
    const letters = this.textContent.split('');
    this.textContent = '';
    letters.forEach((letter) => {
      const element = document.createElement('span');
      element.innerHTML = letter !== ' ' ? letter : '&nbsp;';
      this.letters.add(new Letter(element, mouse));
      this.appendChild(element);
    });

    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.letters.forEach((letter) => {
            letter.setRandomPosition();
          });
        }
      });
    };
    const observer = new IntersectionObserver(callback);
    observer.observe(this);
  }
}

customElements.define('letter-particles', LetterParticles);
