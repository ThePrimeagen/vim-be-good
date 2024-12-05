local log = require("vim-be-good.log")
local GameUtils = require("vim-be-good.game-utils")
local SnakeGame = require("vim-be-good.games.snakelib.snakegame")
local T = require("vim-be-good.types")

local Snake = {}

function Snake:new(difficulty, window)
    local getDifficultyLevel = function(d)
        for i, val in ipairs(T.difficulty) do
            if d == val then
                return i
            end
        end
        return 0
    end
    local round = {
        window = window,
        difficulty = difficulty,
        difficultyLevel = getDifficultyLevel(difficulty),
        endRoundCallback = nil
    }
    self.__index = self
    return setmetatable(round, self)
end

function Snake:getInstructions()
    return {
        '',
        'Classic game of Snake.',
        '',
        '1. h,j,k,l to navigate',
        '     h - move left',
        '     j - move down',
        '     k - move up ',
        '     l - move right',
        '2. Eat food (O) to grow',
        '3. Don\'t eat yourself',
        '4. In higher difficulties, walls kill',
        '5. Snake speed scales with difficulty',
    }
end

function Snake:getConfig()
    log.info("getConfig", self.difficulty, GameUtils.difficultyToTime[self.difficulty])
    return {
        roundTime = 1000000,
        noCursor = true,
        canEndRound = true,
    }
end

function Snake:checkForWin()
    log.info('Checking for Win')
    return false
end

function Snake:name()
    return 'snake'
end

function Snake:setEndRoundCallback(endRoundCallback)
    self.endRoundCallback = endRoundCallback
end

function Snake:render()
    if self.snakeGame then
        self.snakeGame:shutdown(nil)
    end
    self.snakeGame = SnakeGame:new(35, 15, self.difficultyLevel, self.endRoundCallback)
    self.snakeGame:start()
    return {''}, 1
end

return Snake
