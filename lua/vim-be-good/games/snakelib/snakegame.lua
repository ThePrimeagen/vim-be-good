local V = vim.api
local C = require('vim-be-good.games.snakelib.const')
local Grid = require('vim-be-good.games.snakelib.grid')
local Snake = require('vim-be-good.games.snakelib.snake')

local SnakeGame = {}

-- Render loop speed for each difficulty level.
-- Smaller values are faster.
local SpeedLevel = {
    [1] = 150,
    [2] = 135,
    [3] = 120,
    [4] = 105,
    [5] = 80,
    [6] = 40,
}

-- Main entry point of the Snake Game. Handles core business logic.
-- @param width integer: the width of the snake window
-- @param height integer: the height of the snake window
-- @param difficultyLevel integer: value between 1 and 6
-- @param endGameCallback function: the function to be called when the game ends
function SnakeGame:new(width, height, difficultyLevel, endGameCallback)
    self.__index = self
    -- Center game UI in current window
    local curWinHeight = V.nvim_win_get_height(0)
    local curWinWidth = V.nvim_win_get_width(0)
    local col = (curWinWidth - width) / 2
    local row = (curWinHeight - height) / 2

    local scoreBuf = V.nvim_create_buf(false, true)
    local scoreWin = V.nvim_open_win(scoreBuf, false, {
        relative = 'win',
        focusable = false,
        title = "Snake",
        title_pos = "center",
        noautocmd = true,
        row = row,
        col = col,
        width = width,
        height = 1,
        style = 'minimal',
        border = 'rounded',
    })

    local gridBuf = V.nvim_create_buf(false, true)
    local gridWin = V.nvim_open_win(gridBuf, true, {
        relative = 'win',
        win = scoreWin,
        noautocmd = true,
        row = 2,
        col = -1,
        width = width,
        height = height,
        style = 'minimal',
        border = 'rounded',
    })
    V.nvim_buf_set_option(gridBuf, 'modifiable', false)
    -- Setup key press handlers for h,j,k,l
    for _, key in pairs({'h','j','k','l'}) do
        vim.keymap.set({'n'}, key, function ()
            self.snake:setDir(C.KeyDirMap[key])
        end, { buffer = gridBuf })
    end

    local gameGrid = Grid:new(gridBuf, width, height, C.GridChar)

    -- When the game is closed (the grid), also close the Scores window.
    V.nvim_create_autocmd({"WinClosed"}, {
        pattern = { tostring(gridWin) },
        callback = function(_)
            self.gridWin = nil
            self:shutdown(self.endGameCallback)
        end
    })

    local newGame = {
        scoreWin = scoreWin,
        scoreBuf = scoreBuf,
        gridBuf = gridBuf,
        gridWin = gridWin,
        grid = gameGrid,
        food = {},
        snake = {},
        score = 0,
        noWalls = difficultyLevel < 4,
        speed = SpeedLevel[difficultyLevel],  -- technically slowness
        endGameCallback = endGameCallback
    }
    self = setmetatable(newGame, self)
    return self
end

-- Starts the game, including the game loop.
function SnakeGame:start()
    self:cancelTimer()
    self.score = 0
    self.food = {}
    self.snake = Snake:new(self.grid.width / 2, self.grid.height / 2, 3, self.noWalls)
    self.gameTimer = vim.loop.new_timer()
    self.gameTimer:start(0, self.speed, vim.schedule_wrap(function()
        self:render()
    end))
    self:updateScore()
end

-- Shuts down the game and closes its windows. Optionally also call a callback.
function SnakeGame:shutdown(callback)
    self:cancelTimer()
    if self.scoreWin then
        V.nvim_win_close(self.scoreWin, true)
        self.scoreWin = nil
    end
    if self.gridWin then
        V.nvim_win_close(self.gridWin, true)
        self.gridWin = nil
    end
    if callback then
        callback()
    end
end

-- Computes the next game state and draws it to screen.
function SnakeGame:render()
    self.snake:tick(self.grid)

    self.grid:clear()
    -- First render the body, then handle collisions.
    self.snake:renderBody(self.grid)
    self:renderFood()
    self:handleCollision()
    -- Draw head after collisions are processed.
    self.snake:renderHead(self.grid)
    -- Draw buffer to screen.
    self.grid:render()
    self:addFood()
end

-- Handles any collisions and updates game state.
function SnakeGame:handleCollision()
    local hitWall = not self.noWalls and self.snake.hitWall
    local head = self.snake.head
    local charAtHead = self.grid:getChar(head.x, head.y)
    if hitWall or charAtHead == C.BodyChar then
        self:handleSnakeDied()
    elseif charAtHead == C.FoodChar then
        self:consumeFood()
    end
end

-- Renders the food on the grid.
function SnakeGame:renderFood()
    for _, food in pairs(self.food) do
        self.grid:setChar(food.x, food.y, C.FoodChar)
    end
end

-- Adds food if there is none of the map.
function SnakeGame:addFood()
    if #self.food > 0 then
        return
    end
    local x = math.random(self.grid.width)
    local y = math.random(self.grid.height)
    local char = self.grid:getChar(x, y)
    if char == C.GridChar then
       table.insert(self.food, {x = x, y = y})
    end
end

-- Remove food from the map and instructs the snake to grow.
function SnakeGame:consumeFood()
    table.remove(self.food)
    self.snake:grow()
    self.score = self.score + 10
    self:updateScore()
end

-- Draws the HUD in the HUD window with the score.
function SnakeGame:updateScore()
    local walls = 'Walls:Y'
    if self.noWalls then
        walls = 'Walls:N'
    end
    local speedRange = SpeedLevel[1] - SpeedLevel[5]
    local baseSpeedLevel = SpeedLevel[1] + 10
    local speedFrac = math.ceil(100 * (baseSpeedLevel - self.speed) / speedRange)
    local speed = tostring(speedFrac)..'%'
    local status = walls..' | '..'Spd:'..speed..' | '..'Score: '..self.score
    V.nvim_buf_set_lines(self.scoreBuf, 0, -1, false, { status })
end

-- Snake is dead. Stop the game and calls the end game callback.
function SnakeGame:handleSnakeDied()
    self.snake:oops()
    self:cancelTimer()
    -- After 3s, close the game and call the end game callback
    vim.defer_fn(function() self:shutdown(self.endGameCallback) end, 3000)
end

-- Cancels the time and frees its resources.
function SnakeGame:cancelTimer()
    if self.gameTimer then
        self.gameTimer:stop()
        self.gameTimer:close()
        self.gameTimer = nil
    end
end

return SnakeGame
