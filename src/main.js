const game_speed_multiplier = 1.0
var   render_fps            = 20

var game_enabled = true;

var oldwidth=null;
var cursorcount=0;

var curinput='', focused=true, score=0;

function render_tick()
{
  render_schedule_next();
  var w = gel('statswin').offsetWidth;
  if(w !== oldwidth)
  {
    resize();
    oldwidth=w;
  }
  if(game_enabled)
  {
    game_tick()
    decorations_tick()

    let cursor_interval = render_fps/8;
    if(++cursorcount >= cursor_interval)
    {
      cursorcount -= cursor_interval;
      var f = gel('cursor');
      f.style.marginLeft='-1ex';
      f.textContent = (f.textContent == '_' ? ' ' : '_');
    }

    stars_update();
  }
}
function render_schedule_next()
{
  setTimeout(render_tick, game_speed_multiplier * 1000.0/render_fps)
}
function render_score()
{
  const stext = (n,t) => {
    let b = gel(n)
    if(b) b.innerText = t
  }
  stext('score', Math.round(score, 1))
  stext('score1', Math.round(score, 1))
  stext('skill', Math.round(cur_challenge_total, 1) + '/' + Math.round(target_challenge, 1))
  stext('time', Math.round(game_timer, 1))
  stext('time1', Math.round(game_timer, 1))
  stext('miss', Math.round(misses, 1))
}
function render_input()
{
  let equation = poly_parse(curinput);
  /* lhs, comp_op, rhs, errors, trailing signs */
  let poly = equation[2]
  let tex = poly_render_latex(equation[2]);
  if(equation[1])
  {
    let sign = latex_sign(equation[1]);
    tex = poly_render_latex(equation[0]) + sign + tex;
  }
  for(let n=0; n<equation[4].length; ++n)
    tex += latex_sign(equation[4][n]);
  
  latex_render(tex, h=>{
    let i = gel('input'), b=h//.firstChild
    i.replaceChild(b, i.childNodes[2]);
    b.id='inputt'
    /*
    b.style.color='#CCBBC2'
    b.style.display='inline-block'
    b.style.margin='initial'
    b.style.textAlign='initial'
    */
  })
}

function resize()
{
  let room = gel('gamewin')
  let stat = gel('statswin')
  //console.log(window.innerWidth, window.innerHeight)
  stat.style.height = (gel('statstab').offsetHeight + gel('score').offsetHeight*2*1.1)+'px'
  room.style.width = window.innerWidth+'px'
  room.style.height = window.innerHeight+'px'
  stat.style.top    = (room.offsetHeight-stat.offsetHeight)+'px'
  room.style.height = stat.offsetTop+'px'
  
  for(let n=0; n<6; ++n)
  {
    let s=gel('stars'+n);
    if(s){
      s.style.width = room.style.width
      s.style.height = room.style.height
    }
  }
  return false
}
function main_load()
{
  resize()
  let room = gel('gamewin')
  dom_wipe(room)
  document.addEventListener('keydown', keydown, false)
  document.addEventListener('keyup',   keyup,   false)
  window.addEventListener('resize', resize, false)
  window.addEventListener('focus', (ev)=>setfocus(true), false)
  window.addEventListener('blur',  (ev)=>setfocus(false), false)
  //room.addEventListener('mousedown', mouseclick, false)
  render_schedule_next()
}

let alt=false,meta=false,ctrl=false,shift=false;
function keydown(ev)
{
  /* https://www.toptal.com/developers/keycode */
  if(ev.MetaKey) //ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey)
    { /* ignore */ }
  else if(ev.keyCode == 8) /* backspace */
  {
    if(curinput.length > 0)
    {
      curinput = curinput.slice(0,-1);
      render_input();
    }
  }
  else if(ev.keyCode == 13)
  {
    game_submit(poly_parse(curinput));
    curinput = ''
    render_input();
  }
  else if(ev.key.length == 1) 
  {
    if(alt && ev.key == 'l')
    {
      setlanguage(curlang=='en' ? 'fi' : 'en')
      return false
    }
    if(alt && ev.key == 'v')
    {
      game_over();
      return false;
    }
    /* input key */
    curinput += ev.key;
    render_input();
  }
  else if(ev.key == 'Pause')
  {
    
  }
  else if(ev.key == 'Shift') shift=true;
  else if(ev.key == 'Alt' || ev.key == 'AltGraph') alt=true;
  else if(ev.key == 'Control') ctrl=true;
  else if(ev.key == 'Meta' || ev.key == 'Compose') meta=true;
  return false
}
function keyup(ev)
{
  if(ev.key == 'Shift') shift=false;
  else if(ev.key == 'Alt' || ev.key == 'AltGraph') alt=false;
  else if(ev.key == 'Control') ctrl=false;
  else if(ev.key == 'Meta' || ev.key == 'Compose') meta=false;
  return false
}
/*function mouseclick(ev)
{
  return false
}*/
function setfocus(state)
{
  focused=state;
  gel('statswin').style.backgroundColor=(focused ? '#14A' : '#090909');
  return false
}


function game_over()
{
  game_enabled=false;
  gel('gameover').style.display='block';
  render_score();
}

function game_reset()
{
  let room = gel('gamewin')
  dom_wipe(room)
  gel('gameover').style.display='none';

  curinput='';
  score=misses=game_timer=completed=last_scorelog=input_idle=cur_challenge_total=0;
  cur_challenges={}
  game_enabled=true;
  skill_multiplier=1;
  target_challenge=10;
  gamespeed=4;
  input_idle_timeout=5;
  scorelog=[];

  render_score()
  render_input();
}
