import axios from "axios";
import Config from "./config.js";
import { logger } from "./logger.js";
import { performance } from "perf_hooks";

/**
 * Function get bot object.
 */
async function getBotObjectInfo(response, nameCurrentBot) {
  const currentBotInfo = response.data.gameObjects.filter(
    (item) =>
      item.type === "BotGameObject" && item.properties.name === nameCurrentBot
  );

  const teammateBotInfo = response.data.gameObjects.filter(
    (item) =>
      item.type === "BotGameObject" &&
      item.properties.teamId === currentBotInfo[0].properties.teamId &&
      item.properties.name !== nameCurrentBot
  );

  const myTeamScore =
    currentBotInfo[0].properties.score + teammateBotInfo[0].properties.score;

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
    teammateBotInfo: teammateBotInfo[0],
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
      item.type === "BaseGameObject" && item.properties.name === nameCurrentBot
  );

  const teammateBaseInfo = response.data.gameObjects.filter(
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
    baseOfTeammateBot: teammateBaseInfo[0],
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
 * Function get gate object.
 *
 * @param {Array} response
 * @return {object}
 */
async function getGateObject(response) {
  const gateObject = response.data.gameObjects.filter(
    (item) => item.type === "GateGameObject"
  );

  return gateObject;
}

/**
 * Function get surround coordinates of object.
 *
 * @param {number} x
 * @param {number} y
 * @return {object}
 */
async function getSurroundingCoordinates(x, y) {
  const surroundingCoordinates = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx !== 0 || dy !== 0) {
        const newX = x + dx;
        const newY = y + dy;

        if (newX >= 0 && newX < 15 && newY >= 0 && newY < 15) {
          surroundingCoordinates.push({ x: newX, y: newY });
        }
      }
    }
  }

  return surroundingCoordinates;
}

/**
 * Function get surround coordinates of object.
 *
 * @param {number} xEnemy
 * @param {number} yEnemy
 * @param {number} xBase
 * @param {number} yBase
 * @return {boolean}
 */
async function checkEnemyInBase(xEnemy, yEnemy, xBase, yBase) {
  const coordinateSurroundBase = await getSurroundingCoordinates(xBase, yBase);
  const coordinateBase = { x: xBase, y: yBase };

  coordinateSurroundBase.push(coordinateBase);

  const result = coordinateSurroundBase.find(
    ({ x, y }) => x === xEnemy && y === yEnemy
  );

  if (result === undefined) {
    return false;
  }

  return true;
}

/**
 * Function two enemy in two base.
 *
 * @param {number} xEnemy
 * @param {number} yEnemy
 * @param {number} xBase
 * @param {number} yBase
 * @return {boolean}
 */
async function checkTwoEnemyInTwoBase(
  xFirstEnemy,
  yFirstEnemy,
  xSecondEnemy,
  ySecondEnemy,
  xFirstBase,
  yFirstBase,
  xSecondBase,
  ySecondBase
) {
  if (
    checkEnemyInBase(xFirstEnemy, yFirstEnemy, xFirstBase, yFirstBase) &&
    checkEnemyInBase(xSecondEnemy, ySecondEnemy, xSecondBase, ySecondBase)
  ) {
    return true;
  }

  if (
    checkEnemyInBase(xFirstEnemy, yFirstEnemy, xSecondBase, ySecondBase) &&
    checkEnemyInBase(xSecondEnemy, ySecondEnemy, xFirstBase, yFirstBase)
  ) {
    return true;
  }

  return false;
}

export default {
  getBaseObjectInfo,
  getBotObjectInfo,
  getCoinObjectInfo,
  getGateObject,
  checkEnemyInBase,
  checkTwoEnemyInTwoBase,
};
