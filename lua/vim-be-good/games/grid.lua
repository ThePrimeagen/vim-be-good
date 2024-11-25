local V = vim.api

local SnakeGame = {}
local Snake = {}
local Grid = {}

local STOPPED=0
local UP = 1
local DOWN=2
local LEFT=3
local RIGHT=4

function Snake:new(x, y, initialSize)
    self.__index = self
    local head = { x = math.floor(x), y = math.floor(y) }
    local newSnake = {
        dir = RIGHT,
        head = {x = math.floor(x), y = math.floor(y)},
        body = {},
        shouldGrow = false,
        dead = false,
    }
    if initialSize and initialSize > 1 then
        local lastBodyPart = head
        for _ = 1, initialSize do
            local bodyPart = { x = lastBodyPart.x - 1, y = lastBodyPart.y }
            lastBodyPart = bodyPart
            table.insert(newSnake.body, bodyPart)
        end
    end
    return setmetatable(newSnake, self)
end

function Snake:setDir(dir)
    if self.dead or dir < UP or dir > RIGHT then
        return
    end
    local curDir = self.dir
    -- Snakes can't reverse
    if curDir == LEFT and dir == RIGHT or
        curDir == RIGHT and dir == LEFT or
        curDir == UP and dir == DOWN or
        curDir == DOWN and dir == UP then
        return
    end
    self.dir = dir
end

function Snake:grow()
    self.shouldGrow = true
end

function Snake:tick(grid)
    local head = self.head
    local dir = self.dir
    if dir == STOPPED then
        return
    end
    -- Move tail to current head
    if #self.body > 0 then
        local tail = {}
        if not self.shouldGrow then
           tail = table.remove(self.body)
        end
        self.shouldGrow = false
        tail.x = head.x
        tail.y = head.y
        table.insert(self.body, 1, tail)
    end
    -- Move head in direction
    if dir == UP then
        head.y = head.y - 1
    elseif dir == DOWN then
        head.y = head.y + 1
    elseif dir == LEFT then
        head.x = head.x - 1
    elseif dir == RIGHT then
        head.x = head.x + 1
    end
    -- Loop around if at edge of screen
    if head.x >= grid.width then
        head.x = 0
    elseif head.x < 0 then
        head.x = grid.width
    elseif head.y >= grid.height then
        head.y = 0
    elseif head.y < 0 then
        head.y = grid.height
    end
end

local HeadChar = {
    [UP] = '^',
    [DOWN] = 'v',
    [LEFT] = '<',
    [RIGHT] = '>',
    [STOPPED] = 'X',
}
local BodyChar = '*'
local FoodChar = 'O'
local GridChar = '.'

function Snake:renderBody(grid)
    for _, body in pairs(self.body) do
        grid:setChar(body.x, body.y, BodyChar)
    end
end

function Snake:renderHead(grid)
    local head = self.head
    grid:setChar(head.x, head.y, HeadChar[self.dir])
end

function Snake:oops()
    self.dead = true
    self.dir = STOPPED
end

--- SnakeGame
function SnakeGame:new(width, height)
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
            self:handleKeyPress(key)
        end, { buffer = gridBuf })
    end

    local gameGrid = Grid:new(gridBuf, width, height, GridChar)

    -- When the game is closed (the grid), also close the Scores window.
    V.nvim_create_autocmd({"WinClosed"}, {
        pattern = { tostring(gridWin) },
        callback = function(_)
            self:shutdown()
        end
    })

    local newGame = {
        scoreWin = scoreWin,
        scoreBuf = scoreBuf,
        gridBuf = gridBuf,
        gridWin = gridWin,
        grid = gameGrid,
        food = {},
        snake = Snake:new(width / 2, height / 2, 10)
    }
    self = setmetatable(newGame, self)
    return self
end

