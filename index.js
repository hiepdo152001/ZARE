import axios from "axios";
import Config from "./config.js";
import { logger } from "./logger.js";
import scout from "./scout.js";

const baseApiUrl = Config.BASE_API_URL;

const boardId = Config.BOARD_ID;
const datas = {
  boardId: boardId,
};

var coinGames = [];

main();

/**
 * Function main.
 */
async function main() {
  let isStart = false;
  while (!isStart) {
    try {
      const response = await axios.get(`${baseApiUrl}/boards/${boardId}`);
      logger.info(response.data.isStarted);
      // if (response.data.isStarted) {
        if (response.data) {
        isStart = true;
      } else {
        await sleep(300); 
      }
    } catch (error) {
      console.error('Lỗi :', error);
      await sleep(300); 
    }
  }
  await joinBoard(datas, Config.NAME_BOT1, Config.TOKEN_BOT1);
  await joinBoard(datas, Config.NAME_BOT2, Config.TOKEN_BOT2);
} 
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


/**
 * Function join game board.
 *
 * @param {object} datas
 * @param {string} nameBot
 * @param {string} tokenBot
 */
async function joinBoard(datas, nameBot, tokenBot) {
  axios
    .post(`${baseApiUrl}/bots/${tokenBot}/join`, datas)
    .then(async (response) => {
      logger.info(`Bot ${nameBot} joined board ${boardId}`);
      await startAction(boardId, nameBot, tokenBot);
    })
    .catch(async (error) => {
      if (error.response && error.response.status === 409) {
        await startAction(boardId, nameBot, tokenBot);
      } else {
        logger.error(`Error joining bot: ${error}`);
      }
    });
}

/**
 * Function start run bot.
 *
 * @param {string} boardId
 * @param {string} nameBot
 * @param {string} tokenBot
 */
