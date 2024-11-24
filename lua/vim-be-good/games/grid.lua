local V = vim.api

local width = 60
local height = 20

local SnakeGame = {}
local Grid = {}

function SnakeGame:new()
    local scoreBuf = V.nvim_create_buf(false, true)
    local scoreWin = V.nvim_open_win(scoreBuf, false, {
        relative = 'win',
        focusable = false,
        title = "Snake",
        title_pos = "center",
        noautocmd = true,
        row = 6,
        col = 6,
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

    local gameGrid = Grid:new(gridBuf, width, height, '_')

    local newGame = {
        scoreWin = scoreWin,
        scoreBuf = scoreBuf,
        gridBuf = gridBuf,
        gridWin = gridWin,
        grid = gameGrid,
    }
    self.__index = self
    return setmetatable(newGame, self)
end

function SnakeGame:render()
    self.grid:render()
    self.grid:clear('.')
    self.grid:setChar(4,4,'S')
    self.grid:render()
    self.grid:render()
end

function Grid:new(bufNum, cols, rows, fillChar)
    if not fillChar then
       fillChar = ' '
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
        fillChar = fillChar
    }
    self.__index = self
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

function Grid:setChar(row, col, char)
    row = row + 1
    col = col + 1
    if row > self.rows or col > self.cols then
        return
    end
    local line = self.lines[row]
    line = string.sub(line, 1, col-1) .. char .. string.sub(line, col+1)
    self.lines[row] = line
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

-- local snakeGame = SnakeGame:new()
-- snakeGame:render()

return SnakeGame
-- V.nvim_buf_add_highlight(buf, 0, "snake", 0, 0, 1)
