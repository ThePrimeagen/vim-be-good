local log = require("vim-be-good.log")
local GameUtils = require("vim-be-good.game-utils")
local SnakeGame = require("vim-be-good.games.grid")

local Snake = {}

function Snake:new(difficulty, window)
    local round = {
        window = window,
        difficulty = difficulty,
        snakeGame = SnakeGame:new()
    }
    self.__index = self
    return setmetatable(round, self)
end

function Snake:getInstructions()
    return {'TODO'}
end

function Snake:getConfig()
    log.info("getConfig", self.difficulty, GameUtils.difficultyToTime[self.difficulty])
    return {
        roundTime = GameUtils.difficultyToTime[self.difficulty]
    }
end

function Snake:checkForWin()
    log.info('Checking for Win')
    return false
end

function Snake:name()
    return 'snake'
end

function Snake:render()
    local lines = {'123123123','123123'}
    local cursorIdx = 1
    return lines, cursorIdx
end

return Snake
