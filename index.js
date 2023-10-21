import axios from "axios";
import Config from "./config.js";
import { logger } from "./logger.js";
import scout from "./scout.js";

const baseApiUrl = Config.BASE_API_URL;

const boardId = Config.BOARD_ID;
const datas = {
  boardId: boardId,
};

var profile = [];
var coinGames = [];

main();

/**
 * Function main.
 */
async function main() {
  const gameStarted = await checkStartGame(Config.CHECK_START_GAME);

  if (gameStarted === true) {
    await joinBoard(datas, Config.NAME_BOT1, Config.TOKEN_BOT1);
    await joinBoard(datas, Config.NAME_BOT2, Config.TOKEN_BOT2);

    if (Config.TEST_MODE === true) {
      await joinBoard(datas, Config.NAME_BOT_TEST1, Config.TOKEN_BOT_TEST1);
      await joinBoard(datas, Config.NAME_BOT_TEST2, Config.TOKEN_BOT_TEST2);
    }
  }
}

/**
 * Function check start game.
 *
 * @param {boolean} needCheck
 * @return {boolean}
 */
async function checkStartGame(needCheck) {
  if (needCheck === false) {
    logger.info("GAME START !!!");
    return true;
  }

  var response = false;
  var setIntervalCheck = setInterval(() => {
    // call api check start game
    logger.warn("GAME NOT START"); // if game is not start, log and call api
    // response = true; // if game is start, set response is true
    if (response == true) {
      clearInterval(setIntervalCheck);
      logger.info("GAME START !!!");
      return true;
    }
  }, 200);
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

      // TEST CASE
      // if (Config.TEST_MODE === true) {
      //   if (nameBot === "Mầm-01") {
      //     var run = handle(
      //       currentBotInfo.position.x,
      //       currentBotInfo.position.y,
      //       4,
      //       14
      //     );
      //     /** move */
      //     move(tokenBot, run);
      //     logger.info(`${nameBot} move ${run}`);
      //     setTimeout(() => {
      //       startAction(boardId, nameBot, tokenBot);
      //     }, 1000);
      //   }

      //   if (nameBot === "Mầm-02") {
      //     var run = handle(
      //       currentBotInfo.position.x,
      //       currentBotInfo.position.y,
      //       5,
      //       1
      //     );
      //     /** move */
      //     move(tokenBot, run);
      //     logger.info(`${nameBot} move ${run}`);
      //     setTimeout(() => {
      //       startAction(boardId, nameBot, tokenBot);
      //     }, 1000);
      //   }

      //   if (nameBot === "[Test] Mầm-01") {
      //     var targetEnemy = enemiesBotInfo.find(
      //       ({ properties }) => properties.name === "Mầm-02"
      //     );
      //     var run = handle(
      //       currentBotInfo.position.x,
      //       currentBotInfo.position.y,
      //       targetEnemy.properties.base.x,
      //       targetEnemy.properties.base.y
      //     );
      //     /** move */
      //     move(tokenBot, run);
      //     logger.info(`${nameBot} move ${run}`);
      //     setTimeout(() => {
      //       startAction(boardId, nameBot, tokenBot);
      //     }, 1000);
      //   }

      //   // if (nameBot === "[Test] Mầm-02") {
      //   //   var targetEnemy = enemiesBotInfo.find(
      //   //     ({ properties }) => properties.name === "Mầm-01"
      //   //   );
      //   //   var run = handle(
      //   //     currentBotInfo.position.x,
      //   //     currentBotInfo.position.y,
      //   //     targetEnemy.properties.base.x,
      //   //     targetEnemy.properties.base.y
      //   //   );
      //   //   /** move */
      //   //   move(tokenBot, run);
      //   //   logger.info(`${nameBot} move ${run}`);
      //   //   setTimeout(() => {
      //   //     startAction(boardId, nameBot, tokenBot);
      //   //   }, 1000);
      //   // }
      // }

      // HANDLE TWO ENEMY IN HOME

      // if (
      //   scout.checkTwoEnemyInTwoBase(
      //     firstEnemyBotInfo.position.x,
      //     firstEnemyBotInfo.position.y,
      //     secondEnemyBotInfo.position.x,
      //     secondEnemyBotInfo.position.y,
      //     currentBotInfo.properties.base.x,
      //     currentBotInfo.properties.base.y,
      //     teammateBotInfo.properties.base.x,
      //     teammateBotInfo.properties.base.y
      //   )
      // ) {
      //   await handleTwoEnemyInTwoBase(
      //     tokenBot,
      //     nameBot,
      //     currentBotInfo,
      //     firstEnemyBotInfo,
      //     secondEnemyBotInfo
      //   );
      // }

      // HANDLE CHECK ENEMY IN CURRENT BASE
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
        await handleOneEnemyInCurrentBase(
          tokenBot,
          nameBot,
          currentBotInfo,
          teammateBotInfo
        );
      }
    })
    .catch((error) => {
      logger.error(`Error bot: ${error}`);
    });
}

function move(token, direction) {
  const Url = "https://api-zarena.zinza.com.vn/api/bots/" + token + "/move";

  axios
    .post(Url, { direction })
    .then((response) => {
      // Xử lý thành công
    })
    .catch((error) => {
      // Xử lý lỗi
    });
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

async function handleTwoEnemyInTwoBase(
  tokenBot,
  nameBot,
  currentBotInfo,
  firstEnemyBotInfo,
  secondEnemyBotInfo
) {
  if (currentBotInfo.properties.name === "Mầm-01") {
    var run = handle(
      currentBotInfo.position.x,
      currentBotInfo.position.y,
      firstEnemyBotInfo.properties.base.x,
      firstEnemyBotInfo.properties.base.y
    );
    move(tokenBot, run);
    logger.info(`${nameBot} move ${run}`);
    setTimeout(() => {
      startAction(boardId, nameBot, tokenBot);
    }, 1000);
  }
  if (currentBotInfo.properties.name === "Mầm-02") {
    var run = handle(
      currentBotInfo.position.x,
      currentBotInfo.position.y,
      secondEnemyBotInfo.properties.base.x,
      secondEnemyBotInfo.properties.base.y
    );
    move(tokenBot, run);
    logger.info(`${nameBot} move ${run}`);
    setTimeout(() => {
      startAction(boardId, nameBot, tokenBot);
    }, 1000);
  }
}

async function handleOneEnemyInCurrentBase(
  tokenBot,
  nameBot,
  currentBotInfo,
  teammateBotInfo
) {
  var run = handle(
    currentBotInfo.position.x,
    currentBotInfo.position.y,
    teammateBotInfo.properties.base.x,
    teammateBotInfo.properties.base.y
  );
  move(tokenBot, run);
  logger.info(`${nameBot} move ${run}`);
  setTimeout(() => {
    startAction(boardId, nameBot, tokenBot);
  }, 1000);
}
