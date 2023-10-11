const axios = require("axios");

const mam1 = "bd1e5129-4432-426b-b945-170485e41850";
const mam2=  "a099fcef-ec0c-4090-bf4c-b50194b11145";
const name1="Mầm-01";
const name2="Mầm-02";
const boardId = 3;
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
      profile= response.data.gameObjects.filter(item => item && item.type === 'BaseGameObject' && item.properties.name === name);
      bot= response.data.gameObjects.filter(item => item && item.type === 'BotGameObject' && item.properties.name === name);
      coinGames=response.data.gameObjects.filter(item=> item && item.type === 'CoinGameObject');
      var ArrCoins = coinGames.map(coin => ({ x: coin.position.x, y: coin.position.y, point: coin.properties.points }));
      xBase=profile[0].position.x;
      yBase=profile[0].position.y;
      xBot=bot[0].position.x;
      yBot=bot[0].position.y;
      coins=bot[0].properties.coins;
      var test =0;
      test= goHome(coins,xBase,yBase,xBot,yBot,coinGames,ArrCoins,token);
      //mang chua toa do coin
      console.log(1);
      if(test===0){
        var locationCoin=neighbor(xBot,yBot,xBase,yBase,ArrCoins,coins,token); 
        var run=  handle(xBot,yBot,locationCoin.x,locationCoin.y);
        move(token,run);
      }
      setTimeout(() => {
          getBoard(boardId, name, token);
      }, 1000);
    })
    .catch((error)=>{
        console.log("Error  bot:", error);
    })
}
function move(token, direction) {
  const Url = 'https://api-zarena.zinza.com.vn/api/bots/' + token + '/move';

  axios.post(Url, { direction })
    .then((response) => {
      console.log(profile.data);
      // Xử lý thành công
    })
    .catch((error) => {
      // Xử lý lỗi
    });
}

function neighbor(x,y,xBase,yBase,coinGames,coins){
  let closestDistance = Number.MAX_VALUE;
  let closestPoint = null;
  console.log(coins);
  for (const coinGame of coinGames) {
    if(coinGame.point + coins <= 5){
      const distance = Math.sqrt((x - coinGame.x) ** 2 + (y - coinGame.y) ** 2);
      if (distance < closestDistance) {
          closestDistance = distance;
          closestPoint = coinGame;
      }
    }
   
  }
  if(coins < 5 && closestPoint == null){
      return {x: xBase,y:yBase, point:0 }
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

function goHome(coins,xBase,yBase,xBot,yBot,coinGames,ArrCoins,token){
  if(coins ===5 ){
  var moves= handle(xBot,yBot,xBase , yBase);
  move(token,moves);
   return 1;
  }
  return 0;
 
}
