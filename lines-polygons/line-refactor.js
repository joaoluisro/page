class Point{
  constructor(x, y){
    this.x = x;
    this.y = y;
  }

  add(x, y){
    this.x += x;
    this.y += y;
  }

  copy(){
    let copy = new Point(this.x, this.y);
    return copy;
  }

  distSqrd(x, y){
    return((this.x - x)**2 + (this.y - y)**2);
  }

  update(x, y){
    this.x = x;
    this.y = y;
  }

  len(){
    return Math.sqrt(this.x**2 + this.y**2);
  }

  normalized(){
    let p = new Point(this.x, this.y);
    p.x /= p.len();
    p.y /= p.len();
    return p;
  }

  dot(a,b){
    return a*this.x + b*this.y;
  }

}

class Line{
  constructor(p1, p2){
    this.p1 = p1;
    this.p2 = p2;
    this.move = 0;
    this.drag = false;
  }

  update_corner(which, x, y){
    if(which == 1){
      this.p1.update(x, y);
    }
    else if(which == 2){
      this.p2.update(x, y);
    }
  }

  // verifica se o ponto clicado está na proximidade de um dos cantos
  in_range_corner(radius, x, y){

    let d_p1 = this.p1.distSqrd(x, y);
    let d_p2 = this.p2.distSqrd(x, y);

    if(radius * radius >= d_p1) return 1;
    else if(radius * radius >= d_p2) return 2;
    return 0;
  }

  distSqrd_to_point(x, y){
    let x1 = this.p1.x;
    let x2 = this.p2.x;
    let y1 = this.p1.y;
    let y2 = this.p2.y;
    return Math.abs(((y2 - y1)*x - (x2 - x1)*y + (x2*y1) - (y2*y1))/((y2 - y1)**2 + (x2 - x1)**2));
  }

  get_r(){
    return Math.sqrt((this.p2.x - this.p1.x) * (this.p2.x - this.p1.x) +
                     (this.p2.y - this.p1.y) * (this.p2.y - this.p1.y));
  }

  get_d(x,y, r){
    return ((this.p2.x - this.p1.x) * (this.p1.y - y) -
           (this.p1.x - x) * (this.p2.y - this.p1.y))/r;

  }

  is_between(x,y){
    let x1 = Math.min(this.p1.x, this.p2.x);
    let x2 = Math.max(this.p1.x, this.p2.x);
    let y1 = Math.min(this.p1.y, this.p2.y);
    let y2 = Math.max(this.p1.y, this.p2.y);

    return(x1 <= x && x2 >= x && y1 <= y && y2 >= y );

  }

  get_m(){
    let p = new Point((this.p1.x + this.p2.x)/2,(this.p1.y + this.p2.y)/2);
    return p;
  }

  is_collinear(x, y, eps){
    let t1 = this.p1.normalized();
    let t2 = this.p2.normalized();
    let t3 = new Point(x,y);
    let t4 = t3.normalized();

    let x1 = t1.x;
    let y1 = t1.y;
    let x2 = t2.x;
    let y2 = t2.y;
    let x3 = t4.x;
    let y3 = t4.y;
    let cross = Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));
    console.log(cross);

    return(cross < eps);
  }
}


function rand_int(max){
  return Math.floor(Math.random() * max);
}

function addPolygon(canvas, n_sides){

  let max_x = canvas.width;
  let max_y = canvas.height;

  let corners = [];

  for(let i = 0; i < n_sides; i++){
    corners.push(new Point(rand_int(max_x), rand_int(max_y)));
  }

  polygon_lines = [];

  for(let i = 0; i < n_sides - 1; i++){
    polygon_lines.push(new Line(corners[i].copy(),corners[i + 1].copy()));
  }
  polygon_lines.push(new Line(corners[n_sides - 1].copy(), corners[0].copy()));
  return polygon_lines;
}

function updateCanvas(canvas, lines){
  let ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(let i=0; i < lines.length; i++){
    let l = lines[i];
    ctx.beginPath();
    ctx.moveTo(l.p1.x, l.p1.y);
    ctx.lineTo(l.p2.x, l.p2.y);
    ctx.lineWidth=5;
    ctx.strokeStyle="red";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.fillRect(l.p1.x - 3, l.p1.y - 3, 12, 12);
    ctx.fillRect(l.p2.x - 3, l.p2.y - 3, 12, 12);
    ctx.fillStyle = "green";
    let m = l.get_m();
    ctx.fillRect(m.x -3 , m.y-3, 10, 10);
    ctx.stroke();
  }
  //ctx.endPath();
}


