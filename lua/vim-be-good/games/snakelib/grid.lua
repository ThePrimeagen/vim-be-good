local V = vim.api
local C = require('vim-be-good.games.snakelib.const')
local log = require("vim-be-good.log")

local Grid = {}

-- Class the represents a textual rendering grid.
-- @param bufNum integer: the underlying vim buffer to use
-- @param cols integer: the number of columns (width)
-- @param rows integer: the number of rows (height)
-- @param fillChar string: the default character to use
--        when clearing the grid
function Grid:new(bufNum, cols, rows, fillChar)
    self.__index = self
    if not fillChar then
       fillChar = C.GridChar
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

-- Clears the grid using the given @param fillChar, or the
-- default fillChar if none is provided
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

-- Sets the character at the given position to @param char
function Grid:setChar(col, row, char)
    row = row + 1
    col = col + 1
    if row < 1 or col < 1 or row > self.rows or col > self.cols then
        log.warn("setChar ("..char..") out of bounds: " .. col .. "," .. row)
        return
    end
    local line = self.lines[row]
    line = string.sub(line, 1, col-1) .. char .. string.sub(line, col+1)
    self.lines[row] = line
end

-- Returns the character at the given position.
function Grid:getChar(col, row)
    row = row + 1
    col = col + 1
    if row < 1 or col < 1 or row > self.rows or col > self.cols then
        log.warn("getChar out of bounds: " .. col .. "," .. row)
        return nil
    end
    local line = self.lines[row]
    return string.sub(line, col, col)
end

-- Draws the grid to the text buffer associated with the grid.
-- The buffer is marked non-modifiable at the end of the render.
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
    V.nvim_buf_set_option(self.buf, 'modifiable', true)
    V.nvim_buf_set_text(self.buf, 0, 0, rows-1, maxCols, self.lines)
    V.nvim_buf_set_option(self.buf, 'modifiable', false)
end

return Grid
