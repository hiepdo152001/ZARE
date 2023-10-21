import axios from "axios";
import Config from "./config.js";
import  Queue  from 'queue-fifo';
// var door= require('./door.js');

const mam1 = "bd1e5129-4432-426b-b945-170485e41850";
const mam2=  "a099fcef-ec0c-4090-bf4c-b50194b11145";
const test1="a9002808-131c-4a80-9229-76608a3e9220";
const test2="92460a6d-a94d-4812-824a-dda25819ad60";
const name1="Mầm-01";
const name2="Mầm-02";
const nametest1="[Test] Mầm-01";
const nametest2="[Test] Mầm-02";
const boardId = Config.BOARD_ID;
const datas = {
  boardId: boardId,
};
var profile=[];
var coinGames=[];
join(datas,mam1,name1);
join(datas,mam2,name2);


function join(datas,token,name){
    const joinUrl = 'https://api-zarena.zinza.com.vn/api/bots/' + token + "/join";
    axios.post(joinUrl, datas)
    .then((response) => {
        getBoard(boardId,name,token);
    })
    .catch((error) => {
      if (error.response && error.response.status === 409) {
          getBoard(boardId,name,token);
      } else {
        console.log("Error joining bot:", error);
      }
    });
}

function getBoard(boardId,name,token) {
    var boardUrl = 'https://api-zarena.zinza.com.vn/api/boards/' + boardId;
    axios.get(boardUrl)
    .then((response) => {
      
      // home me
      profile = response.data.gameObjects.filter(item => item && item.type === 'BaseGameObject' && item.properties.name === name);
      
      // bot me
      var bot = response.data.gameObjects.filter(item => item && item.type === 'BotGameObject' && item.properties.name === name);
      
      // bot friend 
      var friend = response.data.gameObjects.filter(item => item && item.type === 'BotGameObject' 
      && item.properties.teamId === bot[0].properties.teamId && item.properties.name !== name);
      
      // home friend
      var friendHome = response.data.gameObjects.filter(item => item && item.type === 'BaseGameObject' &&
      item.properties.teamId === bot[0].properties.teamId && item.properties.name !== name);
      // thong tin bot ke dich 
      var enemys = response.data.gameObjects.filter(item => item && item.type === 'BotGameObject' 
      && item.properties.teamId !== bot[0].properties.teamId);
      
      // thong tin home bot ke dich
      var enemysHome = response.data.gameObjects.filter(item => item && item.type === 'BaseGameObject' 
      && item.properties.teamId !== bot[0].properties.teamId);

      // canh cong
      var gates= response.data.gameObjects.filter(item => item && item.type === 'GateGameObject');

      // list coint on board
      coinGames=response.data.gameObjects.filter(item=> item && item.type === 'CoinGameObject');
      //arr point coin
      var ArrCoins = coinGames.map(coin => ({ x: coin.position.x, y: coin.position.y, point: coin.properties.points }));

      var ArrEnemy= enemys.map(enemy=> ({x: enemy.position.x, y: enemy.position.y, point: enemy.properties.coins, }));
      // point home me
      var xBase=profile[0].position.x;
      var yBase=profile[0].position.y;
      // point bot me
      var xBot=bot[0].position.x;
      var yBot=bot[0].position.y;
      // coins me
      var coins=bot[0].properties.coins;
      var run="";
      var location=null;

      //neu coins ===5 ve nha.
      if(coins === 5){
        location={x: xBase,y: yBase, point: 0 }
      }
      else if(coins > 0 && coins < 5){
        ArrCoins.push({ x: xBase, y: yBase, point: 0 });
        var hasFlag = response.data.gameObjects.find(item=>item.type === 'ResetButtonGameObject')  !== undefined;
        if(hasFlag){
          ArrCoins.push({ x: 7, y: 7, point: 0 });
        }
        location=neighbor(xBot,yBot,xBase,yBase,ArrCoins,coins,token);
      }
      else{
        location=neighbor(xBot,yBot,xBase,yBase,ArrCoins,coins,token);
      }
      var start={x: xBot,y: yBot, point: bot[0].properties.coins };
      var end=location;
      // var end= {x: 3,y: 3, point: bot[0].properties.coins };
      
      //thuat toan tim duong di hop ly
      // var path=bfs(start,end,ArrEnemy);
      // if (path !== null && path.length > 0) {
      //   var location = path.shift();
      // } 
      // kiem tra toa do do co phai la dich hay khong 
      for (const enemy of ArrEnemy) {
        // bot lien ke voi minh thi tien hanh chien
        if((Math.abs(xBot - enemy.x) === 1 && yBot === enemy.y) 
        || (Math.abs(yBot - enemy.y) === 1 && xBot === enemy.x))
        {
          if(coins < enemy.point ){
            location = enemy;
            break;
          }
         
        }
        // kiem tra toa do bot de ne 
        else if (Math.abs(location.x - enemy.x) <= 1 && Math.abs(location.y - enemy.y) <= 1) {
          location={x:xBot, y:yBot};
          break;
        }
      }
        run =  handle(xBot,yBot,location.x,location.y);
        if(run !== null){
          setTimeout(() => {
            move(token,run)
            getBoard(boardId, name, token);
          }, 800);
        }
        else{
          setTimeout(() => {
           
            getBoard(boardId, name, token);
          }, 1);
        }
        
        
      
      
      // var next = locationNext(xBot,yBot,run);
      // door.handle(next,)

      // run up down left right
      /// xet run la buoc di tiep theo de toi uu chien thuat
      // run up

      // xet xem toa do cua diem tiep theo la bn {x;y}
      // lay toa do khoanh vung 
      // xet tung case
      // case 1: neu gan cua or vao cua luon -> cua xem nen di vao cua khong
      // case dich: // neu bot o nha minh thi di chuyen sang gui vang nha ban
            // neu ca 2 bot deu o 2 nha minh thi minh di chuyen den 2 nha cua no. sau call board ltuc check
            // no di chuyen ra chua. neu di chuyen roi  
       

      
    })

    .catch((error)=>{
        console.log("Error  bot:", error);
    })
}


