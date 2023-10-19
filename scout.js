import axios from "axios";
import Config from "./config.js";
import { logger } from "./logger.js";

/**
 * Function get bot object.
 */
async function getBotObjectInfo(response, nameCurrentBot) {
  const currentBotInfo = response.data.gameObjects.filter(
    (item) =>
      item.type === "BotGameObject" &&
      item.properties.name === nameCurrentBot
  );

  const teamateBotInfo = response.data.gameObjects.filter(
    (item) =>
      item.type === "BotGameObject" &&
      item.properties.teamId === currentBotInfo[0].properties.teamId &&
      item.properties.name !== nameCurrentBot
  );

  const myTeamScore =
    currentBotInfo[0].properties.score + teamateBotInfo[0].properties.score;

  const enemiesBotInfo = response.data.gameObjects.filter(
    (item) =>
      item.type === "BotGameObject" &&
      item.properties.teamId !== currentBotInfo[0].properties.teamId
  );

  const firstEnemy = enemiesBotInfo[0];
  const secondEnemy = enemiesBotInfo[1];

  const enemyTeamScore =
    firstEnemy.properties.score + secondEnemy.properties.score;

  return {
    currentBotInfo: currentBotInfo[0],
    teamateBotInfo: teamateBotInfo[0],
    myTeamScore: myTeamScore,
    firstEnemyBotInfo: firstEnemy,
    secondEnemyBotInfo: secondEnemy,
    enemyTeamScore: enemyTeamScore,
  };
}

/**
 * Function get base object.
 *
 * @param {Array} response
 * @param {Array} nameCurrentBot
 * @return {object}
 */
async function getBaseObjectInfo(response, nameCurrentBot) {
  const currentBaseInfo = response.data.gameObjects.filter(
    (item) =>
      item.type === "BaseGameObject" &&
      item.properties.name === nameCurrentBot
  );

  const teamateBaseInfo = response.data.gameObjects.filter(
    (item) =>
      item.type === "BaseGameObject" &&
      item.properties.teamId === currentBaseInfo[0].properties.teamId &&
      item.properties.name !== nameCurrentBot
  );

  const enemiesBaseInfo = response.data.gameObjects.filter(
    (item) =>
      item.type === "BaseGameObject" &&
      item.properties.teamId !== currentBaseInfo[0].properties.teamId
  );

  const firstEnemyBaseInfo = enemiesBaseInfo[0];
  const secondEnemyBaseInfo = enemiesBaseInfo[1];

  return {
    baseOfCurrentBot: currentBaseInfo[0],
    baseOfTeamateBot: teamateBaseInfo[0],
    baseOfFirstEnemyBot: firstEnemyBaseInfo,
    baseOfSecondEnemyBot: secondEnemyBaseInfo,
  };
}

/**
 * Function get coin object.
 * 
 * @param {Array} response
 * @return {object}
 */
async function getCoinObjectInfo(response) {
   const coinObject = response.data.gameObjects.filter(
    (item) => item.type === "CoinGameObject"
  );

  const arrCoins = coinObject.map((coin) => ({
    x: coin.position.x,
    y: coin.position.y,
    point: coin.properties.points,
  }));

  return arrCoins;
}

/**
 * Function main.
 */
async function getGateObject() {}

export default {
  getBaseObjectInfo,
  getBotObjectInfo,
  getCoinObjectInfo,
};
