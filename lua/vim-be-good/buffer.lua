local bind = require("vim-be-good.bind")

local function createEmpty(count)
    local lines = {}
    for idx = 1, count, 1 do
        lines[idx] = ""
    end

    return lines
end

local Buffer = {}
function Buffer:new(bufh, window)
    local onChangeList = {}
    local newBuf = {
        bufh = bufh,
        window = window,
        debugLineStr = {},
        instructions = {},
        onChangeList = onChangeList,
        lastRendered = {},
    }

    self.__index = self
    local createdObject = setmetatable(newBuf, self)

    createdObject:attach()
    return createdObject
end

function Buffer:close()
    nvim_buf_detach(self.bufh)
end

local count = 0
function Buffer:onLine(buf, changedtick, firstline, lastline, linedata, more)
    print("onLine", count, " ", self.onChangeList)
    count = count + 1

    if self == nil or self.onChangeList == nil then
        print("Memory Leak...", self.bufh, self.window)
        return
    end

    for idx = 1, table.getn(self.onChangeList), 1 do
        local fn = self.onChangeList[idx]
        status, ret, err = xpcall(fn, debug.traceback, buf, changedtick, firstline, lastline, linedata, more)

        print("ONLINE RESULTS!!!", status, ret, err)
        if status == false then
            print("Error in buf_attach, must close down:", err)
            self.window:close()
        end
    end
end

function Buffer:attach()
    print("WHAT IS THIS???", self.bufh)
    vim.api.nvim_buf_attach(self.bufh, true, {
        on_lines = bind(self, "onLine")
    })
end


function Buffer:render(lines)
    self.lastRendered = lines
    self:debugLine()

    local idx = 1
    local instructionLen = table.getn(self.instructions)

    if instructionLen > 0 then
        vim.api.nvim_buf_set_lines(
            self.bufh, idx, idx + instructionLen, false, self.instructions)
        idx = idx + instructionLen
    end

    local linesLength = table.getn(lines)
    vim.api.nvim_buf_set_lines(self.bufh, idx, idx + linesLength, false, lines)
end

function Buffer:debugLine(line)
    if line ~= nil then
        self.debugLineStr = {line}
    end

    print("debugLine", type(self.debugLineStr))

    vim.api.nvim_buf_set_lines(self.bufh, 0, 1, false, self.debugLineStr)
end

function Buffer:setInstructions(lines)
    self.instructions = lines
end

function Buffer:clearGameLines()
    local startOffset = table.getn(self.instructions) + 1
    local len = table.getn(self.lastRendered)

    vim.api.nvim_buf_set_lines(
        self.bufh, startOffset, startOffset + len, false, createEmpty(len))
end

function Buffer:getGameLines()
    local startOffset = table.getn(self.instructions) + 1
    local len = table.getn(self.lastRendered)

    local lines = vim.api.nvim_buf_get_lines(
        self.bufh, startOffset, startOffset + len, false)

    print("buffer#getGameLines", lines)
    return lines
end

function Buffer:clear()
    local startOffset = table.getn(self.instructions) + 1
    local len = table.getn(self.lastRendered)

    vim.api.nvim_buf_set_lines(
        self.bufh, 0, startOffset + len, false, createEmpty(startOffset + len))
end

function Buffer:onChange(cb)
    print("About to insert onChange baby")
    table.insert(self.onChangeList, cb)
end

return Buffer