function move(token, direction) {
  const Url = 'https://api-zarena.zinza.com.vn/api/bots/' + token + '/move';

  axios.post(Url, { direction })
    .then((response) => {
      
    })
    .catch((error) => {
      // Xử lý lỗi
    });
}

function neighbor(x,y,xBase,yBase,coinGames,coins){
  let closestDistance = Number.MAX_VALUE;
  let closestPoint = null;
  for (const coinGame of coinGames) {
    if(coinGame.point + coins <= 5){
      const distance = Math.sqrt((x - coinGame.x) ** 2 + (y - coinGame.y) ** 2);
      if (distance < closestDistance) {
          closestDistance = distance;
          closestPoint = coinGame;
      }
    }
  }
  if(closestPoint == null){
      return {x: xBase,y: yBase, point: 0 }
  }
  return closestPoint;
}

function handle(x,y,xGo,yGo){
  if(x > xGo){
    return "LEFT";
  }
  else  if( x < xGo){
    return "RIGHT";
  }
  else if(y > yGo){
    return "UP";
  }
  else if(y < yGo){
    return "DOWN";
  }
  else{
    return "";
  }
}

// function locationNext(x,y,run){
//   switch(run){
//     case "RUN":
//       y=y-1;
//       break;
//     case "DOWN":
//       y=y+1;
//       break;
//     case "LEFT":
//       x=x-1;
//       break;
//     case "RIGHT":
//       x=x+1;
//       break;
//   }
//   return {x:x ,y:y};
// }

function bfs(start, end, ArrEnemy) {
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const rows = 15;
  const cols = 15;
  const visited = new Array(rows).fill().map(() => new Array(cols).fill(false));
  const queue = new Queue();

  queue.enqueue({ current: start, path: [] });

  while (!queue.isEmpty()) {
      const { current, path } = queue.dequeue();
      const { x, y, point } = current;

      if (x === end.x && y === end.y) {

          return path; // Tìm thấy đường đi, trả về nó
      }

      for (const [dx, dy] of directions) {
          const new_x = x + dx;
          const new_y = y + dy;
          if (new_x >= 0 && new_x < rows && new_y >= 0 && new_y < cols && !visited[new_x][new_y]) {
              if (ArrEnemy.some(enemy => enemy.x === new_x && enemy.y === new_y)) {
                  if (start.point < 1) {
                      visited[new_x][new_y] = true;
                      const new_path = [...path, { x: new_x, y: new_y, point: 0 }];
                      queue.enqueue({ current: { x: new_x, y: new_y, point: 0 }, path: new_path });
                  }
              } else {
                  visited[new_x][new_y] = true;
                  const new_path = [...path, { x: new_x, y: new_y, point }];
                  queue.enqueue({ current: { x: new_x, y: new_y, point }, path: new_path });
              }
          }
      }
  }

  return null; // Không tìm thấy đường đi
}
function skill(){


}

function friend(){

}