function SnakeGame:render()
    self.snake:tick(self.grid)
    V.nvim_buf_set_option(self.gridBuf, 'modifiable', true)
    self.grid:clear()
    -- First render the body, then handle collisions.
    self.snake:renderBody(self.grid)
    self:renderFood()
    self:handleCollision()
    -- Draw head after collisions are processed.
    self.snake:renderHead(self.grid)
    -- Draw buffer to screen.
    self.grid:render()
    V.nvim_buf_set_option(self.gridBuf, 'modifiable', false)
    self:addFood()
end

function SnakeGame:handleCollision()
    local head = self.snake.head
    local charAtHead = self.grid:getChar(head.x, head.y)
    if charAtHead == BodyChar then
        self.snake:oops()
    elseif charAtHead == FoodChar then
        self:consumeFood(head.x, head.y)
    end
end

function SnakeGame:renderFood()
    for _, food in pairs(self.food) do
        self.grid:setChar(food.x, food.y, FoodChar)
    end
end

function SnakeGame:addFood()
    if #self.food > 0 then
        return
    end
    local x = math.random(self.grid.width)
    local y = math.random(self.grid.height)
    local char = self.grid:getChar(x, y)
    if char == GridChar then
       table.insert(self.food, {x = x, y = y})
    end
end

function SnakeGame:consumeFood(x, y)
    self.snake:grow()
    table.remove(self.food)
end

local KeyDirMap = {
    h = LEFT,
    j = DOWN,
    k = UP,
    l = RIGHT
}

function SnakeGame:handleKeyPress(key)
    print('Pressed: '..key)
    self.snake:setDir(KeyDirMap[key])
end

function SnakeGame:shutdown()
    self:cancelTimer()
    V.nvim_win_close(self.scoreWin, true)
end

function SnakeGame:start()
    self:cancelTimer()
    self.grid:clear()
    self.gameTimer = vim.loop.new_timer()
    self.gameTimer:start(0, 100, vim.schedule_wrap(function()
        self:render()
    end))
end

function SnakeGame:cancelTimer()
    if self.gameTimer then
        self.gameTimer:stop()
        self.gameTimer:close()
        self.gameTimer = nil
    end
end

--- Grid
function Grid:new(bufNum, cols, rows, fillChar)
    self.__index = self
    if not fillChar then
       fillChar = GridChar
    end
    local lines = {}
    for _ = 1, rows do
        table.insert(lines, string.rep(fillChar, cols))
    end
    local newGrid = {
        buf = bufNum,
        lines = lines,
        rows = rows,
        cols = cols,
        width = cols,
        height = rows,
        fillChar = fillChar
    }
    return setmetatable(newGrid, self)
end

function Grid:clear(fillChar)
    if not fillChar then
        fillChar = self.fillChar
    end
    local lines = {}
    for _ = 1, self.rows do
        table.insert(lines, string.rep(fillChar, self.cols))
    end
    self.lines = lines
end

function Grid:setChar(col, row, char)
    row = row + 1
    col = col + 1
    if row < 1 or col < 1 or row > self.rows or col > self.cols then
        print("setChar ("..char..") out of bounds: " .. col .. "," .. row)
        return
    end
    local line = self.lines[row]
    line = string.sub(line, 1, col-1) .. char .. string.sub(line, col+1)
    self.lines[row] = line
end

function Grid:getChar(col, row)
    row = row + 1
    col = col + 1
    if row < 1 or col < 1 or row > self.rows or col > self.cols then
        print("getChar out of bounds: " .. col .. "," .. row)
        return nil
    end
    local line = self.lines[row]
    return string.sub(line, col, col)
end

function Grid:render()
    local currentLines = V.nvim_buf_get_lines(self.buf, 0, -1, false)
    local rows = #currentLines
    local maxCols = 0
    for _, row in pairs(currentLines) do
        local lineLen = string.len(row)
        if lineLen > maxCols then
            maxCols = lineLen
        end
    end
    V.nvim_buf_set_text(self.buf, 0, 0, rows-1, maxCols, self.lines)
end

local snakeGame = SnakeGame:new(60, 20)
snakeGame:start()

return SnakeGame