async function startAction(boardId, nameBot, tokenBot) {
  axios
    .get(`${baseApiUrl}/boards/${boardId}`)
    .then(async (response) => {
      /** scout before move */
      // get base location
      const baseObjectData = await scout.getBaseObjectInfo(response, nameBot);
      const baseOfCurrentBot = baseObjectData.baseOfCurrentBot;
      const baseOfTeammateBot = baseObjectData.baseOfTeammateBot;

      // get bot info
      const botObjectData = await scout.getBotObjectInfo(response, nameBot);
      const currentBotInfo = botObjectData.currentBotInfo;
      const teammateBotInfo = botObjectData.teammateBotInfo;
      const firstEnemyBotInfo = botObjectData.firstEnemyBotInfo;
      const secondEnemyBotInfo = botObjectData.secondEnemyBotInfo;
      const enemiesBotInfo = [
        botObjectData.firstEnemyBotInfo,
        botObjectData.secondEnemyBotInfo,
      ];
      const myTeamScore = botObjectData.myTeamScore;
      const enemyTeamScore = botObjectData.enemyTeamScore;

      // get coin location
      const coinObjectData = await scout.getCoinObjectInfo(response);

      // get gate location
      const gateObjectData = await scout.getGateObject(response);

      // logger.info(JSON.stringify(enemiesBotInfo));

      coinGames = coinObjectData.coinObject;
      var ArrCoins = coinObjectData.arrCoins;
      // point home me
      var xBase = baseOfCurrentBot.position.x;
      var yBase = baseOfCurrentBot.position.y;
      // point bot me
      var xBot = currentBotInfo.position.x;
      var yBot = currentBotInfo.position.y;
      // coins me
      var coins = currentBotInfo.properties.coins;
      var run = "";
      var location = null;

     

       //neu coins ===5 ve nha.
       if (coins === 5) {
        if (
          scout.checkEnemyInBase(
            firstEnemyBotInfo.position.x,
            firstEnemyBotInfo.position.y,
            currentBotInfo.properties.base.x,
            currentBotInfo.properties.base.y
          ) ||
          scout.checkEnemyInBase(
            secondEnemyBotInfo.position.x,
            secondEnemyBotInfo.position.y,
            currentBotInfo.properties.base.x,
            currentBotInfo.properties.base.y
          )
        ) {
          logger.info(`co bot`);
          location={x:teammateBotInfo.properties.base.x + 1 , 
            y: teammateBotInfo.properties.base.y, point :0};
        }
        else{
          logger.info(`dung im ${nameBot} `);
          location = { x: xBase, y: yBase, point: 0 };
        }
      } 
      else if (coins > 0 && coins < 5) {
        ArrCoins.push({ x: xBase, y: yBase, point: 0 });
        var hasFlag =
          response.data.gameObjects.find(
            (item) => item.type === "ResetButtonGameObject"
          ) !== undefined;
        if (hasFlag) {
          ArrCoins.push({ x: 7, y: 7, point: 0 });
        }
        location = neighbor(xBot, yBot, xBase, yBase, ArrCoins, coins);
        if(location.x=== xBase && location.y ===  yBase ){
          if (
            scout.checkEnemyInBase(
              firstEnemyBotInfo.position.x,
              firstEnemyBotInfo.position.y,
              currentBotInfo.properties.base.x,
              currentBotInfo.properties.base.y
            ) ||
            scout.checkEnemyInBase(
              secondEnemyBotInfo.position.x,
              secondEnemyBotInfo.position.y,
              currentBotInfo.properties.base.x,
              currentBotInfo.properties.base.y
            )
          ) {
            logger.info(`co bot`);
            // di chuyen vao nha ban
            location={x:teammateBotInfo.properties.base.x + 1 , 
              y: teammateBotInfo.properties.base.y, point :0};
          }
        }
        // neu ban minh gan nha minh
        if(scout.checkTeammateInCurrentBase(
          teammateBotInfo.position.x, teammateBotInfo.position.y,
          currentBotInfo.properties.base.x, currentBotInfo.properties.base.y
          )){
            location = {x:currentBotInfo.properties.base.x,y: currentBotInfo.properties.base.y,point:0}
          }
         
      } 
      else {
        location = neighbor(xBot, yBot, xBase, yBase, ArrCoins, coins);
        if(scout.checkTeammateInCurrentBase(
          teammateBotInfo.position.x, teammateBotInfo.position.y,
          currentBotInfo.properties.base.x, currentBotInfo.properties.base.y
          )){
            location = {x:teammateBotInfo.position.x,y: teammateBotInfo.position.y,point:0}
          }
      }
      var ArrEnemy=[];
      ArrEnemy.push({x:firstEnemyBotInfo.position.x,y: firstEnemyBotInfo.position.y, point: firstEnemyBotInfo.properties.coins},
        {x:secondEnemyBotInfo.position.x,y: secondEnemyBotInfo.position.y, point: secondEnemyBotInfo.properties.coins})
      // kiem tra toa do do co phai la dich hay khong
      for (const enemy of enemiesBotInfo) {
        // bot lien ke voi minh thi tien hanh chien
        if (
          (Math.abs(xBot - enemy.x) === 1 && yBot === enemy.y) ||
          (Math.abs(yBot - enemy.y) === 1 && xBot === enemy.x)
        ) {
          if (coins < enemy.point) {
            location = enemy;
            break;
          }
        }

        // kiem tra toa do bot de ne
        else if (
          Math.abs(location.x - enemy.x) <= 2 &&
          Math.abs(location.y - enemy.y) <= 2
        ) {
          location = { x: xBot, y: yBot };
          break;
        }
      }
      logger.info(`${nameBot} move ${location.x } , ${location.y }`);
      
      run = handle(xBot, yBot, location.x, location.y);
      if (run !== null) {
        setTimeout(() => {
        move(tokenBot, run);
        logger.info(`${nameBot} move ${run}`);
          startAction(boardId, nameBot, tokenBot);
        }, 800);
      } else {
        setTimeout(() => {
          startAction(boardId, nameBot, tokenBot);
        }, 100);
      }
    })
    .catch((error) => {
      logger.error(`Error bot: ${error}`);
    });
}

function move(token, direction) {
  const Url = `${baseApiUrl}/bots/${token}/move`;

  axios
    .post(Url, { direction })
    .then((response) => {
      // Xử lý thành công
    })
    .catch((error) => {
      // Xử lý lỗi
    });
}

function neighbor(x, y, xBase, yBase, coinGames, coins) {
  let closestDistance = Number.MAX_VALUE;
  let closestPoint = null;
  for (const coinGame of coinGames) {
    if (coinGame.point + coins <= 5) {
      const distance = Math.sqrt((x - coinGame.x) ** 2 + (y - coinGame.y) ** 2);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPoint = coinGame;
      }
    }
  }
  if (closestPoint == null) {
    return { x: xBase, y: yBase, point: 0 };
  }
  return closestPoint;
}

function handle(x, y, xGo, yGo) {
  if (x > xGo) {
    return "LEFT";
  } else if (x < xGo) {
    return "RIGHT";
  } else if (y > yGo) {
    return "UP";
  } else if (y < yGo) {
    return "DOWN";
  }
}




