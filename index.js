import axios from "axios";
import Config from "./config.js";

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

      // list coint on board
      coinGames=response.data.gameObjects.filter(item=> item && item.type === 'CoinGameObject');
      //arr point coin
      var ArrCoins = coinGames.map(coin => ({ x: coin.position.x, y: coin.position.y, point: coin.properties.points }));
      // point home me
      var xBase=profile[0].position.x;
      var yBase=profile[0].position.y;
      // point bot me
      var xBot=bot[0].position.x;
      var yBot=bot[0].position.y;
      // coins me
      var coins=bot[0].properties.coins;
      var run="";
      //neu coins ===5 ve nha.
      if(coins === 5){
      run= handle(xBot,yBot,xBase , yBase);
      }
      else if(coins > 0 && coins < 5){
        ArrCoins.push({ x: xBase, y: yBase, point: 0 });
        var hasFlag = response.data.gameObjects.find(item=>item.type === 'ResetButtonGameObject')  !== undefined;
        if(hasFlag){
          ArrCoins.push({ x: 7, y: 7, point: 0 });
        }
        var locationCoin=neighbor(xBot,yBot,xBase,yBase,ArrCoins,coins,token);
        run=  handle(xBot,yBot,locationCoin.x,locationCoin.y);
      }
      else{
        var locationCoin=neighbor(xBot,yBot,xBase,yBase,ArrCoins,coins,token);
        run=  handle(xBot,yBot,locationCoin.x,locationCoin.y);
      }
      
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
       

      move(token,run);
      setTimeout(() => {
          getBoard(boardId, name, token);
      }, 800);
    })
    .catch((error)=>{
        console.log("Error  bot:", error);
    })
}
function move(token, direction) {
  const Url = 'https://api-zarena.zinza.com.vn/api/bots/' + token + '/move';

  axios.post(Url, { direction })
    .then((response) => {
      // Xử lý thành công
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
}




