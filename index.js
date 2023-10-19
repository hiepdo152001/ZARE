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
      const baseOfTeamateBot = baseObjectData.baseOfTeamateBot;
      const baseOfFirstEnemyBot = baseObjectData.baseOfFirstEnemyBot;
      const baseOfSecondEnemyBot = baseObjectData.baseOfSecondEnemyBot;
      const enemyBases = [
        baseObjectData.baseOfFirstEnemyBot,
        baseObjectData.baseOfSecondEnemyBot,
      ];

      // get bot location
      const botObjectData = await scout.getBotObjectInfo(response, nameBot);
      const currentBotInfo = botObjectData.currentBotInfo;
      const teamateBotInfo = botObjectData.teamateBotInfo;
      const firstEnemyBotInfo = botObjectData.firstEnemyBotInfo;
      const secondEnemyBotInfo = botObjectData.secondEnemyBotInfo;
      const myTeamScore = botObjectData.myTeamScore;
      const enemyTeamScore = botObjectData.enemyTeamScore;

      // get coin location
      const coinObjectData = await scout.getCoinObjectInfo(response);

      // get gate location
      const gateObjectData = await scout.getGateObject(response);
      const testData = await scout.checkEnemyInHome(3,3,3,3);
      logger.info(JSON.stringify(testData));

      /** move */

      // move(token, run);
      // logger.info(`${name} move ${run}`);
      // setTimeout(() => {
      //   getBoard(boardId, name, token);
      // }, 800);
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