function split_line(i, lines, intersection){
  let pa_1 = lines[i].p1.copy();
  let pa_2 = intersection.copy();
  let pb_1 = intersection.copy();
  pb_1.add(1,1);
  pb_2 = lines[i].p2.copy();

  let la = new Line(pa_1, pa_2);
  let lb = new Line(pb_1, pb_2);
  lines[i] = la;
  lines.push(lb);
}

window.addEventListener("load", () => {

  // carrega o canvas e ajusta altura e largura
  let canvas = document.getElementById("canvas-line");
  let div = document.getElementById("canvas-1");
  canvas.width = div.clientWidth;
  canvas.height = div.clientHeight;

  // pontos iniciais
  let p1 = new Point(200, 200);
  let p2 = new Point(800, 500);
  let p3 = new Point(100, 100);
  let p4 = new Point(150, 150);
  let lines = [];
  let l1 = new Line(p1, p2);
  let l2 = new Line(p3, p4);
  //lines.push(l2);
  lines.push(l1);
  let mouse_down = new Point(0,0);
  let draw = false;
  updateCanvas(canvas, lines);

  let form = document.getElementById("form-lados");
  form.addEventListener("submit",(e)=>{
    e.preventDefault();
    let p_lines = addPolygon(canvas, form[0].value);
    for(let i =0; i < p_lines.length; i++){
      lines.push(p_lines[i]);
    }
    updateCanvas(canvas, lines);
  });

  let form_refresh = document.getElementById("refresh-form");
  form_refresh.addEventListener("submit",(e)=>{
    e.preventDefault();
    lines = [];
    updateCanvas(canvas, lines);
  });


  canvas.addEventListener("contextmenu", (event)=>{
    event.preventDefault();
  })

  addEventListener("mousedown", (event)=>{
    draw = true;
    // Calcula x,y do clique em relação ao canvas
    const rect = canvas.getBoundingClientRect();
    let x = event.pageX - rect.left;
    let y = event.pageY - rect.top;
    mouse_down.update(x,y);
    let radius = 9;
    let tol = 10;

    // itera sobre todas as linhas e verifica se:


    // 3) uma das linhas será divida
    for(let i = 0; i < lines.length; i++){

      if(event.which == 1){
        // 1) um dos cantos será arrastado
        let corner = lines[i].in_range_corner(radius, x ,y);
        if(corner > 0){
          lines[i].move = corner;
          break;
        }

        // 2) uma das linhas será arrastada OU
        let m = lines[i].get_m();
        if(m.distSqrd(x,y) < tol * tol && lines[i].is_between(x,y)){
          lines[i].drag = true;
          break;
        }
      }
      else if(event.which == 3) {
        let colinear = lines[i].is_collinear(x, y, 8e-7);
        let between = lines[i].is_between(x,y);
        console.log(colinear, between);
        if(colinear && between){
          let intersection = new Point(x,y);
          split_line(i, lines, intersection);
          console.log("splitted : ", i);
          updateCanvas(canvas,lines);
          break;
        }
      }
    }

  });

  addEventListener("mouseup", (event)=>{
    draw = false;
    for(let i = 0; i < lines.length; i++){
      lines[i].move = 0;
      lines[i].drag = false;
    }
  });

  addEventListener("mousemove", (event)=>{
    // Calcula x,y do clique em relação ao canvas
    const rect = canvas.getBoundingClientRect();
    let x = event.pageX - rect.left;
    let y = event.pageY - rect.top;

    let dist_dragged = Math.sqrt(mouse_down.distSqrd(x,y));

    mouse_down.update(x,y);
    let radius = 9;

    for(let i = 0; i < lines.length; i++){
      if(lines[i].drag){
        let m = lines[i].get_m();
        let hor_orientation = Math.sign(x - m.x);
        let ver_orientation = Math.sign(y - m.y);
        //let r = lines[i].get_r();
        //let d = lines[i].get_d(r, x, y);
        //let dx = (d/r)*(lines[i].p1.y - lines[i].p2.y);
        //let dy = (d/r)*(lines[i].p2.x - lines[i].p1.x);
        //console.log(r, d, dx, dy);

        lines[i].p1.add(hor_orientation*dist_dragged, ver_orientation*dist_dragged);
        lines[i].p2.add(hor_orientation*dist_dragged, ver_orientation*dist_dragged);
      //  lines[i].p1.add(dx/100, dy/100);
      //  lines[i].p2.add(dx/100, dy/100);
        break;
      }
      else{
        lines[i].update_corner(lines[i].move, x, y)
      }
    }

    if(draw){
      updateCanvas(canvas, lines);
    }
  });

});
